/**
 * <ds-rich-text-editor> — Design System.
 *
 * E.6.B.1 (2026-06-30). Rich text editor com toolbar 100% renderizada com
 * DS Singulai (heroicons + neumorphic classes). Tiptap serve apenas como
 * engine — expõe API de commands que chamamos via (click) nos botões DS.
 *
 * Ver Engram: decision/E.6.B-ebook-offcanvas-plan-approved.
 *
 * DECISÕES IMUTÁVEIS:
 * - DEC-E.6.B-A: Tiptap v3 via ngx-tiptap
 * - DEC-E.6.B-B: toolbar 100% DS (heroicons + neumorphic)
 * - DEC-E.6.B-C: output JSON ProseMirror
 * - DEC-E.6.B-G: extensões subset estrito Figma
 * - DEC-E.6.B-H: lightmode-first
 *
 * Consumers alvo (v1):
 * - step-informacoes.longDescription (Fase D)
 * - lesson-ebook-offcanvas.ebookScript (E.6.B.3)
 */

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  OnDestroy,
  output,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroArrowUturnLeft,
  heroArrowUturnRight,
  heroCodeBracket,
  heroCodeBracketSquare,
  heroListBullet,
  heroLink,
  heroPhoto,
  heroChatBubbleBottomCenterText,
  heroChevronDown,
  heroBars2,
  heroTrash,
  heroSwatch,
} from '@ng-icons/heroicons/outline';

import { Editor, EditorEvents } from '@tiptap/core';
import { TiptapEditorDirective } from 'ngx-tiptap';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { marked } from 'marked';

import {
  DEFAULT_TOOLBAR,
  RichTextContent,
  RichTextToolbarConfig,
} from './rich-text-editor.types';

@Component({
  selector: 'ds-rich-text-editor',
  standalone: true,
  imports: [CommonModule, NgIcon, TiptapEditorDirective],
  providers: [
    provideIcons({
      heroArrowUturnLeft,
      heroArrowUturnRight,
      heroCodeBracket,
      heroCodeBracketSquare,
      heroListBullet,
      heroLink,
      heroPhoto,
      heroChatBubbleBottomCenterText,
      heroChevronDown,
      heroBars2,
      heroTrash,
      heroSwatch,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './rich-text-editor.component.html',
  styleUrl: './rich-text-editor.component.scss',
})
export class RichTextEditorComponent implements OnDestroy {
  // ==========================================================================
  // Inputs
  // ==========================================================================

  /** Conteúdo inicial (JSON ProseMirror ou string HTML/serializada). */
  readonly content = input<RichTextContent>(null);

  /** Placeholder quando editor vazio. */
  readonly placeholder = input<string>('Escreva aqui...');

  /** Estado read-only (view mode). */
  readonly readOnly = input<boolean>(false);

  /** Configuração da toolbar (grupos e ordem). Default cobre 13 ícones Figma. */
  readonly toolbarConfig = input<RichTextToolbarConfig>(DEFAULT_TOOLBAR);

  /** Altura mínima do editor em px. */
  readonly minHeight = input<number>(240);

  /**
   * Marca o editor como INVÁLIDO — borda de erro.
   *
   * ⚠️ **Quem decide é o consumidor, não o editor.** O RTE não conhece limite de
   * caractere nem regra de produto; ele só sabe pintar. Colocar a regra aqui
   * dentro obrigaria o DS a conhecer a tabela de limites da Singulai, e este
   * componente precisa fazer sentido num projeto Angular qualquer
   * (critério 1 do decision tree de placement).
   *
   * Usa `--ds-form-border-error`, o MESMO token do `<ds-form-field>` — um campo
   * inválido tem de parecer inválido do mesmo jeito nas duas famílias.
   *
   * `D.3.5.9 / 9e`: nasceu porque os cinco offcanvas passaram a ter teto de
   * tamanho (`9d`) e um gate sem sinal visível é um botão travado sem
   * explicação — o usuário não descobre por que não consegue salvar.
   */
  readonly hasError = input<boolean>(false);

  // ==========================================================================
  // Outputs
  // ==========================================================================

  /**
   * Emite JSON ProseMirror ao mudar. Consumer deve armazenar via
   * `JSON.stringify(event)` no campo do backend.
   */
  readonly contentChange = output<RichTextContent>();

  // ==========================================================================
  // Editor + estado toolbar
  // ==========================================================================

  /** Instância Tiptap (públic para template `<tiptap-editor>`). */
  editor!: Editor;

  /** Signal para forçar recompute dos computeds de toolbar em cada transaction. */
  private readonly tick = signal(0);

  /**
   * Dropdowns abertos (headings / align / color).
   * CDK Overlay é overkill aqui — usar simples click-outside detection.
   */
  protected readonly headingsOpen = signal(false);
  protected readonly alignOpen = signal(false);
  protected readonly colorOpen = signal(false);

  // ==========================================================================
  // Toolbar state computeds (dependem de tick para reagir a transactions)
  // ==========================================================================

  protected readonly isBold = computed(() => this.tick() >= 0 && this.editor?.isActive('bold'));
  protected readonly isItalic = computed(() => this.tick() >= 0 && this.editor?.isActive('italic'));
  protected readonly isUnderline = computed(() => this.tick() >= 0 && this.editor?.isActive('underline'));
  protected readonly isStrike = computed(() => this.tick() >= 0 && this.editor?.isActive('strike'));
  protected readonly isCode = computed(() => this.tick() >= 0 && this.editor?.isActive('code'));
  protected readonly isCodeBlock = computed(() => this.tick() >= 0 && this.editor?.isActive('codeBlock'));
  protected readonly isBlockquote = computed(() => this.tick() >= 0 && this.editor?.isActive('blockquote'));
  protected readonly isBulletList = computed(() => this.tick() >= 0 && this.editor?.isActive('bulletList'));
  protected readonly isOrderedList = computed(() => this.tick() >= 0 && this.editor?.isActive('orderedList'));
  protected readonly isLink = computed(() => this.tick() >= 0 && this.editor?.isActive('link'));

  protected readonly currentHeading = computed<string>(() => {
    this.tick();
    if (!this.editor) return 'Texto normal';
    if (this.editor.isActive('heading', { level: 1 })) return 'Título 1';
    if (this.editor.isActive('heading', { level: 2 })) return 'Título 2';
    if (this.editor.isActive('heading', { level: 3 })) return 'Título 3';
    return 'Texto normal';
  });

  protected readonly currentAlign = computed<'left' | 'center' | 'right' | 'justify'>(() => {
    this.tick();
    if (!this.editor) return 'left';
    if (this.editor.isActive({ textAlign: 'center' })) return 'center';
    if (this.editor.isActive({ textAlign: 'right' })) return 'right';
    if (this.editor.isActive({ textAlign: 'justify' })) return 'justify';
    return 'left';
  });

  /** Paleta de cores (subset — pode expandir via input futuro). */
  protected readonly colorPalette: string[] = [
    '#212529', // default
    '#495057',
    '#adb5bd',
    '#3e619e', // ds-primary
    '#2c5cb1',
    '#46969c', // teal
    '#935050', // burgundy danger
    '#6e5a2e', // beige warning
    '#28a745',
    '#dc3545',
  ];

  // ==========================================================================
  // Lifecycle
  // ==========================================================================

  constructor() {
    // iter18 pattern: instanciar editor uma vez no construtor, sincronizar
    // com content input via effect.
    this.editor = new Editor({
      extensions: [
        StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        Underline,
        Link.configure({ openOnClick: false }),
        Image,
        TextStyle,
        Color,
      ],
      content: this.parseContent(this.content()),
      editable: !this.readOnly(),
      onUpdate: ({ editor }: EditorEvents['update']) => {
        this.tick.update(v => v + 1);
        this.contentChange.emit(editor.getJSON());
      },
      onSelectionUpdate: () => {
        this.tick.update(v => v + 1);
      },
      onTransaction: () => {
        this.tick.update(v => v + 1);
      },
    });

    // Sync content input → editor
    effect(() => {
      const incoming = this.content();
      if (!this.editor) return;
      const parsed = this.parseContent(incoming);
      const current = this.editor.getJSON();
      if (JSON.stringify(current) !== JSON.stringify(parsed)) {
        this.editor.commands.setContent(parsed as any, { emitUpdate: false });
      }
    });

    // Sync readOnly input → editor
    // FIX BUG3 iter4 (2026-07-31): emitUpdate=false suprime o `update` espúrio
    // que Tiptap v3 emitia sempre em setEditable — mesmo sem mudança de valor.
    // Sem esse guard, cada mount de RTE (tab switch) disparava contentChange
    // com editor.getJSON() de doc vazio → parent draft sobrescrito → colidia
    // com snapshot='' de campo null → isDirty=true falso positivo.
    // Ver rich-text-canonical.ts (fix simétrico) e workflow iter4 investigation.
    effect(() => {
      const ro = this.readOnly();
      if (this.editor) this.editor.setEditable(!ro, false);
    });
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
  }

  /**
   * Detecta e converte 4 formatos possíveis para o Tiptap `setContent()`:
   *   1. JSON ProseMirror serializado (formato canônico persistido)
   *   2. HTML puro (começa com tag)
   *   3. Markdown (heurística — headings, listas, bold, code) → HTML via `marked`
   *   4. Plain text (fallback — Tiptap renderiza como parágrafo)
   *
   * E.6.B.3-FIX (2026-07-01): bridge Markdown adicionada porque o AI
   * orchestrator retorna Markdown (StrOutputParser + prompt Markdown). Antes
   * do fix, RTE renderizava `### Título` literal em vez de heading. Tiptap
   * parseia HTML nativamente via DOMParser usando schemas registrados
   * (StarterKit + Underline + Link + Image + TextAlign) e emite JSON
   * ProseMirror no primeiro onUpdate — próximo save persiste como JSON
   * (auto-migração progressiva, zero migration DB).
   */
  private parseContent(v: RichTextContent): any {
    if (v === null || v === undefined || v === '') return '';
    if (typeof v === 'string') {
      const trimmed = v.trim();
      // 1. JSON ProseMirror serializado
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (parsed && typeof parsed === 'object' && parsed.type === 'doc') {
            return parsed;
          }
        } catch { /* fallthrough */ }
      }
      // 2. HTML puro
      if (trimmed.startsWith('<')) return trimmed;
      // 3. Markdown → HTML (auto-migração progressiva)
      if (looksLikeMarkdown(trimmed)) {
        try {
          return marked.parse(trimmed, { async: false, gfm: true, breaks: false }) as string;
        } catch (e) {
          console.warn('[rich-text-editor] markdown parse failed, returning raw', e);
          return trimmed;
        }
      }
      // 4. Plain text
      return trimmed;
    }
    return v;
  }

  // ==========================================================================
  // Toolbar handlers
  // ==========================================================================

  protected chain() {
    return this.editor.chain().focus();
  }

  protected toggleBold(): void { this.chain().toggleBold().run(); }
  protected toggleItalic(): void { this.chain().toggleItalic().run(); }
  protected toggleUnderline(): void { this.chain().toggleUnderline().run(); }
  protected toggleStrike(): void { this.chain().toggleStrike().run(); }
  protected toggleCode(): void { this.chain().toggleCode().run(); }
  protected toggleCodeBlock(): void { this.chain().toggleCodeBlock().run(); }
  protected toggleBlockquote(): void { this.chain().toggleBlockquote().run(); }
  protected toggleBulletList(): void { this.chain().toggleBulletList().run(); }
  protected toggleOrderedList(): void { this.chain().toggleOrderedList().run(); }
  protected undo(): void { this.chain().undo().run(); }
  protected redo(): void { this.chain().redo().run(); }
  protected clearFormatting(): void { this.chain().unsetAllMarks().clearNodes().run(); }

  /**
   * FIX 2026-07-31: click no wrap (padding externo do ProseMirror) foca o
   * editor. Antes só a área interna do ProseMirror capturava click; áreas
   * de padding (15px) e min-height (500px em texto) não focavam apesar de
   * visualmente parecerem parte do campo. Ignora clicks dentro do próprio
   * ProseMirror (não interfere na seleção normal do usuário).
   */
  protected onWrapClick(event: MouseEvent): void {
    if (!this.editor || this.readOnly()) return;
    const target = event.target as HTMLElement;
    // Se click já foi dentro do ProseMirror, ele foca sozinho — não interferir
    if (target.closest('.ProseMirror')) return;
    // Click em área de padding/wrap → foca editor no final do documento
    this.editor.commands.focus('end');
  }

  protected setHeading(level: 0 | 1 | 2 | 3): void {
    if (level === 0) this.chain().setParagraph().run();
    else this.chain().toggleHeading({ level }).run();
    this.headingsOpen.set(false);
  }

  protected setAlign(align: 'left' | 'center' | 'right' | 'justify'): void {
    this.chain().setTextAlign(align).run();
    this.alignOpen.set(false);
  }

  protected setColor(color: string): void {
    this.chain().setColor(color).run();
    this.colorOpen.set(false);
  }

  protected unsetColor(): void {
    this.chain().unsetColor().run();
    this.colorOpen.set(false);
  }

  protected addLink(): void {
    const url = window.prompt('URL do link:', 'https://');
    if (!url) return;
    this.chain().extendMarkRange('link').setLink({ href: url }).run();
  }

  protected addImage(): void {
    const url = window.prompt('URL da imagem:', 'https://');
    if (!url) return;
    this.chain().setImage({ src: url }).run();
  }

  protected toggleHeadingsMenu(e: MouseEvent): void {
    e.stopPropagation();
    this.headingsOpen.update(v => !v);
    this.alignOpen.set(false);
    this.colorOpen.set(false);
  }

  protected toggleAlignMenu(e: MouseEvent): void {
    e.stopPropagation();
    this.alignOpen.update(v => !v);
    this.headingsOpen.set(false);
    this.colorOpen.set(false);
  }

  protected toggleColorMenu(e: MouseEvent): void {
    e.stopPropagation();
    this.colorOpen.update(v => !v);
    this.headingsOpen.set(false);
    this.alignOpen.set(false);
  }
}

/**
 * E.6.B.3-FIX (2026-07-01): heurística conservadora para detectar Markdown.
 * Cobre patterns do prompt do AI orchestrator (headings, listas, bold,
 * inline code, code fence). Falsos-positivos em plain text são raros e o
 * pior caso é o Tiptap parsear texto que já iria renderizar igual.
 */
function looksLikeMarkdown(s: string): boolean {
  return (
    /^#{1,6}\s/m.test(s) ||             // headings (# / ## / ###)
    /^[-*+]\s/m.test(s) ||               // bullet list (- / * / +)
    /^\d+\.\s/m.test(s) ||               // ordered list (1. / 2.)
    /\*\*[^*\n]+\*\*/.test(s) ||         // bold (**texto**)
    /`[^`\n]+`/.test(s) ||               // inline code (`x`)
    /^```/m.test(s)                      // code fence (```)
  );
}
