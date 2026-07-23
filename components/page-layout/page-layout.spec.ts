import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageLayoutComponent } from './page-layout.component';

describe('PageLayoutComponent', () => {
  let fixture: ComponentFixture<PageLayoutComponent>;
  let component: PageLayoutComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageLayoutComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('cria com variant default = dashboard', () => {
    expect(component).toBeTruthy();
    expect(component.variant()).toBe('dashboard');
  });

  it('NAO renderiza nav em variant=dashboard', () => {
    const nav = fixture.nativeElement.querySelector('.ds-page-layout__nav');
    expect(nav).toBeFalsy();
  });

  it('NAO renderiza footer em variant=dashboard', () => {
    const footer = fixture.nativeElement.querySelector('.ds-page-layout__footer');
    expect(footer).toBeFalsy();
  });

  it('renderiza nav E footer em variant=wizard', () => {
    fixture.componentRef.setInput('variant', 'wizard');
    fixture.detectChanges();
    const nav = fixture.nativeElement.querySelector('.ds-page-layout__nav');
    const footer = fixture.nativeElement.querySelector('.ds-page-layout__footer');
    expect(nav).toBeTruthy();
    expect(footer).toBeTruthy();
  });

  it('renderiza nav SEM footer em variant=tabs-internas', () => {
    fixture.componentRef.setInput('variant', 'tabs-internas');
    fixture.detectChanges();
    const nav = fixture.nativeElement.querySelector('.ds-page-layout__nav');
    const footer = fixture.nativeElement.querySelector('.ds-page-layout__footer');
    expect(nav).toBeTruthy();
    expect(footer).toBeFalsy();
  });

  it('aplica classe ai-open quando aiAssistantState=open', () => {
    fixture.componentRef.setInput('aiAssistantState', 'open');
    fixture.detectChanges();
    const layout = fixture.nativeElement.querySelector('.ds-page-layout');
    expect(layout.classList.contains('ds-page-layout--ai-open')).toBe(true);
  });

  it('main tem id ds-page-main para skip link', () => {
    const main = fixture.nativeElement.querySelector('main');
    expect(main).toBeTruthy();
    expect(main.id).toBe('ds-page-main');
  });

  it('aplica aria-label no main', () => {
    fixture.componentRef.setInput('mainAriaLabel', 'Conteudo do dashboard');
    fixture.detectChanges();
    const main = fixture.nativeElement.querySelector('main');
    expect(main.getAttribute('aria-label')).toBe('Conteudo do dashboard');
  });

  it('renderiza skip link com href correto', () => {
    const skipLink = fixture.nativeElement.querySelector('.ds-skip-link');
    expect(skipLink).toBeTruthy();
    expect(skipLink.getAttribute('href')).toBe('#ds-page-main');
  });
});
