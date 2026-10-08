import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideIcons } from '@ng-icons/core';
import { heroCheckBadge, heroCpuChip, heroFunnel } from '@ng-icons/heroicons/outline';

import { DsActivityTimelineComponent } from './activity-timeline.component';
import type { DsActivityItem } from './activity-timeline.types';

/**
 * ============================================================================
 * `ds-activity-timeline` — a alternância, medida no DOM RENDERIZADO
 * ============================================================================
 *
 * ⛔⛔ **ESTA SPEC RENDERIZA, e é por isso que ela existe.** O que o componente entrega é
 * LAYOUT: duas colunas alternadas com a régua ao centro. Uma spec de método veria o
 * `comLado()` e **nada** sobre em que coluna o cartão caiu — e foi medindo a coluna resolvida
 * que a `MA.2` descobriu hoje uma grade colapsando sozinha.
 *
 * ⚠️ **O TAMANHO DA REDE** (regra de 2026-09-14): a mudança é um componente novo de ~40 linhas
 * de TS e uma folha de grade. A menor rede que vê a alternância é um render em Chromium; não
 * há turno de modelo, nem smoke, nem navegador com login envolvidos.
 *
 * 🧪 **MUTAÇÕES PROVADAS (2026-10-08):**
 *   1. `i % 2 === 0` → `false` fixo ........... 🔴 *os cartões alternam de coluna*
 *   2. remover o `grid-column: 3` do `--direita` 🔴 *idem* (é a regra que move)
 */
@Component({
  standalone: true,
  imports: [DsActivityTimelineComponent],
  template: '<ds-activity-timeline [items]="itens" />',
})
class Hospedeiro {
  itens: DsActivityItem[] = [];
}

describe('DsActivityTimelineComponent', () => {
  function montar(itens: DsActivityItem[]) {
    TestBed.configureTestingModule({
      imports: [Hospedeiro],
      providers: [provideIcons({ heroCheckBadge, heroCpuChip, heroFunnel })],
    });
    const f = TestBed.createComponent(Hospedeiro);
    f.componentInstance.itens = itens;
    f.detectChanges();
    return f;
  }

  const item = (id: string, over: Partial<DsActivityItem> = {}): DsActivityItem => ({
    id,
    icon: 'heroFunnel',
    title: `Título ${id}`,
    description: `Descrição ${id}`,
    at: '28/03/2026 - 00:31:45',
    badges: [],
    accent: 'blue',
    ...over,
  });

  afterEach(() => TestBed.resetTestingModule());

  it('⛔ os cartões ALTERNAM de coluna, e o primeiro fica à direita', () => {
    const f = montar([item('a'), item('b'), item('c')]);
    const cartoes = (f.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
      '.ds-atl__cartao',
    );

    expect(cartoes.length).toBe(3);

    /**
     * ⚠️ **Leio a coluna RESOLVIDA pelo navegador, não a classe.** Afirmar
     * `classList.contains('--direita')` mediria o recipiente: a classe pode estar lá e a regra
     * não existir. `getComputedStyle().gridColumnStart` é o que o layout de fato fez.
     */
    const colunas = Array.from(cartoes).map((c) => getComputedStyle(c).gridColumnStart);
    expect(colunas[0]).withContext(`colunas: ${colunas.join(' | ')}`).toBe('3');
    expect(colunas[1]).toBe('1');
    expect(colunas[2]).toBe('3');
  });

  it('cada item tem o SEU marcador — a régua acompanha a altura do cartão', () => {
    const f = montar([item('a'), item('b')]);
    expect(
      (f.nativeElement as HTMLElement).querySelectorAll('.ds-atl__marcador').length,
    ).toBe(2);
  });

  it('o acento e os selos chegam ao DOM como atributo, não como cor inline', () => {
    const f = montar([
      item('a', {
        accent: 'teal',
        badges: [
          { label: 'pelo SDR IA', tone: 'teal' },
          { label: 'Fechou a compra', tone: 'blue' },
        ],
      }),
    ]);
    const el = f.nativeElement as HTMLElement;

    expect(el.querySelector('.ds-atl__cartao')?.getAttribute('data-accent')).toBe('teal');

    const selos = el.querySelectorAll('.ds-atl__selo');
    expect(selos.length).toBe(2);
    expect(selos[0].getAttribute('data-tone')).toBe('teal');
    expect(selos[1].textContent?.trim()).toBe('Fechou a compra');
  });

  /**
   * ⚠️ **CONTROLE: sem selo, não há container de selos.** Sem este caso, uma versão que
   * sempre renderizasse a `div` vazia passaria — e o `gap` dela abriria um buraco no cartão.
   */
  it('⚠️ CONTROLE: item sem selo não renderiza o bloco de selos', () => {
    const f = montar([item('a', { badges: [] })]);
    expect((f.nativeElement as HTMLElement).querySelector('.ds-atl__selos')).toBeNull();
  });

  it('lista VAZIA renderiza a lista sem itens, e não quebra', () => {
    const f = montar([]);
    expect((f.nativeElement as HTMLElement).querySelectorAll('.ds-atl__cartao').length).toBe(0);
  });
});
