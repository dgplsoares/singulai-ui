import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageNavComponent, PageNavStep } from './page-nav.component';

/**
 * Specs do <ds-page-nav> — D.3.W1 (frente W1c).
 *
 * FOCO: o estado `completed` era NO-OP VISUAL. A classe `--completed` so
 * pintava `<ng-icon>` (e pintava de verde #16A34A, cor que nao existe no
 * Figma), enquanto TODO item inativo — concluido ou nao — era renderizado
 * na mesma cor #3E6FCA. Resultado: o usuario nao via quais abas estavam
 * concluidas, e o gate de navegacao (so navega para concluidas + corrente)
 * virava adivinhacao.
 *
 * PALETA CANONICA (medida no Figma, nao inventada):
 *
 *   | estado    | label     | fonte                                        |
 *   |-----------|-----------|----------------------------------------------|
 *   | active    | #3A65B3   | 590:1121 `text-[#3a65b3]` (ja implementado)  |
 *   | completed | #3E6FCA   | links-figma 1.6.1.2 — "no caso de edicao,   |
 *   |           |           | todas as steps estao completas, as cores    |
 *   |           |           | dos icones e textos sao na cor #3E6FCA"     |
 *   | pending   | #8599AC   | 590:1121 + 590:3150 `text-[#8599ac]` — e a  |
 *   |           |           | mesma cor que a prose nomeia para "steps    |
 *   |           |           | ainda nao concluidas"                        |
 *
 * ICONE via `iconSrc` (`<img>`): os SVGs commitados em
 * public/wizard-tabs-nav/ tem a cor BAKED (`stroke="#3E6FCA"`), ou seja,
 * ja estao na paleta de CONCLUIDO. Logo `completed` = sem filtro, e
 * `pending` = filtro dessaturante que aproxima o tom medido no Figma para
 * icone inativo (#A1B5C8). CSS `color` nao alcanca `<img>` — sem filtro o
 * estado e literalmente inexprimivel para quem usa iconSrc, que e o caso
 * de Cursos e de Mentorias.
 */
// ============================================================================
// INSTRUMENTOS — medir EFEITO, nao string.
//
// A primeira versao deste spec afirmava o estado pendente do icone com
// `expect(filter).not.toBe('none')`. Esse predicado aceita `brightness(1)`:
// a identidade matematica, ou seja, OUTRO no-op visual. O teste da entrega
// que existe para matar um no-op visual nao pode aceitar um.
//
// A correcao e medir o pixel. Canvas2D `ctx.filter` interpreta a MESMA
// gramatica do `filter` do CSS, entao da para pegar a string que o browser
// computou no elemento real, aplica-la a cor que o asset tem baked, e ler o
// RGB que sai. `brightness(1)` devolve a cor de entrada; a cadeia real cai em
// cima do tom que o Figma exporta para step nao concluida.
// ============================================================================

interface Rgb {
  r: number;
  g: number;
  b: number;
}

/** Fundo da tab bar (Figma 590:1122 `bg-[#eff3f8]`). Tudo compoe sobre ele. */
const TABBAR_BG = '#EFF3F8';

/**
 * Cor BAKED nos SVGs de public/wizard-tabs-nav/cursos/ — conferida nos 7
 * arquivos: `#3E6FCA` no traco primario, `#C5D2E8` no secundario. E por isso
 * que `completed` e o asset natural: ele ja nasce na paleta de concluido.
 */
const ASSET_STROKE = '#3E6FCA';

/**
 * Tom que o Figma EXPORTA para o icone de step nao concluida — extraido dos
 * SVGs de 590:3150 (nav-lives, nav-seo, nav-midias: `#A1B5C8` no primario).
 * Nao e chute nem derivacao: e o alvo contra o qual a cadeia de filtro foi
 * resolvida.
 */
const FIGMA_PENDING_ICON = '#A1B5C8';

function hexToRgb(hex: string): Rgb {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function cssToRgb(css: string): Rgb {
  const parts = css.match(/-?[\d.]+/g);
  if (!parts || parts.length < 3) throw new Error(`cor nao parseavel: "${css}"`);
  return { r: Number(parts[0]), g: Number(parts[1]), b: Number(parts[2]) };
}

/** Maior diferenca em um canal. 0 = pixels identicos. */
function maxChannelDelta(a: Rgb, b: Rgb): number {
  return Math.max(Math.abs(a.r - b.r), Math.abs(a.g - b.g), Math.abs(a.b - b.b));
}

function show(c: Rgb): string {
  return `rgb(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)})`;
}

/**
 * Aplica uma cadeia de filtros CSS a uma cor solida e devolve o pixel
 * resultante, ja composto sobre `bgHex`.
 *
 * A composicao importa: a cadeia de pending termina em `opacity()`, que so
 * produz o tom alvo quando cai sobre o fundo fixo da tab bar.
 */
function pixelAfterFilter(filter: string, srcHex: string, bgHex: string = TABBAR_BG): Rgb {
  const canvas = document.createElement('canvas');
  canvas.width = 4;
  canvas.height = 4;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas2D indisponivel — o instrumento nao pode medir.');

  ctx.filter = 'none';
  ctx.fillStyle = bgHex;
  ctx.fillRect(0, 0, 4, 4);

  ctx.filter = filter;
  ctx.fillStyle = srcHex;
  ctx.fillRect(0, 0, 4, 4);

  const d = ctx.getImageData(2, 2, 1, 1).data;
  return { r: d[0], g: d[1], b: d[2] };
}

/** Luminancia relativa WCAG 2.x. */
function relativeLuminance(c: Rgb): number {
  const ch = (v: number): number => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * ch(c.r) + 0.7152 * ch(c.g) + 0.0722 * ch(c.b);
}

/** Razao de contraste WCAG entre duas cores OPACAS. */
function contrastRatio(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Compoe `fg` sobre `bg` com alpha. */
function composite(fg: Rgb, bg: Rgb, alpha: number): Rgb {
  return {
    r: fg.r * alpha + bg.r * (1 - alpha),
    g: fg.g * alpha + bg.g * (1 - alpha),
    b: fg.b * alpha + bg.b * (1 - alpha),
  };
}

describe('PageNavComponent — estados visuais de step (D.3.W1 W1c)', () => {
  let fixture: ComponentFixture<PageNavComponent>;

  /** #3E6FCA — concluido (links-figma 1.6.1.2). */
  const COMPLETED = 'rgb(62, 111, 202)';
  /** #8599AC — pendente (Figma 590:1121 / 590:3150). */
  const PENDING = 'rgb(133, 153, 172)';

  const ICON_SRC = 'wizard-tabs-nav/cursos/navitem-informacoes.svg';

  /** Um wizard de 3 steps: corrente + concluida + pendente. */
  const stepsWithIconSrc: PageNavStep[] = [
    { id: 'informacoes', label: 'Informações', iconSrc: ICON_SRC, completed: true },
    { id: 'aulas', label: 'Aulas', iconSrc: ICON_SRC },
    { id: 'seo', label: 'SEO', iconSrc: ICON_SRC, disabled: true },
  ];

  const stepsWithNgIcon: PageNavStep[] = [
    { id: 'informacoes', label: 'Informações', icon: 'heroDocumentText', completed: true },
    { id: 'aulas', label: 'Aulas', icon: 'heroAcademicCap' },
    { id: 'seo', label: 'SEO', icon: 'heroMagnifyingGlass', disabled: true },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageNavComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageNavComponent);
  });

  function render(steps: PageNavStep[], activeStepId: string): void {
    fixture.componentRef.setInput('steps', steps);
    fixture.componentRef.setInput('activeStepId', activeStepId);
    fixture.detectChanges();
  }

  function itemAt(index: number): HTMLButtonElement {
    return fixture.nativeElement.querySelectorAll('.ds-page-nav-item')[index] as HTMLButtonElement;
  }

  function labelColorAt(index: number): string {
    const label = itemAt(index).querySelector('.ds-page-nav-item-label') as HTMLElement;
    return getComputedStyle(label).color;
  }

  function iconImgAt(index: number): HTMLElement {
    return itemAt(index).querySelector('.ds-page-nav-item-icon-img') as HTMLElement;
  }

  function tabbar(): HTMLElement {
    return fixture.nativeElement.querySelector('.ds-page-nav-tabbar') as HTMLElement;
  }

  /**
   * Opacidade ACUMULADA de um elemento ate a tab bar. `opacity` do CSS nao e
   * herdada como valor mas COMPOE: um item a 0.45 dentro de um wrap a 1.0
   * chega no fundo a 0.45. Sem acumular, um esmaecimento posto num ancestral
   * escaparia da medicao.
   */
  function cumulativeOpacity(from: HTMLElement, stopAt: HTMLElement): number {
    let acc = 1;
    let node: HTMLElement | null = from;
    while (node && node !== stopAt) {
      acc *= Number(getComputedStyle(node).opacity);
      node = node.parentElement;
    }
    return acc;
  }

  /**
   * Contraste REAL do label do item `index` contra o fundo da tab bar, ja
   * descontando toda opacidade aplicada no caminho.
   */
  function effectiveLabelContrast(index: number): number {
    const bar = tabbar();
    const label = itemAt(index).querySelector('.ds-page-nav-item-label') as HTMLElement;
    const bg = cssToRgb(getComputedStyle(bar).backgroundColor);
    const fg = cssToRgb(getComputedStyle(label).color);
    const alpha = cumulativeOpacity(label, bar);
    return contrastRatio(composite(fg, bg, alpha), bg);
  }

  it('o estado concluido e visivel quando o step usa iconSrc', () => {
    // 'seo' e a aba corrente => 'informacoes' (completed) e 'aulas' (pending)
    // sao ambas INATIVAS. Se as duas renderizam igual, o estado e no-op.
    render(stepsWithIconSrc, 'seo');

    const completedLabel = labelColorAt(0);
    const pendingLabel = labelColorAt(1);

    // 1) a discriminante: concluida e pendente NAO podem renderizar igual.
    expect(completedLabel)
      .withContext('label de step concluida vs pendente')
      .not.toBe(pendingLabel);

    // 2) e cada uma na cor canonica do Figma, nao so "diferentes".
    expect(completedLabel).toBe(COMPLETED);
    expect(pendingLabel).toBe(PENDING);

    // 3) o icone <img>: CSS color nao o alcanca, entao o estado tem de
    //    aparecer no filter. Concluido = asset natural (#3E6FCA baked),
    //    pendente = dessaturado.
    const completedImg = itemAt(0).querySelector('.ds-page-nav-item-icon-img') as HTMLElement;
    const pendingImg = itemAt(1).querySelector('.ds-page-nav-item-icon-img') as HTMLElement;

    expect(completedImg).withContext('step concluida deve renderizar <img>').toBeTruthy();
    expect(pendingImg).withContext('step pendente deve renderizar <img>').toBeTruthy();

    const completedFilter = getComputedStyle(completedImg).filter;
    const pendingFilter = getComputedStyle(pendingImg).filter;

    expect(completedFilter)
      .withContext('icone de step concluida usa o asset na cor natural')
      .toBe('none');

    // NAO usar `.not.toBe('none')` aqui: esse predicado aceita
    // `brightness(1)`. O que segura o estado e a medicao do pixel — ver o
    // teste "o icone pendente e visivelmente distinto do concluido".
    expect(maxChannelDelta(
      pixelAfterFilter(pendingFilter, ASSET_STROKE),
      pixelAfterFilter(completedFilter, ASSET_STROKE),
    ))
      .withContext('icone de step pendente precisa ser dessaturado — sem isso o estado e invisivel em <img>')
      .toBeGreaterThanOrEqual(30);
  });

  it('o estado concluido e visivel quando o step usa ng-icon', () => {
    render(stepsWithNgIcon, 'seo');

    const completedLabel = labelColorAt(0);
    const pendingLabel = labelColorAt(1);

    expect(completedLabel).not.toBe(pendingLabel);
    expect(completedLabel).toBe(COMPLETED);
    expect(pendingLabel).toBe(PENDING);

    const completedIcon = itemAt(0).querySelector('.ds-page-nav-item-icon') as HTMLElement;
    const pendingIcon = itemAt(1).querySelector('.ds-page-nav-item-icon') as HTMLElement;

    expect(completedIcon).withContext('step concluida deve renderizar <ng-icon>').toBeTruthy();
    expect(pendingIcon).withContext('step pendente deve renderizar <ng-icon>').toBeTruthy();

    // O verde #16A34A que estava aqui nao existe no Figma — a cor de
    // concluido e #3E6FCA, a mesma do texto.
    expect(getComputedStyle(completedIcon).color).toBe(COMPLETED);
    expect(getComputedStyle(pendingIcon).color).toBe(PENDING);
  });

  it('step bloqueado continua nao-clicavel', () => {
    render(stepsWithIconSrc, 'informacoes');

    const emitted: string[] = [];
    fixture.componentInstance.stepClick.subscribe((id: string) => emitted.push(id));

    const blocked = itemAt(2); // 'seo', disabled: true
    expect(blocked.disabled).withContext('step disabled tem o atributo disabled').toBe(true);

    blocked.click();
    fixture.detectChanges();

    expect(emitted)
      .withContext('click em step bloqueada nao pode emitir stepClick')
      .toEqual([]);

    // e a navegacao para as liberadas continua funcionando
    itemAt(1).click();
    fixture.detectChanges();
    expect(emitted).toEqual(['aulas']);
  });

  // ==========================================================================
  // W1c — o no-op visual que protege o no-op visual.
  // ==========================================================================

  it('o icone pendente e visivelmente distinto do concluido', () => {
    render(stepsWithIconSrc, 'seo'); // 0 = concluida, 1 = pendente

    const completedFilter = getComputedStyle(iconImgAt(0)).filter;
    const pendingFilter = getComputedStyle(iconImgAt(1)).filter;

    // O <img> renderiza o MESMO asset nos dois estados (mesmo `iconSrc`), com
    // o traco baked em #3E6FCA. Toda a diferenca tem de vir do filtro — entao
    // e o filtro que se mede, aplicado a essa cor.
    const completedPx = pixelAfterFilter(completedFilter, ASSET_STROKE);
    const pendingPx = pixelAfterFilter(pendingFilter, ASSET_STROKE);

    // 1) DISTINCAO. A cadeia real afasta os dois em ~102 num canal; qualquer
    //    identidade (`none`, `brightness(1)`, `saturate(1)`) devolve 0. O
    //    piso 30 e folgado o bastante para nao ser fragil e apertado o
    //    bastante para nenhum no-op passar.
    expect(maxChannelDelta(completedPx, pendingPx))
      .withContext(
        `concluido ${show(completedPx)} vs pendente ${show(pendingPx)} — ` +
        'se a distancia e pequena, o estado pendente e um no-op visual em <img>',
      )
      .toBeGreaterThanOrEqual(30);

    // 2) DIRECAO. Nao basta "diferente": o pendente tem de cair no tom que o
    //    Figma EXPORTA para step nao concluida (#A1B5C8 nos SVGs de
    //    590:3150). Isto ancora o teste numa fonte externa — a cadeia de
    //    filtro nao pode ser trocada por outra qualquer que so "mude" o pixel.
    expect(maxChannelDelta(pendingPx, hexToRgb(FIGMA_PENDING_ICON)))
      .withContext(
        `pendente ${show(pendingPx)} vs alvo Figma ${FIGMA_PENDING_ICON} ` +
        `${show(hexToRgb(FIGMA_PENDING_ICON))}`,
      )
      .toBeLessThanOrEqual(10);

    // 3) O concluido e o asset INTACTO — a paleta baked ja e a de concluido.
    expect(maxChannelDelta(completedPx, hexToRgb(ASSET_STROKE)))
      .withContext(`concluido ${show(completedPx)} deveria ser o asset natural ${ASSET_STROKE}`)
      .toBeLessThanOrEqual(1);
  });

  it('um filtro identidade nao passa por estado pendente', () => {
    // (a) O INSTRUMENTO mede efeito, nao string. Se Canvas2D `ctx.filter` nao
    //     estivesse funcionando, tudo abaixo seria vacuo — entao prova-se
    //     primeiro que ele reage: grayscale(1) tem de achatar os 3 canais.
    const gray = pixelAfterFilter('grayscale(1)', '#FF0000');
    expect(gray.r).withContext(`grayscale(1) sobre #FF0000 deu ${show(gray)}`).toBe(gray.g);
    expect(gray.g).toBe(gray.b);

    const IDENTITY = 'brightness(1)';
    const natural = pixelAfterFilter('none', ASSET_STROKE);

    // (b) O predicado FRACO — o que este spec usava — aprova a identidade.
    //     Documentado como asercao para que a fraqueza fique visivel no
    //     proprio arquivo, e nao vire de novo o predicado padrao.
    expect(IDENTITY)
      .withContext('`.not.toBe("none")` aceita brightness(1): e por isso que ele nao serve')
      .not.toBe('none');

    // (c) O predicado FORTE recusa: brightness(1) devolve o pixel de
    //     concluido, ao milesimo.
    expect(maxChannelDelta(pixelAfterFilter(IDENTITY, ASSET_STROKE), natural))
      .withContext('brightness(1) e a identidade — nao pode contar como estado pendente')
      .toBe(0);

    // (d) E o filtro que a producao aplica de fato passa no predicado forte.
    render(stepsWithIconSrc, 'seo');
    const pendingFilter = getComputedStyle(iconImgAt(1)).filter;
    const pendingPx = pixelAfterFilter(pendingFilter, ASSET_STROKE);

    expect(maxChannelDelta(pendingPx, natural))
      .withContext(
        `filtro de producao "${pendingFilter}" levou ${ASSET_STROKE} para ${show(pendingPx)} — ` +
        'precisa MUDAR o pixel, nao so ser uma string diferente de "none"',
      )
      .toBeGreaterThanOrEqual(30);
  });

  it('step bloqueado permanece legivel', () => {
    // 'informacoes' e a corrente => idx 1 ('aulas') e pendente-navegavel e
    // idx 2 ('seo') e pendente-BLOQUEADA. As duas usam a mesma cor de texto;
    // a diferenca so pode estar em esmaecimento.
    render(stepsWithIconSrc, 'informacoes');

    const pendingRatio = effectiveLabelContrast(1);
    const blockedRatio = effectiveLabelContrast(2);

    // 1) O Figma NAO tem estado dim. Em 590:1121 e em 590:3150, TODA step
    //    nao-corrente e `text-[#8599ac]` com opacidade cheia — nao existe
    //    segunda camada de esmaecimento para "bloqueada". Empilhar uma sobre
    //    a cor ja dessaturada de pending soma os dois efeitos e derruba o
    //    contraste de 2.64:1 para 1.49:1 (pior, inclusive, que o 1.81:1 que
    //    a barra tinha antes desta entrega).
    expect(blockedRatio)
      .withContext(
        `bloqueada ${blockedRatio.toFixed(3)}:1 vs pendente ${pendingRatio.toFixed(3)}:1 — ` +
        'bloqueada nao pode ser MAIS apagada que pendente; o Figma nao esmaece',
      )
      .toBeCloseTo(pendingRatio, 2);

    // 2) Piso absoluto: o proprio token de pending do Figma (#8599AC) sobre a
    //    tab bar (#EFF3F8) da 2.636:1. Isto pega uma futura mudanca de paleta
    //    que esmaeca AS DUAS juntas — caso em que a asercao (1) continuaria
    //    verde.
    expect(blockedRatio)
      .withContext(`contraste efetivo da step bloqueada: ${blockedRatio.toFixed(3)}:1`)
      .toBeGreaterThanOrEqual(2.5);

    // 3) Legibilidade nao pode custar a AFFORDANCE. Sem o esmaecimento, o
    //    cursor passa a ser o sinal restante de "bloqueada" — entao ele fica
    //    pinado aqui, junto.
    expect(getComputedStyle(itemAt(2)).cursor)
      .withContext('step bloqueada precisa sinalizar o bloqueio pelo cursor')
      .toBe('not-allowed');
  });

  /*
    ⭐⭐ SCROLL HORIZONTAL SEM BARRA — pedido do fundador em 2026-10-26, sobre o nav de
    `setup/website`, que passou a ter 11 abas.

    > *"precisaremos de um scroll x neste nav, porém sem barra de rolagem aparente. Apenas o
    > movimento de scroll horizontal, sendo acionado tanto por clique e arraste, quanto por
    > movimento do cursor (caso do trackpad do macbook com dois dedos)."*

    ⛔⛔ **A ASSERÇÃO QUE MAIS IMPORTA NÃO É O `overflow` — É O `safe center`.** `justify-content:
    center` com conteúdo maior que a caixa transborda **para os dois lados**, e não existe scroll
    negativo: os primeiros itens ficam **inalcançáveis**. ⇒ ligar o scroll sem `safe` entregaria
    uma barra que rola e ainda assim esconde abas, que é pior que o problema original.
    ⚠️ E o `padding`/`margin` tem razão de correção, não de estética: CSS **promove**
    `overflow-y: visible` a `auto` quando o outro eixo rola, então o anel de 5px do item ativo
    seria CORTADO — e é justamente o que o `overflow: visible` da tabbar existe para proteger.
  */
  describe('o scroll horizontal do nav', () => {
    const itens = (): HTMLElement =>
      fixture.nativeElement.querySelector('.ds-page-nav-items') as HTMLElement;

    it('⭐⭐ rola na horizontal e a barra NÃO aparece', () => {
      render(stepsWithIconSrc, 'informacoes');
      const estilo = getComputedStyle(itens());

      expect(estilo.overflowX).toBe('auto');
      /* `scrollbar-width: none` é o padrão; o `::-webkit-scrollbar` não é observável aqui. */
      expect(estilo.scrollbarWidth).toBe('none');
      /* Toque segue rolando nativamente, e o gesto vertical fica para a página. */
      expect(estilo.touchAction).toBe('pan-x');
    });

    it('⭐⭐⭐ `safe center`: com transbordo, o PRIMEIRO item não fica inalcançável', () => {
      render(stepsWithIconSrc, 'informacoes');
      const container = itens();

      /*
        Força o transbordo com a própria caixa, sem depender da largura do iframe do Karma: 40px
        de largura é menor que qualquer item, então `scrollWidth > clientWidth` com certeza.
      */
      container.style.width = '40px';
      container.style.flex = '0 0 auto';
      container.scrollLeft = 0;

      expect(container.scrollWidth).withContext('o cenário precisa transbordar').toBeGreaterThan(
        container.clientWidth,
      );

      /*
        ⛔ O PREDICADO QUE DISTINGUE: com `center`, o conteúdo transborda à esquerda e o primeiro
        item fica com a borda ANTES da borda do container, em `scrollLeft: 0` — inalcançável. Com
        `safe center`, o alinhamento cai para o início e as bordas coincidem.
      */
      const bordaDoContainer = container.getBoundingClientRect().left;
      const bordaDoPrimeiro = itemAt(0).getBoundingClientRect().left;
      expect(bordaDoPrimeiro).toBeGreaterThanOrEqual(bordaDoContainer - 1);
    });

    it('⛔ o anel do item ativo tem folga vertical — senão o scroll o CORTA', () => {
      render(stepsWithIconSrc, 'informacoes');
      const estilo = getComputedStyle(itens());

      /* 10px de cada lado: o anel é `0 0 0 5px`, e o negativo devolve o layout. */
      expect(estilo.paddingTop).toBe('10px');
      expect(estilo.paddingBottom).toBe('10px');
      expect(estilo.marginTop).toBe('-10px');
      expect(estilo.marginBottom).toBe('-10px');
    });
  });

  /*
    ⭐⭐ O ARRASTE, e o risco dele NÃO é o arraste: é o CLIQUE.

    Os itens são `<button>`. Drag-to-scroll ingênuo faz **cada arraste trocar de aba** — e o
    gestor perde o formulário que estava preenchendo. ⇒ limiar + supressão do `click`, e são estes
    dois casos que valem a diretiva existir.
    ⚠️ O trackpad NÃO aparece aqui porque não passa por código nosso: dois dedos na horizontal é
    nativo do container rolável. O caso acima (`overflowX`) é o que o cobre.
  */
  describe('arrastar para rolar', () => {
    const itens = (): HTMLElement =>
      fixture.nativeElement.querySelector('.ds-page-nav-items') as HTMLElement;

    const apertar = (el: HTMLElement, x: number) =>
      el.dispatchEvent(
        new PointerEvent('pointerdown', {
          clientX: x,
          button: 0,
          pointerId: 1,
          pointerType: 'mouse',
          bubbles: true,
        }),
      );
    const mover = (el: HTMLElement, x: number) =>
      el.dispatchEvent(
        new PointerEvent('pointermove', {
          clientX: x,
          pointerId: 1,
          pointerType: 'mouse',
          bubbles: true,
          cancelable: true,
        }),
      );
    const soltar = (el: HTMLElement) =>
      el.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, pointerType: 'mouse', bubbles: true }));

    function comTransbordo(): HTMLElement {
      render(stepsWithIconSrc, 'informacoes');
      const container = itens();
      container.style.width = '40px';
      container.style.flex = '0 0 auto';
      container.scrollLeft = 0;
      return container;
    }

    it('⭐⭐ arrastar para a esquerda avança o scroll', () => {
      const container = comTransbordo();

      apertar(container, 200);
      mover(container, 140);
      soltar(container);

      expect(container.scrollLeft).toBeGreaterThan(0);
    });

    it('⭐⭐⭐ arrastar NÃO troca de aba — o clique é suprimido', () => {
      const container = comTransbordo();
      let cliquesRecebidos = 0;
      fixture.componentInstance.stepClick.subscribe(() => cliquesRecebidos++);

      apertar(container, 200);
      mover(container, 140);
      soltar(container);
      /* O `click` que o navegador dispara depois do `pointerup` sobre o botão. */
      itemAt(0).click();

      expect(cliquesRecebidos).withContext('arrastar navegou — o gestor perderia o formulário').toBe(0);
    });

    it('⛔ CLIQUE COMUM continua navegando — o limiar protege a mão que treme', () => {
      const container = comTransbordo();
      let cliquesRecebidos = 0;
      fixture.componentInstance.stepClick.subscribe(() => cliquesRecebidos++);

      apertar(container, 200);
      /* 2px: abaixo do limiar de 4px ⇒ é clique, não arraste. */
      mover(container, 198);
      soltar(container);
      itemAt(0).click();

      expect(cliquesRecebidos).withContext('o nav parou de responder a clique').toBe(1);
      expect(container.scrollLeft).withContext('não devia ter rolado').toBe(0);
    });
  });
});
