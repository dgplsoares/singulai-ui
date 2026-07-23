import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  TemplateRef,
  ViewChild,
  input,
} from '@angular/core';

import {
  OffcanvasComponent as AppOffcanvasComponent,
  OffcanvasCloseEvent,
  OffcanvasConfig,
  OffcanvasOpenEvent,
  OffcanvasTemplateContext,
} from '../../../app/shared/components/offcanvas';

/**
 * Offcanvas — wrapper thin de `<app-offcanvas>` (REDASH-FASE-A A.1).
 *
 * Estrategia (DEC-DSA-K precedent / `<ds-datatable>`): forwarda 100% da API
 * de `<app-offcanvas>` (298 LOC) sem duplicar logica. Re-exporta types via
 * barrel para que callers DS importem `OffcanvasConfig`, `OffcanvasPosition`,
 * `OffcanvasSize` direto de `@/design-system`.
 *
 * API forward:
 *   - Inputs: isOpen, config, title, subtitle, data, contentTemplate, footerTemplate
 *   - Outputs: opened, closed, isOpenChange
 *   - Public methods: open(), close(result)
 *   - Slot: ng-content forward para o body do panel
 *
 * Variants (config):
 *   - position: left | right | top | bottom (default right)
 *   - size: sm | md | lg | xl | full (default md)
 *
 * Features herdadas: backdrop click, ESC key, body scroll lock, animacao
 * suave configuravel, focus trap, close button, header/footer slots via
 * TemplateRef.
 *
 * Figma: DEC-FIG-A-1 — nodes 559-38745 (config curso), 646-1569 (add modulo),
 * 657-1057 (add aula com tabs).
 *
 * Acoplamento: o DS depende temporariamente de `app/shared/components/offcanvas`.
 * Aceitavel ate promocao desse component para o DS (paralelo ao precedente
 * de `<ds-datatable>` — DEC-PREP3-F).
 *
 * @example
 *   <ds-offcanvas
 *     [isOpen]="isFormOpen()"
 *     [config]="{ position: 'right', size: 'lg' }"
 *     title="Editar Curso"
 *     (closed)="onFormClose($event)"
 *   >
 *     <form>...</form>
 *   </ds-offcanvas>
 */
@Component({
  selector: 'ds-offcanvas',
  standalone: true,
  imports: [AppOffcanvasComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './offcanvas.component.html',
  styleUrl: './offcanvas.component.scss',
})
export class OffcanvasComponent {
  /** Estado de abertura — controla a abertura/fechamento via two-way binding. */
  readonly isOpen = input<boolean>(false);

  /** Configuracao (position/size/closeOnBackdrop/closeOnEscape/etc). */
  readonly config = input<OffcanvasConfig>({});

  /** Titulo do header. Quando vazio, header so renderiza se showCloseButton. */
  readonly title = input<string>('');

  /** Subtitulo opcional abaixo do titulo. */
  readonly subtitle = input<string>('');

  /** Dados passados para o templateContext (uso com TemplateRef). */
  readonly data = input<unknown>(null);

  /** TemplateRef para body (alternativa ao ng-content). */
  readonly contentTemplate = input<TemplateRef<OffcanvasTemplateContext> | undefined>(
    undefined,
  );

  /** TemplateRef para o footer (action buttons, etc). */
  readonly footerTemplate = input<TemplateRef<OffcanvasTemplateContext> | undefined>(
    undefined,
  );

  // --------------------------------------------------------------------------
  // Outputs — forward 1:1 com app-offcanvas
  // --------------------------------------------------------------------------

  /** Emitido apos a animacao de abertura iniciar. */
  @Output() readonly opened = new EventEmitter<OffcanvasOpenEvent>();

  /** Emitido ao fechar (backdrop/escape/button/programmatic). */
  @Output() readonly closed = new EventEmitter<OffcanvasCloseEvent>();

  /** Two-way binding [(isOpen)]. */
  @Output() readonly isOpenChange = new EventEmitter<boolean>();

  // --------------------------------------------------------------------------
  // Imperative API — delegada para o inner
  // --------------------------------------------------------------------------

  @ViewChild(AppOffcanvasComponent) private inner?: AppOffcanvasComponent;

  /** Abre o panel imperativamente. Util quando o caller mantem ViewChild. */
  open(): void {
    this.inner?.open();
  }

  /** Fecha o panel imperativamente, com resultado opcional. */
  close(result?: unknown): void {
    this.inner?.close(result);
  }
}
