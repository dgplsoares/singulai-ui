import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypePickerComponent } from './type-picker.component';
import { TypePickerOption } from './type-picker.types';

/**
 * FASE 0 / 0.3 — sub-bloco 4.5.5.
 *
 * O componente existia desde a D.2.1 sem spec. Ele ganhou o input `layout`
 * porque o node novo (`1425:13231`) põe SEIS cards numa linha só, e o desenho
 * antigo (`657:4912`) era de quatro com largura mínima fixa.
 *
 * O que estes testes travam é a promessa que o input carrega: **o default não
 * muda nada** para quem já consumia o componente.
 */
describe('<ds-type-picker> (FASE 0 / 0.3)', () => {
  let fixture: ComponentFixture<TypePickerComponent>;

  const OPTIONS: TypePickerOption[] = [
    { kind: 'live', label: 'Live', iconSrc: 'content-kinds/kind-live.svg', iconWidth: 27, iconHeight: 15 },
    { kind: 'video', label: 'Vídeo', icon: 'heroPlayCircle', iconWidth: 21, iconHeight: 21 },
    { kind: 'quiz', label: 'Quiz', icon: 'heroCheckCircle', iconWidth: 23, iconHeight: 23, disabled: true },
  ];

  const root = () => fixture.nativeElement.querySelector('.ds-type-picker') as HTMLElement;
  const cards = () =>
    Array.from(fixture.nativeElement.querySelectorAll('.ds-type-picker-card')) as HTMLButtonElement[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TypePickerComponent] }).compileComponents();
    fixture = TestBed.createComponent(TypePickerComponent);
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.detectChanges();
  });

  describe('layout — o input novo do 4.5.5', () => {
    it('o DEFAULT é "auto" e NÃO aplica a classe fill', () => {
      // A promessa do input: quem já consumia o componente não regride.
      expect(root().classList.contains('ds-type-picker--fill')).toBeFalse();
    });

    it('layout="fill" aplica a classe — é o desenho de 6 cards em uma linha', () => {
      fixture.componentRef.setInput('layout', 'fill');
      fixture.detectChanges();

      expect(root().classList.contains('ds-type-picker--fill')).toBeTrue();
    });

    it('voltar para "auto" remove a classe', () => {
      fixture.componentRef.setInput('layout', 'fill');
      fixture.detectChanges();
      fixture.componentRef.setInput('layout', 'auto');
      fixture.detectChanges();

      expect(root().classList.contains('ds-type-picker--fill')).toBeFalse();
    });
  });

  describe('renderização', () => {
    it('renderiza um card por opção', () => {
      expect(cards().length).toBe(OPTIONS.length);
    });

    it('usa o SVG próprio quando há iconSrc, com as dimensões da opção', () => {
      const img = cards()[0].querySelector('img') as HTMLImageElement;

      expect(img).withContext('opção com iconSrc deve renderizar <img>').toBeTruthy();
      expect(img.getAttribute('src')).toBe('content-kinds/kind-live.svg');
      expect(img.style.width).toBe('27px');
      expect(img.style.height).toBe('15px');
    });

    it('cai no heroicon quando não há iconSrc', () => {
      expect(cards()[1].querySelector('img')).toBeNull();
      expect(cards()[1].querySelector('ng-icon')).toBeTruthy();
    });

    it('mostra o rótulo de cada opção', () => {
      expect(cards().map((c) => c.textContent?.trim())).toEqual(['Live', 'Vídeo', 'Quiz']);
    });
  });

  describe('seleção', () => {
    it('emite o kind ao clicar', () => {
      const emitidos: string[] = [];
      fixture.componentInstance.selectedKindChange.subscribe((k) => emitidos.push(k));

      cards()[1].click();

      expect(emitidos).toEqual(['video']);
    });

    it('marca o card selecionado', () => {
      fixture.componentRef.setInput('selectedKind', 'video');
      fixture.detectChanges();

      expect(cards()[1].classList.contains('ds-type-picker-card--selected')).toBeTrue();
      expect(cards()[0].classList.contains('ds-type-picker-card--selected')).toBeFalse();
    });

    it('não emite ao clicar em opção desabilitada', () => {
      const emitidos: string[] = [];
      fixture.componentInstance.selectedKindChange.subscribe((k) => emitidos.push(k));

      cards()[2].click();

      expect(emitidos).toEqual([]);
    });

    it('o picker inteiro desabilitado não emite', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      const emitidos: string[] = [];
      fixture.componentInstance.selectedKindChange.subscribe((k) => emitidos.push(k));

      cards()[0].click();

      expect(emitidos).toEqual([]);
    });
  });

  describe('acessibilidade', () => {
    it('é um radiogroup com radios dentro', () => {
      expect(root().getAttribute('role')).toBe('radiogroup');
      expect(cards().every((c) => c.getAttribute('role') === 'radio')).toBeTrue();
    });

    it('reflete a seleção em aria-checked', () => {
      fixture.componentRef.setInput('selectedKind', 'live');
      fixture.detectChanges();

      expect(cards()[0].getAttribute('aria-checked')).toBe('true');
      expect(cards()[1].getAttribute('aria-checked')).toBe('false');
    });
  });
});
