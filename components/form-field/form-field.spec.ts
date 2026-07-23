import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { provideIcons } from '@ng-icons/core';
import {
  heroChevronDown,
  heroMagnifyingGlass,
  heroXMark,
} from '@ng-icons/heroicons/outline';

import { FormFieldComponent } from './form-field.component';

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
});
