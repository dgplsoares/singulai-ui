import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * `<ds-char-counter>` — "1.234 / 12.000 caracteres", com aviso ao encher.
 *
 * ====================================================================
 * EXTRAÇÃO, NÃO INVENÇÃO (`D.3.5.9 / 9e`)
 * ====================================================================
 * O mesmo bloco existia em `lesson-info-card` e `lesson-texto-offcanvas` —
 * markup idêntico e **10 linhas de SCSS copiadas verbatim** entre os dois. A
 * `9e` ia acrescentar a 3ª, 4ª e 5ª cópias (roteiro do vídeo, roteiro do slide,
 * roteiro do ebook), e cinco cópias do mesmo estilo envelhecem em cinco
 * direções.
 *
 * ====================================================================
 * POR QUE NO DS E NÃO EM SHARED
 * ====================================================================
 * Decision tree de placement, passo 1: *"faria sentido em outro projeto Angular
 * sem nada de Singulai?"*. Um contador de caracteres não sabe o que é curso,
 * aula ou tenant — ele recebe dois números. **Sim → DS.**
 *
 * ⚠️ E é por isso que ele **não conhece a tabela de limites**: quem passa o
 * `limit` é o consumidor, que é quem conhece a regra de produto. Ler
 * `CONTENT_LIMITS` aqui dentro faria o DS depender do domínio.
 */
@Component({
  selector: 'ds-char-counter',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="ds-char-counter"
      [class.ds-char-counter--exceeded]="atLimit()"
      aria-live="polite"
    >
      {{ displayFormatado() }} / {{ limiteFormatado() }}{{ suffix() ? ' ' + suffix() : '' }}
    </div>
  `,
  styleUrl: './char-counter.component.scss',
})
export class CharCounterComponent {
  /** Quantos caracteres o campo tem agora. */
  readonly count = input.required<number>();

  /** O teto. Vem de quem conhece a regra — o DS não decide isto. */
  readonly limit = input.required<number>();

  /** Texto após os números. `''` para só `123 / 500`. */
  readonly suffix = input<string>('caracteres');

  /**
   * Bateu no teto?
   *
   * ⚠️ **`>=`, não `>` — e isso é decisão de produto, tomada pelo fundador em
   * 2026-08-15:** *"quando bater no limite, o texto com o contador de caracteres
   * ficar vermelho"*. "Bater no limite" é ATINGIR.
   *
   * Há também um motivo prático: quando a IA trunca EXATAMENTE no teto, o
   * estado `> limite` não acontece. Pintar só o excesso deixaria o aviso
   * invisível justamente no caso mais comum.
   *
   * ⚠️ Isto NÃO é o mesmo critério do `canSubmit` do consumidor, que recusa em
   * `> limite`. No teto exato o conteúdo ainda é **válido** — o vermelho avisa
   * "acabou o espaço", não "está errado".
   */
  protected readonly atLimit = computed<boolean>(() => this.count() >= this.limit());

  /**
   * O número exibido é **sempre o USADO** — inclusive acima do teto.
   *
   * ====================================================================
   * ⚠️ O NEGATIVO FOI TENTADO E DESFEITO NO MESMO DIA (`9f`, 2026-08-16)
   * ====================================================================
   * A primeira versão da `9f` exibia `-500 / 12.000` para 12.500 caracteres. O
   * fundador se corrigiu horas depois, e a razão é de **coerência interna**:
   *
   *   *"A contagem negativa só faria sentido se o cálculo de caracteres fosse
   *   pela quantidade disponível restante. Como optamos pela quantidade usada
   *   real, então a exibição deveria ser 12.500 / 12.000 (tudo vermelho)."*
   *
   * Ele está certo. `-500` é a linguagem do formato **restante**; `12.500` é a
   * do formato **usado**. Um slot que troca de significado ao cruzar o teto
   * obriga o usuário a reaprender o número justamente no momento em que ele
   * está tentando consertar algo.
   *
   * **Quem comunica o excesso é a COR**, não o sinal — e ela já cobre os dois
   * estados (`atLimit`). O denominador continua ali para a conta ser óbvia:
   * `12.500 / 12.000` diz "passei 500" sem precisar dizer.
   */
  protected readonly displayFormatado = computed<string>(() =>
    comSeparadorDeMilhar(this.count()),
  );

  protected readonly limiteFormatado = computed<string>(() =>
    comSeparadorDeMilhar(this.limit()),
  );
}

/**
 * `12000` → `"12.000"`.
 *
 * ⚠️ **Não usa `toLocaleString`**: ele depende do locale do NAVEGADOR, e um
 * usuário com o browser em inglês veria `12,000` — vírgula onde o resto da tela
 * usa ponto. O separador aqui é decisão de produto (pt-BR), não do ambiente.
 *
 * ⚠️ Também não usa o `DecimalPipe` do Angular: ele exigiria `registerLocaleData`
 * e um `LOCALE_ID` configurado, e este componente é do DS — precisa funcionar
 * em qualquer app que o importe, sem pedir configuração.
 *
 * O `\B` impede o ponto no início — sem ele, um número de 3 dígitos exatos
 * ganharia um ponto na frente (`.500`).
 */
function comSeparadorDeMilhar(valor: number): string {
  return String(valor).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
