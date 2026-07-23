// ============================================================================
// SidebarLeftNav — Types
// Doc: .claude/design-system/components/sidebar-left-nav.md
// ============================================================================

export interface SidebarMenuItem {
  /** Chave unica do item. */
  key: string;

  /** Label exibido (so quando expanded). */
  label: string;

  /** Nome do icone (heroX) — usado quando iconSrc nao for fornecido. */
  icon: string;

  /**
   * Caminho do SVG do icone (relativo a public/). Quando presente, e renderizado
   * via <img> ao inves do <ng-icon name=icon>.
   * Ex: 'branding/icons/menu/dashboard.svg'
   */
  iconSrc?: string;

  /**
   * Caminho do SVG do icone para o estado ACTIVE (rota atual). Quando presente,
   * substitui o iconSrc nesse estado. Ambos os <img> sao renderizados; o CSS
   * cuida de mostrar o correto via .ds-sidebar__menu-item--active.
   * Ex: 'branding/icons/menu/dashboard-active.svg'
   */
  iconSrcActive?: string;

  /**
   * Largura intrinseca do SVG (px) — informa ao browser o aspect ratio.
   * Aplicado como atributo `width` no <img>. Necessario em dispositivos
   * moveis para evitar dimensoes irregulares quando CSS usa width:auto ou
   * height:auto. Ex: para SVG viewBox "0 0 22 22" → iconWidth: 22.
   */
  iconWidth?: number;

  /**
   * Altura intrinseca do SVG (px) — par com iconWidth.
   * Ex: para SVG viewBox "0 0 22 22" → iconHeight: 22.
   */
  iconHeight?: number;

  /** Rota Angular (routerLink). */
  route?: string;

  /** Submenu items. Quando presente, click expande/colapsa em vez de navegar. */
  submenu?: SidebarMenuItem[];

  /** Visivel apenas para certos roles. Default: visivel para todos. */
  visibleForRoles?: string[];

  /**
   * SBSEARCH-2026-05-25 (DEC-SBSEARCH-C): termos extras para a busca interna
   * do sidebar. Match `searchQuery.toLowerCase().includes(keyword)` em
   * adicao ao label. Ajuda em sinonimos / abreviacoes / termos legacy.
   *
   * Ex: { label: 'Cursos', keywords: ['cursos', 'listar cursos', 'aulas'] }
   */
  keywords?: string[];
}

/**
 * SBSEARCH-2026-05-25: resultado da busca interna do sidebar.
 * `parent` presente = item filho (submenu); ausente = item raiz sem submenu.
 */
export interface SidebarSearchResult {
  item: SidebarMenuItem;
  parent?: SidebarMenuItem;
}

export type SidebarState = 'expanded' | 'collapsed';

export interface SidebarUser {
  name: string;
  avatarUrl?: string | null;
}
