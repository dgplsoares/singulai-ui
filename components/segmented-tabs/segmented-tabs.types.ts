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
  /**
   * Desabilita o item: ele continua VISIVEL, sem cursor e sem emitir `tabChange`.
   *
   * ⛔ **Existe porque esconder um comando o faz parecer inexistente.** Medido na `PT.3-FIX`
   * (2026-09-05): as listas de conteudo escondiam "Reorganizar" com menos de 2 itens
   * (`@if (length > 1)`), e a tenant de teste tinha **1 banner e 5 depoimentos** — o botao
   * sumiu em Banners e apareceu em Depoimentos. O fundador reportou os dois como problemas
   * DIFERENTES ("faltou" x "ajuste"), que e' exatamente o que a ausencia produz.
   */
  disabled?: boolean;
}
