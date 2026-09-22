import { TestBed } from '@angular/core/testing';
import { LightboxComponent } from './lightbox.component';

/**
 * ============================================================================
 * `ds-lightbox` — a rede, e cada caso é um jeito de a camada mentir
 * ============================================================================
 *
 * | caso | o defeito que ele pega |
 * |---|---|
 * | fechado não renderiza | camada invisível capturando clique da página inteira |
 * | abre NO índice pedido | clicar na 3ª imagem e ver a 1ª |
 * | as setas dão a VOLTA | o usuário fica preso na última sem saber por quê |
 * | `Esc` fecha, e só quando aberto | atalho global disparando com a camada fechada |
 * | 1 imagem não mostra setas | comando que não leva a lugar nenhum |
 * | clique no fundo fecha, na imagem NÃO | fechar sem querer ao olhar a imagem |
 */
describe('LightboxComponent (`PORT.3`)', () => {
  function montar(imagens: string[], aberto: number | null = null) {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [LightboxComponent] });
    const fixture = TestBed.createComponent(LightboxComponent);
    fixture.componentRef.setInput('imagens', imagens);
    fixture.componentRef.setInput('aberto', aberto);
    fixture.componentRef.setInput('rotulo', 'Projeto X');
    fixture.detectChanges();
    return fixture;
  }

  const TRES = ['a.png', 'b.png', 'c.png'];
  const camada = (f: ReturnType<typeof montar>) => (f.nativeElement as HTMLElement).querySelector('.ds-lightbox');
  const img = (f: ReturnType<typeof montar>) =>
    (f.nativeElement as HTMLElement).querySelector('img') as HTMLImageElement | null;

  it('⭐ fechado NÃO renderiza nada — camada invisível engole o clique da página', () => {
    expect(camada(montar(TRES))).toBeNull();
  });

  it('⭐ abre NO índice pedido, não na primeira', () => {
    const f = montar(TRES, 2);
    expect(img(f)!.getAttribute('src')).toBe('c.png');
    expect(f.componentInstance.indice()).toBe(2);
  });

  it('⭐ as setas dão a VOLTA nas duas direções', () => {
    const f = montar(TRES, 2);
    const c = f.componentInstance;

    c.proxima();
    expect(c.indice()).toBe(0);

    c.anterior();
    expect(c.indice()).toBe(2);
  });

  it('⭐ `Esc` fecha — e NÃO dispara com a camada fechada', () => {
    const aberta = montar(TRES, 0);
    let fechou = 0;
    aberta.componentInstance.fechar.subscribe(() => fechou++);
    aberta.componentInstance.aoEscape();
    expect(fechou).toBe(1);

    const fechada = montar(TRES);
    let fechouDeNovo = 0;
    fechada.componentInstance.fechar.subscribe(() => fechouDeNovo++);
    fechada.componentInstance.aoEscape();
    expect(fechouDeNovo).toBe(0);
  });

  it('⭐ uma imagem só: sem setas e sem contador — comando que não leva a lugar nenhum', () => {
    const f = montar(['unica.png'], 0);
    const html = f.nativeElement as HTMLElement;

    expect(html.querySelectorAll('.ds-lightbox__seta').length).toBe(0);
    expect(html.querySelector('.ds-lightbox__contador')).toBeNull();
    expect(f.componentInstance.descricao()).toBe('Projeto X');
  });

  it('⭐ o clique no FUNDO fecha; o clique na IMAGEM não', () => {
    const f = montar(TRES, 0);
    let fechou = 0;
    f.componentInstance.fechar.subscribe(() => fechou++);

    /**
     * ⭐ Clique REAL no DOM, não `triggerEventHandler`: a 1ª versão chamava o handler da `<img>`
     * direto, e a mutação *"tirar o `stopPropagation`"* SOBREVIVEU — o caso não via propagação
     * nenhuma. `click()` borbulha de verdade até o fundo, que é o que a pessoa faz.
     */
    img(f)!.click();
    expect(fechou).toBe(0);

    (f.nativeElement as HTMLElement).querySelector<HTMLElement>('.ds-lightbox')!.click();
    expect(fechou).toBe(1);
  });

  it('o rótulo diz QUAL imagem está aberta — é o que o leitor de tela anuncia', () => {
    const f = montar(TRES, 1);
    expect(f.componentInstance.descricao()).toBe('Projeto X — imagem 2 de 3');
    expect(camada(f)!.getAttribute('aria-label')).toBe('Projeto X — imagem 2 de 3');
  });
});
