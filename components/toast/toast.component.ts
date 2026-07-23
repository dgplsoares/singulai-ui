import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  computed,
  input,
} from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroCheckCircle,
  heroExclamationTriangle,
  heroInformationCircle,
  heroXCircle,
  heroXMark,
} from '@ng-icons/heroicons/outline';

import { ToastVariant } from './toast.types';

/**
 * Toast — item visual individual de notificacao.
 *
 * Renderizado N vezes pelo <ds-toast-host> conforme o stack do ToastService.
 * Nao deve ser usado diretamente — sempre via toast.success(), toast.error()
 * etc. do ToastService.
 *
 * 4 variants visuais (success/info/warning/error), cada uma com:
 *   - Icone (heroicons outline)
 *   - Cor de accent na border-left (4px)
 *   - Cor do icone
 *
 * Botao X dismiss emite evento (click) que o host consome chamando
 * ToastService.dismiss(id).
 */
@Component({
  selector: 'ds-toast',
  standalone: true,
  imports: [NgIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  providers: [
    provideIcons({
      heroCheckCircle,
      heroInformationCircle,
      heroExclamationTriangle,
      heroXCircle,
      heroXMark,
    }),
  ],
})
export class ToastComponent {
  /** Variant visual. */
  readonly variant = input.required<ToastVariant>();

  /** Mensagem textual. */
  readonly message = input.required<string>();

  /** Emite quando o user clica no botao X. Host consome e chama dismiss. */
  @Output() readonly dismissed = new EventEmitter<void>();

  /** Mapa variant -> nome do heroicon. */
  protected readonly iconName = computed<string>(() => {
    const map: Record<ToastVariant, string> = {
      success: 'heroCheckCircle',
      info: 'heroInformationCircle',
      warning: 'heroExclamationTriangle',
      error: 'heroXCircle',
    };
    return map[this.variant()];
  });

  protected onDismiss(): void {
    this.dismissed.emit();
  }
}
