import { iniciaisDe, iniciaisDeCampos } from './iniciais';

/**
 * ============================================================================
 * `DIV-D3-1` — a regra de iniciais, agora com um dono e uma rede
 * ============================================================================
 *
 * ⛔ **A DÍVIDA CRESCEU DUAS VEZES ENQUANTO ESTAVA REGISTRADA:** 5 → 9 → 12 implementações.
 * Nenhuma delas tinha teste — e é por isso que 4 podiam divergir da decisão do fundador sem
 * que nada acusasse.
 *
 * ⭐ **A asserção que carrega a decisão é a do nome de TRÊS palavras.** Com dois nomes, `AS` e
 * `AM` dão o mesmo resultado — uma rede que só testasse `"Ana Silva"` ficaria **verde contra as
 * duas regras** e não distinguiria nada.
 * 📌 É a lição *"rede que testa onde as duas implementações coincidem não distingue"*, e aqui
 * ela é o desenho do teste, não uma observação depois.
 */
describe('`DIV-D3-1` — iniciaisDe', () => {
  it('⭐ TRÊS palavras: primeira + ÚLTIMA (`AS`), que é a decisão do fundador', () => {
    // ⛔ ESTE é o caso que separa `AS` de `AM`. As 4 implementações substituídas que faziam
    //    `AM` devolviam 'AM' aqui.
    expect(iniciaisDe('Ana Maria Silva')).toBe('AS');
    expect(iniciaisDe('José Carlos de Oliveira')).toBe('JO');
  });

  it('duas palavras — o caso em que `AS` e `AM` coincidem, e por isso não prova nada sozinho', () => {
    expect(iniciaisDe('Ana Silva')).toBe('AS');
  });

  it('uma palavra só: as 2 primeiras letras', () => {
    expect(iniciaisDe('Ana')).toBe('AN');
  });

  it('nome de UMA letra não estoura — devolve a letra', () => {
    // `slice(0,2)` e não `substring` com índice fixo: a diferença aparece só aqui.
    expect(iniciaisDe('A')).toBe('A');
  });

  it('⛔ vazio devolve VAZIO, e não `?` — a função não inventa conteúdo para a tela', () => {
    // Duas das implementações substituídas devolviam '?'. Transformar "não tenho o nome" num
    // caractere visível é decisão de APRESENTAÇÃO, e ela ficou em quem renderiza.
    expect(iniciaisDe('')).toBe('');
    expect(iniciaisDe('   ')).toBe('');
    expect(iniciaisDe(null)).toBe('');
    expect(iniciaisDe(undefined)).toBe('');
  });

  it('espaços múltiplos e bordas não criam palavra fantasma', () => {
    expect(iniciaisDe('  Ana   Maria   Silva  ')).toBe('AS');
  });

  it('sempre MAIÚSCULAS', () => {
    expect(iniciaisDe('ana silva')).toBe('AS');
  });
});

describe('`DIV-D3-1` — iniciaisDeCampos', () => {
  it('primeira letra de cada campo', () => {
    expect(iniciaisDeCampos('Ana', 'Silva')).toBe('AS');
  });

  /**
   * ⭐ **A asserção que justifica a função existir separada.**
   *
   * Se o perfil usasse `iniciaisDe(`${first} ${last}`)`, com `firstName` vazio a concatenação
   * viraria `'Silva'` — uma palavra só — e a regra de palavra única devolveria **`'SI'`**.
   * ⇒ Repontar os 3 lugares de campos separados para a função de nome completo teria sido uma
   * MUDANÇA DE COMPORTAMENTO disfarçada de limpeza.
   */
  it('⛔ campo ausente devolve UMA letra, não duas do outro campo', () => {
    expect(iniciaisDeCampos('', 'Silva')).toBe('S');
    expect(iniciaisDeCampos('Ana', '')).toBe('A');
    expect(iniciaisDe(' Silva')).toBe('SI'); // o contraste, medido
  });

  it('nulo e indefinido não viram "undefined"', () => {
    expect(iniciaisDeCampos(null, undefined)).toBe('');
  });
});
