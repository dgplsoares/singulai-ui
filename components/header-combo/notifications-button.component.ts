import { ChangeDetectionStrategy, Component, EventEmitter, Output, input } from '@angular/core';

import { DsActiveSpinDirective } from '../../directives/active-spin.directive';

/**
 * NotificationsButton — botao de notificacoes do combo header.
 *
 * Replica fiel do node Figma 1094:15280 (estado DEFAULT, sem efeitos).
 * Renderiza apenas o SVG do sino — bell.svg (viewBox 0 0 13.7502 17.75).
 *
 * Estados: default + hover + active (notifications panel aberto).
 * O active reaproveita estrutura visual do <ds-ai-assistant-button>--active.
 *
 * Animacao spin one-shot ao ativar via mixin ds-active-spin-ring +
 * diretiva [dsActiveSpin] (REDASH-PREP-5.1).
 */
@Component({
  selector: 'ds-notifications-button',
  standalone: true,
  imports: [DsActiveSpinDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notifications-button.component.html',
  styleUrl: './notifications-button.component.scss',
})
export class NotificationsButtonComponent {
  readonly ariaLabel = input<string>('Notificacoes');

  /** Estado active — notifications panel aberto (PREP-5). */
  readonly active = input<boolean>(false);

  // Asset override (split-ready). Default preserva path Singulai atual.
  readonly bellIconSrc = input<string>('branding/icons/bell.svg');

  @Output() readonly clicked = new EventEmitter<MouseEvent>();

  protected onClick(event: MouseEvent): void {
    this.clicked.emit(event);
  }
}
