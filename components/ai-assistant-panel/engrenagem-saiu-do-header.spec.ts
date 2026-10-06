import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiAssistantPanelComponent } from './ai-assistant-panel.component';

/**
 * ============================================================================
 * `CHAT-ENGRENAGEM` · `DEC-ENG-A`/`DEC-ENG-C` — a engrenagem sai, o créditos fica
 * ============================================================================
 *
 * **Decisão do fundador, 2026-10-06:** *"a remocao do botao drop down de configuracao (icone
 * engrenagem), que fica no header do painel do assistente de IA. Pois este botão é apenas front,
 * sem ligacao alguma com o backend e nada esta ou sera implementado para ligar a ele, nem na V1,
 * nem na V2."*
 *
 * ⭐ **A premissa foi MEDIDA, não assumida** — `grep -rn "prompt_config" backend-nestjs/src
 *    ai-orchestrator/app` devolve **0**: nenhuma decisão de servidor dependia das 4 chaves.
 * ⛔ **Mas o config VIAJAVA:** `ai-chat-timeline.component.ts` o punha no corpo de TODA chamada
 *    de chat (`fire-and-forget`, *"backend ignora por ora"*). As 2 chaves saíram com o botão —
 *    campo que nenhum lado escreve nem lê é cerimônia.
 *
 * ⚠️ **POR QUE A SEGUNDA METADE DESTA REDE EXISTE** (`DEC-ENG-C`): a engrenagem e o créditos
 *    compartilhavam DOIS mecanismos — o `@HostListener('document:click')` fechava os dois, e havia
 *    um **mutex bilateral** (abrir um fechava o outro). Remover um lado sem olhar o outro quebra o
 *    fechamento do créditos, e `tsc` não vê template.
 *
 * ⛔ **LACUNA DECLARADA:** esta rede prova o COMPONENTE do DS. Que o `MainLayoutComponent` deixou
 *    de passar o `(aiPromptConfigChange)` é provado por outra via — o `tsc` do template, que roda
 *    no `build --configuration production` do `verify --full`, porque listener para um `@Output`
 *    inexistente é erro de compilação de template, não de tipo.
 */
describe('`CHAT-ENGRENAGEM` · a engrenagem saiu do header do painel de IA', () => {
  let f: ComponentFixture<AiAssistantPanelComponent>;

  const montar = (entradas: Record<string, unknown> = {}) => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [AiAssistantPanelComponent] });
    f = TestBed.createComponent(AiAssistantPanelComponent);
    for (const [k, v] of Object.entries(entradas)) f.componentRef.setInput(k, v);
    f.detectChanges();
    return f.nativeElement as HTMLElement;
  };

  describe('⛔ o controle não está mais lá', () => {
    it('não há botão com `aria-label="Configuracoes do Prompt"`', () => {
      const el = montar();

      expect(el.querySelector('[aria-label="Configuracoes do Prompt"]')).toBeNull();
    });

    it('⭐ e o CONTROLE desta negativa: o gatilho de créditos CONTINUA no header', () => {
      const el = montar();

      // Sem esta asserção a de cima passaria VACUOSAMENTE se o header inteiro
      // deixasse de renderizar — modo de falha já medido nesta base.
      expect(el.querySelector('.ds-ai-assistant-panel__credits'))
        .withContext('o gatilho de créditos')
        .not.toBeNull();
    });

    it('nenhum dos 4 switchers aparece, nem com o header clicado inteiro', () => {
      const el = montar();
      el.querySelectorAll<HTMLButtonElement>('.ds-ai-assistant-panel__actions button')
        .forEach((b) => b.click());
      f.detectChanges();

      const texto = el.textContent ?? '';
      expect(texto).not.toContain('Criatividade');
      expect(texto).not.toContain('Tom de voz');
      expect(texto).not.toContain('Buscar fontes externas');
      expect(texto).not.toContain('Reasoning estendido');
    });

    it('e não sobrou nenhum elemento de configuração do prompt no DOM', () => {
      const el = montar();

      expect(el.querySelectorAll('[class*="cfg-"]').length).toBe(0);
      expect(el.querySelectorAll('[class*="--settings"]').length).toBe(0);
    });
  });

  describe('⭐ `DEC-ENG-C` — o créditos não mudou de comportamento', () => {
    const abrirCreditos = (el: HTMLElement) => {
      const botao = el.querySelector<HTMLButtonElement>('.ds-ai-assistant-panel__credits');
      if (!botao) throw new Error('o gatilho de créditos não está no painel');
      botao.click();
      f.detectChanges();
      return el;
    };

    it('o dropdown de créditos ABRE no clique do gatilho', () => {
      const el = abrirCreditos(montar({ credits: 500 }));

      expect(el.querySelector('.ds-ai-assistant-panel__dropdown'))
        .withContext('o dropdown de créditos depois do clique')
        .not.toBeNull();
    });

    it('⭐ e FECHA no clique fora — o `document:click` sobreviveu à remoção', () => {
      const el = abrirCreditos(montar({ credits: 500 }));
      expect(el.querySelector('.ds-ai-assistant-panel__dropdown')).not.toBeNull();

      document.body.click();
      f.detectChanges();

      expect(el.querySelector('.ds-ai-assistant-panel__dropdown'))
        .withContext('o dropdown depois do clique fora')
        .toBeNull();
    });

    it('o gatilho reflete o estado em `aria-expanded`, fechado e aberto', () => {
      const el = montar({ credits: 500 });
      const botao = el.querySelector<HTMLButtonElement>('.ds-ai-assistant-panel__credits');

      expect(botao?.getAttribute('aria-expanded')).toBe('false');

      botao?.click();
      f.detectChanges();

      expect(botao?.getAttribute('aria-expanded')).toBe('true');
    });
  });
});
