import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';

import { ToastComponent } from './toast.component';
import { ToastService } from './toast.service';

/**
 * ToastHost — container singleton que renderiza o stack de toasts.
 *
 * Decisao B1: instanciado UMA vez no shell da app (app.component.html) com
 * `<ds-toast-host />`. Le `ToastService.toasts()` (signal) e renderiza um
 * `<ds-toast>` por instancia.
 *
 * Posicionamento (per spec linha 159 de links-figma-redesign-telas.md):
 *   - position: fixed
 *   - top: 70px (abaixo do header)
 *   - right: 70px
 *   - stack vertical (gap 12px), novos abaixo dos anteriores (decisao C1)
 *
 * Animacao (decisao D): slide-in da direita (300ms ease-out) + fade.
 * Animacao de saida usa o mesmo keyframe em reverso (~200ms).
 *
 * Acoplamento com dominio: ZERO. Componente de DS puro.
 */
@Component({
  selector: 'ds-toast-host',
  standalone: true,
  imports: [ToastComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './toast-host.component.html',
  styleUrl: './toast-host.component.scss',
})
export class ToastHostComponent {
  private readonly toastService = inject(ToastService);

  /** Stack de toasts visiveis. Re-renderiza quando service emite. */
  protected readonly toasts = this.toastService.toasts;

  protected onDismiss(id: number): void {
    this.toastService.dismiss(id);
  }
}
