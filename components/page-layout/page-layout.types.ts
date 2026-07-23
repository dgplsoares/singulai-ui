// ============================================================================
// PageLayout — Types
// Doc: .claude/design-system/components/page-layout.md
// ============================================================================

/**
 * Variants do page-layout.
 *
 * - dashboard: header + page-main com scroll vertical (sem nav, sem footer)
 * - list: identico ao dashboard, usado em listagens
 * - wizard: header + page-nav (tabs) + page-main + page-footer-sticky (botoes)
 * - tabs-internas: header + page-nav (tabs internas) + page-main (sem footer)
 * - detail-fullwidth: header + page-main (sem nav, sem footer)
 */
export type PageLayoutVariant =
  | 'dashboard'
  | 'list'
  | 'wizard'
  | 'tabs-internas'
  | 'detail-fullwidth';

/**
 * Estado do AI Assistant em relacao ao layout.
 * Quando 'open', a area main reduz para deixar espaco a direita.
 */
export type AiAssistantLayoutState = 'closed' | 'open';

/**
 * Painel ativo no nav-footer mobile (DEC-DS-MOB-002).
 * Apenas 1 painel pode estar aberto por vez (mutex). null = nenhum.
 *
 * - 'navegue'  : painel com lista de items raiz (substitui sidebar offcanvas)
 * - 'ai'       : painel AI Assistant full-screen (mobile equivalente do desktop)
 * - 'alertas'  : painel notificacoes (placeholder vazio nesta sprint)
 * - 'conta'    : painel minha conta (placeholder vazio nesta sprint)
 */
export type NavFooterPanel = 'navegue' | 'ai' | 'alertas' | 'conta';
