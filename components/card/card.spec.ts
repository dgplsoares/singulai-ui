import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideIcons } from '@ng-icons/core';
import { heroChartBar } from '@ng-icons/heroicons/outline';

import { CardComponent } from './card.component';

describe('CardComponent', () => {
  let fixture: ComponentFixture<CardComponent>;
  let component: CardComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardComponent],
      providers: [provideIcons({ heroChartBar })],
    }).compileComponents();

    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('cria o componente', () => {
    expect(component).toBeTruthy();
  });

  it('renderiza header quando ha title', () => {
    fixture.componentRef.setInput('title', 'Uso do Plano');
    fixture.componentRef.setInput('icon', 'heroChartBar');
    fixture.detectChanges();
    const header = fixture.nativeElement.querySelector('.ds-card__header');
    expect(header).toBeTruthy();
    expect(header.textContent).toContain('Uso do Plano');
  });

  it('NAO renderiza header em variant=inner-card mesmo com title', () => {
    fixture.componentRef.setInput('title', 'Inner');
    fixture.componentRef.setInput('variant', 'inner-card');
    fixture.detectChanges();
    const header = fixture.nativeElement.querySelector('.ds-card__header');
    expect(header).toBeFalsy();
  });

  it('renderiza nav-tabs quando passado', () => {
    fixture.componentRef.setInput('title', 'Receitas');
    fixture.componentRef.setInput('navTabs', [
      { key: 'day', label: 'Dia', active: false },
      { key: 'week', label: 'Semana', active: true },
      { key: 'month', label: 'Mes', active: false },
    ]);
    fixture.detectChanges();
    const tabs = fixture.nativeElement.querySelectorAll('.ds-card__nav-tab');
    expect(tabs.length).toBe(3);
    expect(tabs[1].classList.contains('ds-card__nav-tab--active')).toBe(true);
  });

  it('emite tabChange ao clicar tab', () => {
    fixture.componentRef.setInput('title', 'X');
    fixture.componentRef.setInput('navTabs', [
      { key: 'day', label: 'Dia' },
    ]);
    fixture.detectChanges();

    let received = '';
    component.tabChange.subscribe((key) => (received = key));

    const tab = fixture.nativeElement.querySelector('.ds-card__nav-tab') as HTMLButtonElement;
    tab.click();
    expect(received).toBe('day');
  });

  it('mostra fallback de skeleton em state=loading', () => {
    fixture.componentRef.setInput('title', 'X');
    fixture.componentRef.setInput('state', 'loading');
    fixture.detectChanges();
    const skeleton = fixture.nativeElement.querySelector('.ds-card__skeleton');
    expect(skeleton).toBeTruthy();
  });

  it('mostra fallback de empty em state=empty', () => {
    fixture.componentRef.setInput('title', 'X');
    fixture.componentRef.setInput('state', 'empty');
    fixture.detectChanges();
    const empty = fixture.nativeElement.querySelector('.ds-card__empty-default');
    expect(empty).toBeTruthy();
  });
});
