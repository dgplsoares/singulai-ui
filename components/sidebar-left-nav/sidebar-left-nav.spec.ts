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
    // Causa-raiz do TS2345 anterior: a versao original capturava a emissao em
    // `let received: string | null = null`. O control-flow analysis do TS nao
    // enxerga atribuicoes feitas dentro do callback do subscribe, entao na
    // linha da assercao `received` continuava estreitado para `null` e
    // `toBe('expanded')` batia contra `Expected<null>`. Spy e' o primitivo
    // correto do Jasmine para "foi emitido com X" -- sem captura em closure,
    // nao ha o que estreitar.
    const stateChangeSpy = jasmine.createSpy('stateChange');
    component.stateChange.subscribe(stateChangeSpy);

    const toggle = fixture.nativeElement.querySelector(
      '.ds-sidebar__toggle',
    ) as HTMLButtonElement;
    toggle.click();
    fixture.detectChanges();
    expect(stateChangeSpy).toHaveBeenCalledWith('expanded');
  });

  // O teste anterior ('mostra avatar com iniciais do nome do usuario')
  // cobria uma feature REMOVIDA: `.ds-sidebar__avatar` com iniciais nao
  // existe mais no template desde os refactors SBNAV/SBNAV2. O footer hoje
  // e um botao neumorphic com <img class="ds-sidebar__user-icon"> e o nome
  // so aparece em estado expanded. Substituido pelos 2 testes abaixo, que
  // descrevem o comportamento atual.
  it('renderiza o botao de conta com o icone de usuario', () => {
    fixture.componentRef.setInput('user', { name: 'John Doe' });
    fixture.detectChanges();

    const userButton = fixture.nativeElement.querySelector(
      '.ds-sidebar__user-button',
    ) as HTMLButtonElement;
    expect(userButton).toBeTruthy();
    expect(userButton.getAttribute('aria-label')).toBe('Minha Conta');

    const icon = fixture.nativeElement.querySelector(
      '.ds-sidebar__user-icon',
    ) as HTMLImageElement;
    expect(icon).toBeTruthy();
    // Default do input userIconSrc (override-avel para split OSS).
    expect(icon.getAttribute('src')).toBe('branding/icons/menu/user.svg');
  });

  it('mostra o nome do usuario apenas em estado expanded', () => {
    fixture.componentRef.setInput('user', { name: 'John Doe' });
    fixture.detectChanges();

    // Collapsed (default): nome nao renderiza.
    expect(fixture.nativeElement.querySelector('.ds-sidebar__user-name')).toBeNull();

    const toggle = fixture.nativeElement.querySelector(
      '.ds-sidebar__toggle',
    ) as HTMLButtonElement;
    toggle.click();
    fixture.detectChanges();

    const userName = fixture.nativeElement.querySelector('.ds-sidebar__user-name');
    expect(userName).toBeTruthy();
    expect(userName.textContent.trim()).toBe('John Doe');
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
