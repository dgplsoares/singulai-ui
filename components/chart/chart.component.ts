import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

import { ChartWidgetComponent } from '../../../app/shared/components/widgets/chart-widget/chart-widget.component';
import { ChartConfig, ChartData } from '../../../app/shared/models/widget.model';

/**
 * Paleta DS default para series multi-color (multi-line area, pie, doughnut).
 * Mapeada para tokens DS via valores literais. Caller pode sobrescrever
 * passando `config.colors` no ChartConfig.
 *
 * Ordem escolhida para charts dashboard: apex (azul primario) -> success
 * (verde) -> warning (laranja) -> danger (vermelho) -> purple -> info.
 * (DEC-PREP4-B)
 */
const DS_DEFAULT_COLORS = [
  '#3C72D0', // apex-blue-500
  '#38A173', // status-success canon
  '#BE833F', // status-warning canon
  '#BC3232', // status-danger canon
  '#7641BF', // purple
  '#3C72D0', // info (= apex)
];

/**
 * Defaults DS para tooltip neumorphic (DEC-PREP4-C).
 * Wrappar passa esses valores no config se caller nao especificar.
 */
const DS_TOOLTIP_DEFAULTS = {
  backgroundColor: '#FFFFFF',
  textColor: '#0B1E40',
  borderColor: '#E5E7EB',
};

/**
 * Defaults DS para tipografia/cores dos eixos.
 */
const DS_AXIS_DEFAULTS = {
  labelColor: '#5C6F8E',
  gridColor: 'rgba(213, 220, 230, 0.5)',
  fontFamily: 'Manrope, sans-serif',
  fontSize: 12,
};

/**
 * Chart — wrapper config-only de `<app-chart-widget>` (DEC-PREP4-A).
 *
 * Mesma estrategia do `<ds-datatable>` (PREP-3): forwarda `[config]` +
 * `[data]` para o shared sem duplicar logica. Aplica defaults DS quando
 * caller nao especifica:
 *   - Paleta de cores (tokens DS) — DEC-PREP4-B
 *   - Tooltip neumorphic (bg branco + texto escuro + border DS) — DEC-PREP4-C
 *   - Tipografia eixos Manrope SemiBold 12px — DEC-PREP4-E
 *
 * Caller pode sobrescrever qualquer default via ChartConfig (props additive).
 *
 * Container externo aplica chrome canonico Figma 1042:28615 (border #DFE3EA
 * + radius 10 + bg semi-transparente + inner border white) — DEC-PREP4-D.
 *
 * Acoplamento: O DS depende de `app/shared/components/widgets/chart-widget/`.
 * Aceitavel temporariamente ate promocao desse component para o DS.
 *
 * @example
 *   <ds-chart
 *     [config]="{ type: 'chart', chartType: 'area', height: 240 }"
 *     [data]="receitasData"
 *   />
 */
@Component({
  selector: 'ds-chart',
  standalone: true,
  imports: [ChartWidgetComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss',
})
export class ChartComponent {
  /** Configuracao do grafico (chartType, height, colors, legend, etc.). */
  readonly config = input.required<ChartConfig>();

  /** Dados do grafico (labels + datasets). */
  readonly data = input<ChartData | null>(null);

  /**
   * Config processado com defaults DS aplicados. Caller pode override
   * qualquer prop via [config] — o spread mantem prioridade do caller.
   */
  protected readonly processedConfig = computed<ChartConfig>(() => {
    const cfg = this.config();
    return {
      ...cfg,
      colors: cfg.colors ?? DS_DEFAULT_COLORS,
      tooltipBackgroundColor:
        cfg.tooltipBackgroundColor ?? DS_TOOLTIP_DEFAULTS.backgroundColor,
      tooltipTextColor: cfg.tooltipTextColor ?? DS_TOOLTIP_DEFAULTS.textColor,
      tooltipBorderColor:
        cfg.tooltipBorderColor ?? DS_TOOLTIP_DEFAULTS.borderColor,
      axisLabelColor: cfg.axisLabelColor ?? DS_AXIS_DEFAULTS.labelColor,
      gridlineColor: cfg.gridlineColor ?? DS_AXIS_DEFAULTS.gridColor,
      axisFontFamily: cfg.axisFontFamily ?? DS_AXIS_DEFAULTS.fontFamily,
      axisFontSize: cfg.axisFontSize ?? DS_AXIS_DEFAULTS.fontSize,
    };
  });
}
