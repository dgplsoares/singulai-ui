import {
  DestroyRef,
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';

/**
 * DsActiveSpinDirective — controla a classe `.ds-spinning` (e classes
 * auxiliares) no host element para disparar a animacao do mixin SCSS
 * `ds-active-spin-ring` (REDASH-PREP-5.1 + 5.2 + 5.2-B4).
 *
 * Modos:
 *
 * 1. PADRAO ([delayClickUntilEnd]=false):
 *    A animacao acompanha o estado active. enabled=true => add .ds-spinning.
 *    trigger muda => restart anim. Click do usuario nao e interceptado.
 *    Usado em: sidebar-left-nav, nav-footer mobile.
 *
 * 2. DELAY CLICK ([delayClickUntilEnd]=true):
 *    Diretiva intercepta o click via host listener. Aplica imediatamente
 *    AS classes auxiliares de [pendingClasses] (visual --active) E
 *    .ds-spinning (animation). Anima por [spinDurationMs]. SO ENTAO
 *    emite (delayedClick) com o evento original.
 *
 *    Modo de uso no template:
 *      <button
 *        dsActiveSpin
 *        [delayClickUntilEnd]="true"
 *        [pendingClasses]="['ds-ai-assistant-button--active']"
 *        [enabled]="active()"
 *        [trigger]="active()"
 *        (delayedClick)="onClick($event)"
 *      >
 *
 *    [pendingClasses] recebe array de classes que devem ser aplicadas
 *    DURANTE o pending (representando o visual --active sem dispar a
 *    action target ainda). Sem essas classes, a animacao roda em
 *    elemento sem o visual ring base — fica esquisito.
 *
 *    Importante: o tempo de espera ate emit do (delayedClick) e
 *    controlado por [spinDurationMs] (default 500ms). DEVE estar
 *    sincronizado com $duration do @include ds-active-spin-ring no
 *    SCSS do componente.
 *
 * --------------------------------------------------------------------------
 * Implementacao B4 (Parte B v3 + suppress):
 *
 * - Diretiva aplica [pendingClasses] no host durante pending — resolve
 *   o problema visual de animation em elemento sem visual --active.
 * - Suppress: apos pending clear, o effect skipa UM restart de
 *   animacao. Evita que a animation rode 2x (uma durante pending,
 *   outra quando active() muda em consequencia do delayedClick).
 * - Mantem: setTimeout deterministico (em vez de animationend),
 *   guard B2 no effect (skip restart durante pending).
 * --------------------------------------------------------------------------
 *
 * Doc do pattern: .claude/design-system/patterns/active-button-spin.md
 */
@Directive({
  selector: '[dsActiveSpin]',
  standalone: true,
})
export class DsActiveSpinDirective {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  /** Quando true, dispara/mantem animacao. */
  readonly enabled = input<boolean>(false);

  /** Toda mudanca re-dispara animacao (modo padrao). Em pending, ignorado. */
  readonly trigger = input<unknown>(null);

  /** Quando true, intercepta click e atrasa emit em [spinDurationMs]. */
  readonly delayClickUntilEnd = input<boolean>(false);

  /**
   * Tempo (ms) ate emitir delayedClick apos o click. Sincronizar com
   * $duration do mixin SCSS ds-active-spin-ring.
   */
  readonly spinDurationMs = input<number>(500);

  /**
   * Classes auxiliares aplicadas no host durante o pending click. Cada
   * classe deve representar parte do visual "active" do componente
   * (background, border, box-shadow), para que a animacao tenha o ring
   * base visivel enquanto roda. Sem isso, animation orbita elemento
   * sem destaque visual.
   *
   * Exemplo: ['ds-ai-assistant-button--active']
   */
  readonly pendingClasses = input<string[]>([]);

  /** Emitido apos spinDurationMs (modo delayClickUntilEnd=true). */
  @Output() readonly delayedClick = new EventEmitter<MouseEvent>();

  private readonly pendingClick = signal<MouseEvent | null>(null);
  private pendingTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Flag para suprimir UM restart do effect apos pending clear. Quando
   * timeout fires e parent reage com setActive(true), o effect re-roda
   * com enabled=true → tentaria restart. Esse flag faz o effect skipar
   * uma vez para evitar animation rodando 2x.
   */
  private suppressNextRestart = false;

  constructor() {
    effect(() => {
      const enabled = this.enabled();
      const hasPending = this.pendingClick() !== null;
      this.trigger();

      const node = this.el.nativeElement;
      const pendingClasses = this.pendingClasses();

      // ====================================================================
      // PENDING ATIVO: aplica visual --active (via pendingClasses) +
      // .ds-spinning. Guard B2: NAO restartar animation em curso.
      // ====================================================================
      if (hasPending) {
        for (const cls of pendingClasses) {
          if (!node.classList.contains(cls)) node.classList.add(cls);
        }
        if (!node.classList.contains('ds-spinning')) {
          node.classList.add('ds-spinning');
        }
        return;
      }

      // ====================================================================
      // PENDING CLEARED.
      //
      // Caso A: enabled=true (parent reagiu ao delayedClick com setActive
      // (true), iniciando o "modo active permanente"). NAO MEXER em
      // pendingClasses — o template binding [class.--active]="active()"
      // do componente cuida de manter o visual. Tocar aqui geraria race
      // condition: diretiva remove → template binding tenta re-add →
      // ordem nao-deterministica → as vezes a class some.
      //
      // Caso B: enabled=false (active() ja era false E ainda e — caso
      // raro mas possivel se parent decidir nao ativar apos delayedClick,
      // ou se o pending foi cancelado externamente). REMOVER pendingClasses
      // para limpar o visual transiente, e remover ds-spinning.
      // ====================================================================
      if (!enabled) {
        for (const cls of pendingClasses) {
          node.classList.remove(cls);
        }
        node.classList.remove('ds-spinning');
        return;
      }

      // SUPPRESS pos-pending: skip um restart para evitar animation 2x
      if (this.suppressNextRestart) {
        this.suppressNextRestart = false;
        // Garante que ds-spinning continua presente (animation que rodou
        // durante pending ja terminou; mantem class para o estado final
        // consistente). Nao restart.
        if (!node.classList.contains('ds-spinning')) {
          node.classList.add('ds-spinning');
        }
        return;
      }

      // Restart normal (modo padrao)
      node.classList.remove('ds-spinning');
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      node.offsetWidth;
      node.classList.add('ds-spinning');
    });

    // Cleanup defensivo
    this.destroyRef.onDestroy(() => {
      if (this.pendingTimer !== null) {
        clearTimeout(this.pendingTimer);
        this.pendingTimer = null;
      }
    });
  }

  @HostListener('click', ['$event'])
  protected onHostClick(event: MouseEvent): void {
    if (!this.delayClickUntilEnd()) return;

    // Ignora duplo-click durante pending
    if (this.pendingClick() !== null) {
      event.stopImmediatePropagation();
      event.preventDefault();
      return;
    }

    event.stopImmediatePropagation();
    event.preventDefault();

    const node = this.el.nativeElement;

    this.pendingClick.set(event);

    // FORCE RESTART sincrono — necessario para toggle OFF (active=true ->
    // false). Nesse cenario, .ds-spinning ja esta aplicada de quando o
    // botao foi ativado, mas a animation anterior ja terminou (forwards
    // fill-mode). Adicionar a classe de novo nao restarta a animation
    // CSS — precisamos remove + reflow + add. O effect (que roda em
    // microtask) tem guard B2 para nao restartar durante pending, entao
    // forcar AQUI sincrono e a unica forma confiavel de garantir
    // restart no toggle off.
    //
    // Tambem aplica pendingClasses sincrono (idempotente) — garante que
    // o ring base esta visivel desde o paint 0 sem esperar microtask
    // do effect.
    for (const cls of this.pendingClasses()) {
      if (!node.classList.contains(cls)) node.classList.add(cls);
    }
    node.classList.remove('ds-spinning');
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    node.offsetWidth; // reflow forca browser a computar styles sem a class
    node.classList.add('ds-spinning');

    // Schedule emit. Animation comeca no proximo paint (~16ms).
    // setTimeout 500ms inicia agora, emit acontece em ~516ms (depois do
    // fim real da animation). Ajuste preventivo do offset paint:
    this.pendingTimer = setTimeout(() => {
      this.pendingTimer = null;
      this.suppressNextRestart = true; // Evita restart no proximo effect
      const captured = this.pendingClick();
      this.pendingClick.set(null);

      if (captured) {
        this.delayedClick.emit(captured);
      }
    }, this.spinDurationMs());
  }
}
