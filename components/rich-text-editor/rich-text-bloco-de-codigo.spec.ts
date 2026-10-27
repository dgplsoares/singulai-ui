import { richTextToDisplayHtml } from './rich-text-canonical';

/**
 * ⭐⭐ `PROSA-CODIGO` (fundador, 2026-10-26) — A SUPERFÍCIE QUE VEM **ANTES** DO CSS.
 *
 * > *"No article, quando eu insiro um conteúdo do tipo bloco de código, o bloco não está formatado
 * > como bloco de código."*
 *
 * ⛔ **ESTE É O CASO QUE DECIDE SE O CSS TEM OBJETO.** O bloco de código nasce no
 * `<ds-rich-text-editor>` (botão `toggleCodeBlock`, Tiptap) e chega ao portal pelo
 * `richTextToDisplayHtml`. Se a serialização **não** produzisse `<pre><code>`, nenhuma regra de
 * CSS do mundo resolveria o pedido — e eu teria estilizado uma tag que não existe.
 *
 * ⚠️ E a premissa era frágil de propósito: `RTE_EXTENSIONS` declara `StarterKit`, e a extensão
 * `codeBlock` vem **de dentro dele**, não escrita na lista. Ou seja: a cobertura depende da
 * versão do pacote, e **nada no repo a afirmava**. Uma atualização do StarterKit que mudasse a
 * tag de saída quebraria as 4 telas em silêncio.
 * ⇒ é por isso que este caso existe como rede, e não como medição de uma vez.
 */
describe('richTextToDisplayHtml — o bloco de código (`PROSA-CODIGO`)', () => {
  const docComCodigo = (codigo: string) => ({
    type: 'doc',
    content: [{ type: 'codeBlock', content: [{ type: 'text', text: codigo }] }],
  });

  it('⭐⭐ bloco de código vira `<pre><code>` — a tag que o CSS global estiliza', () => {
    const html = richTextToDisplayHtml(docComCodigo('npm run build'));

    expect(html).toContain('<pre');
    expect(html).toContain('<code');
    expect(html).toContain('npm run build');
  });

  it('⭐ e sobrevive ao caminho REAL de persistência: string JSON, não objeto', () => {
    /* O painel grava `JSON.stringify(...)`; é esta a forma que chega do banco. */
    const html = richTextToDisplayHtml(JSON.stringify(docComCodigo('SELECT 1;')));

    expect(html).toContain('<pre');
    expect(html).toContain('SELECT 1;');
  });

  /*
    ⛔ O CASO QUE DISTINGUE BLOCO DE TRECHO, e eles recebem CSS diferente: `code` solto é trecho
    dentro da frase (fundo discreto); dentro de `<pre>` ele perde o tratamento, senão ficam dois
    fundos e dois paddings encaixados. Sem este caso, a rede não saberia dizer qual é qual.
  */
  it('⛔ `code` como MARCA de texto não vira bloco — não há `<pre>`', () => {
    const html = richTextToDisplayHtml({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Rode ' },
            { type: 'text', marks: [{ type: 'code' }], text: 'ng build' },
          ],
        },
      ],
    });

    expect(html).toContain('<code');
    expect(html).not.toContain('<pre');
  });
});
