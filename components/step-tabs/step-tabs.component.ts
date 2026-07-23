import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroSparkles,
  heroBars3,
  heroVideoCamera,
  heroPresentationChartBar,
  heroBookOpen,
  heroCheckCircle,
  heroDocumentText,
} from '@ng-icons/heroicons/outline';
import { StepTabItem } from './step-tabs.types';

/**
 * <ds-step-tabs>
 *
 * Sub-Fase E.6.A (2026-06-23). DEC-FIG-D-AULAS-E.6.B.
 *
 * Tabs horizontais para steps internos de offcanvas multi-step (criar/editar
 * aula per tipo: Videoaula 4 steps, Ebook/Quiz/Texto 2 steps). Pixel-perfect
 * contra Figma 706:1864 (container neumorphic) + 711:2094 (item ativo com
 * chrome elaborado) + 711:2111 (item inativo).
 *
 * USO ESPERADO: cabecalho do body de offcanvas multi-step. NAO usar para tabs
 * de pagina (use <ds-page-nav>) nem para filtros pill (use <ds-segmented-tabs>).
 *
 * API discriminated union: items: StepTabItem<K>[] (cada um com key + label +
 * iconLeft?). activeKey controla o destaque. (tabChange) emite ao clicar.
 *
 * LIGHTMODE-FIRST.
 */
@Component({
  selector: 'ds-step-tabs',
  standalone: true,
  imports: [CommonModule, NgIcon],
  providers: [
    provideIcons({
      heroSparkles,
      heroBars3,
      heroVideoCamera,
      heroPresentationChartBar,
      heroBookOpen,
      heroCheckCircle,
      heroDocumentText,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './step-tabs.component.html',
  styleUrl: './step-tabs.component.scss',
})
export class StepTabsComponent<K extends string = string> {
  /** Items dos steps (key + label + iconLeft). */
  readonly items = input.required<StepTabItem<K>[]>();

  /** Key do step ativo. */
  readonly activeKey = input.required<K>();

  /** Estado disabled (todos os tabs nao-clicaveis). */
  readonly disabled = input<boolean>(false);

  /** Emitido ao clicar em um step (passa a key). */
  readonly tabChange = output<K>();

  protected onTabClick(key: K, event: Event): void {
    if (this.disabled()) return;
    if (key === this.activeKey()) return;
    event.stopPropagation();
    this.tabChange.emit(key);
  }
}
