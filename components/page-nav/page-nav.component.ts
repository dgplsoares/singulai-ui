import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroDocumentText,
  heroAcademicCap,
  heroVideoCamera,
  heroCurrencyDollar,
  heroMagnifyingGlass,
  heroPhoto,
  heroCheckCircle,
  heroSparkles,
  heroPresentationChartBar,
  heroCalendarDays,
  heroUserGroup,
  heroCog6Tooth,
} from '@ng-icons/heroicons/outline';
import { DsActiveSpinDirective } from '../../directives/active-spin.directive';

/**
 * Item do nav (uma "step" do wizard).
 *
 * O icone pode vir de duas fontes:
 *   - `iconSrc`: path/URL de SVG custom (preferido — Figma fornece SVGs
 *     proprios para cada wizard, ex: assets/wizard-tabs-nav/cursos/*.svg)
 *   - `icon`: nome de heroicon como fallback
 */
export interface PageNavStep {
  /** Identificador unico (usado pelo activeStepId + stepClick). */
  id: string;
  /** Label visivel. */
  label: string;
  /** Path/URL de SVG custom (preferido). */
  iconSrc?: string;
  /** Nome do heroicon como fallback quando iconSrc nao for fornecido. */
  icon?: string;
  /**
   * Marca a step como CONCLUIDA. Nao e cosmetico: e o unico sinal visual de
   * quais abas o gate de navegacao libera.
   *
   * concluida -> #3E6FCA (label + icone, asset no tom natural)
   * pendente  -> #8599AC (label) + icone dessaturado
   *
   * Ignorado na step corrente, que tem visual proprio.
   */
  completed?: boolean;
  /**
   * ⭐ O ícone é **monocromático** — desenhado numa cor só.
   *
   * ⛔ **Muda COMO o estado pendente é pintado, e a razão está medida.** O padrão aplica
   * `saturate(.7) brightness(.8) opacity(.42)` ao asset, uma cadeia **resolvida
   * numericamente** contra o alvo `#A1B5C8` dos ícones de Cursos — que são **bicolores**
   * (`#3E6FCA` + `#C5D2E8`) e por isso não podem ser achatados numa cor só.
   *
   * Com `monocromatico: true` o ícone vira **máscara** e a cor vem do CSS: exata nos dois
   * estados, sem aproximação. Medido em 2026-09-05, para os ícones de Minha Assinatura:
   * ```
   * filtro aplicado ao #3E6FCA  ->  rgb(164,178,202)
   * alvo do desenho  (#B6C3D4)  ->  rgb(182,195,212)   delta (-18,-17,-10)
   * alvo antigo      (#A1B5C8)  ->  rgb(161,181,200)   delta (  3, -3,  2)
   * ```
   * ⇒ o filtro acerta o alvo para que foi calibrado e **erra visivelmente** o novo.
   *
   * ⚠️ **`false` por padrão**: os consumidores existentes (Cursos, Mentorias, Eventos)
   * continuam no filtro, pixel por pixel. Input novo que muda o visual de quem já usa é
   * regressão com nome de melhoria.
   */
  monocromatico?: boolean;

  /** Opcional: desabilita o click. */
  disabled?: boolean;
}

/**
 * <ds-page-nav>
 *
 * Nav horizontal com steps para wizards (Cursos, Mentorias, Eventos).
 * Pixel-perfect contra Figma 590:1121 + tipografia 784:14261.
 *
 * Ajustes pos-smoke (C.1 iter 2):
 * - Active button: replica visual canonico do <ds-sidebar__menu-item--active>
 *   no estado expanded (sidebar--expanded). Ring duplo #3577EB + #FFFFFF35,
 *   drop-shadow filter neumorphic, e spin one-shot via dsActiveSpin.
 * - Inactive items: color #3E6FCA (Figma blue_1) — NAO o cinza #8599AC
 *   anterior.
 * - Tipografia: Manrope Bold 13/11 (mantida).
 * - Icones: suporte a SVG custom (iconSrc) — wizard Cursos usa
 *   assets/wizard-tabs-nav/cursos/navitem-<id>.svg.
 *
 * LIGHTMODE-FIRST: zero :host-context(.dark).
 *
 * Componente NOVO — nao tem shared equivalente (DEC-C-A: standalone).
 */
@Component({
  selector: 'ds-page-nav',
  standalone: true,
  imports: [CommonModule, NgIcon, DsActiveSpinDirective],
  providers: [
    provideIcons({
      heroDocumentText,
      heroAcademicCap,
      heroVideoCamera,
      heroCurrencyDollar,
      heroMagnifyingGlass,
      heroPhoto,
      heroCheckCircle,
      heroSparkles,
      heroPresentationChartBar,
      heroCalendarDays,
      heroUserGroup,
      heroCog6Tooth,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './page-nav.component.html',
  styleUrl: './page-nav.component.scss',
})
export class PageNavComponent {
  /** Lista de steps a renderizar. */
  readonly steps = input.required<PageNavStep[]>();

  /** Step ativo (renderiza com visual canonico do sidebar active). */
  readonly activeStepId = input.required<string>();

  /** Emitido quando o usuario clica numa step (id da step). */
  readonly stepClick = output<string>();

  protected onStepClick(step: PageNavStep): void {
    if (step.disabled) return;
    this.stepClick.emit(step.id);
  }

  protected isActive(step: PageNavStep): boolean {
    return step.id === this.activeStepId();
  }
}
