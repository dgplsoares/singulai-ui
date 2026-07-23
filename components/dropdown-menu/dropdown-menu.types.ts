// ============================================================================
// DropdownMenu — Types
// Doc: .claude/roadmap/refront/fases/fase-0-redash-impl.md (DEC-IMPL0-B)
// Figma: 1056:8903 (dropdown opcoes do card)
// ============================================================================

/**
 * Item do dropdown menu. Pode ser action button OU divider.
 * Para divider, basta `divider: true` (label/key opcionais).
 */
export interface DropdownMenuItem {
  /** Chave unica — emitida em itemSelect quando clicado. Ignorada em divider. */
  key: string;
  /** Label exibido. Ignorado em divider. */
  label: string;
  /**
   * Heroicon name (ex: 'heroArrowPath', 'heroArrowRightOnRectangle').
   * Renderizado a esquerda do label. Mutuamente exclusivo com iconImageSrc.
   */
  icon?: string;
  /**
   * Caminho do SVG (relativo a public/). Ex: 'branding/icons/menu/dashboard.svg'.
   * Renderizado a esquerda do label. Mutuamente exclusivo com icon.
   */
  iconImageSrc?: string;
  /**
   * Variant visual:
   *   - default: cor de texto padrao
   *   - danger: cor vermelha (delete actions)
   * Default: 'default'.
   */
  variant?: 'default' | 'danger';
  /** Item desabilitado — nao clicavel, visualmente atenuado. */
  disabled?: boolean;
  /**
   * Quando true, este item nao e renderizado como button — e uma linha
   * divisoria (separator). Outros campos sao ignorados.
   */
  divider?: boolean;
  /**
   * Quando true, o item e renderizado como section header (atenuado, sem
   * hover, nao clicavel) — util para agrupar items por categoria.
   * Mutuamente exclusivo com `divider`.
   */
  header?: boolean;
  /**
   * Quando true, clicar no item NAO fecha o dropdown — emite itemSelect mas
   * mantem o menu aberto. Util para multi-select (ex: lista de toggles).
   * Default: false (click fecha o dropdown).
   */
  keepOpen?: boolean;
}

/**
 * Posicao do dropdown relativa ao trigger. Default: 'bottom-end'.
 *
 * - bottom-start: dropdown abaixo, alinhado a esquerda do trigger
 * - bottom-end: dropdown abaixo, alinhado a direita do trigger
 * - top-start: dropdown acima, alinhado a esquerda
 * - top-end: dropdown acima, alinhado a direita
 */
export type DropdownMenuPosition = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
