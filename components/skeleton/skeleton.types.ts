/**
 * Skeleton — tipos.
 *
 * REDASH-FASE-A A.8.
 *
 * Primitivos:
 *   - line   — barra horizontal de texto
 *   - circle — bloco circular (para avatares)
 *   - rect   — retangulo flexivel
 *
 * Composites (pre-baked layouts):
 *   - card      — painel com title + 3 linhas de body (pattern card-panel)
 *   - row       — linha de tabela com 5 celulas
 *   - chart     — placeholder de grafico (rect grande + 4 barras inferiores)
 *   - statsbar  — 4 statsbar-cards lado a lado (label + value)
 *   - list-item — avatar quadrado + 2 linhas (title + subtitle)
 */

export type SkeletonVariant =
  | 'line'
  | 'circle'
  | 'rect'
  | 'card'
  | 'row'
  | 'chart'
  | 'statsbar'
  | 'list-item';
