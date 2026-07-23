// ============================================================================
// PipelineFunnel — Types
// Doc: .claude/roadmap/refront/fases/fase-0-redash-impl.md (DEC-IMPL0-C)
// Figma: 1042:28755 (Funil de Vendas) / 1042:28890 (Pipeline SDR IA)
// ============================================================================

import type { ProgressBarVariant } from '../progress-bar/progress-bar.types';

/**
 * Direcao do delta — up (positivo) ou down (negativo).
 */
export type PipelineFunnelDeltaDirection = 'up' | 'down';

/**
 * Item individual de um pipeline-funnel. Cada um renderiza:
 *   [label]          [value] [deltaPercent% ▲/▼]
 *   [progress-bar fill colorido]
 *
 * Cores seguem ProgressBarVariant (DEC-PREP-1) — variant determina cor
 * da barra E do delta arrow. Caso o consumer queira label colorido tambem
 * (igual Figma), pode setar `labelColor` opcional.
 */
export interface PipelineFunnelItem {
  /** Chave unica do item (track + identificacao). */
  key: string;
  /** Label do bucket (ex: "Novos leads"). */
  label: string;
  /** Valor numerico/textual exibido (ex: 10 ou "10"). */
  value: number | string;
  /** Percentual da barra (0-100). Determina o fill width. */
  percent: number;
  /** Variant de cor da barra (apex/success/warning/danger/info/purple/pink/neutral). */
  variant: ProgressBarVariant;
  /** Delta percentual exibido a direita do value (opcional, ex: 15). */
  deltaPercent?: number;
  /** Direcao do delta arrow. Default: 'up'. */
  deltaDirection?: PipelineFunnelDeltaDirection;
  /**
   * Inverte polaridade do delta — quando true e direction='up', delta vira
   * negativo (red). Use quando aumento da metrica e ruim (ex: tickets em aberto).
   */
  inversePolarity?: boolean;
  /** Cor custom do label (opcional, hex ou CSS var). Default: cor padrao do label. */
  labelColor?: string;
}
