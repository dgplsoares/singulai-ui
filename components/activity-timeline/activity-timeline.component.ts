import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';

import type { DsActivityItem } from './activity-timeline.types';

/**
 * ============================================================================
 * `ds-activity-timeline` — a linha do tempo em DUAS COLUNAS ALTERNADAS
 * ============================================================================
 *
 * Figma `927:16262`: duas colunas de cartões, uma régua vertical ao centro e um marcador por
 * item. Cada cartão tem ícone + título colorido, descrição, selos e carimbo de tempo.
 *
 * ⛔ **POR QUE NÃO REUSEI O `ds-conversation-timeline`:** ele agrupa MENSAGENS por sessão, com
 * dois lados fixos por AUTOR (`them`/`us`) e balões. Aqui os lados alternam por POSIÇÃO, não
 * por autor, e o conteúdo é um cartão com selos. Mesma palavra, outro objeto — forçar um no
 * outro criaria um componente com dois modos que não se parecem.
 *
 * ⛔ **E ELE NÃO ENTRA NO BARRIL** (`design-system/index.ts`), pela mesma razão do irmão: o
 * barril empurra tudo para o bundle inicial (`DIV-DS-BARRIL-INICIAL`), e o `CARGA.4` do Mac
 * mostrou o custo real disso — o `chart.js` viajava para todo visitante da vitrine. O
 * consumidor importa pelo caminho fundo.
 *
 * ⚠️ **O DS não formata data de domínio nem compõe frase** — recebe `title`, `description` e
 * `at` prontos. É a `DEC-ATIV-F` do lado de cá: compor aqui exigiria que o DS conhecesse
 * estágios de lead.
 */
@Component({
  selector: 'ds-activity-timeline',
  standalone: true,
  imports: [NgIcon],
  templateUrl: './activity-timeline.component.html',
  styleUrl: './activity-timeline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DsActivityTimelineComponent {
  readonly items = input.required<DsActivityItem[]>();

  /**
   * ⭐ **A ALTERNÂNCIA É DERIVADA DO ÍNDICE, não um campo do item.** Pedir `side` ao consumidor
   * faria cada tela reimplementar a mesma conta — e errá-la ao filtrar a lista.
   * ⚠️ O primeiro item fica à DIREITA, como no desenho (`timeline-col-1` tem `pt-[110px]`, ou
   * seja a coluna da esquerda começa mais abaixo).
   */
  readonly comLado = computed(() =>
    this.items().map((item, i) => ({ item, direita: i % 2 === 0 })),
  );
}
