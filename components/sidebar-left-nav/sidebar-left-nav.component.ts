import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Output,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { animate, style, transition, trigger } from '@angular/animations';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroChevronDown, heroMagnifyingGlass } from '@ng-icons/heroicons/outline';

import { ButtonComponent } from '../button';
import { DsActiveSpinDirective } from '../../directives/active-spin.directive';
import {
  SidebarMenuItem,
  SidebarSearchResult,
  SidebarState,
  SidebarUser,
} from './sidebar-left-nav.types';

const STORAGE_KEY = 'ds-sidebar-state';

/**
 * SidebarLeftNav — Sidebar principal das telas autenticadas do admin Singulai.
 *
 * 5 estados visuais: collapsed (44px default) / expanded (~280px) /
 * item-active / item-default / item-hover.
 *
 * Persiste estado expanded/collapsed em localStorage.
 *
 * Uso:
 *   <ds-sidebar-left-nav
 *     [menuItems]="menuItems"
 *     [user]="currentUser()"
 *     (accountAction)="onAccountAction($event)"
 *   />
 */
@Component({
  selector: 'ds-sidebar-left-nav',
  standalone: true,
  imports: [
    OverlayModule,
    NgIconComponent,
    RouterLink,
    RouterLinkActive,
    ButtonComponent,
    DsActiveSpinDirective,
  ],
  // Icones HARDCODED no template (search + chevron). Provided no proprio
  // componente DS para garantir renderizacao independente do caller — alinhado
  // com split-ready (caller nao precisa saber dos icones internos).
  // Para icones DINAMICOS via [name]="item.icon", o caller continua responsavel
  // pelos provideIcons no menuItems.
  viewProviders: [
    provideIcons({
      heroChevronDown,
      heroMagnifyingGlass,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // SBNAV-2026-05-25 B4 (DEC-SBNAV-E): animation expand/collapse do submenu.
  // Duration --ds-duration-base (200ms) + easing --ds-ease-default — padroes
  // DS. Valores literais aqui porque @angular/animations nao le CSS vars.
  animations: [
    trigger('submenuExpand', [
      transition(':enter', [
        style({ height: 0, opacity: 0, overflow: 'hidden' }),
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', style({ height: '*', opacity: 1 })),
      ]),
      transition(':leave', [
        style({ height: '*', opacity: 1, overflow: 'hidden' }),
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', style({ height: 0, opacity: 0 })),
      ]),
    ]),
  ],
  templateUrl: './sidebar-left-nav.component.html',
  styleUrl: './sidebar-left-nav.component.scss',
})
export class SidebarLeftNavComponent {
  /** Items do menu raiz com submenus. */
  readonly menuItems = input<SidebarMenuItem[]>([]);

  /** Usuario logado (mostrado no avatar do footer). */
  readonly user = input<SidebarUser | null>(null);

  /** Estado inicial. Override do localStorage. */
  readonly initialState = input<SidebarState>('collapsed');

  // --------------------------------------------------------------------------
  // Asset overrides (split-ready). Defaults preservam paths Singulai atuais.
  // Em uso OSS, consumer override por instancia para customizar brand.
  // --------------------------------------------------------------------------
  readonly logoFullSrc = input<string>('branding/logo-singulai-full.png');
  readonly logoIconSrc = input<string>('branding/logo-singulai-icon.png');
  readonly logoAlt = input<string>('Singulai');
  readonly menuToggleExpandedIconSrc = input<string>('branding/icons/icon-menu-expanded.svg');
  readonly menuToggleCollapsedIconSrc = input<string>('branding/icons/icon-menu-default.svg');
  readonly userIconSrc = input<string>('branding/icons/menu/user.svg');

  /** Aria-label do logo link — computed que combina brand. */
  protected readonly logoAriaLabel = computed(
    () => `${this.logoAlt()} — Ir para Dashboard`
  );

  /** Emitido quando estado expanded/collapsed muda. */
  @Output() readonly stateChange = new EventEmitter<SidebarState>();

  /** Emitido quando usuario clica em search. */
  @Output() readonly searchClick = new EventEmitter<void>();

  /** Emitido quando usuario clica no avatar (abre dropdown Minha Conta — DS-2.2). */
  @Output() readonly accountClick = new EventEmitter<void>();

  /** Emitido quando submenu item e clicado (key do item submenu). */
  @Output() readonly submenuItemClick = new EventEmitter<string>();

  // Estado interno
  protected readonly state = signal<SidebarState>('collapsed');
  // Mutex: apenas 1 submenu aberto por vez (null = nenhum).
  protected readonly expandedKey = signal<string | null>(null);

  protected readonly isExpanded = computed(() => this.state() === 'expanded');
  protected readonly isCollapsed = computed(() => this.state() === 'collapsed');

  // ==========================================================================
  // SBNAV-2026-05-25 B2 (DEC-SBNAV-C): active state cross-submenu via signal.
  // routerLinkActive no <button> nao dispara (sem routerLink). Computado:
  // currentUrl (Router.events) -> activeRootKey (match em item.submenu[].route).
  // ==========================================================================
  private readonly router = inject(Router);
  protected readonly currentUrl = signal<string>(this.router.url);

  /** Key do item raiz cuja rota atual pertence (ou null se nenhuma). */
  protected readonly activeRootKey = computed<string | null>(() => {
    // Normaliza URL (remove query/hash) — match robusto
    const url = this.currentUrl().split('?')[0].split('#')[0];
    for (const item of this.menuItems()) {
      // Item sem submenu: match direto na rota do proprio item (ex: Dashboard)
      if (!item.submenu || item.submenu.length === 0) {
        if (item.route && url.startsWith(item.route)) return item.key;
        continue;
      }
      // Item com submenu: match em qualquer sub-rota
      if (item.submenu.some((s) => s.route && url.startsWith(s.route))) {
        return item.key;
      }
    }
    return null;
  });

  /** Helper para o template — usado no [class.--active]. */
  protected isRootActive(item: SidebarMenuItem): boolean {
    return item.key === this.activeRootKey();
  }

  // ==========================================================================
  // SBNAV2-2026-05-25 (DEC-SBNAV2-A,B,E): wrap-active + floating dropdown helpers
  // ==========================================================================

  /** True quando o ring container deve aparecer (DEC-SBNAV2-B). */
  protected isWrapActive(item: SidebarMenuItem): boolean {
    if (!item.submenu || item.submenu.length === 0) return false;
    return this.isExpanded() && this.isRootActive(item) && this.isSubmenuOpen(item.key);
  }

  /** True quando o dropdown flutuante deve renderizar (collapsed + submenu open). */
  protected isFloatingDropdownOpen(item: SidebarMenuItem): boolean {
    if (!item.submenu || item.submenu.length === 0) return false;
    return !this.isExpanded() && this.isSubmenuOpen(item.key);
  }

  /**
   * ============================================================================
   * ⛔ O FLYOUT ERA CLIPADO POR UM `overflow` QUE CHEGOU DEPOIS DELE
   * ============================================================================
   *
   * **Medido em 2026-09-02**, a pedido do fundador — que lembrava do recurso entregue e nao
   * o via funcionando. Nao era roadmap nem task engolida: era **regressao**.
   *
   * O `SBNAV2` (`b33e339aa`, 26/05) entregou o dropdown como `position: absolute;
   * left: calc(100% + 12px)`, e funcionava porque `.ds-sidebar__nav` tinha `overflow: visible`
   * — a nota da propria entrega diz isso, com todas as letras.
   *
   * Em 17/06 o `b1975144f` (`DEC-POLISH-6`, *"sidebar scroll"*) trocou aquilo por
   * `overflow-y: auto; overflow-x: clip`, para dar scroll interno a nav — sem o que a
   * sidebar expandida empurrava a row do grid para fora do viewport.
   *
   * ⇒ **`overflow-x: clip` corta exatamente o eixo por onde o flyout sai.** Ele passou a
   *   renderizar e ser clipado no mesmo quadro. Nao ha `overflow-clip-margin` no projeto,
   *   entao o corte e' na borda da caixa.
   *
   * ⚠️ E o comentario que acompanha aquela linha afirma que `clip` *"preserva a visibilidade
   * dos rings no eixo horizontal (sem clipping lateral)"* — o que e' **falso**: `clip` clipa;
   * o que ele nao faz e' criar scrollport. Comentario que promete garantia nao e' garantia.
   *
   * ============================================================================
   * POR QUE `cdkConnectedOverlay`, E NAO REVERTER O `overflow`
   * ============================================================================
   *
   * Reverter reintroduziria o defeito de layout que a `DEC-POLISH-6` consertou. A tensao e'
   * real e nao tem saida dentro da caixa: **container com scroll no Y nao deixa filho escapar
   * no X**.
   *
   * ⭐ **O DS-AUDIT decidiu:** `@angular/cdk` ja e' dependencia e o `cdkConnectedOverlay` ja e'
   * o mecanismo de DOIS componentes do DS (`ds-dropdown-menu`, `ds-filter-dropdown`) e de 3
   * shared. O painel passa a ser renderizado no overlay container, **filho de `<body>`** — e
   * por construcao nenhum `overflow` de ancestral o alcanca.
   *
   * ⚠️ **O MARKUP E O SCSS DO PAINEL NAO MUDARAM.** O desenho do `SBNAV2` foi aprovado com as
   * `DEC-SBNAV2-A..J`; o que muda e' **onde ele e' pendurado**. Isso e' seguro porque o
   * seletor e' BEM plano (`.ds-sidebar__floating-dropdown`, sem ancestral) e a encapsulacao
   * emulada carimba o `_ngcontent` em tempo de COMPILACAO, nao pela posicao no DOM.
   */
  protected readonly posicoesDoFlyout: ConnectedPosition[] = [
    // Preferida: a direita do item, alinhado pelo topo — o desenho original.
    {
      originX: 'end',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'top',
      offsetX: 12, // o mesmo `calc(100% + 12px)` de antes
    },
    // Fallback quando nao ha altura abaixo: ancora pelo rodape.
    {
      originX: 'end',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'bottom',
      offsetX: 12,
    },
  ];

  // ==========================================================================
  // SBSEARCH-2026-05-25: search inline + autocomplete sobre menuItems.
  // UX hibrida (legacy comportamento + DS estetica). DEC-SBSEARCH-A..F.
  // ==========================================================================

  /** Estado ativo do search — quando true, botao vira input. */
  protected readonly searchActive = signal<boolean>(false);
  /** Texto digitado pelo usuario. */
  protected readonly searchQuery = signal<string>('');
  /** Indice do resultado destacado (keyboard nav arrow up/down). -1 = nenhum. */
  protected readonly highlightedIndex = signal<number>(-1);

  /** Resultados filtrados (top 8). Match em label OR keywords. */
  protected readonly filteredResults = computed<SidebarSearchResult[]>(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return [];
    const results: SidebarSearchResult[] = [];
    for (const root of this.menuItems()) {
      const hasSubmenu = !!root.submenu && root.submenu.length > 0;
      // Item raiz sem submenu (ex: Dashboard) → entra como resultado direto
      if (!hasSubmenu && this.matchesQuery(root, query)) {
        results.push({ item: root });
      }
      // Filhos (submenu items)
      if (hasSubmenu) {
        for (const child of root.submenu!) {
          if (this.matchesQuery(child, query)) {
            results.push({ item: child, parent: root });
          }
        }
      }
    }
    return results.slice(0, 8);
  });

  protected readonly hasSearchResults = computed(() => this.filteredResults().length > 0);
  protected readonly showEmpty = computed(
    () => this.searchActive() && this.searchQuery().trim().length > 0 && !this.hasSearchResults(),
  );

  private matchesQuery(item: SidebarMenuItem, q: string): boolean {
    if (item.label.toLowerCase().includes(q)) return true;
    return item.keywords?.some((k) => k.toLowerCase().includes(q)) ?? false;
  }

  /** Ativa o modo search. Se sidebar collapsed, expande primeiro. */
  protected activateSearch(): void {
    if (!this.isExpanded()) {
      this.state.set('expanded');
    }
    this.searchActive.set(true);
    this.highlightedIndex.set(-1);
    // Autofocus no proximo tick — input so existe apos render
    setTimeout(() => {
      const el = document.querySelector<HTMLInputElement>('.ds-sidebar__search-input');
      el?.focus();
    }, 0);
  }

  /** Desativa search e limpa estado. */
  protected deactivateSearch(): void {
    this.searchActive.set(false);
    this.searchQuery.set('');
    this.highlightedIndex.set(-1);
  }

  protected onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.highlightedIndex.set(value.trim().length > 0 ? 0 : -1);
  }

  protected onSearchInputKeydown(event: KeyboardEvent): void {
    const results = this.filteredResults();
    if (event.key === 'Escape') {
      event.preventDefault();
      this.deactivateSearch();
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (results.length === 0) return;
      const next = (this.highlightedIndex() + 1) % results.length;
      this.highlightedIndex.set(next);
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (results.length === 0) return;
      const prev = (this.highlightedIndex() - 1 + results.length) % results.length;
      this.highlightedIndex.set(prev);
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      const idx = this.highlightedIndex() >= 0 ? this.highlightedIndex() : 0;
      const hit = results[idx];
      if (hit) this.selectSearchResult(hit);
    }
  }

  /** Click em um resultado: navega + auto-expande grupo pai + limpa search. */
  protected selectSearchResult(result: SidebarSearchResult): void {
    const route = result.item.route;
    if (!route) {
      // Sem rota — placeholder "Em breve". Nao navega; mantem search ativo.
      return;
    }
    // Auto-expand grupo pai (DEC-SBSEARCH replica legacy)
    if (result.parent) {
      this.expandedKey.set(result.parent.key);
    }
    this.router.navigateByUrl(route);
    this.deactivateSearch();
  }

  /** Helper template: rota inexistente = "Em breve". */
  protected isComingSoon(result: SidebarSearchResult): boolean {
    return !result.item.route;
  }

  /**
   * Trigger ATRASADO para a animacao spin do item active. Atualizado
   * 300ms apos o state mudar — mesma duracao da CSS transition de
   * width do sidebar (.--ds-duration-medium). UX: sidebar transition
   * acontece PRIMEIRO, depois o spin do item active dispara.
   *
   * Inicializado com o state atual (sem delay no mount inicial).
   */
  protected readonly spinTrigger = signal<SidebarState>('collapsed');

  /** Timer do delay do spinTrigger — limpado se state mudar antes de 300ms. */
  private spinTriggerTimer: ReturnType<typeof setTimeout> | null = null;

  /** Duracao da CSS transition do sidebar width. Sincronizar com SCSS. */
  private static readonly SIDEBAR_TRANSITION_MS = 300;

  constructor() {
    // Carrega estado do localStorage no SSR-safe
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem(STORAGE_KEY) as SidebarState | null;
      if (saved === 'expanded' || saved === 'collapsed') {
        this.state.set(saved);
      } else {
        this.state.set(this.initialState());
      }
    }

    // SBNAV-2026-05-25 B2: escuta NavigationEnd para manter currentUrl signal
    // sincronizado. Usa takeUntilDestroyed para limpeza automatica (sem
    // ngOnDestroy manual).
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((e) => this.currentUrl.set(e.urlAfterRedirects));

    // SBNAV-2026-05-25 B2 (DEC-SBNAV-F): auto-expand do submenu da raiz active
    // quando user navega direto para uma URL (mount inicial ou nav externa).
    // Apenas no MOUNT — depois disso, expansao manual prevalece.
    let autoExpandApplied = false;
    effect(() => {
      const key = this.activeRootKey();
      if (!autoExpandApplied && key && this.isExpanded()) {
        this.expandedKey.set(key);
        autoExpandApplied = true;
      }
    });

    // Inicializa spinTrigger com state inicial (sem delay no mount)
    this.spinTrigger.set(this.state());

    // Persiste mudancas de state em localStorage
    effect(() => {
      const current = this.state();
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, current);
      }
      this.stateChange.emit(current);
    });

    // Atualiza spinTrigger com delay de 300ms (= duracao da transition).
    // Resultado: quando user toggla sidebar, sidebar transita imediato,
    // e SO DEPOIS de 300ms o spinTrigger muda → diretiva [dsActiveSpin]
    // dispara animation no item active.
    effect(() => {
      const targetState = this.state();

      // Cancela timer anterior se ainda nao disparou (evita acumular
      // animations se user toggla rapido)
      if (this.spinTriggerTimer !== null) {
        clearTimeout(this.spinTriggerTimer);
      }

      this.spinTriggerTimer = setTimeout(() => {
        this.spinTrigger.set(targetState);
        this.spinTriggerTimer = null;
      }, SidebarLeftNavComponent.SIDEBAR_TRANSITION_MS);
    });
  }

  protected toggleSidebar(): void {
    const next = this.state() === 'collapsed' ? 'expanded' : 'collapsed';
    // SBNAV2-2026-05-25 (DEC-SBNAV2-G + I):
    //  - expand: mantem expandedKey (floating fecha automatico via condicional,
    //    inline abre automatico — herdaa estado).
    //  - collapse: limpa expandedKey (nao queremos floating auto-aberto;
    //    DEC-SBNAV2-I: collapsed start so abre dropdown por click intencional).
    if (next === 'collapsed') {
      this.expandedKey.set(null);
    }
    this.state.set(next);
  }

  protected toggleSubmenu(key: string): void {
    // Mutex: clica no mesmo → fecha; clica em outro → fecha o anterior e abre este
    this.expandedKey.update((curr) => (curr === key ? null : key));
  }

  protected isSubmenuOpen(key: string): boolean {
    return this.expandedKey() === key;
  }

  protected onSearchClick(): void {
    // SBSEARCH-2026-05-25: ativa o modo search inline (substitui o stub
    // anterior que apenas emitia searchClick). Emit mantido para callers
    // legados que ainda escutem o output — sera deprecated em DS-3.x.
    this.searchClick.emit();
    this.activateSearch();
  }

  protected onAccountClick(): void {
    this.accountClick.emit();
  }

  protected onSubmenuItemClick(key: string): void {
    this.submenuItemClick.emit(key);
    // SBNAV2-2026-05-25 (DEC-SBNAV2-D): em collapsed-floating, click em sub-item
    // fecha o dropdown apos navegar. Em expanded, mantem submenu inline aberto
    // (UX espera que usuario continue vendo o grupo ativo).
    if (!this.isExpanded()) {
      this.expandedKey.set(null);
    }
  }

  /** Iniciais do nome do usuario para placeholder do avatar (1-2 chars). */
  // ==========================================================================
  // SBSEARCH-2026-05-25 — HostListeners globais (shortcut + click outside).
  // ==========================================================================

  /** Atalho global Cmd+K (Mac) / Ctrl+K (Windows/Linux) ativa search. */
  @HostListener('document:keydown', ['$event'])
  protected onDocumentKeydown(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (!this.searchActive()) {
        this.activateSearch();
      } else {
        this.deactivateSearch();
      }
      return;
    }
    // SBNAV2-2026-05-25 (DEC-SBNAV2-D): ESC fecha floating dropdown (collapsed)
    if (event.key === 'Escape' && !this.isExpanded() && this.expandedKey() !== null) {
      this.expandedKey.set(null);
    }
  }

  /** Click fora do search-container desativa search; click fora do floating fecha dropdown. */
  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    // Search container behavior (existente)
    if (this.searchActive() && !target.closest('.ds-sidebar__search-container')) {
      this.deactivateSearch();
    }

    // SBNAV2-2026-05-25 (DEC-SBNAV2-D): click fora fecha floating dropdown collapsed.
    // Permite clicks dentro do menu-item-wrap (botao raiz) ou do floating-dropdown.
    if (!this.isExpanded() && this.expandedKey() !== null) {
      const insideWrap = target.closest('.ds-sidebar__menu-item-wrap');
      const insideDropdown = target.closest('.ds-sidebar__floating-dropdown');
      if (!insideWrap && !insideDropdown) {
        this.expandedKey.set(null);
      }
    }
  }

  protected getInitials(name: string): string {
    if (!name) return '?';
    const words = name.trim().split(/\s+/).filter((w) => w.length > 0);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  }
}
