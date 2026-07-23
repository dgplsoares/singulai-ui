/**
 * <ds-rich-text-editor> — Types.
 * E.6.B.1 (2026-06-30). Ver decision/E.6.B-ebook-offcanvas-plan-approved.
 *
 * DEC-E.6.B-C: output persistido como JSON ProseMirror (padrão Tiptap).
 * Backend recebe string serializada e armazena em campos como
 * `ebookScript` / `longDescription`.
 */

import type { JSONContent } from '@tiptap/core';

/** Conteúdo do editor — JSON ProseMirror ou string serializada. */
export type RichTextContent = JSONContent | string | null;

/** Ícones da toolbar do Figma (13 grupos). Ver DEC-E.6.B-G. */
export type RichTextToolbarKey =
  | 'undo'
  | 'redo'
  | 'headings'      // Normal text dropdown (H1/H2/H3/paragraph)
  | 'align'         // text-align dropdown (left/center/right/justify)
  | 'color'         // color picker
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'code'          // inline code
  | 'clearFormat'
  | 'bulletList'
  | 'orderedList'
  | 'link'
  | 'image'
  | 'codeBlock'
  | 'blockquote';

/** Configuração da toolbar — ordem determina layout visual. */
export interface RichTextToolbarConfig {
  groups: RichTextToolbarKey[][];
}

/** Toolbar default (todos os 13 grupos do Figma). */
export const DEFAULT_TOOLBAR: RichTextToolbarConfig = {
  groups: [
    ['undo', 'redo'],
    ['headings'],
    ['align'],
    ['color'],
    ['bold', 'italic', 'underline', 'strike', 'code', 'clearFormat'],
    ['bulletList', 'orderedList'],
    ['link', 'image', 'codeBlock', 'blockquote'],
  ],
};
