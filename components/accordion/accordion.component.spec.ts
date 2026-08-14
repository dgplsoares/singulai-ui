import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccordionComponent } from './accordion.component';
import { AccordionModule } from './accordion.types';

/**
 * D.3.5 sub-bloco `D.3.5.1` — o `<ds-accordion>` deixa de ter copy de Cursos cravada.
 *
 * ====================================================================
 * A DÍVIDA QUE ESTE SUB-BLOCO PAGA
 * ====================================================================
 * O componente é do DS e já serve os três produtos, mas tinha o vocabulário de
 * Cursos **preso no template**: `"Aulas do módulo"` (`:99`), `"Reorganizar aulas"`
 * (`:117`) e `"Arrastar aula para reordenar"` (`:156`). A step de Programação de
 * Mentorias renderizaria **"Aulas"** onde o canônico é **"Sessões"**.
 *
 * A `D.3.4.5 §12` registrou a dívida e nomeou a `D.3.5` como dona. Aqui ela é paga.
 *
 * ====================================================================
 * O QUE ESTES TESTES TRAVAM
 * ====================================================================
 * O componente tem **~136 consumidores** herdados. A promessa do input novo é que
 * **o default não muda nada** para nenhum deles — e é isso que a primeira suíte
 * verifica, antes de qualquer teste do comportamento novo.
 */
describe('<ds-accordion> — rótulos parametrizáveis (D.3.5.1)', () => {
  let fixture: ComponentFixture<AccordionComponent>;

  const MODULOS: AccordionModule[] = [
    {
      id: 'm1',
      title: 'Módulo 1',
      description: 'Descrição do módulo',
      items: [
        { id: 'i1', kind: 'aula', title: 'Aula 1' },
        { id: 'i2', kind: 'quiz', title: 'Quiz 1' },
      ],
    },
  ];

  const texto = () => (fixture.nativeElement as HTMLElement).textContent ?? '';
  const tituloSecao = () =>
    (fixture.nativeElement.querySelector('.ds-accordion-subsection-title') as HTMLElement | null)
      ?.textContent?.trim() ?? null;
  const alcaDeArraste = () =>
    fixture.nativeElement.querySelector('.ds-accordion-item-drag-handle') as HTMLElement | null;

  /**
   * A alça de arraste dos itens só existe com a reordenação ativa — e quem
   * controla isso é o PAI, via input `dndLessonsModuleId`, não estado interno.
   */
  const ativarReordenacao = () => {
    fixture.componentRef.setInput('dndLessonsModuleId', 'm1');
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AccordionComponent] }).compileComponents();
    fixture = TestBed.createComponent(AccordionComponent);
    fixture.componentRef.setInput('modules', MODULOS);
    fixture.detectChanges();
  });

  describe('o DEFAULT não muda nada — a promessa aos ~136 consumidores', () => {
    it('mantém "Aulas do módulo" como título da subseção', () => {
      expect(tituloSecao()).toBe('Aulas do módulo');
    });

    it('mantém "Reorganizar aulas" no botão', () => {
      // Só aparece com mais de 1 item — a fixture tem 2.
      expect(texto()).toContain('Reorganizar aulas');
    });

    it('mantém "Arrastar aula para reordenar" na alça', () => {
      // A alça só existe DEPOIS de ativar a reordenação — não por default.
      ativarReordenacao();

      expect(alcaDeArraste()?.getAttribute('aria-label')).toBe('Arrastar aula para reordenar');
    });

    it('mantém "Adicionar Aula"', () => {
      expect(texto()).toContain('Adicionar Aula');
    });

    it('o accordion NÃO renderiza botão de adicionar módulo — ele é do caller', () => {
      // Era o `addModuleLabel`, INPUT MORTO descoberto na `D.3.5.1`: declarado
      // e nunca lido. O fundador decidiu em 2026-08-13 pela opção (a) —
      // remover o input e manter o botão FORA do accordion, no header do card e
      // no rodapé da lista, que é como o `step-aulas` já fazia.
      //
      // Este teste é a rede contra o caminho de volta: se alguém puser o botão
      // dentro do accordion, os consumidores passam a ter DOIS.
      expect(texto()).not.toContain('Adicionar Módulo');
    });
  });

  describe('Mentorias e Eventos passam a poder falar a própria língua', () => {
    it('aceita "Sessões do Módulo" — o caso de Mentorias', () => {
      fixture.componentRef.setInput('itemsSectionLabel', 'Sessões do Módulo');
      fixture.detectChanges();

      expect(tituloSecao()).toBe('Sessões do Módulo');
      expect(texto()).withContext('"Aulas" não pode sobrar em Mentorias').not.toContain('Aulas do módulo');
    });

    it('aceita "Sessões do Palco" — o caso de Eventos', () => {
      // ⚠️ O vocabulário canônico da D.3.5 é Módulo (DEC-FIG-D.3.5-1); "Palco"
      // aparece aqui só para provar que o input não presume nenhum substantivo.
      fixture.componentRef.setInput('itemsSectionLabel', 'Sessões do Palco');
      fixture.detectChanges();

      expect(tituloSecao()).toBe('Sessões do Palco');
    });

    it('troca o rótulo de reordenar', () => {
      fixture.componentRef.setInput('reorderItemsLabel', 'Reorganizar sessões');
      fixture.detectChanges();

      expect(texto()).toContain('Reorganizar sessões');
      expect(texto()).not.toContain('Reorganizar aulas');
    });

    it('troca o aria-label da alça — acessibilidade acompanha o vocabulário', () => {
      fixture.componentRef.setInput('dragItemAriaLabel', 'Arrastar sessão para reordenar');
      fixture.detectChanges();
      ativarReordenacao();

      expect(alcaDeArraste()?.getAttribute('aria-label')).toBe('Arrastar sessão para reordenar');
    });

    it('os três rótulos são independentes entre si', () => {
      fixture.componentRef.setInput('itemsSectionLabel', 'Sessões do Módulo');
      fixture.detectChanges();

      // Trocar um não pode arrastar os outros junto.
      expect(texto()).toContain('Reorganizar aulas');
      ativarReordenacao();
      expect(alcaDeArraste()?.getAttribute('aria-label')).toBe('Arrastar aula para reordenar');
    });
  });

  describe('kind alinhado ao vocabulário canônico (D.3.5.2)', () => {
    /**
     * O mapa de ícone é `protected` — testado por cast em vez de pelo DOM
     * porque `ng-reflect-*` só existe em dev mode, e o que importa aqui é a
     * REGRA, não o atributo renderizado.
     */
    const icone = (kind: string) =>
      (fixture.componentInstance as unknown as { iconForKind(k: string): string })
        .iconForKind(kind);

    const comKind = (kind: string) => {
      fixture.componentRef.setInput('modules', [
        { id: 'm1', title: 'M', items: [{ id: 'i1', kind, title: 'Item' }] },
      ]);
      fixture.detectChanges();
    };

    it('aceita os 6 kinds canônicos — os mesmos valores do ContentKind', () => {
      (['video', 'live', 'in_person', 'ebook', 'quiz', 'extra'] as const).forEach((k) => {
        expect(() => comKind(k)).withContext(k).not.toThrow();
      });
    });

    it('⚠️ "aula" continua aceito, e com o ÍCONE ANTIGO', () => {
      // A DEC-D.3.5-E proíbe abrir o `step-aulas`, que ainda passa 'aula'.
      // Trocar o ícone aqui mudaria a aparência daquela tela sem que esta fase
      // a tivesse tocado — regressão silenciosa. `aula` morre na D.3.6.
      expect(icone('aula')).toBe('heroVideoCamera');
    });

    it('os canônicos usam os MESMOS ícones que o CONTENT_KINDS declara', () => {
      // Sem isto, o accordion e o <ds-type-picker> mostrariam símbolos
      // diferentes para o mesmo conceito na mesma tela.
      expect(icone('live')).toBe('heroVideoCamera');
      expect(icone('video')).toBe('heroPlayCircle');
      expect(icone('in_person')).toBe('heroMapPin');
      expect(icone('ebook')).toBe('heroBookOpen');
      expect(icone('quiz')).toBe('heroCheckCircle');
      expect(icone('extra')).toBe('heroBars3');
    });

    it('"custom" cai no ícone default', () => {
      expect(icone('custom')).toBe('heroDocumentText');
    });
  });

  describe('o que NÃO foi tocado neste sub-bloco', () => {
    it('renderiza os módulos e os itens como antes', () => {
      expect(texto()).toContain('Módulo 1');
      expect(texto()).toContain('Aula 1');
      expect(texto()).toContain('Quiz 1');
    });

    it('não mostra "Reorganizar" com um item só', () => {
      fixture.componentRef.setInput('modules', [{ ...MODULOS[0], items: [MODULOS[0].items[0]] }]);
      fixture.detectChanges();

      expect(texto()).not.toContain('Reorganizar aulas');
    });
  });
});
