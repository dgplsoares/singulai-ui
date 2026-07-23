import { Injectable, computed, inject, signal } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

/**
 * NavigationHistoryService — rastreia historico de navegacao do Router.
 *
 * Usado por <ds-page-header> para habilitar/desabilitar os botoes voltar
 * e avancar automaticamente. Caller pode tambem chamar `back()` / `forward()`
 * / `reset()` direto para implementar comportamentos customizados (ex:
 * limpar historico apos CRUD create).
 *
 * Pilhas mantidas:
 *   pastUrls  — URLs visitadas ANTES da atual (mais antiga primeiro)
 *   futureUrls — URLs descartadas via back() (mais recente no topo)
 *
 * Sincroniza com browser back/forward (popstate) detectando o trigger
 * de cada NavigationStart event. Tres casos sao tratados:
 *   1. Imperative (router.navigate / RouterLink) — push current em past, clear future
 *   2. Popstate back  — newUrl bate com pastUrls.last → pop past, push current em future
 *   3. Popstate forward — newUrl bate com futureUrls.last → pop future, push current em past
 *   4. Caso indefinido (URL externa, jump) — comporta como imperative
 *
 * SSR-safe: se Router nao injetar (split-ready sem router), o service vira
 * no-op silencioso. Page-header continua funcional via inputs manuais.
 *
 * Stack limitado a 50 entradas (FIFO) — evita vazamento em SPAs longas.
 */
@Injectable({ providedIn: 'root' })
export class NavigationHistoryService {
  private static readonly STACK_LIMIT = 50;

  private readonly router = inject(Router, { optional: true });

  private readonly _pastUrls = signal<string[]>([]);
  private readonly _futureUrls = signal<string[]>([]);
  private readonly _currentUrl = signal<string | null>(null);

  /** True quando ha URL anterior na pilha (botao voltar habilita). */
  readonly canGoBack = computed(() => this._pastUrls().length > 0);

  /** True quando ha URL futura disponivel apos back() (botao avancar habilita). */
  readonly canGoForward = computed(() => this._futureUrls().length > 0);

  /** Snapshot read-only da pilha de URLs anteriores. */
  readonly pastUrls = this._pastUrls.asReadonly();

  /** Snapshot read-only da pilha de URLs futuras. */
  readonly futureUrls = this._futureUrls.asReadonly();

  /** URL atual rastreada (null antes da primeira NavigationEnd). */
  readonly currentUrl = this._currentUrl.asReadonly();

  /** Trigger do NavigationStart corrente — usado em NavigationEnd. */
  private pendingTrigger: 'imperative' | 'popstate' | 'hashchange' = 'imperative';

  constructor() {
    if (!this.router) return; // sem Router — service no-op (split-ready)

    this.router.events
      .pipe(filter((e): e is NavigationStart | NavigationEnd =>
        e instanceof NavigationStart || e instanceof NavigationEnd))
      .subscribe(event => {
        if (event instanceof NavigationStart) {
          // navigationTrigger pode ser undefined em navegacoes sinteticas
          // (ex: chamadas internas do Router em redirects). Default seguro:
          // tratar como imperative.
          this.pendingTrigger = event.navigationTrigger ?? 'imperative';
          return;
        }
        // NavigationEnd
        this.handleNavigation(event.urlAfterRedirects, this.pendingTrigger);
      });
  }

  /**
   * Navega para a URL anterior usando o Router. Pop em pastUrls,
   * push da URL atual em futureUrls. NOOP se !canGoBack.
   */
  back(): void {
    if (!this.canGoBack() || !this.router) return;
    const prev = this._pastUrls()[this._pastUrls().length - 1];
    // navegacao imperative — handler em NavigationEnd cuida das pilhas.
    // Para o handler reconhecer corretamente, marcamos como "back via service"
    // antes de navegar. O event NavigationStart vai vir com trigger=imperative,
    // mas a URL bate com pastUrls.last → handleNavigation trata como popstate-back.
    void this.router.navigateByUrl(prev);
  }

  /**
   * Navega para a URL futura. Pop em futureUrls, push da URL atual em pastUrls.
   * NOOP se !canGoForward.
   */
  forward(): void {
    if (!this.canGoForward() || !this.router) return;
    const next = this._futureUrls()[this._futureUrls().length - 1];
    void this.router.navigateByUrl(next);
  }

  /**
   * Limpa ambas as pilhas. Chamar apos operacao CRUD create — desabilita
   * o botao back ate que o usuario navegue novamente. Mantem currentUrl
   * (apenas o historico e zerado).
   */
  reset(): void {
    this._pastUrls.set([]);
    this._futureUrls.set([]);
  }

  // --------------------------------------------------------------------------
  // Internals
  // --------------------------------------------------------------------------

  private handleNavigation(
    newUrl: string,
    trigger: 'imperative' | 'popstate' | 'hashchange',
  ): void {
    const current = this._currentUrl();

    // Primeira navegacao — apenas seta currentUrl, nada para empurrar
    if (current === null) {
      this._currentUrl.set(newUrl);
      return;
    }

    // Mesma URL (ex: replaceUrl, query param tweak) — ignora
    if (newUrl === current) return;

    // Heuristica: independente do trigger, se newUrl bate com topo de uma das
    // pilhas, e back/forward (cobre caso de service.back() que dispara
    // imperative mas semanticamente e back).
    const past = this._pastUrls();
    const future = this._futureUrls();

    if (past.length > 0 && newUrl === past[past.length - 1]) {
      // Back — pop past, push current em future
      this._pastUrls.set(past.slice(0, -1));
      this._futureUrls.set(this.pushBounded(future, current));
      this._currentUrl.set(newUrl);
      return;
    }

    if (future.length > 0 && newUrl === future[future.length - 1]) {
      // Forward — pop future, push current em past
      this._futureUrls.set(future.slice(0, -1));
      this._pastUrls.set(this.pushBounded(past, current));
      this._currentUrl.set(newUrl);
      return;
    }

    // Imperativo OU popstate-jump arbitrario — push current em past, clear future
    this._pastUrls.set(this.pushBounded(past, current));
    this._futureUrls.set([]);
    this._currentUrl.set(newUrl);
  }

  private pushBounded(stack: string[], url: string): string[] {
    const next = [...stack, url];
    if (next.length > NavigationHistoryService.STACK_LIMIT) {
      return next.slice(next.length - NavigationHistoryService.STACK_LIMIT);
    }
    return next;
  }
}
