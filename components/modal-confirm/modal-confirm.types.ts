// ============================================================================
// Modal Confirm — Types (REDASH-PREP-3)
// Spec: .claude/links-figma-redesign-telas.md (linha 7 + Figma 805:4558)
// Doc: .claude/roadmap/dashboard-redesign.md (PREP-3)
// ============================================================================

/**
 * 4 variants semanticas do modal de confirmacao (DEC-PREP3-B).
 *
 * Default = `danger` — caso predominante per spec linha 7:
 * "Todas as requisições de delete abrirão um modal centralizado de
 *  confirmação de exclusão do registro."
 *
 * Cores accent (DEC-PREP3-D + DEC-FIG-PREP3-1):
 *   - danger: #935050 (Figma 805:4558 — burgundy delete)
 *   - warning: #BE833F (alinhado com tokens DS warning)
 *   - info: #3C72D0 (alinhado com tokens DS apex/info)
 *   - success: #38A173 (alinhado com tokens DS success)
 */
export type ModalConfirmVariant = 'info' | 'success' | 'warning' | 'danger';
