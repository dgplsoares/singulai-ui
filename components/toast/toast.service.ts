import { Injectable, signal } from '@angular/core';

import {
  TOAST_DEFAULT_DURATION_MS,
  TOAST_MAX_STACK,
  ToastInstance,
  ToastVariant,
} from './toast.types';

/**
 * ToastService — service global de notificacoes toastr-style.
 *
 * Singleton (providedIn: 'root'). Consumido pelo <ds-toast-host> que renderiza
 * o stack. API publica e simples (decisao A1) — 4 metodos para 4 variants:
 *
 *   const toast = inject(ToastService);
 *   toast.success('Curso criado!');
 *   toast.info('Reorganizacao salva.');
 *   toast.warning('Voce esta proximo do limite do plano.');
 *   toast.error('Falha ao conectar com o servidor.');
 *
 * Sem customizacao por chamada (sem options object). Duracao fixa por variant
 * (4s para success/info/warning, 6s para error). Max 5 toasts simultaneos
 * (FIFO drop). Dismiss manual via botao X cancela o timer interno.
 *
 * Per convention/component-placement: vai no DS porque tem zero acoplamento
 * com dominio Singulai. Operacional sem precisar de Service Singulai.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  /** Stack de toasts visiveis. Lido pelo <ds-toast-host> via signal. */
  private readonly _toasts = signal<ToastInstance[]>([]);
  readonly toasts = this._toasts.asReadonly();

  /** Contador interno para IDs unicos. */
  private nextId = 1;

  /** Timers ativos (uma entrada por toast). Limpos em dismiss/auto-destroy. */
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();

  // --------------------------------------------------------------------------
  // API publica — 4 metodos por variant
  // --------------------------------------------------------------------------

  /** Notificacao de sucesso (verde). Auto-destroy 4s. */
  success(message: string): void {
    this.add('success', message);
  }

  /** Notificacao informativa (azul). Auto-destroy 4s. */
  info(message: string): void {
    this.add('info', message);
  }

  /** Notificacao de atencao (laranja). Auto-destroy 4s. */
  warning(message: string): void {
    this.add('warning', message);
  }

  /** Notificacao de erro (vermelho). Auto-destroy 6s (mais tempo para ler). */
  error(message: string): void {
    this.add('error', message);
  }

  // --------------------------------------------------------------------------
  // API interna — controle de queue
  // --------------------------------------------------------------------------

  /**
   * Dismiss programatico de um toast pelo id. Usado pelo <ds-toast> ao
   * receber click no botao X.
   */
  dismiss(id: number): void {
    this.cancelTimer(id);
    this._toasts.update((arr) => arr.filter((t) => t.id !== id));
  }

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------

  /**
   * Adiciona um toast no stack. Aplica regra de FIFO drop quando o stack
   * excede TOAST_MAX_STACK. Agenda auto-destroy via timer.
   */
  private add(variant: ToastVariant, message: string): void {
    const id = this.nextId++;
    const instance: ToastInstance = { id, variant, message };

    this._toasts.update((arr) => {
      const next = [...arr, instance];
      // FIFO drop: se exceder o max, remove o mais antigo (head)
      if (next.length > TOAST_MAX_STACK) {
        const dropped = next.shift();
        if (dropped) this.cancelTimer(dropped.id);
      }
      return next;
    });

    const duration = TOAST_DEFAULT_DURATION_MS[variant];
    const timer = setTimeout(() => this.dismiss(id), duration);
    this.timers.set(id, timer);
  }

  /** Cancela timer (se existir) de um id especifico. */
  private cancelTimer(id: number): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
  }
}
