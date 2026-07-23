import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import {
  heroBars3,
  heroChevronDown,
  heroChevronLeft,
  heroMagnifyingGlass,
  heroSquares2x2,
  heroUser,
} from '@ng-icons/heroicons/outline';

import { SidebarLeftNavComponent } from './sidebar-left-nav.component';
import { SidebarMenuItem } from './sidebar-left-nav.types';

describe('SidebarLeftNavComponent', () => {
  let fixture: ComponentFixture<SidebarLeftNavComponent>;
  let component: SidebarLeftNavComponent;

  const menuItems: SidebarMenuItem[] = [
    { key: 'dashboard', label: 'Dashboard', icon: 'heroSquares2x2', route: '/dashboard' },
    {
      key: 'ensino',
      label: 'Ensino',
      icon: 'heroSquares2x2',
      submenu: [
        { key: 'cursos', label: 'Cursos', icon: 'heroSquares2x2', route: '/ensino/cursos' },
      ],
    },
  ];

  beforeEach(async () => {
    // Limpa localStorage antes de cada teste
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('ds-sidebar-state');
    }

    await TestBed.configureTestingModule({
      imports: [SidebarLeftNavComponent],
      providers: [
        provideRouter([]),
        provideIcons({
          heroBars3,
          heroChevronLeft,
          heroChevronDown,
          heroMagnifyingGlass,
          heroSquares2x2,
          heroUser,
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarLeftNavComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('menuItems', menuItems);
    fixture.detectChanges();
  });

  it('cria o componente', () => {
    expect(component).toBeTruthy();
  });

  it('inicia em estado collapsed por default', () => {
    const sidebar = fixture.nativeElement.querySelector('.ds-sidebar');
    expect(sidebar.classList.contains('ds-sidebar--collapsed')).toBe(true);
  });

  it('alterna para expanded ao clicar no toggle', () => {
    const toggle = fixture.nativeElement.querySelector(
      '.ds-sidebar__toggle',
    ) as HTMLButtonElement;
    toggle.click();
    fixture.detectChanges();
    const sidebar = fixture.nativeElement.querySelector('.ds-sidebar');
    expect(sidebar.classList.contains('ds-sidebar--expanded')).toBe(true);
  });

  it('persiste estado em localStorage ao alternar', () => {
    const toggle = fixture.nativeElement.querySelector(
      '.ds-sidebar__toggle',
    ) as HTMLButtonElement;
    toggle.click();
    fixture.detectChanges();
    expect(window.localStorage.getItem('ds-sidebar-state')).toBe('expanded');
  });

  it('renderiza items do menu', () => {
    const items = fixture.nativeElement.querySelectorAll('.ds-sidebar__menu-item');
    expect(items.length).toBe(menuItems.length);
  });

  it('NAO mostra labels em estado collapsed', () => {
    const labels = fixture.nativeElement.querySelectorAll('.ds-sidebar__menu-label');
    expect(labels.length).toBe(0);
  });

  it('mostra labels em estado expanded', () => {
    const toggle = fixture.nativeElement.querySelector(
      '.ds-sidebar__toggle',
    ) as HTMLButtonElement;
    toggle.click();
    fixture.detectChanges();
    const labels = fixture.nativeElement.querySelectorAll('.ds-sidebar__menu-label');
    expect(labels.length).toBe(menuItems.length);
  });

  it('emite stateChange quando toggle muda', () => {
    let received: string | null = null;
    component.stateChange.subscribe((s) => (received = s));

    const toggle = fixture.nativeElement.querySelector(
      '.ds-sidebar__toggle',
    ) as HTMLButtonElement;
    toggle.click();
    fixture.detectChanges();
    expect(received).toBe('expanded');
  });

  it('mostra avatar com iniciais do nome do usuario', () => {
    fixture.componentRef.setInput('user', { name: 'John Doe' });
    fixture.detectChanges();
    const avatar = fixture.nativeElement.querySelector('.ds-sidebar__avatar');
    expect(avatar.textContent.trim()).toBe('JD');
  });

  it('emite accountClick ao clicar no avatar', () => {
    let clicked = false;
    component.accountClick.subscribe(() => (clicked = true));

    const avatarBtn = fixture.nativeElement.querySelector(
      '.ds-sidebar__user-button',
    ) as HTMLButtonElement;
    avatarBtn.click();
    expect(clicked).toBe(true);
  });
});
