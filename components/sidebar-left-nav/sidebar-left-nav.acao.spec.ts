import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideIcons } from '@ng-icons/core';
import {
  heroBars3,
  heroChevronLeft,
  heroChevronDown,
  heroMagnifyingGlass,
  heroSquares2x2,
  heroUser,
} from '@ng-icons/heroicons/outline';

import { SidebarLeftNavComponent } from './sidebar-left-nav.component';
import { SidebarMenuItem } from './sidebar-left-nav.types';

/**
 * ============================================================================
 * `MENU-CAT.3` — O SIDEBAR SABE REPRESENTAR ITEM DE **AÇÃO**
 * ============================================================================
 *
 * O fundador pediu (2026-09-30) um submenu *"Abrir Chat com IA"* que **abre o painel de chat** em vez
 * de trocar de rota. O `/ds-audit` mediu que **o DS não modelava isso**: `SidebarMenuItem` tinha
 * `route`, `submenu`, `visibleForRoles` e `keywords` — nenhum conceito de ação.
 *
 * ⛔ **E "sem rota" NÃO podia ser o sinal**, porque a ausência de rota já significava outra coisa
 * neste componente: o caminho da busca a trata como **"Em breve"**. Sobrecarregá-la faria **um sinal
 * responder duas perguntas** — a mesma família do defeito do kanban que esta fase consertou, e aqui
 * previsto antes de chegar ao usuário. ⇒ a extensão é o campo EXPLÍCITO `acao: true`.
 *
 * ⚠️ **São DOIS caminhos de render**, e isto é medição, não suposição: o submenu expandido e o
 * dropdown flutuante do sidebar **recolhido**. Cobrir um só deixaria metade do componente com link
 * morto — e foi o merge da outra máquina, que tocou este arquivo no mesmo dia, que me fez remedir e
 * achar o segundo.
 */
describe('`MENU-CAT.3` — `SidebarLeftNavComponent` com item de ação', () => {
  let fixture: ComponentFixture<SidebarLeftNavComponent>;
  let component: SidebarLeftNavComponent;

  const menuItems: SidebarMenuItem[] = [
    {
      key: 'ai-agents',
      label: 'Agentes IA',
      icon: 'heroSquares2x2',
      submenu: [
        { key: 'agents-dashboard', label: 'Visão Geral', icon: 'heroSquares2x2', route: '/app/agents/dashboard' },
        { key: 'abrir-chat-ia', label: 'Abrir Chat com IA', icon: 'heroSquares2x2', acao: true },
        { key: 'agents-list', label: 'Agentes IA', icon: 'heroSquares2x2', route: '/app/agents/list' },
      ],
    },
  ];

  beforeEach(async () => {
    if (typeof window !== 'undefined') window.localStorage.removeItem('ds-sidebar-state');

    await TestBed.configureTestingModule({
      imports: [SidebarLeftNavComponent],
      providers: [
        provideRouter([]),
        /**
         * ⛔ **OBRIGATÓRIO, e a medição explica por quê.** O submenu EXPANDIDO é renderizado com a
         * animação `@submenuExpand`; sem provider de animações o Angular lança
         * `NG05105: Unexpected synthetic property @submenuExpand` **ao clicar no grupo** — não ao
         * criar o componente. ⇒ o erro aparece longe da causa, e parece seletor errado.
         *
         * 📌 **E isto revelou que o caminho EXPANDIDO nunca foi testado neste componente:** a spec
         *    base cobre rótulos e toggle (sem abrir submenu) e a `flyout.spec` cobre o COLAPSADO
         *    (que usa overlay, não animação). Esta é a primeira rede do submenu expandido.
         */
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
    // ⚠️ O flyout do colapsado vive no `cdk-overlay-container`, FORA do host — sem esta limpeza os
    //    casos contaminam uns aos outros. Padrão copiado da `sidebar-left-nav.flyout.spec.ts`.
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  /**
   * ⛔ **O SIDEBAR NASCE COLAPSADO** (a spec base afirma: *"inicia em estado collapsed por default"*),
   * e eu media o caminho errado: minha 1ª versão clicava no grupo sem expandir e procurava os
   * sub-itens no host — onde, no colapsado, eles **não estão**. 4 casos falharam por isso.
   * 📌 *O estado inicial do componente é parte do contrato, e presumi-lo é medir outro programa.*
   */
  function expandir(): void {
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('.ds-sidebar__toggle')!
      .click();
    fixture.detectChanges();
  }

  function abrirGrupo(): void {
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('.ds-sidebar__menu-item')!
      .click();
    fixture.detectChanges();
  }

  /** No EXPANDIDO os sub-itens ficam no host. */
  function subItensExpandido(): HTMLElement[] {
    return Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.ds-sidebar__submenu-item'),
    );
  }

  /** No COLAPSADO eles ficam no overlay do CDK — é o SEGUNDO caminho de render. */
  function subItensFlyout(): HTMLElement[] {
    return Array.from(
      document.querySelectorAll('.cdk-overlay-container .ds-sidebar__submenu-item'),
    );
  }

  it('⭐ EXPANDIDO: o item de ação renderiza `<button>`, e os que navegam renderizam `<a>`', () => {
    expandir();
    abrirGrupo();
    const itens = subItensExpandido();

    const porRotulo = new Map(itens.map((el) => [el.textContent?.trim(), el.tagName]));
    expect(porRotulo.get('Abrir Chat com IA')).toBe('BUTTON');
    // controle: os vizinhos continuam links
    expect(porRotulo.get('Visão Geral')).toBe('A');
    expect(porRotulo.get('Agentes IA')).toBe('A');
  });

  /**
   * ⛔ O defeito que o `<button>` evita: `<a [routerLink]="undefined">` é **link morto** — sem
   * `href`, e o `routerLink` vazio pode disparar navegação para a rota atual.
   */
  it('⛔ o item de ação NÃO tem `href` — não é link morto', () => {
    expandir();
    abrirGrupo();
    const botao = subItensExpandido().find((el) => el.textContent?.trim() === 'Abrir Chat com IA')!;

    expect(botao.getAttribute('href')).toBeNull();
    expect(botao.getAttribute('type')).toBe('button');
  });

  it('⭐ clicar no item de ação emite `submenuItemClick` com a chave', () => {
    const emitidas: string[] = [];
    component.submenuItemClick.subscribe((k) => emitidas.push(k));

    expandir();
    abrirGrupo();
    subItensExpandido().find((el) => el.textContent?.trim() === 'Abrir Chat com IA')!.click();

    expect(emitidas).toEqual(['abrir-chat-ia']);
  });

  /**
   * ⭐⭐ O **SEGUNDO CAMINHO DE RENDER**, e é o que eu quase deixei sem rede. O sidebar COLAPSADO
   * projeta o submenu num painel flutuante no `cdk-overlay-container` — outro trecho do template,
   * com o mesmo `<a>`/`<button>` duplicado. Cobrir só o expandido deixaria metade do componente
   * servindo link morto.
   */
  it('⭐ COLAPSADO (flyout): o item de ação também é `<button>` e também emite', () => {
    const emitidas: string[] = [];
    component.submenuItemClick.subscribe((k) => emitidas.push(k));

    abrirGrupo(); // sem expandir — é o caminho do flyout
    const itens = subItensFlyout();
    expect(itens.length).withContext('o flyout não renderizou sub-itens').toBeGreaterThan(0);

    const acao = itens.find((el) => el.textContent?.trim() === 'Abrir Chat com IA')!;
    expect(acao.tagName).toBe('BUTTON');
    expect(acao.getAttribute('href')).toBeNull();

    acao.click();
    expect(emitidas).toEqual(['abrir-chat-ia']);
  });

  it('⛔ clicar no item de ação NÃO navega', () => {
    const router = TestBed.inject(Router);
    const nav = spyOn(router, 'navigateByUrl');

    expandir();
    abrirGrupo();
    subItensExpandido().find((el) => el.textContent?.trim() === 'Abrir Chat com IA')!.click();

    expect(nav).not.toHaveBeenCalled();
  });

  /**
   * ⛔ **A busca é o caminho que ninguém testa à mão**, e era onde o item de ação iria falhar de dois
   * jeitos: aparecer como "Em breve" e não fazer nada ao ser escolhido.
   */
  it('⛔ na BUSCA o item de ação não é rotulado "Em breve"', () => {
    const resultado = { item: menuItems[0].submenu![1] };
    expect((component as never as { isComingSoon(r: unknown): boolean }).isComingSoon(resultado)).toBeFalse();
  });

  it('⭐ escolher o item de ação NA BUSCA emite a chave — não fica inerte', () => {
    const emitidas: string[] = [];
    component.submenuItemClick.subscribe((k) => emitidas.push(k));

    const resultado = { item: menuItems[0].submenu![1], parent: menuItems[0] };
    (component as never as { selectSearchResult(r: unknown): void }).selectSearchResult(resultado);

    expect(emitidas).toEqual(['abrir-chat-ia']);
  });

  /** Controle: item sem rota E sem `acao` continua sendo "Em breve". A extensão não afrouxou nada. */
  it('controle — item sem rota e sem `acao` SEGUE sendo "Em breve"', () => {
    const semNada = { item: { key: 'futuro', label: 'Futuro', icon: 'heroSquares2x2' } };
    expect((component as never as { isComingSoon(r: unknown): boolean }).isComingSoon(semNada)).toBeTrue();
  });
});
