import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import {
  camposInvalidos,
  focarPrimeiroInvalido,
  mensagemDeCamposInvalidos,
} from './campos-invalidos';

/**
 * ============================================================================
 * `DEF.10` — a rede do utilitário que NOMEIA o campo
 * ============================================================================
 *
 * ⛔ O defeito de origem (smoke `E2`): *"Preencha os campos obrigatórios"* sem dizer qual.
 *
 * ⭐ **O rótulo é lido do DOM de propósito**, então estas specs montam DOM de verdade — o
 * Karma roda num Chrome real, e testar a leitura do rótulo contra um objeto dublado provaria
 * exatamente o que não importa.
 */
describe('campos-invalidos (`DEF.10`)', () => {
  let fb: FormBuilder;
  let hospedeiro: HTMLElement;

  beforeEach(() => {
    fb = new FormBuilder();
    hospedeiro = document.createElement('div');
    document.body.appendChild(hospedeiro);
  });

  afterEach(() => hospedeiro.remove());

  /** Monta o que o `ds-form-field` renderiza: um `<label>` e o controle dentro dele. */
  function campoNaTela(nome: string, rotulo: string, tag = 'input') {
    hospedeiro.insertAdjacentHTML(
      'beforeend',
      `<ds-form-field><label>${rotulo}</label><${tag} formControlName="${nome}" tabindex="0"></${tag}></ds-form-field>`,
    );
  }

  describe('quais campos barram', () => {
    let form: FormGroup;

    beforeEach(() => {
      form = fb.group({
        title: ['', [Validators.required, Validators.minLength(3)]],
        duracao: [5, [Validators.required, Validators.min(15)]],
        descricao: ['tudo certo'],
      });
      campoNaTela('title', 'Título da Live');
      campoNaTela('duracao', 'Duração (minutos)');
    });

    it('⭐ devolve só os inválidos, com o RÓTULO QUE ESTÁ NA TELA', () => {
      const campos = camposInvalidos(form, hospedeiro);

      expect(campos.map((c) => c.nome)).toEqual(['title', 'duracao']);
      expect(campos[0].rotulo).toBe('Título da Live');
      expect(campos[1].rotulo).toBe('Duração (minutos)');
    });

    it('⭐ e o MOTIVO em português, com o número do validador', () => {
      const campos = camposInvalidos(form, hospedeiro);

      expect(campos[0].motivo).toBe('é obrigatório');
      expect(campos[1].motivo).toBe('não pode ser menor que 15');
    });

    it('⛔ campo válido não entra — a lista é o que FALTA, não o formulário inteiro', () => {
      expect(camposInvalidos(form, hospedeiro).some((c) => c.nome === 'descricao')).toBeFalse();
    });

    it('⛔ campo DESABILITADO não entra, mesmo inválido: o usuário não pode preenchê-lo', () => {
      const comDesabilitado = fb.group({ preco: [{ value: null, disabled: true }, Validators.required] });

      expect(camposInvalidos(comDesabilitado, hospedeiro).length).toBe(0);
    });

    it('⛔ sem rótulo na tela, o recuo é NOMEADO — o nome do controle, nunca "campo"', () => {
      const semTela = fb.group({ timezone: ['', Validators.required] });

      expect(camposInvalidos(semTela, hospedeiro)[0].rotulo).toBe('timezone');
    });

    it('⛔ validador desconhecido vira "valor inválido", não some da lista', () => {
      const comCustomizado = fb.group({ x: ['', () => ({ inventado: true })] });

      expect(camposInvalidos(comCustomizado, hospedeiro)[0].motivo).toBe('está com um valor inválido');
    });
  });

  describe('a frase do toast', () => {
    it('⭐ um campo: diz o campo e o motivo', () => {
      expect(
        mensagemDeCamposInvalidos([{ nome: 'title', rotulo: 'Título da Live', motivo: 'é obrigatório' }]),
      ).toBe('Título da Live é obrigatório.');
    });

    it('⭐ vários: nomeia o primeiro e CONTA o resto (toast não comporta lista)', () => {
      const frase = mensagemDeCamposInvalidos([
        { nome: 'title', rotulo: 'Título da Live', motivo: 'é obrigatório' },
        { nome: 'a', rotulo: 'A', motivo: 'é obrigatório' },
        { nome: 'b', rotulo: 'B', motivo: 'é obrigatório' },
      ]);

      expect(frase).toContain('Título da Live é obrigatório');
      expect(frase).toContain('mais 2 campos');
    });

    it('⛔ dois campos dizem "1 campo", no singular', () => {
      const frase = mensagemDeCamposInvalidos([
        { nome: 'a', rotulo: 'A', motivo: 'é obrigatório' },
        { nome: 'b', rotulo: 'B', motivo: 'é obrigatório' },
      ]);

      expect(frase).toContain('mais 1 campo ');
    });

    it('⛔ lista vazia não produz frase — toast vazio é pior que toast nenhum', () => {
      expect(mensagemDeCamposInvalidos([])).toBe('');
    });
  });

  describe('levar o usuário até o campo', () => {
    it('⭐ foca o primeiro pendente — é o que resolve, não a mensagem', () => {
      campoNaTela('title', 'Título da Live');
      const foi = focarPrimeiroInvalido(
        [{ nome: 'title', rotulo: 'Título da Live', motivo: 'é obrigatório' }],
        hospedeiro,
      );

      expect(foi).toBeTrue();
      expect(document.activeElement?.getAttribute('formControlName')).toBe('title');
    });

    it('⛔ campo fora da tela (aba fechada, card recolhido) devolve FALSE — quem chama não pode supor que rolou', () => {
      const foi = focarPrimeiroInvalido(
        [{ nome: 'escondido', rotulo: 'X', motivo: 'é obrigatório' }],
        hospedeiro,
      );

      expect(foi).toBeFalse();
    });
  });
});
