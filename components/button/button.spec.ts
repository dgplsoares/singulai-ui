import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideIcons } from '@ng-icons/core';
import { heroEye } from '@ng-icons/heroicons/outline';

import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let fixture: ComponentFixture<ButtonComponent>;
  let component: ButtonComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
      providers: [provideIcons({ heroEye })],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('variant', 'action');
    fixture.detectChanges();
  });

  it('cria o componente', () => {
    expect(component).toBeTruthy();
  });

  it('aplica data-variant correto', () => {
    fixture.componentRef.setInput('variant', 'primary-cta');
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('.ds-button');
    expect(btn.dataset['variant']).toBe('primary-cta');
  });

  it('emite clicked apenas quando habilitado', () => {
    let count = 0;
    component.clicked.subscribe(() => count++);

    const btn = fixture.nativeElement.querySelector('.ds-button');
    btn.click();
    expect(count).toBe(1);

    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    btn.click();
    expect(count).toBe(1);
  });

  it('mostra spinner em loading', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    const spinner = fixture.nativeElement.querySelector('.ds-button__spinner');
    expect(spinner).toBeTruthy();
  });

  it('renderiza iconLeft quando informado', () => {
    fixture.componentRef.setInput('iconLeft', 'heroEye');
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelector('.ds-button__icon--left');
    expect(icon).toBeTruthy();
  });

  it('aria-pressed presente em variants tooglaveis', () => {
    fixture.componentRef.setInput('variant', 'nav-tab');
    fixture.componentRef.setInput('active', true);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('.ds-button');
    expect(btn.getAttribute('aria-pressed')).toBe('true');
  });
});

/**
 * ============================================================================
 * ⭐ `action-send` — a variant que nasceu porque `icon` NAO SERVIA
 * ============================================================================
 *
 * **`CHAT-2/3.e`, 2026-09-02.** O botao de enviar do chat de IA era um `<button
 * class="send-btn">` cru, com ~60 linhas de SCSS dentro da feature. O sub-bloco pedia
 * `<ds-button>`, e a medicao mostrou que a variant `icon` **produz outro visual**:
 *
 *     icon          26px de altura · borda #adc2dd · #edf1f6 chapado
 *     action-send   41x41 · borda #648DC4 · gradiente de 3 paradas ·
 *                   sombra de 4 camadas com `inset 0 0 0 4px #D7DFE9`
 *
 * ⇒ Trocar por `icon` teria sido **regressao visual sem referencia de Figma** (o doc da fase
 *   nomeia 3 nodes e nenhum cobre a area do input/send). O fundador escolheu **estender o
 *   DS** — que e' o que o `CLAUDE.md` prescreve para arranjo que o DS nao tem.
 *
 * ⚠️ **Karma nao mede estilo computado de variant.** O que estas assercoes fixam e' o
 * CONTRATO: a variant existe, chega ao DOM como `data-variant`, e o botao continua
 * respondendo a `disabled` e emitindo `clicked`. O visual em si e' do smoke.
 * 📌 Dito aqui de proposito, para ninguem supor cobertura que nao existe.
 */
describe('ds-button — a variant action-send', () => {
  it('⭐ chega ao DOM como data-variant="action-send"', async () => {
    const { ButtonComponent } = await import('./button.component');
    const { TestBed } = await import('@angular/core/testing');

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({ imports: [ButtonComponent] }).compileComponents();
    const f = TestBed.createComponent(ButtonComponent);
    f.componentRef.setInput('variant', 'action-send');
    f.detectChanges();

    const btn = f.nativeElement.querySelector('button');
    expect(btn.getAttribute('data-variant')).toBe('action-send');
  });

  it('honra `disabled` — o chat desabilita enquanto nao ha o que enviar', async () => {
    const { ButtonComponent } = await import('./button.component');
    const { TestBed } = await import('@angular/core/testing');

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({ imports: [ButtonComponent] }).compileComponents();
    const f = TestBed.createComponent(ButtonComponent);
    f.componentRef.setInput('variant', 'action-send');
    f.componentRef.setInput('disabled', true);
    f.detectChanges();

    const btn = f.nativeElement.querySelector('button');
    expect(btn.hasAttribute('disabled')).toBe(true);
    expect(btn.getAttribute('aria-disabled')).toBe('true');
  });

  it('⛔ botao SO-ICONE precisa de `ariaLabel` — sem label projetado nao ha nome acessivel', async () => {
    const { ButtonComponent } = await import('./button.component');
    const { TestBed } = await import('@angular/core/testing');

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({ imports: [ButtonComponent] }).compileComponents();
    const f = TestBed.createComponent(ButtonComponent);
    f.componentRef.setInput('variant', 'action-send');
    f.componentRef.setInput('ariaLabel', 'Enviar mensagem');
    f.detectChanges();

    expect(f.nativeElement.querySelector('button').getAttribute('aria-label')).toBe(
      'Enviar mensagem',
    );
  });
});
