import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteProgressComponent } from './route-progress.component';

/**
 * ============================================================================
 * `ds-route-progress` — a barra que diz "seu clique funcionou"
 * ============================================================================
 *
 * 🔔 NASCEU DE UM SMOKE DO FUNDADOR: *"o usuário clica e fica aguardando... ele fica repetindo
 * o clique"*. A causa foi medida e **não era atraso proposital** — entre o clique e a tela o
 * browser baixa um chunk (284 chunks, o maior com 3,2 MB) e **ninguém escutava
 * `NavigationStart`**.
 *
 * ⚠️ O componente NÃO conhece o `Router` de propósito: ele recebe `ativo` e desenha. Por isso
 * estas specs não precisam de roteador — e por isso ele serve a qualquer app Angular.
 */
@Component({
  standalone: true,
  imports: [RouteProgressComponent],
  template: `<ds-route-progress [ativo]="ativo()" [rotulo]="rotulo()" />`,
})
class Hospedeiro {
  readonly ativo = signal(false);
  readonly rotulo = signal('Carregando página');
}

describe('`ds-route-progress`', () => {
  let f: ComponentFixture<Hospedeiro>;

  const barra = () => (f.nativeElement as HTMLElement).querySelector('.ds-route-progress');

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Hospedeiro] }).compileComponents();
    f = TestBed.createComponent(Hospedeiro);
    f.detectChanges();
  });

  it('⛔ NÃO aparece quando não há navegação — senão vira ruído permanente', () => {
    expect(barra()).toBeNull();
  });

  it('⭐ aparece assim que `ativo` vira `true`', () => {
    f.componentInstance.ativo.set(true);
    f.detectChanges();

    expect(barra()).not.toBeNull();
  });

  it('some quando a navegação termina', () => {
    f.componentInstance.ativo.set(true);
    f.detectChanges();
    f.componentInstance.ativo.set(false);
    f.detectChanges();

    expect(barra()).toBeNull();
  });

  describe('acessibilidade — a barra é visual, e o problema é pior para quem não enxerga', () => {
    beforeEach(() => {
      f.componentInstance.ativo.set(true);
      f.detectChanges();
    });

    it('anuncia que está ocupada', () => {
      expect(barra()!.getAttribute('role')).toBe('progressbar');
      expect(barra()!.getAttribute('aria-busy')).toBe('true');
    });

    it('tem rótulo, e ele é configurável', () => {
      expect(barra()!.getAttribute('aria-label')).toBe('Carregando página');

      f.componentInstance.rotulo.set('Abrindo relatório');
      f.detectChanges();
      expect(barra()!.getAttribute('aria-label')).toBe('Abrindo relatório');
    });

    it('⚠️ NÃO declara `aria-valuenow` — a barra é INDETERMINADA', () => {
      /**
       * ⛔ Não se sabe quanto falta para o chunk chegar. Um `valuenow` aqui seria inventar
       * progresso na barra que existe justamente para dar confiança. `aria-busy` sem valor é
       * o que descreve "está acontecendo, não sei quanto falta".
       */
      expect(barra()!.hasAttribute('aria-valuenow')).toBe(false);
    });
  });

  it('não intercepta clique — é sobreposição, não obstáculo', () => {
    f.componentInstance.ativo.set(true);
    f.detectChanges();

    // `pointer-events: none` vem do SCSS; aqui garante-se que a barra não é um alvo de clique
    // por estrutura (nada focável nem interativo dentro dela).
    expect(barra()!.querySelector('button, a, input')).toBeNull();
  });
});
