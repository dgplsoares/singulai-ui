import { TestBed } from '@angular/core/testing';

import { ConversationTimelineComponent } from './conversation-timeline.component';
import { ConversationGroup } from './conversation-timeline.types';

/**
 * ============================================================================
 * `ds-conversation-timeline` — a PRIMEIRA rede deste componente
 * ============================================================================
 *
 * ⛔⛔ **Mede o DOM, não os inputs.** Afirmar `c.groups().length` provaria que o `input()`
 * guarda o que recebeu. O que importa é o que o gestor VÊ: quantos grupos, de que lado cada
 * mensagem cai, e se o carimbo sai em `pt-BR`.
 * 📌 Família *"provar a camada não prova a travessia"*.
 */
describe('ConversationTimelineComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [ConversationTimelineComponent] }));

  function render(groups: ConversationGroup[]): HTMLElement {
    const f = TestBed.createComponent(ConversationTimelineComponent);
    f.componentRef.setInput('groups', groups);
    f.detectChanges();
    return f.nativeElement as HTMLElement;
  }

  const UMA: ConversationGroup[] = [
    {
      id: 's1',
      messages: [
        { id: 'm1', side: 'them', text: 'Olá!', at: '2026-04-17T20:00:00.000Z', initials: 'AI' },
        { id: 'm2', side: 'us', text: 'Oi', at: '2026-04-17T20:02:00.000Z', initials: 'JD' },
      ],
    },
  ];

  /**
   * ⭐ `DEC-LEAD-D` / Figma — GRUPOS são estruturais, não decoração: o desenho separa sessões
   * com `gap 20px` e mensagens com `25px`. Uma lista chapada perderia a fronteira.
   * ⭐ MUTAÇÃO: achatar o `@for` de grupos em um só → esta asserção fica vermelha.
   */
  it('✅ um bloco por GRUPO, e as mensagens dentro dele', () => {
    const el = render([
      UMA[0],
      { id: 's2', messages: [{ id: 'm3', side: 'them', text: 'Voltou?', at: '2026-04-17T20:08:00.000Z', initials: 'AI' }] },
    ]);

    expect(el.querySelectorAll('.ds-conversation-timeline__group').length).toBe(2);
    expect(el.querySelectorAll('.ds-conversation-timeline__line').length).toBe(3);
  });

  /**
   * 🔴 O LADO. É ele que diz QUEM FALOU — trocá-lo faz o gestor ler a fala do agente como se
   * fosse do lead, num painel de CRM. ⛔ Defeito silencioso: nada quebra, só mente.
   * ⭐ MUTAÇÃO: inverter a condição `msg.side === 'us'` → vermelha.
   */
  it('🔴 só a mensagem `us` ganha a classe de lado — é ela que diz quem falou', () => {
    const linhas = render(UMA).querySelectorAll('.ds-conversation-timeline__line');

    expect(linhas[0].classList).not.toContain('ds-conversation-timeline__line--us');
    expect(linhas[1].classList).toContain('ds-conversation-timeline__line--us');
  });

  /**
   * ⛔ `pt-BR` EXPLÍCITO. Sem ele o mesmo registro vira `4/17/2026` num navegador em inglês, e
   * o gestor lê a data errada sem nada acusar.
   * ⭐ MUTAÇÃO: trocar `'pt-BR'` por `undefined` → vermelha num runner em locale inglês.
   * ⚠️ O Karma deste projeto roda em locale do container; a asserção fixa o FORMATO, que é o
   * que o Figma especifica (`17/04/2026, 17:00:00`, com segundos).
   */
  it('⛔ carimbo em pt-BR, com segundos — o formato do Figma', () => {
    const meta = render(UMA).querySelector('.ds-conversation-timeline__meta')!;

    expect(meta.textContent!.trim()).toMatch(/^\d{2}\/\d{2}\/\d{4},\s\d{2}:\d{2}:\d{2}$/);
  });

  /**
   * ⚠️ Data inválida mostra o TEXTO CRU, nunca `Invalid Date`. A fonte é o servidor, mas um ISO
   * malformado não pode virar ruído na tela do gestor.
   */
  it('⚠️ ISO malformado: mostra o que veio, não `Invalid Date`', () => {
    const el = render([{ id: 's', messages: [{ id: 'm', side: 'them', text: 'x', at: 'nao-e-data', initials: 'AI' }] }]);

    expect(el.querySelector('.ds-conversation-timeline__meta')!.textContent!.trim()).toBe('nao-e-data');
  });

  /** ⚠️ CONTROLE: sem iniciais, o avatar não é renderizado (e não vira um círculo vazio). */
  it('⚠️ CONTROLE: `initials` vazio esconde o avatar', () => {
    const el = render([{ id: 's', messages: [{ id: 'm', side: 'them', text: 'x', at: '2026-04-17T20:00:00.000Z', initials: '' }] }]);

    expect(el.querySelector('ds-thumbnail-avatar')).toBeNull();
  });
});
