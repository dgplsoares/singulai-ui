import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BadgeComponent } from './badge.component';

@Component({
  standalone: true,
  imports: [BadgeComponent],
  template: `
    <ds-badge variant="info">sem contorno</ds-badge>
    <ds-badge variant="info" outline="subtle">com contorno</ds-badge>
  `,
})
class Hospedeiro {}

/**
 * ============================================================================
 * `PT.1.A` / `DEC-PT-2` — o contorno do badge
 * ============================================================================
 *
 * ⛔ **Por que um input e não variants novas.** O Figma 1007:11134 (*Recomendado*) e
 * 1007:11137 (*Plano Atual*) pedem borda de 0.5px numa cor dessaturada do próprio selo.
 * Criar `info-outlined`, `success-outlined` etc. **dobraria as 8 variants para 16** — e a
 * paleta é compartilhada com `ds-progress-bar` pela `DEC-DSA-L`. Contorno é eixo
 * independente da cor.
 *
 * ⚠️ **O default protege ~30 consumidores existentes**, e é isso que a 1ª spec fixa: input
 * novo que muda o visual de quem já usa não é extensão, é regressão com nome de melhoria.
 *
 * 🧪 **MUTAÇÕES PROVADAS** (2026-09-05):
 *   1. trocar o default para `'subtle'` derruba *"sem contorno por padrão"*;
 *   2. remover a linha `border: 0.5px solid transparent` do default derruba
 *      *"a caixa não muda de tamanho"* — que é o ponto de reservar o espaço.
 */
describe('ds-badge — contorno (PT.1.A)', () => {
  let fixture: ComponentFixture<Hospedeiro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Hospedeiro] }).compileComponents();
    fixture = TestBed.createComponent(Hospedeiro);
    fixture.detectChanges();
  });

  const badges = () =>
    Array.from(fixture.nativeElement.querySelectorAll('.ds-badge')) as HTMLElement[];

  it('não desenha contorno por padrão', () => {
    expect(badges()[0].getAttribute('data-outline')).toBe('none');
  });

  it('declara o contorno quando pedido', () => {
    expect(badges()[1].getAttribute('data-outline')).toBe('subtle');
  });

  /**
   * ⭐ **A caixa é a mesma nos dois.** A borda existe sempre (transparente no default), então
   * um selo com contorno ao lado de um sem contorno tem a **mesma altura**. Sem isso, o
   * `Recomendado` ficaria 1px mais alto que o vizinho — o tipo de defeito que só aparece
   * quando os dois estão lado a lado, que é exatamente o caso desta tela.
   */
  it('a caixa não muda de tamanho entre com e sem contorno', () => {
    const [sem, com] = badges();

    /**
     * ⛔ **AFIRMA O VALOR ABSOLUTO, não a igualdade entre os dois.**
     *
     * A 1ª versão comparava `sem` com `com` — e a mutação SOBREVIVEU, porque **os dois
     * mudam juntos**: sem a borda transparente no default, ambos ficam `0px` e a
     * igualdade continua verdadeira. Sondado: com a linha, `1px / 1px`, altura 21;
     * sem ela, `0px / 0px`, altura 19.
     *
     * ⚠️ E `borderTopStyle === 'solid'` também não distinguia: `solid` vem de um **reset
     * global** (preflight), não desta regra — passava nos dois cenários.
     *
     * 📌 É *"rede que testa onde as duas implementações coincidem não distingue"*, a 7ª
     * lição da `PLAYER-1`, aplicada a mim mesmo um dia depois.
     */
    expect(getComputedStyle(sem).borderTopWidth).not.toBe('0px');
    expect(getComputedStyle(com).borderTopWidth).not.toBe('0px');
    expect(sem.offsetHeight).toBe(com.offsetHeight);
  });

  /** A cor do contorno deriva do texto — acompanha as 8 variants sem par de token novo. */
  it('o contorno não é transparente quando subtle', () => {
    const cor = getComputedStyle(badges()[1]).borderTopColor;
    expect(cor).not.toBe('rgba(0, 0, 0, 0)');
    expect(cor).not.toBe('transparent');
  });
});
