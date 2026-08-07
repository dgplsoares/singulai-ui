import { Component } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';

import { CalloutComponent } from './callout.component';

/**
 * RED-first do `<ds-callout>` (D.3.W3, sub-bloco W3.4).
 *
 * ====================================================================
 * POR QUE DS, E NAO SCSS LOCAL NO OFFCANVAS
 * ====================================================================
 * A arvore de placement do projeto e' mecanica e comeca por: "esse componente
 * faria sentido em outro projeto Angular sem nada de Singulai?". Uma caixa de
 * aviso com icone, titulo e texto: sim. A arvore para ai' e responde DS — a
 * contagem de consumidores so' e' criterio quando a resposta e' NAO.
 *
 * A medicao concorda: o DS nao tem callout/alert/banner nenhum, e ha' pelo menos
 * 8 arquivos com caixas de aviso improvisadas (`bg-blue-50` e afins) em telas
 * legadas. Uma nona improvisacao aqui seria a divida `DEC-FIG-D.3-5a` de novo com
 * outro nome — a que a W3.1 acabou de pagar.
 */
@Component({
  standalone: true,
  imports: [CalloutComponent],
  template: `
    <ds-callout [variant]="variant" [calloutTitle]="titulo" [icon]="icone">
      Texto projetado.
    </ds-callout>
  `,
})
class HostSpec {
  variant: 'info' | 'success' | 'warning' | 'danger' = 'info';
  titulo: string | null = 'Singulai Live';
  icone: string | null = 'heroVideoCamera';
}

describe('CalloutComponent', () => {
  let fixture: ComponentFixture<HostSpec>;
  let host: HostSpec;

  const raiz = () => (fixture.nativeElement as HTMLElement).querySelector('.ds-callout')!;

  async function montar(): Promise<void> {
    await TestBed.configureTestingModule({ imports: [HostSpec] }).compileComponents();
    fixture = TestBed.createComponent(HostSpec);
    host = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => { await montar(); });

  describe('conteúdo', () => {
    it('projeta o corpo', () => {
      expect(raiz().textContent).toContain('Texto projetado.');
    });

    it('exibe o título quando recebido', () => {
      expect(raiz().querySelector('.ds-callout__title')?.textContent?.trim())
        .toBe('Singulai Live');
    });

    it('sem título, não renderiza o elemento do título', () => {
      // Um `<strong>` vazio herdaria margem e abriria um buraco acima do texto.
      host.titulo = null;
      fixture.detectChanges();
      expect(raiz().querySelector('.ds-callout__title')).toBeNull();
    });

    it('sem ícone, não renderiza o bloco do ícone', () => {
      host.icone = null;
      fixture.detectChanges();
      expect(raiz().querySelector('.ds-callout__icon')).toBeNull();
    });
  });

  describe('variantes', () => {
    it('info é o default e vira classe', () => {
      expect(raiz().classList).toContain('ds-callout--info');
    });

    it('trocar a variante troca a classe, sem acumular', () => {
      host.variant = 'warning';
      fixture.detectChanges();

      expect(raiz().classList).toContain('ds-callout--warning');
      expect(raiz().classList).not.toContain('ds-callout--info');
    });
  });

  describe('acessibilidade', () => {
    it('anuncia como nota, não como alerta', () => {
      // `role="alert"` interrompe o leitor de tela. Este bloco é informativo e
      // aparece junto com o campo — interromper seria hostil.
      expect(raiz().getAttribute('role')).toBe('note');
    });

    it('variante de perigo passa a ser anunciada como alerta', () => {
      host.variant = 'danger';
      fixture.detectChanges();
      expect(raiz().getAttribute('role')).toBe('alert');
    });
  });
});
