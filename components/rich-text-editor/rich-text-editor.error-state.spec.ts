import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RichTextEditorComponent } from './rich-text-editor.component';

/**
 * ⚠️ **ESTA SPEC NASCE DE UMA MUTAÇÃO QUE SOBREVIVEU** (`D.3.5.9 / 9e`,
 * 2026-08-15).
 *
 * O `hasError` foi implementado, a suíte ficou verde com 1.212 testes, e eu ia
 * fechar o sub-bloco. A mutação obrigatória — remover
 * `[class.ds-rich-text-editor--error]` do template — **passou**: nada quebrou.
 *
 * Ou seja: a borda vermelha podia sumir do produto inteiro sem um único teste
 * reclamar. É o mesmo padrão das quatro sobreviventes de 2026-08-14 — testei o
 * que era fácil (o `computed` do consumidor) e não o que o usuário vê (a classe
 * no DOM).
 *
 * O `<ds-rich-text-editor>` não tinha spec nenhuma até aqui.
 */
describe('<ds-rich-text-editor> — estado de erro (9e)', () => {
  let fixture: ComponentFixture<RichTextEditorComponent>;

  async function montar(hasError?: boolean, readOnly = false): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [RichTextEditorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RichTextEditorComponent);
    if (hasError !== undefined) {
      fixture.componentRef.setInput('hasError', hasError);
    }
    fixture.componentRef.setInput('readOnly', readOnly);
    fixture.detectChanges();
  }

  function raiz(): HTMLElement {
    return fixture.nativeElement.querySelector('.ds-rich-text-editor') as HTMLElement;
  }

  it('sem `hasError`, nasce SEM a classe de erro', async () => {
    await montar();

    expect(raiz().classList).not.toContain('ds-rich-text-editor--error');
  });

  it('`hasError=true` aplica a classe de erro no DOM', async () => {
    // ⚠️ A asserção é sobre a CLASSE, não sobre o input: foi exatamente o que
    // faltava quando a mutação sobreviveu.
    await montar(true);

    expect(raiz().classList).toContain('ds-rich-text-editor--error');
  });

  it('`hasError=false` NÃO aplica', async () => {
    await montar(false);

    expect(raiz().classList).not.toContain('ds-rich-text-editor--error');
  });

  it('reage à mudança do input sem remontar', async () => {
    await montar(false);
    expect(raiz().classList).not.toContain('ds-rich-text-editor--error');

    fixture.componentRef.setInput('hasError', true);
    fixture.detectChanges();

    expect(raiz().classList).toContain('ds-rich-text-editor--error');
  });

  it('marca `aria-invalid` — o aviso não pode ser só visual', async () => {
    await montar(true);

    expect(raiz().getAttribute('aria-invalid')).toBe('true');
  });

  it('sem erro, `aria-invalid` fica AUSENTE, não `"false"`', async () => {
    // `aria-invalid="false"` é ruído para leitor de tela: ele anuncia o estado
    // de um campo que não tem problema nenhum.
    await montar(false);

    expect(raiz().hasAttribute('aria-invalid')).toBeFalse();
  });

  it('o erro convive com o modo leitura', async () => {
    // Um campo legado acima do teto abre em `view` e continua inválido — as
    // duas classes têm de coexistir sem uma apagar a outra.
    await montar(true, true);

    expect(raiz().classList).toContain('ds-rich-text-editor--error');
    expect(raiz().classList).toContain('ds-rich-text-editor--read-only');
  });
});
