/**
 * ============================================================================
 * `C4.1` — AS LEITURAS DE TEXTO RICO QUE **NÃO** PRECISAM DO EDITOR
 * ============================================================================
 *
 * ⛔⛔ **POR QUE ESTE ARQUIVO EXISTE, e a razão é MEDIDA, não organizacional:**
 *
 * O `rich-text-canonical.ts` exporta **duas coisas de naturezas diferentes**:
 *
 * | | precisa do Tiptap? |
 * |---|---|
 * | `RTE_EXTENSIONS` · `richTextToDisplayHtml` (usa `generateHTML`) | **SIM** |
 * | `richTextToPlainText` · `getPlainTextLength` | **NÃO** — percorrem o JSON |
 *
 * 🔴 E a **vitrine pública** importava as puras: `themes/_base/produto/subtitulo-do-heroi.ts:1` →
 * `richTextToPlainText`. Como `themes/_base` está no **grafo inicial**, importar uma função pura
 * arrastava o editor inteiro para o bundle que **todo visitante baixa**:
 *
 * ```
 * chunk-3GT6UBQH.js   418 kB
 *   arquivos do PROJETO nele:  rich-text-canonical.ts   2,6 kB    <- UM só
 *   e dentro:  prosemirror-view 95 kB · @tiptap/core 83 kB · prosemirror-model 44 kB · …  ≈ 315 kB
 * ```
 *
 * 📌 **Não era "a vitrine usa o editor". Era "a função pura mora no mesmo arquivo que o editor"** —
 * e o empacotador só sabe decidir por MÓDULO, nunca por export.
 * ⇒ o conserto é **partir o módulo**, não remover uma dependência.
 *
 * ⚠️ **E isto reposiciona o budget do bundle**, que vinha reprovando por BYTES e me fez raspar
 * código três vezes: a folga real nunca esteve no tamanho do que eu escrevia — estava numa
 * **fronteira de módulo mal colocada**. *Raspar bytes é tratar o sintoma de uma fronteira errada.*
 *
 * ----------------------------------------------------------------------------
 * ⛔ A REGRA QUE ESTE ARQUIVO PASSA A CARREGAR
 * ----------------------------------------------------------------------------
 *
 * **Nada aqui pode importar `@tiptap/*`, `prosemirror-*` nem `marked`.** Um único import desses
 * desfaz o ganho em silêncio — o build continua verde e o bundle volta a crescer.
 * 🔔 Cobrado por exit code: `scripts/check-leitura-de-texto-rico-sem-editor.mjs`.
 */
import type { JSONContent } from '@tiptap/core';
import type { RichTextContent } from './rich-text-editor.types';

/*
  ⚠️ `import type` é APAGADO na compilação — ele não gera `import` no JavaScript e **não** puxa o
  pacote. É a única menção a `@tiptap` que este arquivo pode ter, e é por isso que ela é segura.
*/

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

