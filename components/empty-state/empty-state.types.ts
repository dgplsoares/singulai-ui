// ============================================================================
// EmptyState — Types (REDASH-FASE-A A.6)
// Figma: 764-6987 (Lives Vinculadas empty card)
// Reusa pattern do empty state interno do <app-data-table> (ContentChild
// #emptyState + emptyStateMessage/Icon/Action).
// ============================================================================

/**
 * Variant semantica do empty state. Afeta a cor do icone e leve diferenciacao
 * visual. Padrao 'default' (placeholder neutro).
 */
export type EmptyStateVariant =
  | 'default'      // Pattern base — nada encontrado / lista vazia
  | 'no-results'   // Busca/filtro sem retorno — sugere "Limpar filtros"
  | 'no-data'      // Recurso ainda nao foi criado — sugere CTA "Criar primeiro X"
  | 'error';       // Erro ao carregar — sugere "Tentar novamente"

/**
 * Tamanho do empty state. sm e o pattern do Figma 764-6987 (em card-panel body);
 * md e lg sao para contextos com mais espaco (full page, telas vazias).
 */
export type EmptyStateSize = 'sm' | 'md' | 'lg';
