import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  computed,
  inject,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIconComponent } from '@ng-icons/core';

import { NavigationHistoryService } from '../../services/navigation-history.service';
import { ButtonComponent } from '../button';
import {
  PageHeaderBreadcrumb,
  PageHeaderVariant,
} from './page-header.types';

/**
 * PageHeader — header sticky presente em TODAS as telas autenticadas.
 *
 * Estrutura (3 zonas):
 *   1. Nav-title (esquerda): botoes voltar/avancar + divider + icon + titulo
 *   2. Breadcrumbs (centro): caminho de navegacao
 *   3. Actions (direita):
 *      - Botoes "Reorganizar"/"Personalizar" (so variant=default — dashboard principal)
 *      - Slot custom para acoes especificas da tela
 *      - Combo botoes header (darkmode/notif/AI) — projetado via slot
 *
 * REGRA CRITICA: sticky no top do page-main com border-bottom dupla (entalhe).
 *
 * Uso:
 *   <ds-page-header
 *     variant="default"
 *     title="Dashboard"
 *     icon="heroSquares2x2"
 *     [breadcrumbs]="[{label: 'Dashboard'}]"
 *     (back)="onBack()"
 *     (forward)="onForward()"
 *     (reorganize)="onReorganize()"
 *     (customize)="onCustomize()"
 *   >
 *     <div page-header-actions>
 *       <ds-combo-buttons-header />
 *     </div>
 *   </ds-page-header>
 */
@Component({
  selector: 'ds-page-header',
  standalone: true,
  imports: [
    NgIconComponent,
    RouterLink,
    ButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss',
})
export class PageHeaderComponent {
  /** Variant do header. Default: module-dashboard (mais comum). */
  readonly variant = input<PageHeaderVariant>('module-dashboard');

  /** Titulo da tela. */
  readonly title = input.required<string>();

  /** Nome do icone (heroX). */
  readonly icon = input<string | null>(null);

  /** Lista de breadcrumbs (caminho de navegacao). */
  readonly breadcrumbs = input<PageHeaderBreadcrumb[]>([]);

  /**
   * Override do estado do botao voltar. `null` (default) = consulta o
   * NavigationHistoryService automaticamente. `true`/`false` = caller
   * controla manualmente (overrides o service). REDASH-PREP-6.
   */
  readonly canGoBack = input<boolean | null>(null);

  /** Override do estado do botao avancar. `null` = service automatico. */
  readonly canGoForward = input<boolean | null>(null);

  /** Estado active do botao "Reorganizar" (so variant=default). */
  readonly reorganizeActive = input<boolean>(false);

  // --------------------------------------------------------------------------
  // Asset overrides (split-ready). Defaults preservam paths Singulai atuais.
  // Logo mobile aparece apenas na variant mobile (Figma 1139:11647).
  // --------------------------------------------------------------------------
  readonly mobileLogoSrc = input<string>('branding/logo-singulai-icon.png');
  readonly mobileLogoAlt = input<string>('Singulai');

  /** Estado active do botao "Personalizar" (so variant=default). */
  readonly customizeActive = input<boolean>(false);

  /** Emitido ao clicar botao voltar. */
  @Output() readonly back = new EventEmitter<void>();

  /** Emitido ao clicar botao avancar. */
  @Output() readonly forward = new EventEmitter<void>();

  /** Emitido ao clicar Reorganizar (so variant=default). */
  @Output() readonly reorganize = new EventEmitter<void>();

  /** Emitido ao clicar Personalizar (so variant=default). */
  @Output() readonly customize = new EventEmitter<void>();

  /** Emitido ao clicar item do breadcrumb (passa o index). */
  @Output() readonly breadcrumbClick = new EventEmitter<number>();

  // History service — consultado quando inputs canGoBack/canGoForward
  // estao em null (default). Caller pode injetar o service no parent e
  // chamar `history.back()` no handler `(back)` para navegar.
  private readonly history = inject(NavigationHistoryService);

  protected readonly showDashboardActions = computed(
    () => this.variant() === 'default',
  );

  protected readonly hasBreadcrumbs = computed(
    () => this.breadcrumbs().length > 0,
  );

  /** Estado efetivo do botao back: input override OU service.canGoBack(). */
  protected readonly effectiveCanGoBack = computed(
    () => this.canGoBack() ?? this.history.canGoBack(),
  );

  /** Estado efetivo do botao forward: input override OU service.canGoForward(). */
  protected readonly effectiveCanGoForward = computed(
    () => this.canGoForward() ?? this.history.canGoForward(),
  );

  protected onBack(): void {
    if (this.effectiveCanGoBack()) this.back.emit();
  }

  protected onForward(): void {
    if (this.effectiveCanGoForward()) this.forward.emit();
  }

  protected onReorganize(): void {
    this.reorganize.emit();
  }

  protected onCustomize(): void {
    this.customize.emit();
  }

  protected onBreadcrumbClick(index: number, item: PageHeaderBreadcrumb): void {
    if (item.route) this.breadcrumbClick.emit(index);
  }
}
