import { ChangeDetectionStrategy, Component, EventEmitter, Output, input } from '@angular/core';

/**
 * DarkModeButton — botao de alternar tema do combo header.
 *
 * Replica fiel do node Figma 1094:15268 (estado DEFAULT, sem efeitos).
 *
 * Estrutura composite (8 elementos posicionados em absolute):
 *  - moon-vector217.svg (lua principal) em (2.73, 2)  — 12.765 x 13.63
 *  - moon-vector.svg (cone de luz) rotacionado 15deg, centralizado em 18.564 x 18.26
 *  - 2 estrelinhas (left:11.01,top:1.2 e left:13.41,top:5.98) — cada uma e um "+"
 *    formado por 2 retangulos perpendiculares de 1.197 x 3.59 px (cor #7390B9)
 *
 * Effects neumorphic sao adicionados em fase posterior.
 */
@Component({
  selector: 'ds-dark-mode-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dark-mode-button.component.html',
  styleUrl: './dark-mode-button.component.scss',
})
export class DarkModeButtonComponent {
  readonly ariaLabel = input<string>('Alternar tema claro/escuro');

  // Asset overrides (split-ready). Defaults preservam paths Singulai atuais.
  readonly moonIconSrc = input<string>('branding/icons/moon-vector217.svg');
  readonly moonGlowIconSrc = input<string>('branding/icons/moon-vector.svg');

  @Output() readonly clicked = new EventEmitter<MouseEvent>();

  protected onClick(event: MouseEvent): void {
    this.clicked.emit(event);
  }
}
