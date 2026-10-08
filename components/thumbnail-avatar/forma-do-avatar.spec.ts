import { TestBed } from '@angular/core/testing';

import { ThumbnailAvatarComponent } from './thumbnail-avatar.component';

/**
 * ============================================================================
 * `LEAD-ABAS` `LA.2` / `DEC-LEAD-G` — a FORMA do avatar
 * ============================================================================
 *
 * O timeline do `Chat IA` (Figma `932:17802`) pede avatar **circular** de 26px; o DS entrega
 * quadrado-arredondado. A regra do projeto manda **estender o DS com input novo, default
 * preservando o comportamento atual** — nunca montar o controle por fora.
 *
 * ⛔⛔ **ESTA REDE MEDE O `data-shape` NO DOM, NÃO O SIGNAL.** Afirmar `c.shape() === 'circle'`
 * provaria só que o `input()` guarda o que recebeu — e o defeito que importa mora no SCSS: a
 * regra de círculo tem de vir **DEPOIS** dos blocos de size, senão o `border-radius` do tamanho
 * a sobrescreve e o avatar sai quadrado **com o atributo correto posto**. Defeito mudo.
 * 📌 É a família *"provar a camada não prova a travessia"*.
 *
 * ⚠️ **LIMITE DECLARADO:** o Karma não carrega o SCSS compilado do componente de forma a tornar
 * o `border-radius` efetivo legível por `getComputedStyle` de modo confiável aqui. ⇒ esta rede
 * prova o **atributo que seleciona a regra**; a regra em si é guardada pelo comentário de ordem
 * no SCSS e pelo smoke visual. Isto está dito, não escondido.
 */
describe('ThumbnailAvatarComponent — a forma (LA.2)', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [ThumbnailAvatarComponent] }));

  function render(shape?: 'rounded' | 'circle'): HTMLElement {
    const f = TestBed.createComponent(ThumbnailAvatarComponent);
    f.componentRef.setInput('name', 'John Doe');
    if (shape) f.componentRef.setInput('shape', shape);
    f.detectChanges();
    return (f.nativeElement as HTMLElement).querySelector('.ds-thumbnail-avatar')!;
  }

  /**
   * ⭐ MUTAÇÃO: trocar o default do `shape` para `'circle'`. Esta asserção fica vermelha — e é
   * a que garante que a extensão **não mexeu em nenhum uso que já existe**.
   */
  it('⛔ sem `shape`, o default é `rounded` — nenhum uso existente muda', () => {
    expect(render().getAttribute('data-shape')).toBe('rounded');
  });

  /** ⭐ MUTAÇÃO: apagar o `[attr.data-shape]` do template → vermelha (o seletor some). */
  it('✅ com `shape="circle"`, o atributo que seleciona a regra do SCSS está no DOM', () => {
    expect(render('circle').getAttribute('data-shape')).toBe('circle');
  });

  /**
   * ⚠️ CONTROLE: a forma NÃO pode interferir no tamanho. Sem este caso, uma implementação que
   * trocasse `data-size` por `data-shape` passaria nos dois acima.
   */
  it('⚠️ CONTROLE: `circle` não mexe no `data-size`', () => {
    const el = render('circle');

    expect(el.getAttribute('data-size')).toBe('md');
    expect(el.getAttribute('data-shape')).toBe('circle');
  });
});
