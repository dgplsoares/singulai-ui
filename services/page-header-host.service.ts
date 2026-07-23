import { Injectable, Signal, signal } from '@angular/core';

import {
  PageHeaderBreadcrumb,
  PageHeaderVariant,
} from '../components/page-header/page-header.types';

/**
 * Configuracao do page-header registrada pela page via `setConfig()`.
 * Reflete os inputs do `<ds-page-header>` + handlers dos outputs.
 *
 * **Sticky pattern (DS):** ao inves de cada page renderizar `<ds-page-header>`
 * dentro de seu HTML (filho do `<router-outlet>` que esta dentro do scroll),
 * a page **REGISTRA** sua config aqui via `setConfig()` no `ngOnInit`. O
 * `MainLayoutComponent` injeta este service e renderiza UM unico
 * `<ds-page-header>` em slot dedicado FORA do `<router-outlet>` (irmao do
 * `<main>` scroll). Resultado: header fica fixo arquiteturalmente (igual DS-validado).
 *
 * **Combo header (dark-mode + notif + AI):** GLOBAL no `MainLayoutComponent`.
 * Page so sinaliza `showCombo: true/false` (default true). Handlers do combo
 * vivem no MainLayout, nao na page.
 *
 * **Reatividade:** `reorganizeActive` e `customizeActive` sao **accessors**
 * `() => boolean` (signal-compativel). Page passa `() => this.isDragMode()`
 * e o template do MainLayout chama `cfg.reorganizeActive?.()` — Angular
 * change-detection re-avalia automaticamente quando o signal muda.
 */
export interface PageHeaderConfig {
  /** Variant do header. Default 'default'. */
  variant?: PageHeaderVariant;

  /** Titulo principal exibido no header. */
  title: string;

  /** Nome do heroIcon (ex: 'heroSquares2x2'). */
  icon?: string | null;

  /** Lista de breadcrumbs. */
  breadcrumbs?: PageHeaderBreadcrumb[];

  /**
   * Accessor para o estado active do botao "Reorganizar".
   * Use `() => this.isDragMode()` para reatividade com signals da page.
   * Default false quando nao fornecido.
   */
  reorganizeActive?: () => boolean;

  /**
   * Accessor para o estado active do botao "Personalizar".
   * Use `() => this.customizeOpen()` para reatividade com signals da page.
   * Default false quando nao fornecido.
   */
  customizeActive?: () => boolean;

  /**
   * Renderiza o combo header (dark-mode + notif + AI) a direita.
   * Default true. Pages especiais (ex: signup, splash) podem desabilitar.
   */
  showCombo?: boolean;

  /** Handler do click no botao voltar (<). Default: usa NavigationHistoryService.back(). */
  onBack?: () => void;

  /** Handler do click no botao avancar (>). Default: usa NavigationHistoryService.forward(). */
  onForward?: () => void;

  /** Handler do click no botao "Reorganizar" (so variant=default). */
  onReorganize?: () => void;

  /** Handler do click no botao "Personalizar" (so variant=default). */
  onCustomize?: () => void;
}

/**
 * PageHeaderHostService — service singleton para registro de config do
 * `<ds-page-header>` por cada page autenticada.
 *
 * Usado pelo `MainLayoutComponent` (shell) para renderizar UM unico
 * `<ds-page-header>` em slot dedicado FORA do `<router-outlet>` (irmao do
 * `<main>` scroll), alinhado com a arquitetura do DS-validado
 * (`<ds-page-layout>` → `__header` grid-row 1 do `__main-area-inner`).
 *
 * **Como cada page deve usar:**
 *
 * ```typescript
 * export class MinhaPage implements OnInit, OnDestroy {
 *   private pageHeaderHost = inject(PageHeaderHostService);
 *   private navHistory = inject(NavigationHistoryService);
 *
 *   protected isDragMode = signal(false);
 *
 *   ngOnInit() {
 *     this.pageHeaderHost.setConfig({
 *       variant: 'default',
 *       title: 'Dashboard',
 *       icon: 'heroSquares2x2',
 *       breadcrumbs: [{ label: 'Dashboard' }],
 *       reorganizeActive: () => this.isDragMode(),
 *       onBack: () => this.navHistory.back(),
 *       onReorganize: () => this.isDragMode.update(v => !v),
 *     });
 *   }
 *
 *   ngOnDestroy() {
 *     this.pageHeaderHost.clear();
 *   }
 * }
 * ```
 *
 * **Pages legacy** que ainda usam `<app-page-header>` shared inline NAO
 * precisam migrar nesta fase — basta nao chamar `setConfig()`. O slot DS
 * fica vazio (config = null) e o header legacy renderiza inline como hoje.
 *
 * Backwards-compat total. Pages migram individualmente quando refatoradas
 * em fases B/D/E.
 */
@Injectable({ providedIn: 'root' })
export class PageHeaderHostService {
  private readonly _config = signal<PageHeaderConfig | null>(null);

  /**
   * Config atual do page-header. `null` quando nao ha page registrada
   * (ex: pages legacy ou momento entre navegacoes). MainLayoutComponent
   * renderiza o `<ds-page-header>` condicionalmente via `@if (config())`.
   */
  readonly config: Signal<PageHeaderConfig | null> = this._config.asReadonly();

  /**
   * Registra a config do page-header. Chamado pela page no `ngOnInit`.
   * Substitui completamente a config anterior — handlers ficam orfaos
   * (garbage-collected) quando a referencia some.
   */
  setConfig(config: PageHeaderConfig): void {
    this._config.set(config);
  }

  /**
   * Limpa a config. Chamado pela page no `ngOnDestroy` (ou na navegacao
   * para pages que nao tem page-header DS, como signup/splash).
   */
  clear(): void {
    this._config.set(null);
  }
}
