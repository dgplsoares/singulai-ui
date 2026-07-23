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
  heroTrash,
} from '@ng-icons/heroicons/outline';

import { ModalDialogComponent } from '../../../app/shared/components/modal-dialog/modal-dialog.component';
import {
  ModalDialogConfig,
  ModalCloseEvent,
} from '../../../app/shared/components/modal-dialog/modal-dialog.types';

import { ButtonComponent } from '../button/button.component';
import { ButtonVariantColor } from '../button/button.types';
import { IconNeumorphicComponent } from '../icon-neumorphic/icon-neumorphic.component';
import { IconNeumorphicVariant } from '../icon-neumorphic/icon-neumorphic.types';

import { ModalConfirmVariant } from './modal-confirm.types';

/**
 * Modal Confirm — wrapper de `<app-modal-dialog>` com layout 100% template
 * (DEC-PREP3.5-B). Desativa o header e close-btn do shared e projeta TUDO
 * via [contentTemplate] + [footerTemplate].
 *
 * O shared continua provendo: backdrop, ESC, focus-lock, scroll-lock,
 * animacao de entrada/saida.
 *
 * Layout canonico (Figma 872:14037):
 *   ┌────────────────────────────────────┐
 *   │ [icon] Titulo variant      [close] │  ← header flex row, gap 10
 *   ├────────────────────────────────────┤
 *   │           [icon-bigger]            │
 *   │   "Confirma que deseja ...?"       │
 *   │   "Nome do registro"               │
 *   ├────────────────────────────────────┤
 *   │ ─── divider duplo escuro+branco ── │
 *   │       [Cancelar]   [Excluir]       │  ← ds-button tertiary + danger
 *   └────────────────────────────────────┘
 *
 * Botoes do footer usam `<ds-button>` da DS:
 *   - cancel: variantColor='tertiary'
 *   - confirm: variantColor='danger' (sempre — paleta canonica delete)
 *
 * @example
 *   <ds-modal-confirm
 *     [isOpen]="showDelete()"
 *     variant="danger"
 *     title="Excluir Curso"
 *     message="Confirma que deseja excluir o registro abaixo?"
 *     [recordName]="course().name"
 *     (confirmed)="onDeleteConfirmed()"
 *     (cancelled)="showDelete.set(false)"
 *   />
 */
@Component({
  selector: 'ds-modal-confirm',
  standalone: true,
  imports: [
    ModalDialogComponent,
    NgIconComponent,
    ButtonComponent,
    IconNeumorphicComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './modal-confirm.component.html',
  styleUrl: './modal-confirm.component.scss',
  providers: [
    provideIcons({
      heroCheckCircle,
      heroExclamationTriangle,
      heroInformationCircle,
      heroTrash,
    }),
  ],
})
export class ModalConfirmComponent {
  /** Estado de abertura. */
  readonly isOpen = input.required<boolean>();

  /** Variant visual + semantica (DEC-PREP3-B). Default: danger. */
  readonly variant = input<ModalConfirmVariant>('danger');

  /** Titulo do header (cor herda da variant via SCSS). */
  readonly title = input.required<string>();

  /** Mensagem principal (bold no body). */
  readonly message = input.required<string>();

  /** Nome do registro. Quando omitido, body mostra so [message]. */
  readonly recordName = input<string | null>(null);

  /** Label do botao de confirmacao. Default depende da variant. */
  readonly confirmLabel = input<string | null>(null);

  /** Label do botao de cancelamento. Default: 'Cancelar'. */
  readonly cancelLabel = input<string>('Cancelar');

  /** Emitido quando user clica no botao confirmar. */
  @Output() readonly confirmed = new EventEmitter<void>();

  /**
   * Emitido quando user cancela (Cancelar/backdrop/ESC/X).
   * Caller deve setar `[isOpen]=false` ao receber.
   */
  @Output() readonly cancelled = new EventEmitter<void>();

  // --------------------------------------------------------------------------
  // Internal — config do app-modal-dialog
  // --------------------------------------------------------------------------

  /**
   * Config do shared modal-dialog. Tamanho fixo `sm`.
   * `showCloseButton: false` desativa o X do shared (DEC-PREP3.5-B);
   * renderizamos o nosso via <ds-icon-neumorphic> dentro do contentTemplate.
   */
  protected readonly modalConfig = computed<ModalDialogConfig>(() => ({
    type: 'default', // nao usamos icon/cor do header default — desativado
    size: 'sm',
    closeOnBackdrop: true,
    closeOnEscape: true,
    showCloseButton: false,
    centered: true,
    blockScroll: true,
  }));

  /** Default labels por variant. */
  private readonly defaultConfirmLabel = computed(() => {
    const map: Record<ModalConfirmVariant, string> = {
      danger: 'Excluir',
      warning: 'Continuar',
      info: 'OK',
      success: 'Confirmar',
    };
    return map[this.variant()];
  });

  /** Label efetivo do botao confirmar. */
  protected readonly effectiveConfirmLabel = computed(
    () => this.confirmLabel() ?? this.defaultConfirmLabel(),
  );

  /** Mapa variant -> nome do icone heroicons. */
  protected readonly iconName = computed(() => {
    const map: Record<ModalConfirmVariant, string> = {
      danger: 'heroTrash',
      warning: 'heroExclamationTriangle',
      info: 'heroInformationCircle',
      success: 'heroCheckCircle',
    };
    return map[this.variant()];
  });

  /**
   * Mapa variant DS -> IconNeumorphicVariant. Os 4 variants do modal
   * mapeiam 1:1 para os variants do ds-icon-neumorphic (cor controlada
   * via [data-variant] no SCSS do icon-neumorphic).
   */
  protected readonly iconVariant = computed<IconNeumorphicVariant>(() => {
    const map: Record<ModalConfirmVariant, IconNeumorphicVariant> = {
      danger: 'danger',
      warning: 'warning',
      info: 'info',
      success: 'success',
    };
    return map[this.variant()];
  });

  /**
   * Mapa variant -> ButtonVariantColor para o botao confirmar.
   * Para o caso primario danger (delete), usa 'danger'. Outros mapeiam
   * para colors existentes do <ds-button>.
   */
  protected readonly confirmButtonColor = computed<ButtonVariantColor>(() => {
    const map: Record<ModalConfirmVariant, ButtonVariantColor> = {
      danger: 'danger',
      warning: 'warning',
      info: 'apex',
      success: 'success',
    };
    return map[this.variant()];
  });

  // --------------------------------------------------------------------------
  // Handlers
  // --------------------------------------------------------------------------

  /** Botao close (X) do header — emite cancelled. */
  protected onCloseClick(): void {
    this.cancelled.emit();
  }

  /** Botao Cancelar do footer. */
  protected onCancelClick(): void {
    this.cancelled.emit();
  }

  /** Botao Confirmar do footer. */
  protected onConfirmClick(): void {
    this.confirmed.emit();
  }

  /**
   * Handler do (closed) do shared modal-dialog. Captura backdrop/ESC.
   * Como nao usamos buttons array nem close-btn shared, todos os reasons
   * recebidos aqui sao backdrop/escape/programmatic — sempre cancelamento.
   */
  protected onModalClosed(_event: ModalCloseEvent): void {
    this.cancelled.emit();
  }
}
