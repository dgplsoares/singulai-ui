import { TestBed } from '@angular/core/testing';

import { AiAssistantPanelComponent } from './ai-assistant-panel.component';

/**
 * ============================================================================
 * `IA-R13` 14.19 (`DEC-R13-BA`) — o cabeçalho do painel fica inativo durante a geração
 * ============================================================================
 *
 * ⛔ O smoke do fundador em HML (roteiro 1): durante a geração, os botões do cabeçalho do painel do chat seguiam ativos. O painel é do DS e não tinha
 *    como ficar inativo — nem spec nenhuma (esta é a primeira).
 * ⭐ `bloqueado` (padrão `false`) deixa INERTES as ações do cabeçalho e as abas; o corpo projetado — onde mora o PARAR — segue ativo.
 */
describe('AiAssistantPanelComponent — `bloqueado` (`IA-R13` 14.19)', () => {
  const montar = (bloqueado?: boolean) => {
    TestBed.configureTestingModule({ imports: [AiAssistantPanelComponent] });
    const f = TestBed.createComponent(AiAssistantPanelComponent);
    if (bloqueado !== undefined) f.componentRef.setInput('bloqueado', bloqueado);
    f.detectChanges();
    return f.nativeElement as HTMLElement;
  };
  const inerte = (el: HTMLElement, seletor: string) => {
    const alvo = el.querySelector(seletor);
    if (!alvo) throw new Error(`${seletor} não está no painel`);
    return alvo.hasAttribute('inert');
  };

  it('⭐ bloqueado: as ações do cabeçalho e as abas ficam inertes', () => {
    const el = montar(true);

    expect(inerte(el, '.ds-ai-assistant-panel__actions')).withContext('as ações do cabeçalho').toBeTrue();
    expect(inerte(el, '.ds-ai-assistant-panel__tabs')).withContext('as abas').toBeTrue();
  });

  it('sem bloqueio — o padrão —, nada fica inerte: o controle', () => {
    const el = montar();

    expect(inerte(el, '.ds-ai-assistant-panel__actions')).toBeFalse();
    expect(inerte(el, '.ds-ai-assistant-panel__tabs')).toBeFalse();
  });
});
