import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  Output,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';

import { DsActiveSpinDirective } from '../../directives/active-spin.directive';
import { NavFooterPanel } from './nav-footer.types';

/**
 * NavFooter — barra de navegacao inferior mobile (Bottom Navigation).
 *
 * Visivel apenas no breakpoint mobile (< 992px). Substitui visualmente a
 * sidebar-left-nav do desktop. Card 2 camadas com 5 botoes:
 *
 *   [Dashboard] [Navegue] [Agente IA] [Alertas] [Conta]
 *
 * O botao Dashboard tem visual diferenciado (triple-border ring + bg #EFF3F8)
 * indicando o item raiz ativo (rota = /dashboard).
 *
 * Os outros 4 botoes abrem paineis (mutex — apenas 1 aberto por vez):
 * - Navegue: lista de itens raiz do menu (substitui sidebar)
 * - Agente IA: painel full-screen do AI Assistant (renderizado pelo page-layout)
 * - Alertas: painel de notificacoes (placeholder nesta sprint)
 * - Conta: painel minha conta (placeholder nesta sprint)
 *
 * Quando algum painel esta aberto, o nav-footer cresce em altura e mostra
 * o conteudo acima dos 5 botoes (que continuam visiveis para troca rapida
 * entre paineis).
 *
 * ---------------------------------------------------------------------------
 * State machine de animacao (close-animado-then-open em troca de painel):
 *
 *   activePanel    = input do parent (intencao do usuario, valor live)
 *   displayedPanel = qual painel esta no DOM agora (lag durante close anim)
 *   isOpen         = controla --visible no panel-area (max-height + opacity)
 *
 *   - Open from closed:  set displayed=target → tick → isOpen=true
 *   - Close:             isOpen=false → wait TRANSITION_MS → displayed=null
 *   - Switch panel:      isOpen=false → wait TRANSITION_MS → displayed=novo
 *                        → tick → isOpen=true (close + open animados)
 *   - 'ai' renderiza dentro do painel-area como os outros (slot
 *     [nav-footer-panel-ai]). Botao "maximizar" no header do painel pode
 *     promover o conteudo para overlay full-screen via [page-layout-ai].
 * ---------------------------------------------------------------------------
 *
 * Inputs:
 *   activePanel       — qual painel esta aberto (mutex, null se nenhum)
 *   dashboardActive   — destaca o botao Dashboard (rota = /dashboard)
 *   navegueActive     — destaca "Navegue" (rota raiz que nao /dashboard)
 *
 * Outputs:
 *   panelToggle       — emite quando user clica em Navegue/AI/Alertas/Conta
 *   dashboardClick    — emite quando user clica no Dashboard
 *
 * Slots (content projection):
 *   [nav-footer-panel-navegue]  — conteudo do painel Navegue
 *   [nav-footer-panel-alertas]  — conteudo do painel Alertas
 *   [nav-footer-panel-conta]    — conteudo do painel Conta
 *
 * Painel AI nao tem slot aqui — o conteudo vem do `[page-layout-ai]` do
 * <ds-page-layout>, renderizado em modo full-screen mobile.
 */
@Component({
  selector: 'ds-nav-footer',
  standalone: true,
  imports: [DsActiveSpinDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './nav-footer.component.html',
  styleUrl: './nav-footer.component.scss',
})
export class NavFooterComponent {
  /** Painel atualmente aberto (mutex). null = nenhum (modo compact). */
  readonly activePanel = input<NavFooterPanel | null>(null);

  /** Dashboard active (rota = /dashboard). Default false. */
  readonly dashboardActive = input<boolean>(false);

  /** Navegue active (rota raiz que nao /dashboard, sem painel aberto). */
  readonly navegueActive = input<boolean>(false);

  // --------------------------------------------------------------------------
  // Asset overrides (split-ready). Defaults preservam paths Singulai atuais.
  // Consumer pode override por instancia para virar package OSS configuravel.
  // --------------------------------------------------------------------------
  readonly homeIconSrc = input<string>('branding/icons/nav-footer/01-home.svg');
  readonly navegueIconSrc = input<string>('branding/icons/nav-footer/02-navegue.svg');
  readonly aiIconSrc = input<string>('branding/icons/nav-footer/03-agente-ia.svg');
  readonly alertasIconSrc = input<string>('branding/icons/nav-footer/04-alertas.svg');
  readonly contaIconSrc = input<string>('branding/icons/nav-footer/05-conta.svg');

  /**
   * Emite quando user clica em qualquer botao de painel
   * (Navegue / Agente IA / Alertas / Conta). O parent deve atualizar o
   * activePanel state.
   */
  @Output() readonly panelToggle = new EventEmitter<NavFooterPanel>();

  /**
   * Emite quando user clica no botao Dashboard. O parent deve navegar
   * para a rota /dashboard (e fechar paineis).
   */
  @Output() readonly dashboardClick = new EventEmitter<void>();

  // ----- Animacao state machine -----

  /** Painel renderizado no DOM (lag atras do activePanel durante close). */
  protected readonly displayedPanel = signal<NavFooterPanel | null>(null);

  /** Controla --visible no panel-area (false = colapsado / em transicao). */
  protected readonly isOpen = signal<boolean>(false);

  /** True enquanto ha painel renderizado (inclui durante transicao de close). */
  protected readonly isExpanded = computed(() => this.displayedPanel() !== null);

  /** Buffer pequeno acima dos 300ms da transicao CSS para evitar race. */
  // Sincronizado com $duration do mixin ds-active-spin-ring (500ms).
  // Garante que: click no botao -> animation do botao roda 500ms ->
  // submenu efetivamente transiciona max-height/opacity.
  // O blur do main-area (--panel-open) e aplicado IMEDIATO via
  // @HostBinding no page-layout (depende de navFooterPanel signal,
  // setado no instante do panelToggle emit).
  private static readonly TRANSITION_MS = 500;

  private pendingTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.clearPending());

    effect(() => {
      const target = this.activePanel();

      const displayed = untracked(() => this.displayedPanel());
      const open = untracked(() => this.isOpen());

      // Ja em sync? (mesmo painel + mesmo estado de visibilidade)
      if (target === displayed && (target !== null) === open) {
        return;
      }

      // Cancela qualquer transicao agendada — vamos reagendar com base no novo target
      this.clearPending();

      // CASO 1: fechar (sem novo painel)
      if (target === null) {
        if (open) {
          this.isOpen.set(false);
          this.pendingTimer = setTimeout(() => {
            this.pendingTimer = null;
            this.displayedPanel.set(null);
          }, NavFooterComponent.TRANSITION_MS);
        } else {
          // ja invisivel, limpa direto
          this.displayedPanel.set(null);
        }
        return;
      }

      // CASO 2: abrir do zero (nada renderizado) ou re-abrir mesmo painel
      // (interrompe close em progresso).
      if (displayed === null || displayed === target) {
        if (displayed === null) {
          this.displayedPanel.set(target);
          // Atrasa a transicao visual do submenu em TRANSITION_MS (500ms).
          // Esse delay sincroniza com a animacao spin do botao clicado:
          // animacao roda → quando termina, submenu transita max-height/opacity.
          // O blur do main-area (--panel-open) ja foi aplicado IMEDIATO
          // pelo @HostBinding do page-layout (depende de navFooterPanel
          // signal setado no panelToggle emit, antes deste effect rodar).
          this.pendingTimer = setTimeout(() => {
            this.pendingTimer = null;
            this.isOpen.set(true);
          }, NavFooterComponent.TRANSITION_MS);
        } else {
          // mesmo painel, fechamento interrompido — apenas reabre
          this.isOpen.set(true);
        }
        return;
      }

      // CASO 3: trocar painel (close atual animado → open novo animado)
      this.isOpen.set(false);
      this.pendingTimer = setTimeout(() => {
        this.pendingTimer = null;
        // Re-checa o target ao final da transicao (usuario pode ter clicado
        // em outro painel durante os 320ms; nesse caso o effect ja rodou de
        // novo e cancelou esse timer — chegamos aqui apenas se nao houve
        // mudanca subsequente).
        this.displayedPanel.set(target);
        requestAnimationFrame(() => this.isOpen.set(true));
      }, NavFooterComponent.TRANSITION_MS);
    });
  }

  /** Helpers para o template. Usam activePanel (live) — buttons reagem na hora. */
  protected isPanelActive(panel: NavFooterPanel): boolean {
    return this.activePanel() === panel;
  }

  protected onPanelClick(panel: NavFooterPanel): void {
    this.panelToggle.emit(panel);
  }

  protected onDashboardClick(): void {
    this.dashboardClick.emit();
  }

  private clearPending(): void {
    if (this.pendingTimer !== null) {
      clearTimeout(this.pendingTimer);
      this.pendingTimer = null;
    }
  }
}
