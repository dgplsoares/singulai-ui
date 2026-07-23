// ============================================================================
// Card — Types
// Doc: .claude/design-system/components/card.md
// ============================================================================

/**
 * Variants do card.
 *
 * - default: card padrao com header (icon + titulo + acoes) + body
 * - dashboard: card de dashboard (com nav-tabs period-selector + dropdown opcoes)
 * - with-tabs: card com nav-tabs no header
 * - simple: card sem dropdown opcoes (so icone + titulo + body)
 * - inner-card: card dentro de outro card (datatable wrapper) — sem icone neumorphic
 */
export type CardVariant =
  | 'default'
  | 'dashboard'
  | 'with-tabs'
  | 'simple'
  | 'inner-card';

/** Estado do card. */
export type CardState = 'default' | 'loading' | 'empty' | 'error';

/** Item de nav-tabs no header do card. */
export interface CardNavTab {
  key: string;
  label: string;
  active?: boolean;
}

/** Item de dropdown options no header do card. */
export interface CardDropdownItem {
  key: string;
  label: string;
  icon?: string;
  variant?: 'default' | 'danger';
  divider?: boolean;
}
