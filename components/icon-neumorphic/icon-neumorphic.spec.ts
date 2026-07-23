import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideIcons } from '@ng-icons/core';
import { heroChartBar } from '@ng-icons/heroicons/outline';

import { IconNeumorphicComponent } from './icon-neumorphic.component';

describe('IconNeumorphicComponent', () => {
  let fixture: ComponentFixture<IconNeumorphicComponent>;
  let component: IconNeumorphicComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconNeumorphicComponent],
      providers: [provideIcons({ heroChartBar })],
    }).compileComponents();

    fixture = TestBed.createComponent(IconNeumorphicComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('icon', 'heroChartBar');
    fixture.detectChanges();
  });

  it('cria com size default md', () => {
    expect(component).toBeTruthy();
    expect(component.size()).toBe('md');
  });

  it('aplica classe correta por size', () => {
    fixture.componentRef.setInput('size', 'sm');
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.ds-icon-neumorphic');
    expect(el.classList.contains('ds-icon-neumorphic--sm')).toBe(true);
  });

  it('marca como decorativo quando sem ariaLabel', () => {
    const el = fixture.nativeElement.querySelector('.ds-icon-neumorphic');
    expect(el.getAttribute('role')).toBe('presentation');
    expect(el.getAttribute('aria-hidden')).toBe('true');
  });

  it('marca como img quando tem ariaLabel', () => {
    fixture.componentRef.setInput('ariaLabel', 'Dashboard');
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.ds-icon-neumorphic');
    expect(el.getAttribute('role')).toBe('img');
    expect(el.getAttribute('aria-label')).toBe('Dashboard');
  });
});
