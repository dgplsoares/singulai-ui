import { Injectable, computed, signal } from '@angular/core';

/**
 * BreakpointService — observa breakpoints do design system Singulai.
 *
 * Fornece 6 signals reativos a window.resize:
 *   isMobile          — viewport < 992px (mobile + tablet) — usado pelo DS
 *                       para alternar layouts mobile vs desktop
 *   isMobileOnly      — viewport < 768px (mobile estrito, sem tablet)
 *   isTablet          — viewport 768-991px (tablet exclusivo)
 *   isDesktop         — viewport ≥ 992px (= !isMobile)
 *   isMediumDesktop   — viewport 1440-1919px (mutex AI ↔ sidebar legacy)
 *   isExtraLargeDesktop — viewport ≥ 1920px (sem mutex, ambos expandidos)
 *
 * Implementa via window.matchMedia + signal reativo.
 *
 * Uso:
 *   constructor(private bp = inject(BreakpointService)) {}
 *   protected readonly isMobile = this.bp.isMobile;
 *   ...
 *   @if (isMobile()) { ... }
 *
 * Singleton (`providedIn: 'root'`) — uma instancia por aplicacao. Os listeners
 * matchMedia vivem pelo tempo de vida da aplicacao (cleanup nao necessario).
 *
 * Migracao do `ViewportService` legacy:
 *   - ViewportService.isMobile$ (< 768)        → BreakpointService.isMobileOnly()
 *   - ViewportService.isTablet$ (768-991)      → BreakpointService.isTablet()
 *   - ViewportService.isDesktop$ (≥ 992)       → BreakpointService.isDesktop()
 *   - ViewportService.isMediumDesktop$         → BreakpointService.isMediumDesktop()
 *   - ViewportService.isExtraLargeDesktop$     → BreakpointService.isExtraLargeDesktop()
 *
 * Atencao: `BreakpointService.isMobile` (< 992) cobre mobile + tablet, NAO
 * equivale ao `ViewportService.isMobile$` (< 768) legacy. Se migrando features
 * que precisam isolar mobile-only, use `isMobileOnly()` ao inves de `isMobile()`.
 */
@Injectable({ providedIn: 'root' })
export class BreakpointService {
  // Internal writable signals (set via matchMedia listeners)
  private readonly _isMobile = signal(false);
  private readonly _isMobileOnly = signal(false);
  private readonly _isTablet = signal(false);
  private readonly _isMediumDesktop = signal(false);
  private readonly _isExtraLargeDesktop = signal(false);

  /** Signal: true quando viewport < 992px (mobile + tablet). Reativo a resize. */
  readonly isMobile = this._isMobile.asReadonly();

  /** Signal: true quando viewport < 768px (mobile estrito). */
  readonly isMobileOnly = this._isMobileOnly.asReadonly();

  /** Signal: true quando viewport 768-991px (tablet exclusivo). */
  readonly isTablet = this._isTablet.asReadonly();

  /** Signal: true quando viewport ≥ 992px (desktop em diante). */
  readonly isDesktop = computed(() => !this._isMobile());

  /** Signal: true quando viewport 1440-1919px (mutex AI ↔ sidebar). */
  readonly isMediumDesktop = this._isMediumDesktop.asReadonly();

  /** Signal: true quando viewport ≥ 1920px (sem mutex, ambos expandidos). */
  readonly isExtraLargeDesktop = this._isExtraLargeDesktop.asReadonly();

  // Media query strings (usadas internamente + acessiveis via static)
  static readonly MOBILE_QUERY = '(max-width: 991px)';
  static readonly MOBILE_ONLY_QUERY = '(max-width: 767px)';
  static readonly TABLET_QUERY = '(min-width: 768px) and (max-width: 991px)';
  static readonly MEDIUM_DESKTOP_QUERY = '(min-width: 1440px) and (max-width: 1919px)';
  static readonly EXTRA_LARGE_DESKTOP_QUERY = '(min-width: 1920px)';

  constructor() {
    // SSR safety: window indisponivel no servidor — fica em default false
    if (typeof window === 'undefined') return;

    this.bindQuery(BreakpointService.MOBILE_QUERY, this._isMobile);
    this.bindQuery(BreakpointService.MOBILE_ONLY_QUERY, this._isMobileOnly);
    this.bindQuery(BreakpointService.TABLET_QUERY, this._isTablet);
    this.bindQuery(BreakpointService.MEDIUM_DESKTOP_QUERY, this._isMediumDesktop);
    this.bindQuery(BreakpointService.EXTRA_LARGE_DESKTOP_QUERY, this._isExtraLargeDesktop);
  }

  private bindQuery(query: string, target: ReturnType<typeof signal<boolean>>): void {
    const mql = window.matchMedia(query);
    target.set(mql.matches);
    mql.addEventListener('change', (e) => target.set(e.matches));
  }
}
