/**
 * Rich Text Canonical Utility (2026-07-31)
 *
 * Fonte única de verdade para:
 *  1. Lista canônica de Tiptap extensions usadas pelo <ds-rich-text-editor>
 *  2. Função `normalizeRichTextToCanonical(v)` que converte QUALQUER input
 *     (JSON ProseMirror, HTML string, Markdown string, plain text, null) para
 *     uma string canônica JSON com key ordering estável.
 *
 * ### Por que existe
 *
 * O `<ds-rich-text-editor>` (via Tiptap) sempre emite `contentChange` com
 * ProseMirror JSON canônico. Consumidores (offcanvas de aula) armazenam esse
 * JSON no signal `draft`. Ao comparar com o valor ORIGINAL (que pode ter
 * vindo do backend como Markdown, HTML ou JSON serializado), a comparação
 * assimétrica dispara `isDirty=true` FALSO POSITIVO — o texto não mudou,
 * mudou só o formato do container.
 *
 * Bug histórico: 2026-07-31 (Diogo reportou em Aula 2 do curso 81039c99).
 * Root cause: dirty check comparava `draft` (JSON) vs `original` (String Md).
 * Fix: normalizar AMBOS os lados via esta função ANTES de comparar.
 *
 * ### Como usar (padrão originalSnapshot)
 *
 * ```ts
 * // 1. Ao abrir o offcanvas, congelar snapshot canônico:
 * this.originalSnapshot = {
 *   slideScript: normalizeRichTextToCanonical(incoming.slideScript),
 *   // ...outros campos
 * };
 *
 * // 2. Em isDirty, comparar draft canônico vs snapshot congelado:
 * if (normalizeRichTextToCanonical(this.draftSlideScript()) !== snap.slideScript) {
 *   return true;
 * }
 * ```
 *
 * @see bug3-finalPlan.md (workflow deep investigation 2026-07-31)
 * @see Engram bugfix/E.6-bug3-isdirty-canonical
 */

import { generateJSON, generateHTML } from '@tiptap/core';
import type { JSONContent } from '@tiptap/core';
import type { RichTextContent } from './rich-text-editor.types';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { marked } from 'marked';

/**
 * Lista canônica de extensions do RTE. Fonte única de verdade — usada pelo
 * componente <ds-rich-text-editor> E pelo normalizer canônico. Se algum
 * consumer precisar customizar (adicionar extension), abrir issue para
 * discutir promoção da lista OU criação de variante do RTE.
 */
export const RTE_EXTENSIONS = [
  StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  Underline,
  Link.configure({ openOnClick: false }),
  Image,
  TextStyle,
  Color,
];

/**
 * Serializa objeto JSON com key ordering ESTÁVEL (chaves ordenadas alfabet.).
 *
 * Necessário porque `JSON.stringify` default preserva ordem de inserção, e
 * duas serializações de mesma estrutura semântica com ordem diferente
 * produzem strings diferentes → falso positivo em comparação por string.
 */
function canonicalStringify(obj: unknown): string {
  return JSON.stringify(obj, (_k, val) => {
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      return Object.keys(val)
        .sort()
        .reduce<Record<string, unknown>>((acc, k) => {
          acc[k] = (val as Record<string, unknown>)[k];
          return acc;
        }, {});
    }
    return val;
  });
}

/**
 * FIX BUG3 iter3 (2026-07-31 — confirmado via [BUG3-V2-FIRSTDIFF] position=4592):
 *
 * Tiptap Editor (que gera o draft via `editor.getJSON()`) automaticamente
 * anexa um parágrafo vazio no fim do doc quando o último node é um block
 * fechado (lista, blockquote, codeBlock etc). Isso é comportamento de plugin
 * ProseMirror `trailingNode` — dá ao cursor um lugar para pousar após listas.
 *
 * `generateJSON(html, extensions)` NÃO roda plugins (só constrói o doc via
 * schema puro). Resultado: draft tem `paragraph` extra, snap não tem →
 * comparação por string diverge.
 *
 * Fix: strip trailing empty paragraph/heading em AMBOS os lados (via
 * normalizer chamado nos dois). Semanticamente equivalente (block vazio
 * no final não muda o conteúdo do doc).
 *
 * Loop: cobre múltiplos blocks vazios consecutivos no final.
 */
function stripTrailingEmptyBlocks(json: unknown): unknown {
  if (
    !json ||
    typeof json !== 'object' ||
    !('content' in json) ||
    !Array.isArray((json as { content: unknown }).content)
  ) {
    return json;
  }
  const doc = json as { content: unknown[]; [k: string]: unknown };
  const stripped = [...doc.content];
  while (stripped.length > 0) {
    const last = stripped[stripped.length - 1] as
      | { type?: string; content?: unknown[] }
      | undefined;
    const isEmptyBlock =
      last &&
      (last.type === 'paragraph' || last.type === 'heading') &&
      (!last.content || last.content.length === 0);
    if (!isEmptyBlock) break;
    stripped.pop();
  }
  return { ...doc, content: stripped };
}

/**
 * FIX BUG3 iter4 (2026-07-31):
 * Após stripTrailingEmptyBlocks, doc semanticamente vazio vira
 * {type:'doc', content:[]}. Serializado = '{"content":[],"type":"doc"}',
 * que DIVERGE do snapshot vazio `''` gerado por input null/''.
 * Detectar essa condição e retornar '' → ambos lados convergem.
 *
 * Cobre: RTE field null hidratado ao snapshot='' vs emit inicial do Tiptap
 * (que sempre gera {type:'doc',content:[{type:'paragraph'}]} = doc vazio).
 */
function isEmptyDoc(json: unknown): boolean {
  if (!json || typeof json !== 'object') return false;
  const doc = json as { type?: string; content?: unknown[] };
  if (doc.type !== 'doc') return false;
  return !doc.content || doc.content.length === 0;
}

/**
 * FIX BUG3 iter4 (2026-07-31):
 * Pipeline canônico unificado — TODO input semanticamente equivalente
 * termina na mesma string canônica.
 *
 * Passo A: converter input para HTML string (denominador comum).
 * Passo B: HTML → JSON via generateJSON (elimina attrs runtime como
 *          textAlign:null que só o Editor live emite).
 * Passo C: stripTrailingEmptyBlocks (remove trailing paragraph plugin).
 * Passo D: se doc vazio → ''; senão → canonicalStringify.
 *
 * Isso resolve a assimetria "JSON do Editor" vs "HTML do backend":
 *  - JSON.getJSON() do Editor com textAlign:null → generateHTML remove →
 *    HTML puro → generateJSON reconstrói SEM textAlign → canonical A
 *  - HTML puro do backend → generateJSON → canonical A (mesmo)
 * Ambos convergem.
 */
function jsonToCanonicalOrEmpty(json: JSONContent | unknown): string {
  try {
    // Roundtrip via HTML para eliminar attrs runtime do Editor
    const html = generateHTML(json as JSONContent, RTE_EXTENSIONS);
    const roundtripped = generateJSON(html, RTE_EXTENSIONS);
    const stripped = stripTrailingEmptyBlocks(roundtripped);
    if (isEmptyDoc(stripped)) return '';
    return canonicalStringify(stripped);
  } catch {
    return '';
  }
}

/**
 * FIX BUG3 iter4 (2026-07-31): pipeline canônico para HTML string direto.
 * HTML → generateJSON → strip → (empty?'':canonical).
 */
function htmlToCanonicalOrEmpty(html: string): string {
  try {
    const json = generateJSON(html, RTE_EXTENSIONS);
    const stripped = stripTrailingEmptyBlocks(json);
    if (isEmptyDoc(stripped)) return '';
    return canonicalStringify(stripped);
  } catch {
    return '';
  }
}

/**
 * Heurística simples para detectar Markdown (mesma do RTE — mantida DRY aqui).
 */
function looksLikeMarkdown(s: string): boolean {
  const trimmed = s.trim();
  if (!trimmed) return false;
  // Headings, listas, bold, code blocks, blockquote
  if (/^(#{1,6}\s|[-*+]\s|\d+\.\s|>\s|```)/m.test(trimmed)) return true;
  if (/\*\*[^*]+\*\*|__[^_]+__|`[^`]+`/.test(trimmed)) return true;
  return false;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Converte QUALQUER RichTextContent para canonical JSON string.
 *
 * Cobre 5 casos:
 *  1. `null`/`undefined`/`''`     → `''`
 *  2. JSON ProseMirror object      → canonicalStringify direto
 *  3. JSON ProseMirror string      → parse + canonicalStringify
 *  4. HTML string ('<p>...</p>')   → Tiptap generateJSON + canonicalStringify
 *  5. Markdown ('## title')        → marked.parse → HTML → generateJSON → canonical
 *  6. Plain text                   → wrap `<p>` + generateJSON → canonical
 *
 * Se qualquer conversão falhar (input malformado), retorna string vazia
 * (fallback seguro — evita crash em isDirty computation).
 */
export function normalizeRichTextToCanonical(v: unknown): string {
  if (v == null || v === '') return '';

  // Caso 2: objeto JSON ProseMirror (do editor.getJSON() ou estrutura)
  // FIX iter4: roundtrip JSON→HTML→JSON via jsonToCanonicalOrEmpty
  // para eliminar attrs runtime do Editor (textAlign:null etc) que só o
  // Editor live emite. Assim JSON e HTML equivalentes convergem.
  if (typeof v === 'object') {
    return jsonToCanonicalOrEmpty(v);
  }

  if (typeof v !== 'string') return '';

  const trimmed = v.trim();
  if (trimmed === '') return '';

  // Caso 3: JSON serializado (persistência backend legacy)
  // FIX iter4: parse + roundtrip mesmo pipeline dos objetos JSON
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === 'object' && parsed.type === 'doc') {
        return jsonToCanonicalOrEmpty(parsed);
      }
    } catch {
      /* fallthrough — tratar como texto plain */
    }
  }

  // Caso 4/5/6: converter para HTML, depois generateJSON via htmlToCanonicalOrEmpty
  let html: string;
  if (trimmed.startsWith('<')) {
    html = trimmed;
  } else if (looksLikeMarkdown(trimmed)) {
    try {
      html = marked.parse(trimmed, { async: false, gfm: true, breaks: false }) as string;
    } catch {
      html = `<p>${escapeHtml(trimmed)}</p>`;
    }
  } else {
    html = `<p>${escapeHtml(trimmed)}</p>`;
  }

  return htmlToCanonicalOrEmpty(html);
}

/**
 * Walk ProseMirror JSON tree e conta caracteres de plain text (soma
 * `n.text.length` para todo node com `type: 'text'`).
 *
 * Helper interno de `getPlainTextLength` — exportado apenas para casos
 * que já têm o node parseado (evita reparsing).
 */
function walkPmText(node: JSONContent | null | undefined): number {
  if (!node) return 0;
  let count = 0;
  const walk = (n: JSONContent): void => {
    if (typeof n.text === 'string') count += n.text.length;
    if (Array.isArray(n.content)) n.content.forEach(walk);
  };
  walk(node);
  return count;
}

/**
 * ============================================================================
 * `DEF.8` — O MESMO CONTEÚDO, EM **TEXTO PURO** (para lista, cartão e tabela)
 * ============================================================================
 *
 * ⛔ **Por que não bastava o `richTextToDisplayHtml`:** lista, cartão e coluna de tabela mostram uma LINHA de
 * resumo, muitas vezes truncada por CSS. Injetar HTML ali traria `<p>`, `<h2>` e quebras onde cabe uma frase — e
 * `[innerHTML]` num `<td>` é convite a layout quebrado. Quem precisa de **estrutura** usa o HTML; quem precisa de
 * **resumo** usa isto.
 *
 * ⚠️ Aceita as TRÊS formas que convivem no banco, como as irmãs: objeto do ProseMirror, string JSON serializada e
 * texto puro legado (que volta intacto). Parágrafos viram **espaço**, não colagem: sem isso, *"Aula 1"* + *"Aula 2"*
 * viraria *"Aula 1Aula 2"*.
 */
export function richTextToPlainText(value: unknown): string {
  if (value == null || value === '') return '';

  const doNo = (node: JSONContent): string => {
    const pedacos: string[] = [];
    const walk = (n: JSONContent): void => {
      if (typeof n.text === 'string') pedacos.push(n.text);
      if (Array.isArray(n.content)) n.content.forEach(walk);
    };
    walk(node);
    return pedacos.join(' ').replace(/\s+/g, ' ').trim();
  };

  if (typeof value === 'object') {
    try {
      return doNo(value as JSONContent);
    } catch {
      return '';
    }
  }

  if (typeof value !== 'string') return '';

  const trimmed = value.trim();
  if (trimmed === '') return '';
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      return doNo(JSON.parse(trimmed) as JSONContent);
    } catch {
      // ⚠️ Não era JSON de verdade: devolve o texto como está, em vez de engolir o conteúdo.
      return value;
    }
  }
  return value;
}

/**
 * Converte qualquer forma persistida de rich text para **HTML string
 * seguro** para exibição (consumido via `[innerHTML]` no template).
 *
 * Cobre 5 formatos que podem estar armazenados no backend hoje:
 *  1. `null` / `undefined` / `''`      → `''`
 *  2. JSONContent object               → `generateHTML` via RTE_EXTENSIONS
 *  3. String JSON serializado          → parse + `generateHTML`
 *  4. String HTML (`<p>…</p>`)         → devolve como está (já é HTML)
 *  5. Plain text                       → escape + `<p>` wrapper
 *
 * ### Uso
 *
 * ```ts
 * // component.ts
 * import { richTextToDisplayHtml } from '.../rich-text-canonical';
 *
 * renderLessonDescription(desc: string | null | undefined): string {
 *   return richTextToDisplayHtml(desc);
 * }
 *
 * // component.html
 * <p [innerHTML]="renderLessonDescription(lesson.description)"></p>
 * ```
 *
 * ### Segurança
 *
 * Angular sanitiza `[innerHTML]` por default via `DomSanitizer` — o
 * caller **não** deve chamar `bypassSecurityTrustHtml` neste retorno
 * (defesa XSS mantida). Ver comentário do `draftContentAsHtml` no
 * `lesson-texto-offcanvas` (mesma convenção).
 *
 * ### Extraído em 2026-07-31 (E.6-close.5 Padrão A)
 *
 * Fix para bug latente pre-existente do Portal do Aluno: ebook/quiz/
 * texto persistem `description` via `serializeRichText(RichTextContent)`
 * → `JSON.stringify(...)` (string JSON literal). Portal exibia via
 * `{{ description }}` plain interpolation, resultando em texto
 * `{"type":"doc","content":[...]}` aparecendo para o aluno.
 * Videoaula pós-E.6-close.3 também migrou para JSON serialize.
 *
 * DEC-E.6-close-H (Padrão A: Rich end-to-end).
 * DEC-E.6-close-I (backward compat com legacy plain string / HTML).
 *
 * @see Engram bugfix/portal-aluno-description-json-render
 */
export function richTextToDisplayHtml(value: unknown): string {
  if (value == null || value === '') return '';

  // Caso 2: objeto JSONContent (raramente vindo do backend, mas cobre)
  if (typeof value === 'object') {
    try {
      return generateHTML(value as JSONContent, RTE_EXTENSIONS);
    } catch {
      return '';
    }
  }

  if (typeof value !== 'string') return '';

  const trimmed = value.trim();
  if (trimmed === '') return '';

  // Caso 3: JSON string serializado (padrão persistência atual)
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === 'object' && parsed.type === 'doc') {
        return generateHTML(parsed as JSONContent, RTE_EXTENSIONS);
      }
    } catch {
      /* fallthrough — trata como plain text abaixo */
    }
  }

  // Caso 4: HTML string (backend legacy que salvou HTML direto)
  if (trimmed.startsWith('<')) {
    return trimmed;
  }

  // Caso 5: plain text (videoaula pre-migration + AI raw response +
  // markdown legado). Escape + wrap em <p> para renderização.
  return `<p>${escapeHtml(trimmed)}</p>`;
}

/**
 * Conta caracteres de plain text em qualquer `RichTextContent`.
 *
 * Cobre:
 *  1. `null` / `undefined` / `''` → 0
 *  2. Plain string (não JSON serializado) → `.length`
 *  3. JSON string serializado (persistência backend legacy) → parse + walk
 *  4. JSONContent object (do editor.getJSON()) → walk direto
 *
 * Se JSON parse falhar (input malformado), fallback = `content.length`
 * (contagem como string plain — seguro, evita crash).
 *
 * ### Extraído em 2026-07-31 (E.6-close.2a STEP 0)
 *
 * Antes desta extração, 4 arquivos duplicavam a mesma função inline:
 *  - `lesson-ebook-offcanvas.component.ts`
 *  - `lesson-quiz-offcanvas.component.ts`
 *  - `lesson-texto-offcanvas.component.ts`
 *  - `step-informacoes.component.ts`
 * Consolidação exigida como pré-requisito para extração do
 * `<app-lesson-info-card>` shared — parents precisam do helper para
 * `hasUnsavedChanges()` add-mode gate sem acessar internal state do card.
 *
 * @see Workflow adversarial w2fbq1t4a (BLOCKER — dirty-check-iter4 lens)
 * @see Engram bugfix/getPlainTextLength-consolidation
 */
export function getPlainTextLength(content: RichTextContent): number {
  if (content === null || content === undefined || content === '') return 0;
  if (typeof content === 'string') {
    const trimmed = content.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        return walkPmText(JSON.parse(trimmed));
      } catch {
        return content.length;
      }
    }
    return content.length;
  }
  return walkPmText(content as JSONContent);
}
