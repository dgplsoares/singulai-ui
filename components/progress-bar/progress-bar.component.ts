import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

import {
  PROGRESS_BAR_SIZES,
  ProgressBarSize,
  ProgressBarVariant,
} from './progress-bar.types';

/**
 * ProgressBar — barra de progresso visual generica do DS.
 *
 * Renderiza apenas a barra (track + fill) com chrome aninhado neumorphic.
 * Label, valor textual e delta % ficam fora — caller compoe.
 *
 * Visual baseado no Figma do dashboard Singulai (Uso do Plano + Funil de
 * Vendas): container externo com padding interno + track com bg sutil +
 * fill arredondado com cor variant.
 *
 * Uso:
 *   <ds-progress-bar [value]="78" variant="success" size="md" />
 *   <ds-progress-bar [value]="42" [max]="60" variant="purple" />
 *
 * Per convention/component-placement: vai no DS porque tem zero acoplamento
 * com dominio Singulai. API generica, configuravel via @Input, sem inject
 * de Service Singulai.
 */
@Component({
  selector: 'ds-progress-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.scss',
})
export class ProgressBarComponent {
  /** Valor atual (numerador). Required. */
  readonly value = input.required<number>();

  /** Maximo possivel (denominador). Default 100 para uso percentual direto. */
  readonly max = input<number>(100);

  /** Variant de cor do fill. Default apex (azul Singulai). */
  readonly variant = input<ProgressBarVariant>('apex');

  /** Tamanho da barra. md (10px height) bate com o Figma do dashboard. */
  readonly size = input<ProgressBarSize>('md');

  /**
   * Aria-label customizado. Quando ausente, o aria-valuenow + valuetext sao
   * suficientes (a screen reader anuncia "60 de 100, 60 por cento").
   */
  readonly ariaLabel = input<string | null>(null);

  // --------------------------------------------------------------------------
  // Computed
  // --------------------------------------------------------------------------

  /** Percentual 0-100, clamp aplicado para evitar overflow visual. */
  protected readonly percent = computed(() => {
    const v = this.value();
    const m = this.max();
    if (!m || m <= 0) return 0;
    return Math.min(100, Math.max(0, (v / m) * 100));
  });

  /** Texto acessivel descrevendo o estado da barra. */
  protected readonly accessibleValueText = computed(
    () => `${this.value()} de ${this.max()}`,
  );

  /** Mapa de dimensoes para o size atual. */
  protected readonly dimensions = computed(
    () => PROGRESS_BAR_SIZES[this.size()],
  );
}
