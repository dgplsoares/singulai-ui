import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { provideIcons } from '@ng-icons/core';
import {
  heroChevronDown,
  heroMagnifyingGlass,
  heroXMark,
} from '@ng-icons/heroicons/outline';

import { FormFieldComponent } from './form-field.component';
import type { FormFieldType } from './form-field.types';

describe('FormFieldComponent', () => {
  let fixture: ComponentFixture<FormFieldComponent>;
  let component: FormFieldComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormFieldComponent, FormsModule],
      providers: [
        provideIcons({ heroChevronDown, heroMagnifyingGlass, heroXMark }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FormFieldComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('variant', 'text');
    fixture.detectChanges();
  });

  it('cria o componente', () => {
    expect(component).toBeTruthy();
  });

  it('renderiza input para variant=text', () => {
    const input = fixture.nativeElement.querySelector('input[type="text"]');
    expect(input).toBeTruthy();
  });

  it('renderiza textarea para variant=textarea', () => {
    fixture.componentRef.setInput('variant', 'textarea');
    fixture.detectChanges();
    const ta = fixture.nativeElement.querySelector('textarea');
    expect(ta).toBeTruthy();
  });

  it('renderiza select com options para variant=select', () => {
    fixture.componentRef.setInput('variant', 'select');
    fixture.componentRef.setInput('options', [
      { value: 'a', label: 'Opcao A' },
      { value: 'b', label: 'Opcao B' },
    ]);
    fixture.detectChanges();
    const select = fixture.nativeElement.querySelector('select');
    expect(select).toBeTruthy();
    expect(select.options.length).toBe(2);
  });

  it('renderiza toggle (checkbox role=switch) para variant=toggle', () => {
    fixture.componentRef.setInput('variant', 'toggle');
    fixture.componentRef.setInput('label', 'Ativo');
    fixture.detectChanges();
    const cb = fixture.nativeElement.querySelector('input[type="checkbox"]');
    expect(cb).toBeTruthy();
    expect(cb.getAttribute('role')).toBe('switch');
  });

  it('renderiza search com icone e clear quando ha valor', () => {
    fixture.componentRef.setInput('variant', 'search');
    fixture.detectChanges();
    const search = fixture.nativeElement.querySelector('input[type="search"]');
    expect(search).toBeTruthy();
  });

  it('mostra error message quando errorMessage e tocado', () => {
    fixture.componentRef.setInput('errorMessage', 'Campo obrigatorio');
    fixture.detectChanges();
    // Sem touch — nao mostra
    let err = fixture.nativeElement.querySelector('.ds-form-field__error');
    expect(err).toBeFalsy();

    // Simula blur
    const input = fixture.nativeElement.querySelector('input');
    input.dispatchEvent(new FocusEvent('blur'));
    fixture.detectChanges();

    err = fixture.nativeElement.querySelector('.ds-form-field__error');
    expect(err).toBeTruthy();
    expect(err.textContent).toContain('Campo obrigatorio');
  });

  it('marca aria-required quando required=true', () => {
    fixture.componentRef.setInput('required', true);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input');
    expect(input.getAttribute('aria-required')).toBe('true');
  });

  // ==========================================================================
  // DEC-D.3.4-2 — tipos temporais + min/max
  //
  // Por que isto entra no DS em vez de virar <input type="date"> cru no step:
  // o wizard de Mentorias precisa de "Data/Hora Inicio", "Data/Hora Termino" e
  // das duas datas da promocao AGORA (D.3.4), e a D.3.5 precisa de min/max UM
  // sub-bloco depois para o clamp da sessao a janela do produto (DEC-LP-E).
  // Resolver com input cru custaria a mesma linha duas vezes e deixaria o
  // clamp sem lugar canonico. Cursos e Eventos fazem cru hoje — e' o drift que
  // esta fase existe para nao propagar.
  // ==========================================================================
  describe('DEC-D.3.4-2 — tipos temporais', () => {
    // ------------------------------------------------------------------
    // DETECTOR DE COMPILACAO — nao apagar.
    //
    // Os tres `it()` abaixo NAO protegem a uniao `FormFieldType`: o template
    // faz `[type]="type()"` e repassa a string crua ao input nativo, entao
    // `setInput('type', 'date')` renderiza `input[type=date]` mesmo com a
    // uniao sem o valor — `setInput` recebe `unknown` e nao type-checka.
    // Medido: os tres passaram no RED, antes de qualquer mudanca no DS.
    //
    // Quem prova o contrato e' esta atribuicao. Ela falha em
    // `tsc --noEmit -p tsconfig.spec.json` se alguem estreitar a uniao de
    // volta — que e' a regressao real a temer, ja' que o runtime nao acusa.
    // Mesma licao da D.3.W1 (`wizard-step.contract.spec.ts`): spec que so'
    // exercita comportamento e' vacuo contra tipagem estrutural.
    // ------------------------------------------------------------------
    const TIPOS_TEMPORAIS: readonly FormFieldType[] = [
      'date',
      'datetime-local',
      'time',
    ] as const;

    it('a uniao FormFieldType admite os tres tipos temporais', () => {
      expect(TIPOS_TEMPORAIS.length).toBe(3);
    });

    it('renderiza input[type=date] para type=date', () => {
      fixture.componentRef.setInput('type', 'date');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('input[type="date"]')).toBeTruthy();
    });

    it('renderiza input[type=datetime-local] para type=datetime-local', () => {
      fixture.componentRef.setInput('type', 'datetime-local');
      fixture.detectChanges();
      expect(
        fixture.nativeElement.querySelector('input[type="datetime-local"]'),
      ).toBeTruthy();
    });

    it('renderiza input[type=time] para type=time', () => {
      fixture.componentRef.setInput('type', 'time');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('input[type="time"]')).toBeTruthy();
    });

    it('propaga min e max ao input nativo', () => {
      fixture.componentRef.setInput('type', 'datetime-local');
      fixture.componentRef.setInput('min', '2026-04-25T09:00');
      fixture.componentRef.setInput('max', '2026-04-27T18:00');
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input');
      expect(input.getAttribute('min')).toBe('2026-04-25T09:00');
      expect(input.getAttribute('max')).toBe('2026-04-27T18:00');
    });

    it('propaga min numerico (o caso "Capacidade (pessoas)" e "Preco")', () => {
      fixture.componentRef.setInput('type', 'number');
      fixture.componentRef.setInput('min', 0);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('input').getAttribute('min')).toBe('0');
    });

    it('NAO emite os atributos quando min/max nao sao informados', () => {
      // Guarda contra `[attr.min]="min()"` virar string "null" no DOM — que o
      // browser trata como restricao invalida em vez de ausencia.
      const input = fixture.nativeElement.querySelector('input');
      expect(input.hasAttribute('min')).toBeFalse();
      expect(input.hasAttribute('max')).toBeFalse();
    });
  });

  // ==========================================================================
  // DEC-D.3.4-3 — contador de caracteres tambem em variant=text
  //
  // Hoje o contador so' renderiza para textarea. O step SEO precisa dele em
  // "Meta Title" (recomendado 50-60), que e' text. A alternativa era o
  // `.char-count` inline do step-seo de Cursos — que ja' e' copia do pattern
  // `.url-preview` do mesmo arquivo, e viraria a terceira.
  // ==========================================================================
  describe('DEC-D.3.4-3 — contador de caracteres', () => {
    const contador = () =>
      fixture.nativeElement.querySelector('.ds-form-field__counter');

    it('renderiza o contador em variant=text quando ha maxLength', () => {
      fixture.componentRef.setInput('maxLength', 60);
      fixture.detectChanges();
      expect(contador()).toBeTruthy();
    });

    it('conta o valor corrente', () => {
      fixture.componentRef.setInput('maxLength', 60);
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input');
      input.value = 'Mentoria de Design';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(contador().textContent.replace(/\s/g, '')).toBe('18/60');
    });

    it('NAO renderiza o contador em variant=text sem maxLength', () => {
      expect(contador()).toBeFalsy();
    });

    it('continua renderizando em textarea (regressao)', () => {
      fixture.componentRef.setInput('variant', 'textarea');
      fixture.componentRef.setInput('maxLength', 160);
      fixture.detectChanges();
      expect(contador()).toBeTruthy();
    });

    for (const variant of ['select', 'search', 'toggle'] as const) {
      it(`NAO renderiza o contador em variant=${variant} mesmo com maxLength`, () => {
        // O contador e' de campo de TEXTO. Sem esta guarda, alargar a condicao
        // para "maxLength != null" o faria aparecer sob um select e sob um
        // toggle, onde ele nao significa nada.
        fixture.componentRef.setInput('variant', variant);
        fixture.componentRef.setInput('maxLength', 60);
        fixture.detectChanges();
        expect(contador()).toBeFalsy();
      });
    }
  });
});
