import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiAssistantPanelComponent } from './ai-assistant-panel.component';

/**
 * ============================================================================
 * `DIV-CRED-DROPDOWN` — o menu de Créditos IA traz o que o legado trazia
 * ============================================================================
 *
 * ⛔ **O defeito, relatado pelo fundador em 2026-09-25:** *"na versão legada funcionava e na
 *    versão refatorada nós nunca implementamos com dados reais. Aliás, a versão refatorada traz
 *    opções do menu dropdown que nunca foram desenhadas, foi invenção."*
 *
 * **Provado por artefato**, não aceito por confiança: o componente legado
 * (`ai-credits-dropdown.component.ts`, apagado em `d214eb2ec`, 2026-05-12) declara *"Design
 * conforme Figma node 53:10364"* e tem SETE elementos — contratados · restantes · barra ·
 * "% utilizado" · aviso · "Comprar mais créditos" · loading e erro com retry. **Nenhum** dos três
 * itens da versão refatorada (`history`/`add`/`plan`) aparece nele, e os três só davam
 * `console.log` — não havia `@Output`.
 *
 * ⚠️ **LACUNA DECLARADA:** esta rede prova o COMPONENTE. Ela não prova que o `MainLayoutComponent`
 *    **passa** os inputs — que era o outro defeito, e o mais silencioso (o input tem default `0`,
 *    então nada acusa quando ele falta). Essa parte é coberta por EXIT CODE, em
 *    `scripts/check-painel-de-ia-recebe-o-saldo.mjs`: mutação não enxerga template que ninguém
 *    monta, e montar o `MainLayoutComponent` custa mais de dez dublês.
 */
describe('`DIV-CRED-DROPDOWN` · o menu de Créditos IA', () => {
  let f: ComponentFixture<AiAssistantPanelComponent>;

  const montar = (entradas: Record<string, unknown> = {}) => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [AiAssistantPanelComponent] });
    f = TestBed.createComponent(AiAssistantPanelComponent);
    for (const [k, v] of Object.entries(entradas)) f.componentRef.setInput(k, v);
    f.detectChanges();
    return f.nativeElement as HTMLElement;
  };

  const abrir = (el: HTMLElement) => {
    const botao = el.querySelector<HTMLButtonElement>('.ds-ai-assistant-panel__credits');
    if (!botao) throw new Error('o gatilho de créditos não está no painel');
    botao.click();
    f.detectChanges();
    return el;
  };

  const texto = (el: HTMLElement) => el.textContent ?? '';

  describe('⛔ os três itens INVENTADOS saíram', () => {
    it('não há "Histórico de uso", "Adicionar créditos" nem "Gerenciar plano"', () => {
      const el = abrir(montar({ credits: 850 }));

      expect(texto(el)).not.toContain('Histórico de uso');
      expect(texto(el)).not.toContain('Adicionar créditos');
      expect(texto(el)).not.toContain('Gerenciar plano');
    });

    it('⭐ e os SETE do legado estão lá', () => {
      const el = abrir(montar({ credits: 850, creditsMonthlyLimit: 1000 }));
      const t = texto(el);

      expect(t).withContext('cabeçalho').toContain('Créditos de IA');
      expect(t).withContext('contratados').toContain('Créditos contratados');
      expect(t).withContext('restantes').toContain('Créditos restantes');
      expect(t).withContext('% utilizado').toContain('% utilizado');
      expect(t).withContext('comprar').toContain('Comprar mais créditos');
      expect(el.querySelector('ds-progress-bar')).withContext('a barra').not.toBeNull();
    });
  });

  describe('o gatilho — o formato vem do Figma `559:41724`', () => {
    it('mostra `Créditos IA (N)` com o saldo que recebe', () => {
      // ⛔ Antes desta correção o painel mostrava SEMPRE `(0)`, porque nenhum montador real
      //    passava `[credits]` e o input tem default `0`.
      const el = montar({ credits: 850 });

      expect(texto(el)).toContain('Créditos IA');
      expect(texto(el)).toContain('(850)');
    });
  });

  describe('a cota contratada', () => {
    it('mostra o número quando há cota — com a casa do milhar', () => {
      const el = abrir(montar({ credits: 400, creditsMonthlyLimit: 5000 }));

      // ⚠️ Esta asserção dizia `'5000'` e passou a dizer `'5.000'` quando o fundador pediu a casa
      //    do milhar (2026-09-25). Teste que quebra por causa do refator é PARTE do refator.
      expect(texto(el)).toContain('5.000');
    });

    it('mostra `∞` quando não há cota — e NÃO a barra de progresso', () => {
      const el = abrir(montar({ credits: 400, creditsMonthlyLimit: null }));

      expect(texto(el)).toContain('∞');
      // ⚠️ `DEC-FIG-CRED-1` — divergência deliberada do legado: sem cota o percentual é 0 por
      //    construção, e "0% utilizado" afirmaria que a tenant não gastou nada, que é diferente
      //    de "não há cota a comparar".
      expect(el.querySelector('ds-progress-bar')).toBeNull();
      expect(texto(el)).not.toContain('% utilizado');
    });
  });

  describe('o percentual utilizado', () => {
    it('é `(cota - saldo) / cota`, arredondado', () => {
      const el = abrir(montar({ credits: 250, creditsMonthlyLimit: 1000 }));

      // 1000 - 250 = 750 usados ⇒ 75%
      expect(texto(el)).toContain('75% utilizado');
    });
  });

  describe('⛔ `-840% utilizado` — o que o fundador viu em 2026-09-25', () => {
    /**
     * O relato: *"Créditos contratados 1000 / Créditos restantes 9403 / -840% utilizado"*.
     *
     * A conta estava CERTA — `(1000 - 9403) / 1000 = -840,3%`. Errada era a PREMISSA: a fórmula
     * assume `saldo <= cota`, e isso não se sustenta. Medido no banco:
     *   `admin_manual_insert +11.000` naquela tenant (um lançamento de 10.000 em 26/08).
     * E compra de créditos produz o mesmo (`dev-tenant`: 15.863 de saldo, cota 1.000).
     *
     * 📌 O defeito veio do LEGADO, copiado junto com o resto — e nunca apareceu lá porque o
     *    dropdown legado morreu antes de alguém inserir crédito manual.
     */
    it('o número exato do relato NÃO aparece mais', () => {
      const el = abrir(montar({ credits: 9403, creditsMonthlyLimit: 1000 }));

      expect(texto(el)).not.toContain('-840');
      expect(texto(el)).not.toContain('840%');
    });

    it('⭐ e a BARRA some quando o saldo passa da cota — ela mede consumo DA COTA', () => {
      const el = abrir(montar({ credits: 9403, creditsMonthlyLimit: 1000 }));

      // ⛔ O clamp sozinho mostraria "0% utilizado": verdadeiro ("não consumiu a cota") e
      //    ENGANOSO, porque sugere quem acabou de começar — quando há 9x a cota disponível.
      expect(el.querySelector('ds-progress-bar')).toBeNull();
      expect(texto(el)).not.toContain('% utilizado');
    });

    it('mas os DOIS números continuam lá — eles contam a história inteira', () => {
      const el = abrir(montar({ credits: 9403, creditsMonthlyLimit: 1000 }));

      expect(texto(el)).toContain('Créditos contratados');
      expect(texto(el)).toContain('Créditos restantes');
      expect(texto(el)).toContain('9.403');
      expect(texto(el)).toContain('1.000');
    });

    it('nenhum percentual passa de 100 nem fica negativo — o clamp é defesa', () => {
      // saldo ZERO com cota 1000 ⇒ 100% usado, e nunca mais que isso
      const el = abrir(montar({ credits: 0, creditsMonthlyLimit: 1000 }));

      expect(texto(el)).toContain('100% utilizado');
    });

    it('o caso NORMAL segue com barra: 250 de 1000 ⇒ 75%', () => {
      const el = abrir(montar({ credits: 250, creditsMonthlyLimit: 1000 }));

      expect(el.querySelector('ds-progress-bar')).not.toBeNull();
      expect(texto(el)).toContain('75% utilizado');
    });

    it('saldo IGUAL à cota ainda mostra a barra — a fronteira é `<=`', () => {
      const el = abrir(montar({ credits: 1000, creditsMonthlyLimit: 1000 }));

      expect(el.querySelector('ds-progress-bar')).not.toBeNull();
      expect(texto(el)).toContain('0% utilizado');
    });
  });

  describe('⭐ a casa do milhar (fundador, 2026-09-25)', () => {
    it('o gatilho mostra `(9.403)`, não `(9403)`', () => {
      const el = montar({ credits: 9403 });

      expect(texto(el)).toContain('(9.403)');
      expect(texto(el)).not.toContain('(9403)');
    });

    it('a cota mostra `1.000`', () => {
      const el = abrir(montar({ credits: 250, creditsMonthlyLimit: 1000 }));

      expect(texto(el)).toContain('1.000');
    });

    it('⛔ e o separador é o de pt-BR (ponto), não o de en-US (vírgula)', () => {
      // `Intl.NumberFormat('pt-BR')` explícito, e não o `DecimalPipe`: sem
      // `registerLocaleData(pt)` o pipe formataria `1,000`, que em pt-BR se lê "um vírgula zero".
      const el = montar({ credits: 1000 });

      expect(texto(el)).toContain('(1.000)');
      expect(texto(el)).not.toContain('(1,000)');
    });

    it('números abaixo de mil não ganham separador — o caso do Figma `(850)`', () => {
      const el = montar({ credits: 850 });

      expect(texto(el)).toContain('(850)');
    });
  });

  describe('⛔ o aviso de saldo baixo NÃO é simétrico, e isso é de propósito', () => {
    it('COM cota: avisa abaixo de 10% dela', () => {
      const el = abrir(montar({ credits: 40, creditsMonthlyLimit: 1000 }));

      expect(texto(el)).toContain('Seus créditos estão acabando!');
    });

    it('COM cota alta: 800 de 5000 NÃO é "acabando" — o controle', () => {
      // ⭐ É este caso que distingue a regra RELATIVA da ABSOLUTA, e por isso ele existe:
      //    800 está muito acima do limiar absoluto (10) e também acima do relativo
      //    (5000 × 0,1 = 500). ⇒ não avisa.
      //    Com a regra trocada para absoluta, o caso de cima (40 de 1000) deixaria de avisar —
      //    e é o par dos dois que prova a assimetria, nunca um sozinho.
      const el = abrir(montar({ credits: 800, creditsMonthlyLimit: 5000 }));

      expect(texto(el)).not.toContain('acabando');
    });

    it('SEM cota: o critério é absoluto — avisa abaixo de 10', () => {
      const el = abrir(montar({ credits: 9, creditsMonthlyLimit: null }));

      expect(texto(el)).toContain('Seus créditos estão acabando!');
    });

    it('SEM cota: 40 créditos não avisam — o controle', () => {
      const el = abrir(montar({ credits: 40, creditsMonthlyLimit: null }));

      expect(texto(el)).not.toContain('acabando');
    });
  });

  describe('⛔ o estado de ERRO — e ele é obrigatório, não cortesia', () => {
    it('mostra a mensagem e NÃO os números', () => {
      // ⛔ POR QUE ISTO IMPORTA: quando a carga falha, o service mantém `credits` em `null` e
      //    `balance()` devolve **0** (`?? 0`). Sem este ramo a tela diria "0 créditos" — um número
      //    FALSO com cara de verdade. (O `IA-RESIDUO` já tirou daqui a fabricação oposta: o
      //    `catch` injetava `balance: 100, monthlyLimit: 500` e apagava o próprio erro.)
      const el = abrir(montar({ credits: 0, creditsError: 'Falha ao carregar créditos' }));

      expect(texto(el)).toContain('Falha ao carregar créditos');
      expect(texto(el)).toContain('Tentar novamente');
      expect(texto(el)).not.toContain('Créditos contratados');
      expect(texto(el)).not.toContain('Créditos restantes');
    });

    it('o botão de retentativa emite `retryCredits`', () => {
      const el = abrir(montar({ credits: 0, creditsError: 'caiu' }));
      let pediu = 0;
      f.componentInstance.retryCredits.subscribe(() => pediu++);

      el.querySelector<HTMLButtonElement>('.ds-ai-assistant-panel__credits-retry')?.click();

      expect(pediu).toBe(1);
    });
  });

  describe('o estado de CARGA', () => {
    it('mostra "Carregando..." e não os números', () => {
      const el = abrir(montar({ credits: 0, creditsLoading: true }));

      expect(texto(el)).toContain('Carregando');
      expect(texto(el)).not.toContain('Créditos contratados');
    });

    it('⚠️ e o gatilho mostra `...` em vez de `(0)` enquanto carrega', () => {
      const el = montar({ credits: 0, creditsLoading: true });

      // Sem isto, o gestor lê "(0)" por um instante a cada abertura — e "(0)" é exatamente o
      // sintoma do defeito que esta dívida conserta.
      expect(texto(el)).not.toContain('Créditos contratados');
    });
  });

  describe('"Comprar mais créditos"', () => {
    it('emite `buyCredits` e fecha o menu', () => {
      const el = abrir(montar({ credits: 10, creditsMonthlyLimit: 1000 }));
      let comprou = 0;
      f.componentInstance.buyCredits.subscribe(() => comprou++);

      el.querySelector<HTMLButtonElement>('.ds-ai-assistant-panel__credits-buy')?.click();
      f.detectChanges();

      expect(comprou).toBe(1);
      expect(el.querySelector('.ds-ai-assistant-panel__dropdown--credits')).toBeNull();
    });

    it('aparece mesmo no estado de erro — é a saída do gestor sem saldo', () => {
      const el = abrir(montar({ credits: 0, creditsError: 'caiu' }));

      expect(el.querySelector('.ds-ai-assistant-panel__credits-buy')).not.toBeNull();
    });
  });
});
