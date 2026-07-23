import { ChangeDetectionStrategy, Component, EventEmitter, Output, input } from '@angular/core';

import { DsActiveSpinDirective } from '../../directives/active-spin.directive';

/**
 * AiAssistantButton — botao do AI Assistant do combo header.
 *
 * Replica fiel do node Figma 1094:15285 (estado DEFAULT) e 1088:13824 (active).
 * Renderiza apenas o SVG sparkles — sparkles.svg (viewBox 0 0 23.7401 19.2631).
 *
 * Estados: default + hover + active (AI Assistant aberto).
 * O active reaproveita estrutura do dashboard menu-item-active (triple ring +
 * bg #EFF3F8 + inset neumorphic + filter drop-shadow).
 *
 * Animacao spin one-shot ao ativar via mixin ds-active-spin-ring +
 * diretiva [dsActiveSpin] (REDASH-PREP-5.1).
 */
@Component({
  selector: 'ds-ai-assistant-button',
  standalone: true,
  imports: [DsActiveSpinDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ai-assistant-button.component.html',
  styleUrl: './ai-assistant-button.component.scss',
})
export class AiAssistantButtonComponent {
  readonly ariaLabel = input<string>('Abrir Assistente IA');

  /** Estado active — AI Assistant panel aberto. */
  readonly active = input<boolean>(false);

  // Asset override (split-ready). Default preserva path Singulai atual.
  readonly sparklesIconSrc = input<string>('branding/icons/sparkles.svg');

  @Output() readonly clicked = new EventEmitter<MouseEvent>();

  protected onClick(event: MouseEvent): void {
    this.clicked.emit(event);
  }
}
