// ============================================================================
// Badge — Types (REDASH-FASE-A A.5)
// Doc: .claude/roadmap/refront/fases/fase-A-listagem-core-ds.md
// Figma: 627-3162 (rounded variant) + patterns inline IMPL-6/11/13 (pill variant)
//
// Padronizacao DEC-DSA-L: 8 variants alinhadas com <ds-progress-bar>.
// Cores consolidadas das mini-tables IMPL-6/11/13 (Leads/Tickets/Campaigns)
// + statsbar variants + ds-apex tokens.
// ============================================================================

/**
 * Variants de cor do badge. Padronizado com <ds-progress-bar> (DEC-DSA-L).
 *
 * Cada variant define um par bg + color (definido no SCSS):
 *   - apex     — azul Singulai      (#E6EFFF / #3C72D0)
 *   - success  — verde positivo     (#DDEDDF / #3BA36F)
 *   - warning  — laranja-mostarda   (#FFEEDA / #7E511E)
 *   - danger   — vermelho           (#FBE5E5 / #BC3232)
 *   - info     — turquesa info      (#DDF1F2 / #46969C)
 *   - purple   — roxo               (#E8DCF9 / #7641BF)
 *   - pink     — rosa               (#FCE4EC / #C2185B)
 *   - neutral  — cinza              (#E5EBF2 / #5C6F8E)
 */
export type BadgeVariant =
  | 'apex'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'purple'
  | 'pink'
  | 'neutral';

/**
 * Tamanho do badge. sm e o default das mini-tables (10px font); md e
 * ligeiramente maior (11px) — usado em headers/labels.
 */
export type BadgeSize = 'sm' | 'md';

/**
 * Shape do badge.
 *   - pill     — bordas arredondadas total (50px) — pattern dos status badges
 *                das mini-tables IMPL-6/11/13 (Leads/Tickets/Campaigns).
 *   - rounded  — cantos arredondados (8px) — pattern do Figma 627-3162
 *                (badge com icone, usado em status de assets de aula).
 */
export type BadgeShape = 'pill' | 'rounded';
