import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  HostListener,
  Output,
  computed,
  input,
  signal,
} from '@angular/core';

import {
  AiAssistantLayoutState,
  NavFooterPanel,
  PageLayoutVariant,
} from './page-layout.types';

/**
 * PageLayout — skeleton raiz das telas autenticadas do admin Singulai.
 *
 * Estrutura:
 *   ┌─────────────────────────────────────────────────────────────────┐
 *   │ ┌────┐ ┌──────────────────────────────────────────────────────┐ │
 *   │ │    │ │ page-header (sticky)                                  │ │
 *   │ │ S  │ ├──────────────────────────────────────────────────────┤ │
 *   │ │ I  │ │ page-nav (sticky, opcional — wizard tabs)            │ │
 *   │ │ D  │ ├──────────────────────────────────────────────────────┤ │
 *   │ │ E  │ │                                                      │ │
 *   │ │ B  │ │   page-main (UNICO com scroll vertical)              │ │
 *   │ │ A  │ │                                                      │ │
 *   │ │ R  │ ├──────────────────────────────────────────────────────┤ │
 *   │ │    │ │ page-footer-sticky (opcional — actions/submit)       │ │
 *   │ └────┘ └──────────────────────────────────────────────────────┘ │
 *   │                                                                 │
 *   │   AI Assistant overlay (direita, quando open)                   │
 *   └─────────────────────────────────────────────────────────────────┘
 *
 * REGRA CRITICA: APENAS page-main faz scroll. Header/nav/footer sao sticky.
 *
 * Slots de projecao (Content Children):
 *   [page-layout-sidebar]   — sidebar lateral esquerda
 *   [page-layout-header]    — page-header
 *   [page-layout-nav]       — page-nav (wizard tabs ou tabs internas)
 *   [page-layout-main]      — conteudo principal (scrollavel)
 *   [page-layout-footer]    — page-footer-sticky
 *   [page-layout-ai]        — AI Assistant overlay
 *
 * Uso:
 *   <ds-page-layout variant="dashboard" [aiAssistantState]="aiState()">
 *     <ds-sidebar-left-nav page-layout-sidebar />
 *     <ds-page-header page-layout-header title="Dashboard" />
 *     <div page-layout-main>
 *       <!-- conteudo -->
 *     </div>
 *   </ds-page-layout>
 */
@Component({
  selector: 'ds-page-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './page-layout.component.html',
  styleUrl: './page-layout.component.scss',
})
export class PageLayoutComponent {
  /** Variant do layout. Default: dashboard. */
  readonly variant = input<PageLayoutVariant>('dashboard');

  /** Estado do AI Assistant. Default: closed. */
  readonly aiAssistantState = input<AiAssistantLayoutState>('closed');

  /** Largura da sidebar quando expandida. Default: 280px. */
  readonly sidebarWidth = input<string>('280px');

  /** Largura da AI Assistant quando aberta. Default: 400px. */
  readonly aiAssistantWidth = input<string>('400px');

  /** Aria-label do `<main>` para acessibilidade. Default: "Conteudo principal". */
  readonly mainAriaLabel = input<string>('Conteudo principal');

  /**
   * Indica se a rota atual e o dashboard. Usado pelo nav-footer pra ativar
   * o estado "Dashboard active" (botao estampado triple-border).
   *
   * Quando false, "Navegue" assume o active automaticamente (quando nenhum
   * painel mobile esta aberto).
   *
   * Default: false. Parent (showcase / app) controla via input.
   */
  readonly dashboardActive = input<boolean>(false);

  /**
   * Indica se o AI Assistant esta no estado maximizado (full-screen overlay).
   * Quando true, aplica classe `.ds-page-layout--ai-maximized` no host e na
   * inner div — usado pelo CSS para ajustar o width do overlay
   * (calc(--ai-width - 40px) maximizado vs calc(--ai-width - 10px) normal).
   *
   * Default: false (estado normal, side overlay 400px no desktop).
   */
  readonly aiMaximized = input<boolean>(false);

  /**
   * Emite quando o usuario clica no botao AI toggle (no mobile vindo do
   * nav-footer; no desktop ainda nao tem botao proprio dentro do layout).
   * O parent pode opcionalmente atualizar o aiAssistantState como resposta.
   *
   * O componente JA mantem um signal interno (navFooterPanel='ai') que sincroniza
   * o aiOpen sem necessidade do parent reagir — o evento e apenas notificacao.
   */
  @Output() readonly aiToggle = new EventEmitter<void>();

  /**
   * Emite quando o painel ativo do nav-footer muda (incluindo abertura,
   * troca entre paineis e fechamento). Util para o parent sincronizar
   * outras pecas de UI (ex: rotular toolbar, atualizar query params).
   */
  @Output() readonly panelChange = new EventEmitter<NavFooterPanel | null>();

  // ----- Estado interno (mutex de paineis mobile — DEC-DS-MOB-002) -----

  /**
   * Painel mobile aberto no nav-footer. null = nenhum painel aberto.
   * So 1 painel pode estar aberto por vez (mutex).
   *
   * Public para permitir leitura via template ref (ex: showcase usa
   * `<ds-page-layout #layout>` + `layout.navFooterPanel()` no nav-footer).
   */
  readonly navFooterPanel = signal<NavFooterPanel | null>(null);

  // ----- Computed states -----

  protected readonly hasNav = computed(() => {
    const v = this.variant();
    return v === 'wizard' || v === 'tabs-internas';
  });

  protected readonly hasFooter = computed(() => this.variant() === 'wizard');

  /**
   * AI esta aberto em modo OVERLAY full-screen (desktop direita / mobile slide-up)
   * apenas quando aiAssistantState='open'. Quando navFooterPanel='ai', o painel
   * AI renderiza INLINE dentro do nav-footer (como os outros paineis); o botao
   * "maximizar" do header do painel pode promover para overlay via aiAssistantState.
   */
  protected readonly aiOpen = computed(
    () => this.aiAssistantState() === 'open',
  );

  /** True quando QUALQUER painel mobile (Navegue/AI/Alertas/Conta) esta aberto. */
  protected readonly isAnyPanelOpen = computed(
    () => this.navFooterPanel() !== null,
  );

  /**
   * Active "Navegue" no nav-footer: quando nao esta no dashboard E nao ha
   * painel aberto (sub-rotas internas sao consideradas "navegue").
   * Quando ha painel aberto, o active passa para o painel correspondente.
   */
  protected readonly navegueActive = computed(
    () => !this.dashboardActive() && this.navFooterPanel() === null,
  );

  // ----- HostBindings -----

  @HostBinding('class.ds-page-layout--ai-open')
  get aiOpenClass(): boolean {
    return this.aiOpen();
  }

  @HostBinding('class.ds-page-layout--ai-maximized')
  get aiMaximizedClass(): boolean {
    return this.aiMaximized();
  }

  /** Class binding: qualquer painel mobile aberto. */
  @HostBinding('class.ds-page-layout--panel-open')
  get panelOpenClass(): boolean {
    return this.isAnyPanelOpen();
  }

  /**
   * Atributo data-active-panel: identifica qual painel esta aberto pra CSS
   * aplicar transforms/visibilidade especificos por painel.
   */
  @HostBinding('attr.data-active-panel')
  get activePanelAttr(): string | null {
    return this.navFooterPanel();
  }

  /**
   * Class binding scroll-locked: host overflow:hidden quando algum painel
   * estiver aberto (drawer/AI). Relevante visualmente apenas em mobile.
   */
  @HostBinding('class.ds-page-layout--scroll-locked')
  get scrollLockedClass(): boolean {
    return this.isAnyPanelOpen() || this.aiOpen();
  }

  @HostBinding('style.--ds-layout-sidebar-width') get sidebarWidthVar() {
    return this.sidebarWidth();
  }

  @HostBinding('style.--ds-layout-ai-width') get aiWidthVar() {
    return this.aiAssistantWidth();
  }

  // ----- HostListeners -----

  /** ESC fecha qualquer painel aberto. */
  @HostListener('document:keydown.escape')
  protected onEscapeKey(): void {
    if (this.isAnyPanelOpen()) this.closePanels();
  }

  // ----- Public methods (chamados pelo nav-footer ou template do showcase) -----

  /**
   * Toggle do painel mobile. Se ja estiver aberto o painel solicitado, fecha.
   * Caso contrario, abre o solicitado (mutex automatico — fecha qualquer outro).
   *
   * Para 'ai', tambem emite aiToggle (notificacao para o parent eventualmente
   * sincronizar aiAssistantState).
   */
  togglePanel(panel: NavFooterPanel): void {
    const current = this.navFooterPanel();
    const next = current === panel ? null : panel;
    this.navFooterPanel.set(next);
    this.panelChange.emit(next);
    if (panel === 'ai') {
      this.aiToggle.emit();
    }
  }

  /** Fecha qualquer painel aberto (chamado pelo ESC, click fora, etc). */
  closePanels(): void {
    if (this.navFooterPanel() !== null) {
      this.navFooterPanel.set(null);
      this.panelChange.emit(null);
    }
  }

  /**
   * Click no main-area: quando algum painel esta aberto, atua como backdrop
   * dismissable — fecha o painel. Quando nenhum painel aberto, no-op (clicks
   * normais nos cards do main-area passam atraves).
   */
  protected onMainAreaClick(): void {
    if (this.isAnyPanelOpen()) {
      this.closePanels();
    }
  }
}
