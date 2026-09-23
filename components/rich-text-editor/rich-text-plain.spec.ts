import { richTextToPlainText } from './rich-text-canonical';

/**
 * `DEF.8` — lista, cartão e tabela mostram RESUMO: precisam de texto puro, não de HTML nem do JSON do editor.
 * ⛔ A 3ª ocorrência da família (blog · Sobre · combo) provou que achar de um em um não funciona.
 */
describe('richTextToPlainText (`DEF.8`)', () => {
  const doc = (...paragrafos: string[]) => ({
    type: 'doc',
    content: paragrafos.map((t) => ({ type: 'paragraph', content: [{ type: 'text', text: t }] })),
  });

  it('⭐ string JSON do editor vira o texto, sem chave nem colchete', () => {
    expect(richTextToPlainText(JSON.stringify(doc('Combo teste')))).toBe('Combo teste');
  });

  it('⭐ objeto do ProseMirror (o dado LEGADO) também', () => {
    expect(richTextToPlainText(doc('Combo teste'))).toBe('Combo teste');
  });

  it('⛔ parágrafos NÃO colam: viram espaço', () => {
    expect(richTextToPlainText(doc('Aula 1', 'Aula 2'))).toBe('Aula 1 Aula 2');
  });

  it('⭐ texto puro legado volta intacto — e o vazio vira vazio', () => {
    expect(richTextToPlainText('Descrição antiga')).toBe('Descrição antiga');
    expect(richTextToPlainText('')).toBe('');
    expect(richTextToPlainText(null)).toBe('');
    expect(richTextToPlainText(undefined)).toBe('');
  });

  it('⛔ string que PARECE JSON e não é: devolve o texto, não engole', () => {
    expect(richTextToPlainText('{isto não é json}')).toBe('{isto não é json}');
  });
});
