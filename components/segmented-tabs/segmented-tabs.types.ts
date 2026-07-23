// ============================================================================
// SegmentedTabs — Types
// ============================================================================

/**
 * Item de tab do segmented control. Cada item vira um botao na linha de tabs.
 *
 * Border-radius das pontas eh aplicado automaticamente baseado em $first/$last
 * do @for — nao precisa ser configurado por item.
 */
export interface SegmentedTabItem<K extends string = string> {
  /** Identificador unico do tab (chave usada em activeKey + emits). */
  key: K;
  /** Texto principal do tab. */
  label: string;
  /**
   * Nome do icone heroicon (ex: 'heroPlusCircle'). O parent registra os
   * icones via provideIcons.
   */
  icon?: string;
  /** Tamanho do icone. Default '17px'. */
  iconSize?: string;
  /**
   * Quando true, exibe um botao X ao final do tab. Click no X emite
   * (itemClose) com a key — parent decide o que fazer (ex: remover do array).
   */
  closable?: boolean;
  /** Aria-label para o close button. Default "Fechar". */
  closeAriaLabel?: string;
}
