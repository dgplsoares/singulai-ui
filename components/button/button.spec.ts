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
