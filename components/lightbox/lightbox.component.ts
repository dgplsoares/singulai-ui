import { ChangeDetectionStrategy, Component, HostListener, computed, input, linkedSignal, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronLeft, heroChevronRight, heroXMark } from '@ng-icons/heroicons/outline';

/**
 * ============================================================================
 * `ds-lightbox` — AMPLIAR UMA IMAGEM DE UMA COLEÇÃO (`PORT.3`)
 * ============================================================================
 *
 * ⭐ **Por que no DS e não em `shared`:** o decision tree pergunta *"faria sentido em outro projeto
 * Angular sem nada de Singulai — sem cursos, alunos, agentes, multi-tenant?"*. Ampliar uma imagem
 * de uma lista, navegar com as setas e fechar no `Esc` não tem nada do produto. ⇒ DS.
 *
 * ⛔ **Não é o `app-modal-dialog`**, e a diferença não é estética: o modal é uma CAIXA com título,
 * corpo e rodapé sobre um fundo claro; aqui a imagem **é** o conteúdo, ocupa a tela e o fundo é
 * quase preto. Envelopar o modal para esconder tudo o que ele desenha custaria mais que os 60
 * elementos deste template.
 *
 * ⛔ **LIGHTMODE-FIRST não se aplica ao fundo:** o escuro aqui não é *tema*, é a convenção de
 * visualizador de imagem (a referência do Figma Make usa `rgba(0,0,0,.92)`). Não há `dark:` nem
 * `:host-context(.dark)` — a cor é incondicional, como o `.pdf-viewer` já faz.
 *
 * ⚠️ **A navegação dá a VOLTA** (`%`), como na referência: na última, *próxima* leva à primeira.
 * Sem isso o usuário fica preso no fim sem saber por quê.
 */
@Component({
  selector: 'ds-lightbox',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon],
  viewProviders: [provideIcons({ heroXMark, heroChevronLeft, heroChevronRight })],
  templateUrl: './lightbox.component.html',
  styleUrl: './lightbox.component.scss',
})
export class LightboxComponent {
  /** As imagens da coleção, na ordem em que a tela as mostra. */
  readonly imagens = input<readonly string[]>([]);

  /** `null` = fechado. Número = o índice aberto. */
  readonly aberto = input<number | null>(null);

  /** O texto alternativo base; o índice é acrescentado ("… — imagem 2 de 5"). */
  readonly rotulo = input<string>('Imagem');

  readonly fechar = output<void>();

  /**
   * O índice VISÍVEL: nasce do que ABRIU e anda com as setas.
   *
   * ⛔ **A 1ª versão era um `computed` que ESCREVIA um signal** — `NG0600: Writing to signals is
   * not allowed in a computed`, e foram 3 casos da rede que pegaram, não o `tsc`. O que eu queria
   * é exatamente `linkedSignal`: um estado **derivado de uma fonte** que também aceita escrita
   * local, e que se REINICIA quando a fonte muda (abrir outra imagem recomeça dali).
   */
  readonly indice = linkedSignal({
    source: this.aberto,
    computation: (abriu: number | null, anterior?: { source: number | null; value: number }) =>
      abriu ?? anterior?.value ?? 0,
  });

  readonly total = computed(() => this.imagens().length);
  readonly atual = computed(() => this.imagens()[this.indice()] ?? null);
  readonly temVarias = computed(() => this.total() > 1);

  readonly descricao = computed(() =>
    this.temVarias() ? `${this.rotulo()} — imagem ${this.indice() + 1} de ${this.total()}` : this.rotulo(),
  );

  anterior(): void {
    if (this.temVarias()) this.indice.set((this.indice() - 1 + this.total()) % this.total());
  }

  proxima(): void {
    if (this.temVarias()) this.indice.set((this.indice() + 1) % this.total());
  }

  @HostListener('document:keydown.escape')
  aoEscape(): void {
    if (this.aberto() !== null) this.fechar.emit();
  }

  @HostListener('document:keydown.arrowleft')
  aoEsquerda(): void {
    if (this.aberto() !== null) this.anterior();
  }

  @HostListener('document:keydown.arrowright')
  aoDireita(): void {
    if (this.aberto() !== null) this.proxima();
  }
}
