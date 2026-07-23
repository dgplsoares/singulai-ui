import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroBookOpen,
  heroVideoCamera,
  heroCheckCircle,
  heroDocumentText,
  heroPencil,
  heroTrash,
  heroEye,
  heroBars3,
  heroPresentationChartBar,
} from '@ng-icons/heroicons/outline';
import { ButtonComponent } from '../button/button.component';
import {
  AccordionItem,
  AccordionItemKind,
} from '../accordion/accordion.types';

/**
 * <ds-accordion-item>
 *
 * Row canonica de "item dentro de modulo" — promovida para standalone em
 * D.1.3.4 (REFAC-1) para reuso fora do `<ds-accordion>`. Originalmente vivia
 * inline no template do accordion (Fase C C.3, DEC-FIG-C-3 + DEC-C-3-B).
 *
 * Pixel-perfect contra Figma 590:3272 (cradBody — modulo do wizard Cursos) e
 * 760:4827 (live row em step-lives). Visual identico nos 2 contextos —
 * standalone elimina duplicacao do `<ds-linked-item>` removido em D.1.3.4.
 *
 * Layout: icon + title a esquerda; badges (variants success/warning/neutral) +
 * actions (ds-button action-icon Eye/Pencil/Trash) a direita.
 *
 * LIGHTMODE-FIRST: zero :host-context(.dark).
 *
 * Consumers atuais:
 * - <ds-accordion> (REFAC-2): renderiza N items dentro do container do modulo
 * - step-lives (REFAC-4): renderiza N lives vinculadas a um curso
 *
 * Quando o `<ds-accordion>` precisar de variants de acao customizadas
 * (ex: heroArrowTopRightOnSquare "abrir em nova aba" da live), a strategy
 * adotada eh ESTENDER `AccordionItem` com novos showXxx flags + outputs aqui.
 * Por enquanto v1 mantem 3 acoes canonicas (view/edit/delete) — step-lives
 * mapeia 3 botoes do Figma para esses outputs:
 *  - "Ver detalhes"          → itemView   (heroEye)
 *  - "Abrir em nova aba"     → itemEdit   (heroPencil reaproveitado)
 *  - "Desvincular live"      → itemDelete (heroTrash)
 *
 * Refator futuro: dar suporte a icones customizados das acoes via prop
 * `[customActions]` opcional (escopo nao incluido aqui).
 */
@Component({
  selector: 'ds-accordion-item',
  standalone: true,
  imports: [CommonModule, NgIcon, ButtonComponent],
  providers: [
    provideIcons({
      heroBookOpen,
      heroVideoCamera,
      heroCheckCircle,
      heroDocumentText,
      heroPencil,
      heroTrash,
      heroEye,
      heroBars3,
      heroPresentationChartBar,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './accordion-item.component.html',
  styleUrl: './accordion-item.component.scss',
})
export class AccordionItemComponent {
  /** Item a renderizar (kind + title + badges + flags showXxx). */
  readonly item = input.required<AccordionItem>();

  // ============================================================================
  // Outputs (eventos das 3 acoes canonicas)
  // ============================================================================
  /** Emitido ao clicar no botao Ver (heroEye, variant info). */
  readonly itemView = output<string>();

  /** Emitido ao clicar no botao Editar (heroPencil, variant info). */
  readonly itemEdit = output<string>();

  /** Emitido ao clicar no botao Excluir (heroTrash, variant danger). */
  readonly itemDelete = output<string>();

  // ============================================================================
  // Helpers
  // ============================================================================
  /** Icone default per kind (sobrescrito por iconSrc/icon do AccordionItem). */
  protected readonly iconName = computed<string>(() => {
    const it = this.item();
    if (it.icon) return it.icon;
    switch (it.kind) {
      case 'ebook': return 'heroBookOpen';
      case 'aula': return 'heroVideoCamera';
      case 'quiz': return 'heroCheckCircle';
      default: return 'heroDocumentText';
    }
  });

  protected readonly showView = computed<boolean>(() => this.item().showView !== false);
  protected readonly showEdit = computed<boolean>(() => this.item().showEdit !== false);
  protected readonly showDelete = computed<boolean>(() => this.item().showDelete !== false);

  protected onView(): void {
    this.itemView.emit(this.item().id);
  }

  protected onEdit(): void {
    this.itemEdit.emit(this.item().id);
  }

  protected onDelete(): void {
    this.itemDelete.emit(this.item().id);
  }
}
