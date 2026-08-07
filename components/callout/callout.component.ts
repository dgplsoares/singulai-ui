import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroCheckCircle,
  heroExclamationTriangle,
  heroInformationCircle,
  heroVideoCamera,
  heroXCircle,
} from '@ng-icons/heroicons/outline';

import type { CalloutVariant } from './callout.types';

/**
 * `<ds-callout>` — caixa de aviso com icone, titulo e texto.
 *
 * ====================================================================
 * POR QUE ELE E' DO DS
 * ====================================================================
 * A arvore de placement do projeto comeca por "faria sentido em outro projeto
 * Angular sem nada de Singulai?". Uma caixa de aviso: sim — e a arvore para ai'.
 *
 * A medicao concorda: nao havia callout/alert/banner no DS, e ha' pelo menos 8
 * arquivos com caixas improvisadas em telas legadas. Fazer a nona aqui repetiria
 * a divida que a `W3.1` acabou de pagar.
 *
 * Desenho medido em `760:5891` (o aviso do Singulai Live no offcanvas de live).
 *
 * ====================================================================
 * `role` MUDA COM A VARIANTE
 * ====================================================================
 * `role="alert"` INTERROMPE o leitor de tela. Este bloco aparece ao lado de um
 * campo, como parte da explicacao dele — interromper a leitura seria hostil.
 * Por isso `note` no caso geral, e `alert` so' em `danger`, onde a interrupcao
 * e' o ponto.
 */
@Component({
  selector: 'ds-callout',
  standalone: true,
  imports: [NgIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './callout.component.html',
  styleUrl: './callout.component.scss',
  viewProviders: [
    provideIcons({
      heroInformationCircle,
      heroCheckCircle,
      heroExclamationTriangle,
      heroXCircle,
      heroVideoCamera,
    }),
  ],
})
export class CalloutComponent {
  readonly variant = input<CalloutVariant>('info');

  /**
   * Titulo em negrito acima do texto. `null` = sem titulo.
   *
   * `calloutTitle` e nao `title`: `title` e' atributo global do HTML e vira
   * tooltip nativo no host, que apareceria por cima do proprio aviso.
   */
  readonly calloutTitle = input<string | null>(null);

  /** Heroicon exibido no bloco a esquerda. `null` = sem icone. */
  readonly icon = input<string | null>(null);

  /** Ver a nota da classe. */
  readonly role = computed(() => (this.variant() === 'danger' ? 'alert' : 'note'));
}
