// ============================================================================
// PageHeader — Types
// Doc: .claude/design-system/components/page-header.md
// ============================================================================

/**
 * Variants do page-header.
 *
 * - default: Dashboard principal — inclui botoes "Reorganizar" e "Personalizar"
 * - module-dashboard: Dashboards de modulos (Ensino, Lives, etc) — sem
 *   Reorganizar/Personalizar
 * - screen-list: Listagens (Cursos, Mentorias, etc)
 * - screen-create: Criacao com wizard (page-nav abaixo)
 * - screen-detail: Telas de detalhe
 */
export type PageHeaderVariant =
  | 'default'
  | 'module-dashboard'
  | 'screen-list'
  | 'screen-create'
  | 'screen-detail';

/**
 * Item de breadcrumb. Se route e fornecido, item vira link clicavel.
 */
export interface PageHeaderBreadcrumb {
  label: string;
  route?: string;
}
