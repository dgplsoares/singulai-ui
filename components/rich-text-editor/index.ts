export * from './rich-text-editor.component';
export * from './rich-text-editor.types';
/*
  ⛔⛔ `C4.1` (2026-10-08) — ESTE BARRIL EXPORTAVA AS DUAS NATUREZAS JUNTAS, e era o último elo.

  As leituras PURAS (`richTextToPlainText`, `getPlainTextLength`) não precisam do Tiptap; o resto
  precisa. Enquanto o barril as servia do MESMO módulo, quem importasse uma pura arrastava **~315
  kB de editor** para o bundle inicial.
  ⚠️ E o `tsc` foi quem cobrou: removida a reexportação do `rich-text-canonical`, ele apontou
    **este arquivo** — que nenhum `grep` pelas funções teria achado, porque ele as reexporta sem
    nomeá-las no mesmo lugar que os importadores.
  ⇒ cada export vem agora do módulo certo. Quem quiser só ler texto importa o módulo PURO
    diretamente — e é o que o caminho inicial faz.
*/
export { getPlainTextLength, richTextToPlainText } from './rich-text-sem-editor';
export {
  normalizeRichTextToCanonical,
  richTextToDisplayHtml,
  RTE_EXTENSIONS,
} from './rich-text-canonical';
