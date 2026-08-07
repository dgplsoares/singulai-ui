import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * `<ds-number-stepper>` — campo numérico com setas, do Figma.
 *
 * ====================================================================
 * POR QUE ELE EXISTE, E POR QUE SO' AGORA
 * ====================================================================
 * A `D.3.4` mediu este controle em "Capacidade (pessoas)" (`1074:10986`) e NAO o
 * construiu — um componente de DS para um consumidor so' e' abstracao prematura.
 * A divida ficou registrada como `DEC-FIG-D.3-5a`.
 *
 * A `D.3.W3` mediu mais dois: "Limite de participantes" (`828:4467`) e "Preco"
 * (`767:9277`). Tres telas, o mesmo desenho — e `<input type="number">` cru em cada
 * uma produziria tres aparencias da mesma coisa, com os spinners nativos do browser,
 * que sao diferentes em cada um.
 *
 * ====================================================================
 * POR QUE `type="text"` E NAO `type="number"`
 * ====================================================================
 * Preco em pt-BR se digita com VIRGULA. `<input type="number">` trata "19,90" como
 * entrada invalida e devolve string vazia — o valor digitado simplesmente some. Alem
 * disso ele traz os spinners nativos, que o Figma substitui pelo bloco `#e2eaf2`.
 *
 * `role="spinbutton"` + `aria-valuemin/max/now` devolvem a semântica que o
 * `type="text"` não tem, para leitor de tela.
 */
@Component({
  selector: 'ds-number-stepper',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './number-stepper.component.html',
  styleUrl: './number-stepper.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NumberStepperComponent),
      multi: true,
    },
  ],
})
export class NumberStepperComponent implements ControlValueAccessor {
  /** Menor valor aceito. `null` = sem piso. */
  readonly min = input<number | null>(null);

  /** Maior valor aceito. `null` = sem teto. */
  readonly max = input<number | null>(null);

  /** Quanto cada seta soma ou subtrai. */
  readonly step = input<number>(1);

  /** Casas decimais exibidas. `0` = inteiro. */
  readonly decimals = input<number>(0);

  /** Texto fixo antes do valor — "R$" no card de Monetização (`760:5441`). */
  readonly prefix = input<string | null>(null);

  readonly placeholder = input<string>('');

  /** Desabilita por input; o `setDisabledState` do form também desabilita. */
  readonly disabled = input<boolean>(false);

  readonly ariaLabel = input<string | null>(null);

  /** Valor corrente. `null` = campo vazio, que NAO e' zero. */
  private readonly valor = signal<number | null>(null);

  /**
   * O que o usuário está digitando AGORA, ou `null` quando ele não está digitando.
   *
   * Existe para que a formatação não atropele a digitação: reformatar a cada tecla
   * faria o cursor pular e impediria de escrever "19," a caminho de "19,90".
   */
  private readonly rascunho = signal<string | null>(null);

  /**
   * Texto do input — DERIVADO, não guardado.
   *
   * A primeira versão gravava o texto formatado dentro do `writeValue`. Isso congela
   * o display no formato que valia naquele instante: um consumidor que definisse
   * `decimals` depois do valor (ou o mudasse) continuaria vendo "100" onde deveria
   * ler "100,00". Derivar faz a formatação seguir o valor E as casas decimais.
   */
  readonly texto = computed(() => this.rascunho() ?? this.formatar(this.valor()));

  private readonly disabledPorForm = signal(false);

  readonly estaDesabilitado = computed(() => this.disabled() || this.disabledPorForm());

  readonly valorAtual = computed(() => this.valor());

  readonly naoPodeDecrementar = computed(() => {
    if (this.estaDesabilitado()) {
      return true;
    }
    const piso = this.min();
    const v = this.valor();
    return piso !== null && v !== null && v <= piso;
  });

  readonly naoPodeIncrementar = computed(() => {
    if (this.estaDesabilitado()) {
      return true;
    }
    const teto = this.max();
    const v = this.valor();
    return teto !== null && v !== null && v >= teto;
  });

  private onChangeFn: (v: number | null) => void = () => {};
  private onTouchedFn: () => void = () => {};

  // ==================== Interação ====================

  incrementar(): void {
    this.passo(+1);
  }

  decrementar(): void {
    this.passo(-1);
  }

  onInput(bruto: string): void {
    this.rascunho.set(bruto);

    const parseado = this.parse(bruto);
    this.valor.set(parseado);
    this.onChangeFn(parseado);
  }

  /**
   * Sair do campo é onde o valor é corrigido.
   *
   * Corrigir a cada tecla impediria de digitar "1" a caminho de "100" num campo com
   * mínimo 10 — o "1" viraria "10" e o próximo dígito faria "101".
   */
  onBlur(): void {
    this.onTouchedFn();

    const limitado = this.limitar(this.valor());
    if (limitado !== this.valor()) {
      this.valor.set(limitado);
      this.onChangeFn(limitado);
    }

    // Devolve o campo à formatação canônica.
    this.rascunho.set(null);
  }

  // ==================== ControlValueAccessor ====================

  writeValue(v: unknown): void {
    const numero = typeof v === 'number' && Number.isFinite(v) ? v : null;
    this.valor.set(numero);
    this.rascunho.set(null);
  }

  registerOnChange(fn: (v: number | null) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledPorForm.set(isDisabled);
  }

  // ==================== Interno ====================

  /**
   * Um passo para cima ou para baixo.
   *
   * Campo vazio ANCORA no mínimo em vez de partir de zero: num campo cujo piso é 10,
   * `null + 1` daria 1 — um valor que o próprio campo recusa.
   */
  private passo(direcao: 1 | -1): void {
    const base = this.valor() ?? this.min() ?? 0;
    const partida = this.valor() === null ? base : base + direcao * this.step();

    const proximo = this.limitar(this.arredondar(partida));

    this.valor.set(proximo);
    this.rascunho.set(null);
    this.onChangeFn(proximo);
  }

  private limitar(v: number | null): number | null {
    if (v === null) {
      return null;
    }
    const piso = this.min();
    const teto = this.max();

    if (piso !== null && v < piso) return piso;
    if (teto !== null && v > teto) return teto;
    return v;
  }

  /**
   * Corta o lixo de ponto flutuante do passo.
   *
   * `0.2 + 0.1 === 0.30000000000000004`. Num preço isso vira "0,30" na tela e
   * 0.30000000000000004 no banco — e a soma de dois desses não bate com o total.
   */
  private arredondar(v: number): number {
    const casas = this.decimals();
    return casas > 0 ? Number(v.toFixed(casas)) : Math.round(v);
  }

  /** `null` quando não há número — vazio e "abc" são a mesma coisa: sem resposta. */
  private parse(bruto: string): number | null {
    const limpo = bruto.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '');
    if (limpo === '' || limpo === '-') {
      return null;
    }
    const n = Number(limpo);
    return Number.isFinite(n) ? n : null;
  }

  private formatar(v: number | null): string {
    if (v === null) {
      return '';
    }
    const casas = this.decimals();
    return casas > 0
      ? v.toLocaleString('pt-BR', {
          minimumFractionDigits: casas,
          maximumFractionDigits: casas,
        })
      : String(v);
  }
}
