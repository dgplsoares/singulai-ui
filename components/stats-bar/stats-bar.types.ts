// ============================================================================
// StatsBar — Types (REDASH-FASE-A A.2 revisado 2026-05-12)
//
// Container slot-based. Cards filhos sao <ds-statsbar-card> — types do
// card (StatsbarCardVariant etc) vivem na pasta statsbar-card/.
// ============================================================================

/**
 * Numero de colunas do container. Default 4. Em mobile (<=991px) cai para
 * 2x2 grid automaticamente (exceto 1/2 que mantem).
 */
export type StatsBarColumns = 1 | 2 | 3 | 4 | 5 | 6;
