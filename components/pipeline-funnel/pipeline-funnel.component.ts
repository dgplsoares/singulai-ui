import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { ProgressBarComponent } from '../progress-bar';
import { PipelineFunnelItem } from './pipeline-funnel.types';

/**
 * PipelineFunnel — lista vertical de buckets com label + value + delta + barra
 * de progresso colorida.
 *
 * Usado no Dashboard Principal:
 *   - Card "Funil de Vendas" (Figma 1042:28755): 6 buckets (Novos leads,
 *     Qualificados, Propostas, Call Agendada, Em negociacao, Convertidos)
 *   - Card "Pipeline de SDR IA" (Figma 1042:28890): mesma estrutura com
 *     dados proprios do agent SDR
 *
 * Visual de cada item:
 *   ┌─────────────────────────────────────┐
 *   │ Novos leads               10  15% ▲ │  <- label + value + delta
 *   │ ████████░░░░░░░░░░░░░░░░░░░░░░░░░░ │  <- progress bar colorida
 *   └─────────────────────────────────────┘
 *
 * Reusa `<ds-progress-bar>` (REDASH-PREP-1) — todas as 8 variants de cor
 * disponiveis (apex/success/warning/danger/info/purple/pink/neutral).
 *
 * Uso:
 *   <ds-pipeline-funnel [items]="funilItems" />
 */
@Component({
  selector: 'ds-pipeline-funnel',
  standalone: true,
  imports: [ProgressBarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pipeline-funnel.component.html',
  styleUrl: './pipeline-funnel.component.scss',
})
export class PipelineFunnelComponent {
  /** Lista de buckets do pipeline. Ordem de exibicao = ordem do array. */
  readonly items = input.required<PipelineFunnelItem[]>();

  /** Aria-label do container — para screen readers. */
  readonly ariaLabel = input<string>('Pipeline de etapas');

  /**
   * Computa se o delta deve mostrar como negativo (vermelho/down arrow):
   *   - direction='down' (sem inverse) → negativo
   *   - direction='up' + inversePolarity=true → negativo
   *   - direction='down' + inversePolarity=true → positivo (raro)
   *   - direction='up' (sem inverse) → positivo
   */
  protected isDeltaNegative(item: PipelineFunnelItem): boolean {
    const isUp = item.deltaDirection !== 'down';
    return item.inversePolarity ? isUp : !isUp;
  }
}
