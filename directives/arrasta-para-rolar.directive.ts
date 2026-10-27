import { Directive, ElementRef, inject, OnDestroy, Renderer2 } from '@angular/core';

/**
 * ============================================================================
 * `dsArrastaParaRolar` — ROLAR NA HORIZONTAL COM CLIQUE E ARRASTE
 * ============================================================================
 *
 * ⭐⭐ **Pedido do fundador em 2026-10-26**, sobre o nav de `setup/website`:
 *
 * > *"precisaremos de um scroll x neste nav, porém sem barra de rolagem aparente. Apenas o
 * > movimento de scroll horizontal, sendo acionado tanto por clique e arraste, quanto por
 * > movimento do cursor (caso do trackpad do macbook com dois dedos para direita ou esquerda)."*
 *
 * ⭐ **O trackpad NÃO passa por aqui, e isso é deliberado:** dois dedos na horizontal é
 * comportamento **nativo** de qualquer container com `overflow-x: auto`. Esta diretiva cobre
 * **só** o que o navegador não dá de graça — o arraste com o botão do mouse.
 * ⇒ Se o CSS de rolagem sair do container, o trackpad para e esta diretiva **não o substitui**.
 *
 * ----------------------------------------------------------------------------
 * ⛔⛔ O RISCO AQUI NÃO É O ARRASTE — É O CLIQUE
 * ----------------------------------------------------------------------------
 * Os filhos do container são `<button>` (as abas do nav). Uma implementação ingênua de
 * drag-to-scroll faz **cada arraste virar uma troca de aba**: o `pointerup` sobre o botão dispara
 * `click`, e o usuário que só queria rolar é navegado para outro lugar — perdendo o formulário
 * que estava preenchendo.
 *
 * ⇒ **Duas defesas, e as duas são necessárias:**
 *   1. **LIMIAR** de {@link LIMIAR_DE_ARRASTE}px antes de considerar que houve arraste. Abaixo
 *      dele, o gesto é um clique e nada é interceptado — mão que treme não desliga o nav.
 *   2. **SUPRESSÃO DO `click`** na fase de **captura**, uma única vez, quando o limiar foi
 *      passado. Captura, e não bubbling: o handler do botão roda no alvo, então interceptar
 *      depois seria tarde.
 *
 * ⚠️ **E a supressão se desarma sozinha**, no mesmo `pointerup`. Um listener que ficasse armado
 * engoliria o PRÓXIMO clique legítimo — defeito pior que o original, porque intermitente.
 *
 * ----------------------------------------------------------------------------
 * Notas de implementação
 * ----------------------------------------------------------------------------
 * - `setPointerCapture`: o arraste sobrevive a sair do container, que é o caso comum ao rolar até
 *   a ponta. Sem ele o gesto morre no meio e o conteúdo fica parado com o botão ainda apertado.
 * - **Só botão primário** (`button === 0`): arraste com o botão do meio é rolagem automática do
 *   sistema, e com o direito é menu de contexto. Sequestrar os dois seria tirar função.
 * - `Renderer2.listen` em vez de `addEventListener`: devolve a função de remoção, e é o que
 *   mantém o `ngOnDestroy` honesto.
 * - **Nada de `cursor: grab`**: os filhos são botões, e `grab` sobre um botão comunica a coisa
 *   errada. A afordância de rolagem aqui é o próprio conteúdo cortado na borda.
 *
 * @example
 * <div class="minha-tira-rolavel" dsArrastaParaRolar>…</div>
 */

/** Deslocamento em px a partir do qual o gesto deixa de ser clique e passa a ser arraste. */
export const LIMIAR_DE_ARRASTE = 4;

@Directive({
  selector: '[dsArrastaParaRolar]',
  standalone: true,
})
export class ArrastaParaRolarDirective implements OnDestroy {
  private readonly hospedeiro = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);

  private readonly desinscrever: Array<() => void> = [];

  /** `null` = nenhum arraste em curso. */
  private inicio: { x: number; scrollLeft: number; pointerId: number } | null = null;
  private passouDoLimiar = false;

  constructor() {
    const el = this.hospedeiro.nativeElement;

    this.desinscrever.push(
      this.renderer.listen(el, 'pointerdown', (evento: PointerEvent) => this.aoApertar(evento)),
      this.renderer.listen(el, 'pointermove', (evento: PointerEvent) => this.aoMover(evento)),
      this.renderer.listen(el, 'pointerup', () => this.aoSoltar()),
      this.renderer.listen(el, 'pointercancel', () => this.aoSoltar()),
    );
  }

  ngOnDestroy(): void {
    for (const remover of this.desinscrever) remover();
    this.desinscrever.length = 0;
  }

  private aoApertar(evento: PointerEvent): void {
    /*
      ⛔ `mouse` com botão primário, e só. Toque e caneta já rolam nativamente pelo
      `touch-action: pan-x` — interceptá-los aqui competiria com a rolagem do próprio navegador,
      que é mais suave (tem inércia) do que qualquer coisa que este código faria.
    */
    if (evento.pointerType === 'mouse' && evento.button !== 0) return;
    if (evento.pointerType !== 'mouse') return;

    const el = this.hospedeiro.nativeElement;
    this.inicio = { x: evento.clientX, scrollLeft: el.scrollLeft, pointerId: evento.pointerId };
    this.passouDoLimiar = false;
  }

  private aoMover(evento: PointerEvent): void {
    const inicio = this.inicio;
    if (!inicio || evento.pointerId !== inicio.pointerId) return;

    const deslocamento = evento.clientX - inicio.x;

    if (!this.passouDoLimiar) {
      if (Math.abs(deslocamento) < LIMIAR_DE_ARRASTE) return;
      this.passouDoLimiar = true;
      const el = this.hospedeiro.nativeElement;
      /*
        ⚠️ A captura entra só DEPOIS do limiar: capturar no `pointerdown` roubaria o `pointerup`
        de um clique comum, e o botão deixaria de responder.
      */
      el.setPointerCapture?.(inicio.pointerId);
    }

    /*
      O conteúdo acompanha o cursor: arrastar para a ESQUERDA avança o scroll, então o sinal é
      invertido. É o gesto de "empurrar o papel", não de "mover a barra".
    */
    this.hospedeiro.nativeElement.scrollLeft = inicio.scrollLeft - deslocamento;
    /* Sem isto o arraste SELECIONA o texto das abas em vez de rolar. */
    evento.preventDefault();
  }

  private aoSoltar(): void {
    const inicio = this.inicio;
    this.inicio = null;
    if (!inicio) return;

    const el = this.hospedeiro.nativeElement;
    el.releasePointerCapture?.(inicio.pointerId);

    if (!this.passouDoLimiar) return;
    this.passouDoLimiar = false;

    /*
      ⛔⛔ A SUPRESSÃO DO CLIQUE, e ela é a razão desta diretiva existir em vez de 5 linhas inline.

      Sem isto, arrastar o nav TROCA DE ABA — e o usuário perde o formulário que estava
      preenchendo. ⇒ captura (não bubbling: o handler do botão roda no alvo) + `once` (um listener
      que ficasse armado engoliria o PRÓXIMO clique legítimo, e um defeito intermitente custa mais
      que o original).
    */
    const engolir = (clique: Event) => {
      clique.stopPropagation();
      clique.preventDefault();
    };
    el.addEventListener('click', engolir, { capture: true, once: true });

    /*
      ⚠️ REDE DE SEGURANÇA: se nenhum clique vier (o ponteiro foi solto fora de um botão), o
      listener `once` fica armado e engoliria o próximo clique de verdade. O `setTimeout(0)` o
      remove no fim da fila de tarefas — depois do `click` sintético, que é disparado no mesmo
      ciclo do `pointerup`.
    */
    setTimeout(() => el.removeEventListener('click', engolir, { capture: true }), 0);
  }
}
