import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
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

/**
 * ============================================================================
 * ⛔ O FLYOUT DO COLLAPSED ERA CLIPADO — e nenhuma spec via
 * ============================================================================
 *
 * **Medido em 2026-09-02, a pedido do fundador**, que lembrava do recurso entregue e não o
 * via funcionando. Não era task de roadmap nem task engolida: era **regressão**.
 *
 * O `SBNAV2` (`b33e339aa`, 26/05) entregou o dropdown como `position: absolute;
 * left: calc(100% + 12px)`, e ele funcionava porque `.ds-sidebar__nav` tinha
 * `overflow: visible` — a nota da própria entrega registra isso.
 *
 * Em 17/06 o `b1975144f` (`DEC-POLISH-6`, *"sidebar scroll"*) trocou por
 * `overflow-y: auto; overflow-x: clip`, para dar scroll interno à nav. ⇒ **`clip` corta
 * exatamente o eixo por onde o flyout sai.** Ele passou a renderizar e ser clipado no mesmo
 * quadro, e por isso parecia "não implementado".
 *
 * ⚠️ **A spec do componente não pegou porque cobria `collapsed` default e labels ocultos —
 * nada do flyout.** Rede que não testa o comportamento não avisa quando ele some.
 *
 * ============================================================================
 * O QUE ESTAS ASSERÇÕES PINAM, E POR QUE É ESTRUTURAL
 * ============================================================================
 *
 * Karma não mede clipping visual. O que ele mede — e o que de fato torna o clipping
 * **impossível** — é **onde o painel mora no DOM**: com `cdkConnectedOverlay` ele é filho do
 * `.cdk-overlay-container`, irmão de `<body>`, fora da árvore da sidebar.
 *
 * ⇒ Enquanto o painel estiver fora do host, nenhum `overflow` de ancestral o alcança. Se
 *   alguém voltar ao `@if` + `position: absolute`, estas asserções ficam vermelhas.
 */
describe('SidebarLeftNav — o flyout do collapsed escapa do container que clipa', () => {
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
        { key: 'trilhas', label: 'Trilhas', icon: 'heroSquares2x2', route: '/ensino/trilhas' },
      ],
    },
  ];

  const noOverlay = () =>
    document.querySelector('.cdk-overlay-container .ds-sidebar__floating-dropdown');
  const noHost = () =>
    fixture.nativeElement.querySelector('.ds-sidebar__floating-dropdown');
  const botaoDoGrupo = (): HTMLButtonElement =>
    fixture.nativeElement.querySelectorAll('.ds-sidebar__menu-item')[1] as HTMLButtonElement;

  beforeEach(async () => {
    window.localStorage.removeItem('ds-sidebar-state');

    await TestBed.configureTestingModule({
      imports: [SidebarLeftNavComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
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

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  it('⭐ collapsed + clique no grupo: o painel abre FORA do host, no overlay container', () => {
    // O default é collapsed — a spec irmã já fixa isso.
    botaoDoGrupo().click();
    fixture.detectChanges();

    // ⛔ A asserção que pina o conserto: existe no overlay, NÃO existe dentro do componente.
    expect(noOverlay()).withContext('painel no overlay container').not.toBeNull();
    expect(noHost()).withContext('painel NÃO dentro do host (seria clipado)').toBeNull();
  });

  it('⭐ os itens do submenu chegam ao painel — não é uma casca vazia', () => {
    botaoDoGrupo().click();
    fixture.detectChanges();

    const texto = noOverlay()!.textContent ?? '';
    expect(texto).toContain('Cursos');
    expect(texto).toContain('Trilhas');
    // O header replica o rótulo do grupo (DEC-SBNAV2-E).
    expect(texto).toContain('Ensino');
  });

  it('clicar de novo no mesmo grupo FECHA — o mutex do `expandedKey`', () => {
    botaoDoGrupo().click();
    fixture.detectChanges();
    expect(noOverlay()).not.toBeNull();

    botaoDoGrupo().click();
    fixture.detectChanges();
    expect(noOverlay()).toBeNull();
  });

  it('⛔ EXPANDIDO não usa flyout — o submenu é inline, e isso não pode regredir junto', () => {
    // O toggle de estado é o 1º botão do header; expandir e abrir o grupo.
    component['state'].set('expanded');
    fixture.detectChanges();
    botaoDoGrupo().click();
    fixture.detectChanges();

    expect(noOverlay()).withContext('expandido não abre painel flutuante').toBeNull();
  });

  it('ESC fecha o painel — o handler é `document`-scoped e sobrevive ao overlay', () => {
    botaoDoGrupo().click();
    fixture.detectChanges();
    expect(noOverlay()).not.toBeNull();

    // ⚠️ Vai no `document` de propósito: com o painel fora do host, um listener preso ao
    //    host não veria a tecla. É exatamente o wire-up que a migração podia ter quebrado.
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(noOverlay()).toBeNull();
  });

  it('clique fora fecha — e clique DENTRO do painel não fecha', () => {
    botaoDoGrupo().click();
    fixture.detectChanges();

    // Dentro: o `closest('.ds-sidebar__floating-dropdown')` tem de casar mesmo no overlay.
    noOverlay()!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    expect(noOverlay()).withContext('clique dentro NÃO fecha').not.toBeNull();

    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    expect(noOverlay()).withContext('clique fora fecha').toBeNull();
  });
});
