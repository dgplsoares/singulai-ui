// ============================================================================
// ProgressBar — Types
// Doc: .claude/roadmap/dashboard-redesign.md (PREP-1)
// Figma: 1042:28527 (Uso do Plano), 1042:28755 (Funil de Vendas)
// ============================================================================

/**
 * Tamanho da barra (altura). md (10px) bate com o Figma do dashboard
 * principal. sm/lg sao variantes para outros contextos.
 */
export type ProgressBarSize = 'sm' | 'md' | 'lg';

/**
 * Variant de cor do fill da barra. Cores escolhidas a partir das paletas
 * do Figma do Funil de Vendas (1042:28755), onde cada item tem cor
 * coordenada com seu label. Alinhadas com IconNeumorphicVariant + adicao
 * de 'pink' (Figma C746DB) usada em "Call Agendada".
 */
export type ProgressBarVariant =
  | 'apex' // azul Apex Singulai (default)
  | 'success' // verde — convertidos / positivo
  | 'warning' // laranja — propostas / atencao
  | 'danger' // vermelho — falha / acima do limite
  | 'info' // turquesa — em negociacao / em progresso
  | 'purple' // roxo — novos leads / categoria 1
  | 'pink' // rosa — call agendada / categoria 2
  | 'neutral'; // cinza — generico / desabilitado

export interface ProgressBarSizeMap {
  /** Altura interna da track (px) */
  trackHeight: number;
  /** Padding do container externo (px) */
  containerPadding: number;
}

export const PROGRESS_BAR_SIZES: Record<ProgressBarSize, ProgressBarSizeMap> = {
  sm: { trackHeight: 6, containerPadding: 2 },
  md: { trackHeight: 10, containerPadding: 3 }, // padrao Figma
  lg: { trackHeight: 14, containerPadding: 4 },
};
