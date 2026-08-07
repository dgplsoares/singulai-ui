import { Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { NumberStepperComponent } from './number-stepper.component';

/**
 * RED-first do `<ds-number-stepper>` (D.3.W3, sub-bloco W3.1).
 *
 * ====================================================================
 * POR QUE ELE E' DO DS, E POR QUE SO' AGORA
 * ====================================================================
 * A `D.3.4` mediu este controle em "Capacidade (pessoas)" (`1074:10986`) e NAO o
 * construiu: um componente de DS para um consumidor so' e' abstracao prematura, e
 * criar componente de DS nao estava no escopo aprovado daquele sub-bloco. A divida
 * ficou registrada como `DEC-FIG-D.3-5a`.
 *
 * A `D.3.W3` mediu mais dois: "Limite de participantes" (`828:4467`) e "Preco"
 * (`767:9277`). Tres consumidores em telas diferentes e' o gatilho — e os tres sao o
 * mesmo desenho, entao um `<input type="number">` cru em cada um produziria tres
 * aparencias diferentes da mesma coisa.
 *
 * ====================================================================
 * O PREFIXO NAO E' ENFEITE
 * ====================================================================
 * O de Preco tem um slot de 37px com "R$" ANTES do valor (`760:5441` → Frame 418).
 * Sem `prefix` na API, o consumidor teria que envolver o componente num wrapper e
 * reposicionar a borda — que e' exatamente como se reimplementa um componente por
 * fora dele.
 */
@Component({
  standalone: true,
  imports: [NumberStepperComponent, ReactiveFormsModule],
  template: `<ds-number-stepper
    [formControl]="control"
    [min]="min()"
    [max]="max()"
    [step]="step()"
    [decimals]="decimals()"
    [prefix]="prefix()"
  />`,
})
class HostSpec {
  readonly control = new FormControl<number | null>(10);
  readonly min = signal<number | null>(0);
  readonly max = signal<number | null>(100);
  readonly step = signal(1);
  readonly decimals = signal(0);
  readonly prefix = signal<string | null>(null);
}

describe('NumberStepperComponent', () => {
  let fixture: ComponentFixture<HostSpec>;
  let host: HostSpec;

  const input = () =>
    (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('input')!;

  const botoes = () =>
    (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('button');

  const incrementar = () => botoes()[0];
  const decrementar = () => botoes()[1];

  async function montar(): Promise<void> {
    await TestBed.configureTestingModule({ imports: [HostSpec] }).compileComponents();
    fixture = TestBed.createComponent(HostSpec);
    host = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => { await montar(); });

  describe('incremento e decremento', () => {
    it('a seta para cima soma um passo', () => {
      incrementar().click();
      expect(host.control.value).toBe(11);
    });

    it('a seta para baixo subtrai um passo', () => {
      decrementar().click();
      expect(host.control.value).toBe(9);
    });

    it('respeita o passo configurado', () => {
      host.step.set(5);
      fixture.detectChanges();
      incrementar().click();
      expect(host.control.value).toBe(15);
    });

    it('partindo de vazio, a primeira seta ancora no mínimo', () => {
      // Sem isto o `null + 1` viraria `1` num campo cujo mínimo é 10, ou `NaN`.
      host.control.setValue(null);
      host.min.set(10);
      fixture.detectChanges();

      incrementar().click();
      expect(host.control.value).toBe(10);
    });
  });

  describe('limites (critérios 9.17 e 9.18)', () => {
    it('no mínimo, a seta de decremento fica desabilitada', () => {
      host.control.setValue(0);
      fixture.detectChanges();
      expect(decrementar().disabled).toBeTrue();
    });

    it('no máximo, a seta de incremento fica desabilitada', () => {
      host.control.setValue(100);
      fixture.detectChanges();
      expect(incrementar().disabled).toBeTrue();
    });

    it('valor digitado acima do máximo volta para o máximo', () => {
      input().value = '999';
      input().dispatchEvent(new Event('input'));
      input().dispatchEvent(new Event('blur'));
      expect(host.control.value).toBe(100);
    });

    it('valor digitado abaixo do mínimo volta para o mínimo', () => {
      input().value = '-5';
      input().dispatchEvent(new Event('input'));
      input().dispatchEvent(new Event('blur'));
      expect(host.control.value).toBe(0);
    });

    it('sem máximo definido, não trava o incremento', () => {
      host.max.set(null);
      host.control.setValue(999999);
      fixture.detectChanges();
      expect(incrementar().disabled).toBeFalse();
    });
  });

  describe('vazio é um valor', () => {
    it('apagar o campo grava null, e não zero', () => {
      // Zero é uma resposta ("sem limite de participantes"); vazio é a ausência de
      // resposta. Confundir os dois inventaria um limite que ninguém definiu.
      input().value = '';
      input().dispatchEvent(new Event('input'));
      expect(host.control.value).toBeNull();
    });

    it('texto que não é número não vira 0', () => {
      input().value = 'abc';
      input().dispatchEvent(new Event('input'));
      expect(host.control.value).toBeNull();
    });
  });

  describe('prefixo e decimais', () => {
    it('sem prefixo, não renderiza o slot', () => {
      expect((fixture.nativeElement as HTMLElement).querySelector('.ds-number-stepper__prefix'))
        .toBeNull();
    });

    it('com prefixo, renderiza o texto recebido', () => {
      host.prefix.set('R$');
      fixture.detectChanges();
      const slot = (fixture.nativeElement as HTMLElement)
        .querySelector('.ds-number-stepper__prefix');
      expect(slot?.textContent?.trim()).toBe('R$');
    });

    it('com decimais, exibe no formato pt-BR', () => {
      host.decimals.set(2);
      host.control.setValue(100);
      fixture.detectChanges();
      expect(input().value).toBe('100,00');
    });

    it('com decimais, aceita vírgula na digitação', () => {
      host.decimals.set(2);
      fixture.detectChanges();

      input().value = '19,90';
      input().dispatchEvent(new Event('input'));
      expect(host.control.value).toBe(19.9);
    });

    it('o passo respeita a casa decimal, sem erro de ponto flutuante', () => {
      // 0.1 + 0.2 === 0.30000000000000004. Um preço não pode exibir isso.
      host.decimals.set(2);
      host.step.set(0.1);
      host.control.setValue(0.2);
      fixture.detectChanges();

      incrementar().click();
      expect(host.control.value).toBe(0.3);
    });
  });

  describe('ControlValueAccessor', () => {
    it('reflete o valor vindo do form', () => {
      host.control.setValue(42);
      fixture.detectChanges();
      expect(input().value).toBe('42');
    });

    it('control desabilitado desabilita input e setas', () => {
      host.control.disable();
      fixture.detectChanges();

      expect(input().disabled).toBeTrue();
      expect(incrementar().disabled).toBeTrue();
      expect(decrementar().disabled).toBeTrue();
    });

    it('sair do campo marca como tocado', () => {
      input().dispatchEvent(new Event('blur'));
      expect(host.control.touched).toBeTrue();
    });
  });

  describe('acessibilidade', () => {
    it('as setas têm rótulo acessível', () => {
      expect(incrementar().getAttribute('aria-label')).toBeTruthy();
      expect(decrementar().getAttribute('aria-label')).toBeTruthy();
    });

    it('o componente expõe o papel de spinbutton com os limites', () => {
      expect(input().getAttribute('role')).toBe('spinbutton');
      expect(input().getAttribute('aria-valuemin')).toBe('0');
      expect(input().getAttribute('aria-valuemax')).toBe('100');
    });
  });
});
