import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';

/**
 * ============================================================================
 * `DEF.10` — QUAL CAMPO FALTA, E O QUE HÁ DE ERRADO COM ELE
 * ============================================================================
 *
 * ⛔ **O DEFEITO QUE ISTO EXISTE PARA MATAR** (smoke do fundador, `E2`): o formulário
 * recusava o submit com *"Preencha os campos obrigatórios"* — **sem dizer qual**. O usuário
 * ficava procurando numa tela de 20 campos qual deles o ofendeu.
 *
 * ⭐ **O RÓTULO SE LÊ DA TELA, NÃO SE COPIA PARA O TS.** Um mapa
 * `{ title: 'Título da Live' }` seria uma segunda cópia do que já está no template, e as
 * duas envelhecem em direções diferentes. Aqui o rótulo sai do `<label>` que o usuário
 * está vendo: do controle inválido, acha `[formControlName="X"]`, sobe até o campo e lê.
 *
 * ⚠️ **Recuo NOMEADO, nunca silencioso:** sem rótulo na tela, devolve o nome do controle.
 * `|| 'campo'` transformaria *"não sei"* numa afirmação inútil — a família de `as X` e
 * `|| valor` que esta base já pagou três vezes.
 */

/** Um campo que barrou o submit, com o rótulo que o usuário vê e o motivo em português. */
export interface CampoInvalido {
  /** O `formControlName` — é por ele que se acha o elemento na tela. */
  nome: string;
  /** O texto do `<label>` renderizado; na ausência dele, o próprio `nome`. */
  rotulo: string;
  /** Por que barrou, já em português e com o número quando o validador o tem. */
  motivo: string;
}

/**
 * Traduz o erro do validador para o que se diz a uma pessoa.
 *
 * ⚠️ **Mapa explícito, com recuo nomeado.** Validador que este mapa não conhece vira
 * *"valor inválido"* — honesto — em vez de sumir da lista e deixar o submit recusado
 * **sem nenhuma explicação**, que é o defeito original em versão menor.
 */
function motivoDoErro(erros: ValidationErrors): string {
  if (erros['required']) return 'é obrigatório';
  if (erros['requiredTrue']) return 'precisa estar marcado';
  if (erros['email']) return 'precisa ser um e-mail válido';

  const min = erros['minlength'] as { requiredLength: number } | undefined;
  if (min) return `precisa ter ao menos ${min.requiredLength} caracteres`;

  const max = erros['maxlength'] as { requiredLength: number } | undefined;
  if (max) return `pode ter no máximo ${max.requiredLength} caracteres`;

  const menor = erros['min'] as { min: number } | undefined;
  if (menor) return `não pode ser menor que ${menor.min}`;

  const maior = erros['max'] as { max: number } | undefined;
  if (maior) return `não pode ser maior que ${maior.max}`;

  if (erros['pattern']) return 'está num formato inválido';

  return 'está com um valor inválido';
}

/** O rótulo que o usuário vê para este controle, ou o próprio nome do controle. */
function rotuloNaTela(hospedeiro: Element | null | undefined, nome: string): string {
  const campo = hospedeiro?.querySelector(`[formControlName="${nome}"]`);
  const rotulo = campo?.closest('ds-form-field')?.querySelector('label')?.textContent;
  const limpo = (rotulo ?? '').replace(/\s+/g, ' ').replace(/\*$/, '').trim();
  return limpo.length > 0 ? limpo : nome;
}

/**
 * Os campos que impedem o submit, **na ordem do formulário** — que é a ordem em que eles
 * aparecem na tela, e portanto a ordem em que a pessoa vai resolvê-los.
 *
 * @param hospedeiro o elemento que contém o formulário; sem ele, os rótulos recuam para o
 *        nome do controle (a função continua útil, só menos legível).
 */
export function camposInvalidos(form: FormGroup, hospedeiro?: Element | null): CampoInvalido[] {
  const invalidos: CampoInvalido[] = [];

  for (const [nome, controle] of Object.entries(form.controls) as [string, AbstractControl][]) {
    /*
      ⚠️ Controle DESABILITADO não entra, e quem o barra é o `!errors` — **medido**, não suposto:
      `disable()` zera `errors` e põe o status em `DISABLED` (`valid` segue `false`).
      ⛔ Havia aqui um `controle.disabled ||` a mais, e a mutação que o removeu SOBREVIVEU —
      nenhuma rede pode distinguir dois termos equivalentes. Guarda sem leitor é cerimônia.
    */
    if (controle.valid || !controle.errors) continue;

    invalidos.push({
      nome,
      rotulo: rotuloNaTela(hospedeiro, nome),
      motivo: motivoDoErro(controle.errors),
    });
  }

  return invalidos;
}

/**
 * A frase do toast. **Nomeia o campo**, e com dois ou mais diz quantos são em vez de
 * despejar a lista inteira num toast que não cabe.
 */
export function mensagemDeCamposInvalidos(campos: CampoInvalido[]): string {
  if (campos.length === 0) return '';

  const primeiro = campos[0];
  if (campos.length === 1) return `${primeiro.rotulo} ${primeiro.motivo}.`;

  const resto = campos.length - 1;
  return `${primeiro.rotulo} ${primeiro.motivo} — e mais ${resto} ${
    resto === 1 ? 'campo' : 'campos'
  } para revisar.`;
}

/**
 * Leva o usuário ao primeiro campo pendente: rola até ele e devolve o foco.
 *
 * ⚠️ **Devolve `true` só quando encontrou o elemento.** Quem chama não pode presumir que
 * rolou — o campo pode estar numa aba fechada ou num card recolhido, e aí a resposta certa
 * é o toast, não uma rolagem que não aconteceu.
 */
export function focarPrimeiroInvalido(
  campos: CampoInvalido[],
  hospedeiro?: Element | null,
): boolean {
  const primeiro = campos[0];
  if (!primeiro || !hospedeiro) return false;

  const alvo = hospedeiro.querySelector(`[formControlName="${primeiro.nome}"]`);
  if (!alvo) return false;

  alvo.scrollIntoView({ behavior: 'smooth', block: 'center' });
  (alvo as HTMLElement).focus?.();
  return true;
}
