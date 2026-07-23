import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import {
  heroChevronDown,
  heroChevronLeft,
  heroChevronRight,
  heroSparkles,
  heroSquares2x2,
} from '@ng-icons/heroicons/outline';

import { PageHeaderComponent } from './page-header.component';

describe('PageHeaderComponent', () => {
  let fixture: ComponentFixture<PageHeaderComponent>;
  let component: PageHeaderComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageHeaderComponent],
      providers: [
        provideRouter([]),
        provideIcons({
          heroChevronLeft,
          heroChevronRight,
          heroChevronDown,
          heroSquares2x2,
          heroSparkles,
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PageHeaderComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', 'Dashboard');
    fixture.detectChanges();
  });

  it('cria com title obrigatorio', () => {
    expect(component).toBeTruthy();
    expect(component.title()).toBe('Dashboard');
  });

  it('renderiza titulo no h1', () => {
    const h1 = fixture.nativeElement.querySelector('.ds-page-header__title');
    expect(h1.textContent.trim()).toBe('Dashboard');
  });

  it('NAO mostra Reorganizar/Personalizar em variant=module-dashboard (default)', () => {
    const buttons = fixture.nativeElement.querySelectorAll('ds-button');
    // Sem variant=default, nao tem botoes dashboard
    expect(buttons.length).toBe(0);
  });

  it('mostra Reorganizar/Personalizar em variant=default', () => {
    fixture.componentRef.setInput('variant', 'default');
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('ds-button');
    expect(buttons.length).toBe(2);
  });

  it('renderiza breadcrumbs quando passados', () => {
    fixture.componentRef.setInput('breadcrumbs', [
      { label: 'Home', route: '/' },
      { label: 'Cursos' },
    ]);
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('.ds-page-header__breadcrumb-item');
    expect(items.length).toBe(2);
  });

  it('marca aria-current="page" no ultimo breadcrumb', () => {
    fixture.componentRef.setInput('breadcrumbs', [
      { label: 'Home', route: '/' },
      { label: 'Cursos' },
    ]);
    fixture.detectChanges();
    const current = fixture.nativeElement.querySelector('[aria-current="page"]');
    expect(current).toBeTruthy();
    expect(current.textContent.trim()).toBe('Cursos');
  });

  it('emite back quando botao voltar e clicado E canGoBack=true', () => {
    fixture.componentRef.setInput('canGoBack', true);
    fixture.detectChanges();

    let emitted = false;
    component.back.subscribe(() => (emitted = true));

    const btn = fixture.nativeElement.querySelector(
      'button[aria-label="Voltar"]',
    ) as HTMLButtonElement;
    btn.click();
    expect(emitted).toBe(true);
  });

  it('botao voltar fica disabled quando canGoBack=false', () => {
    const btn = fixture.nativeElement.querySelector(
      'button[aria-label="Voltar"]',
    ) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('aplica role=banner no header', () => {
    const header = fixture.nativeElement.querySelector('header');
    expect(header.getAttribute('role')).toBe('banner');
  });
});
