import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CharCounterComponent } from './char-counter.component';

/**
 * O que esta rede protege: **o critério de "cheio"** e o fato de o componente
 * NÃO conhecer regra de produto.
 *
 * O `>=` (e não `>`) é decisão do fundador, 2026-08-15: *"quando bater no
 * limite, o texto com o contador de caracteres ficar vermelho"* — "bater no
 * limite" é ATINGIR. E há o motivo prático: quando a IA trunca exatamente no
 * teto, `> limite` nunca acontece, e pintar só o excesso deixaria o aviso
 * invisível no caso mais comum.
 */
describe('<ds-char-counter> (D.3.5.9 / 9e)', () => {
  let fixture: ComponentFixture<CharCounterComponent>;

  async function montar(count: number, limit: number, suffix?: string): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [CharCounterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CharCounterComponent);
    fixture.componentRef.setInput('count', count);
    fixture.componentRef.setInput('limit', limit);
    if (suffix !== undefined) {
      fixture.componentRef.setInput('suffix', suffix);
    }
    fixture.detectChanges();
  }

  function raiz(): HTMLElement {
    return fixture.nativeElement.querySelector('.ds-char-counter') as HTMLElement;
  }

  it('mostra os dois números e o sufixo', async () => {
    await montar(120, 500);

    expect(raiz().textContent?.trim()).toBe('120 / 500 caracteres');
  });

  /**
   * ====================================================================
   * O NÚMERO É SEMPRE O USADO — INCLUSIVE ACIMA DO TETO (`9f`, 2026-08-16)
   * ====================================================================
   * A primeira versão da `9f` exibia `-500 / 12.000` acima do teto. O fundador
   * se corrigiu no mesmo dia, por coerência: *"a contagem negativa só faria
   * sentido se o cálculo fosse pela quantidade disponível restante. Como
   * optamos pela quantidade usada real, a exibição deveria ser 12.500 / 12.000
   * (tudo vermelho)"*.
   *
   * Um slot que troca de significado ao cruzar o teto obriga o usuário a
   * reaprender o número no pior momento. **Quem comunica o excesso é a COR.**
   */
  describe('o número é sempre o usado', () => {
    it('⚠️ acima do teto continua mostrando o USADO, não o excedente', async () => {
      // O caso do fundador: 12.500 num campo de 12.000.
      await montar(12_500, 12_000);

      expect(raiz().textContent?.trim()).toBe('12.500 / 12.000 caracteres');
    });

    it('e o vermelho é quem avisa que passou', async () => {
      await montar(12_500, 12_000);

      expect(raiz().classList).toContain('ds-char-counter--exceeded');
    });

    it('enquanto cabe, o formato é o mesmo', async () => {
      await montar(50, 12_000);

      expect(raiz().textContent?.trim()).toBe('50 / 12.000 caracteres');
    });

    it('no teto exato mostra o usado', async () => {
      await montar(12_000, 12_000);

      expect(raiz().textContent?.trim()).toBe('12.000 / 12.000 caracteres');
    });

    it('NÃO há salto de significado ao cruzar o teto', async () => {
      // 12.000 -> 12.001 é uma continuação; só a cor muda de estado.
      await montar(12_001, 12_000);

      expect(raiz().textContent?.trim()).toBe('12.001 / 12.000 caracteres');
    });

    it('apagar o excesso tira o vermelho', async () => {
      await montar(12_500, 12_000);
      expect(raiz().classList).toContain('ds-char-counter--exceeded');

      fixture.componentRef.setInput('count', 11_800);
      fixture.detectChanges();

      expect(raiz().textContent?.trim()).toBe('11.800 / 12.000 caracteres');
      expect(raiz().classList).not.toContain('ds-char-counter--exceeded');
    });
  });

  describe('separador de milhar', () => {
    it('usa PONTO, não vírgula — pt-BR, independente do locale do browser', async () => {
      // `toLocaleString` mostraria `12,000` num browser em inglês. O separador
      // é decisão de produto, não do ambiente de quem abre a tela.
      await montar(1_234_567, 2_000_000);

      expect(raiz().textContent?.trim()).toBe('1.234.567 / 2.000.000 caracteres');
    });

    it('números de até 3 dígitos ficam intactos', async () => {
      await montar(50, 500);

      expect(raiz().textContent?.trim()).toBe('50 / 500 caracteres');
    });

    it('o separador vale também acima do teto', async () => {
      await montar(13_500, 12_000);

      expect(raiz().textContent?.trim()).toBe('13.500 / 12.000 caracteres');
    });
  });

  it('sufixo vazio deixa só os números — é o formato da descrição', async () => {
    await montar(120, 500, '');

    expect(raiz().textContent?.trim()).toBe('120 / 500');
  });

  describe('o aviso de cheio', () => {
    it('NÃO avisa abaixo do teto', async () => {
      await montar(499, 500);

      expect(raiz().classList).not.toContain('ds-char-counter--exceeded');
    });

    it('⚠️ AVISA EXATAMENTE no teto — `>=`, não `>`', async () => {
      // Se fosse `>`, a IA truncando no teto exato nunca acenderia o aviso.
      await montar(500, 500);

      expect(raiz().classList).toContain('ds-char-counter--exceeded');
    });

    it('avisa acima do teto', async () => {
      await montar(501, 500);

      expect(raiz().classList).toContain('ds-char-counter--exceeded');
    });

    it('reage à mudança do count sem remontar', async () => {
      await montar(10, 500);
      expect(raiz().classList).not.toContain('ds-char-counter--exceeded');

      fixture.componentRef.setInput('count', 500);
      fixture.detectChanges();

      expect(raiz().classList).toContain('ds-char-counter--exceeded');
    });
  });

  it('não conhece regra de produto — o `limit` vem de FORA', () => {
    // Documenta a fronteira de camada: o DS não pode importar
    // `CONTENT_LIMITS`, que é domínio da Singulai. Se alguém tentar, este
    // teste não pega — mas o import quebraria o critério 1 do decision tree
    // de placement, e o docblock do componente diz por quê.
    const fonte = CharCounterComponent.toString();

    expect(fonte).not.toContain('CONTENT_LIMITS');
  });
});
