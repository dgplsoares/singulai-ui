// ============================================================================
// FilterDropdown — Types (REDASH-FASE-A A.4)
// Figma: 952-15654 (trigger fechado) + 952-16189 (menu aberto) +
//        952-16238 (filtro aplicado) + 952-16231 (checkboxes multi-select)
// ============================================================================

/**
 * Opcao individual do filter dropdown.
 *
 * Pattern: typicamente o primeiro item e "Todos" (value especial) que
 * representa "sem filtro / mostrar tudo". Clicar nele desmarca os demais.
 * Caller controla essa logica via `selectedValues`.
 */
export interface FilterDropdownItem {
  /** Identificador unico do filtro (emitido em filtersChange). */
  value: string;

  /** Label exibido (ex: 'Confirmados'). */
  label: string;

  /**
   * Contagem opcional exibida em parenteses apos o label (ex: 'Confirmados (3)').
   * Quando omitido, label e renderizado sem o sufixo.
   */
  count?: number;

  /** Desabilita o item (visualmente atenuado + nao clicavel). */
  disabled?: boolean;
}

/**
 * Posicao do dropdown relativa ao trigger. Reusa o mesmo enum de
 * <ds-dropdown-menu> para consistencia.
 */
export type FilterDropdownPosition =
  | 'bottom-start'
  | 'bottom-end'
  | 'top-start'
  | 'top-end';

/**
 * Modo de selecao do filtro.
 *
 * - `multi` (default): caller mantem `selectedValues: string[]`; click toggla
 *   o value (add/remove). Overlay permanece aberto entre clicks. Marca
 *   `aria-multiselectable="true"`.
 * - `single`: caller mantem `selectedValues: [value]`; click em qualquer
 *   item substitui a selecao por aquele unico value e FECHA o overlay.
 *   Marca `aria-multiselectable="false"`. Compativel com padrao de filtros
 *   de status em listagens (G.4.x — DEC-G4.3-F).
 */
export type FilterDropdownMode = 'single' | 'multi';
