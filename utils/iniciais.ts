/**
 * ============================================================================
 * `DIV-D3-1` — A REGRA DE INICIAIS, e ela passa a existir **uma vez**
 * ============================================================================
 *
 * ⛔ **A DÍVIDA CRESCEU DUAS VEZES ENQUANTO ESTAVA REGISTRADA.** Medida em três momentos:
 *
 * ```
 * quando foi escrita        ->  5 implementações
 * remedida em 2026-08-22    ->  9   ("a dívida DOBROU")
 * remedida em 2026-09-10    ->  12
 * ```
 *
 * 📌 **É o argumento inteiro deste arquivo.** O plano original era *"escolher a regra e aplicar
 * nos N lugares"* — e aplicar a mesma regra em N lugares é **exatamente como ela dobrou duas
 * vezes**. Enquanto a regra não tiver um dono, o 13º lugar nasce na próxima tela.
 *
 * ⭐ **DECISÃO DO FUNDADOR (`AS`, 2026-09-10): primeira letra do PRIMEIRO nome + primeira do
 * ÚLTIMO.** `"Ana Maria Silva"` → `AS`, e não `AM`.
 *
 * ⚠️ **E o Gate 1 achou a decisão JÁ IMPLEMENTADA no destino:** `ds-thumbnail-avatar` já fazia
 * `AS`. ⇒ a metade *"aplicar `AS` no DS"* do plano refinado **não tinha objeto**; o trabalho
 * real era extrair a regra de lá e repontar quem discordava. Das 9 que analisam um nome
 * completo, **4 faziam `AM`** e mudam na tela: `list-widget`, `sidebar-left-nav`,
 * `ticket-form` e `testimonials-section`.
 *
 * ⛔ **POR QUE ISTO MORA NO DESIGN SYSTEM.** O passo 1 da árvore de placement pergunta *"faria
 * sentido em outro projeto Angular sem nada de Singulai?"* — e iniciais de um nome não sabem o
 * que é tenant, curso ou aluno. Responde **sim** ⇒ DS. É também de onde o
 * `ds-thumbnail-avatar` precisa importá-la, e o DS não pode depender de `app/shared`.
 *
 * ⚠️ **CONSEQUÊNCIA DE PROCESSO, e ela não é opcional:** tocar `design-system/**` **RETÉM o
 * push em `main`** (regra do fundador, 2026-09-02) — `main` dispara o `ds-mirror` para o
 * repositório **público** `singulai-ui`.
 */

/**
 * Iniciais de um nome completo. **Máximo 2 letras, maiúsculas.**
 *
 * ```
 * iniciaisDe('Ana Maria Silva')  ->  'AS'   (primeiro + último — a decisão `AS`)
 * iniciaisDe('Ana')              ->  'AN'   (uma palavra só: as 2 primeiras letras)
 * iniciaisDe('  ')               ->  ''     (vazio é vazio, não é '?')
 * ```
 *
 * ⛔ **Devolve `''` para entrada vazia, e NÃO `'?'`.** Duas das implementações substituídas
 * devolviam `'?'` — o que transforma *"não tenho o nome"* em **um caractere que o usuário vê**.
 * Quem quiser um marcador visual decide isso na tela, com o contexto na mão; a função não
 * inventa conteúdo.
 * 📌 É a mesma família de `|| valor`: converter *"não sei"* em algo exibível é decisão de
 * apresentação, e ela não pertence ao cálculo.
 */
export function iniciaisDe(nomeCompleto: string | null | undefined): string {
  const cru = (nomeCompleto ?? '').trim();
  if (!cru) return '';

  const palavras = cru.split(/\s+/).filter(Boolean);
  if (palavras.length === 0) return '';

  // Uma palavra apenas — as 2 primeiras letras. `slice` e não `substring(0,2)` de propósito:
  // para nome de 1 letra ele devolve a letra, sem estourar.
  if (palavras.length === 1) return palavras[0].slice(0, 2).toUpperCase();

  const primeira = palavras[0][0] ?? '';
  const ultima = palavras[palavras.length - 1][0] ?? '';
  return (primeira + ultima).toUpperCase();
}

/**
 * Iniciais quando o nome já vem **em campos separados** — o caso do perfil e da conta, onde
 * `firstName` e `lastName` são colunas e não um texto a ser analisado.
 *
 * ⛔ **NÃO é `iniciaisDe(`${first} ${last}`)`, e a diferença é observável:** com `firstName`
 * vazio e `lastName = 'Silva'`, a concatenação viraria `'Silva'` — uma palavra só — e a regra
 * de palavra única devolveria **`'SI'`**. Aqui devolve **`'S'`**, que é o comportamento atual
 * dos três lugares que a usam.
 * 📌 Preservar isso é o que torna este repontamento uma **refatoração**, e não uma mudança de
 * comportamento disfarçada de limpeza.
 */
export function iniciaisDeCampos(
  primeiroNome: string | null | undefined,
  ultimoNome: string | null | undefined,
): string {
  const a = (primeiroNome ?? '').trim().charAt(0);
  const b = (ultimoNome ?? '').trim().charAt(0);
  return `${a}${b}`.toUpperCase();
}
