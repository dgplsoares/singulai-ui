import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroBookOpen,
  heroVideoCamera,
  heroCheckCircle,
  heroDocumentText,
  heroPencilSquare,
  heroPencil,
  heroTrash,
  heroPlus,
  heroEye,
  heroQuestionMarkCircle,
  heroSquares2x2,
  heroPlayCircle,
  heroChevronDown,
  heroBars3,
  heroXMark,
  heroCheck,
  heroArrowsUpDown,
  heroMapPin,
} from '@ng-icons/heroicons/outline';
import { ButtonComponent } from '../button/button.component';
import { SegmentedButtonComponent } from '../segmented-button/segmented-button.component';
import { AccordionItemComponent } from '../accordion-item/accordion-item.component';
import {
  AccordionItem,
  AccordionItemEvent,
  AccordionItemKind,
  AccordionModule,
  AccordionModuleReorderEvent,
  AccordionLessonsReorderEvent,
  AccordionLessonsReorderItemEvent,
} from './accordion.types';

/**
 * <ds-accordion>
 *
 * Accordion de modulos com items (Ebooks, Aulas, Quizzes) — usado nos
 * wizards Cursos/Mentorias/Eventos da Fase D.
 *
 * Pixel-perfect contra Figma 590:3272 (cradBody — modulo do wizard Cursos).
 * Specs canonicos: DEC-FIG-C-3.
 * API discriminated union: DEC-C-3-A.
 * Placement strategy: DEC-C-3-B (botoes dual-border + badges INLINE; row
 * actions REUSAM `ds-button` action-icon).
 *
 * LIGHTMODE-FIRST: zero :host-context(.dark).
 *
 * Componente NOVO — nao tem shared equivalente (DEC-C-A).
 *
 * v1 NAO inclui:
 * - DnD funcional (sub-fase futura `ds-accordion-dnd`, placeholder via
 *   AccordionModule.enableDnD)
 * - Animacao expand/collapse (sub-fase futura
 *   `ds-accordion-collapse-animation`, sempre expanded no v1)
 */
@Component({
  selector: 'ds-accordion',
  standalone: true,
  imports: [CommonModule, NgIcon, ButtonComponent, SegmentedButtonComponent, AccordionItemComponent, CdkDropList, CdkDrag, CdkDragHandle],
  providers: [
    provideIcons({
      heroMapPin,
      heroBookOpen,
      heroVideoCamera,
      heroCheckCircle,
      heroDocumentText,
      heroPencilSquare,
      heroPencil,
      heroTrash,
      heroPlus,
      heroEye,
      heroQuestionMarkCircle,
      heroSquares2x2,
      heroPlayCircle,
      heroChevronDown,
      heroBars3,
      heroXMark,
      heroCheck,
      heroArrowsUpDown,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './accordion.component.html',
  styleUrl: './accordion.component.scss',
})
export class AccordionComponent {
  /** Modulos a renderizar. */
  readonly modules = input.required<AccordionModule[]>();

  /** Label do botao "+ Adicionar item" (header e footer dos modulos). */
  readonly addItemLabel = input<string>('Adicionar Aula');

  /**
   * Titulo da subsecao que lista os itens do modulo.
   *
   * D.3.5: era `"Aulas do módulo"` CRAVADO no template. O componente e' do DS e
   * ja' serve Mentorias ("Sessões do Módulo") e Eventos ("Sessões do Palco") —
   * vocabulario de Cursos preso no HTML fazia a step de Mentorias renderizar
   * "Aulas". A `D.3.4.5 §12` registrou a divida e nomeou esta fase como dona.
   *
   * Default preserva o texto atual: nenhum dos ~136 consumidores muda.
   */
  readonly itemsSectionLabel = input<string>('Aulas do módulo');

  /** Rotulo do botao de reordenar itens. Era `"Reorganizar aulas"` cravado. */
  readonly reorderItemsLabel = input<string>('Reorganizar aulas');

  /** `aria-label` da alca de arraste do item. Era `"Arrastar aula para reordenar"`. */
  readonly dragItemAriaLabel = input<string>('Arrastar aula para reordenar');

  /**
   * E.1 (DEC-FIG-D-AULAS-E.1.A — 2026-06-21): override do estado expanded
   * de TODOS os módulos pelo caller (modo "Padrão / Expandir / Reorganizar"
   * do header do card).
   *
   * - 'auto' (default): expandedMap interno governa (cada módulo independente,
   *   click no header toggla).
   * - 'all-expanded': todos forçados expanded; clique no header é no-op.
   * - 'all-collapsed': todos forçados collapsed; clique no header é no-op.
   *
   * Útil quando o caller precisa coordenar TODOS os módulos a partir de
   * um controle externo (ex: nav-tabs do header de step Aulas).
   */
  readonly forceMode = input<'auto' | 'all-expanded' | 'all-collapsed'>('auto');

  /**
   * E.4 (DEC-FIG-D-AULAS-E.4.B — 2026-06-22): habilita drag-and-drop de
   * MÓDULOS via Angular CDK. Quando true:
   * - Drag-handle (grip) aparece no canto esquerdo de cada módulo (fade in)
   * - cdkDrag ativo, drop emite (moduleReorder) para o caller persistir
   * Default false. Caller controla via input (ex: viewMode === 'reorganizar').
   *
   * Aulas dentro do módulo NÃO entram nesta sub-fase (escopo apenas Módulos).
   */
  readonly dndEnabled = input<boolean>(false);

  /**
   * E.9 (DEC-FIG-D-AULAS-E.9.C — 2026-06-22): id do módulo em modo
   * "Reorganizar aulas". null = nenhum módulo em dnd (modo padrão).
   * UM módulo por vez (decisão Diogo).
   *
   * Quando set para um id de módulo:
   * - Aulas desse módulo viram cdkDrag com handle visível
   * - Botões Ver/Editar/Deletar dos items somem (via show*=false override)
   * - Subsection header mostra [Cancelar][Salvar] em vez de [Reorganizar]
   */
  readonly dndLessonsModuleId = input<string | null>(null);

  // ============================================================================
  // Outputs — eventos do nivel modulo
  // ============================================================================
  readonly moduleEdit = output<string>();
  readonly moduleDelete = output<string>();
  readonly addItem = output<string>();

  // ============================================================================
  // Outputs — eventos do nivel item
  // ============================================================================
  readonly itemView = output<AccordionItemEvent>();
  readonly itemEdit = output<AccordionItemEvent>();
  readonly itemDelete = output<AccordionItemEvent>();

  /** Emitido ao alternar expanded/collapsed do modulo. */
  readonly moduleToggle = output<{ moduleId: string; expanded: boolean }>();

  /**
   * E.4 (DEC-FIG-D-AULAS-E.4.C): emitido após drop do módulo via DnD.
   * Caller persiste com moveItemInArray no FormArray + updateModuleOrders
   * + saveFormData + persistToBackend.
   */
  readonly moduleReorder = output<AccordionModuleReorderEvent>();

  // ============================================================================
  // E.9 (DEC-FIG-D-AULAS-E.9.C — 2026-06-22): outputs do modo
  // "Reorganizar aulas" per-module. Caller mantém estado + snapshot.
  // ============================================================================

  /** Emitido ao clicar [Reorganizar aulas] no header da subsection. */
  readonly lessonsReorderRequest = output<AccordionLessonsReorderEvent>();

  /** Emitido ao clicar [Cancelar reorganização]. */
  readonly lessonsReorderCancel = output<AccordionLessonsReorderEvent>();

  /** Emitido ao clicar [Salvar] (modo reorganizando). */
  readonly lessonsReorderSave = output<AccordionLessonsReorderEvent>();

  /**
   * Emitido após drop de aula em modo dnd. Caller faz moveItemInArray no
   * FormArray.lessons + updateLessonOrders, SEM persist (persist só no save).
   */
  readonly lessonsReorder = output<AccordionLessonsReorderItemEvent>();

  // ============================================================================
  // Estado interno: expanded per moduleId (signal).
  // Inicializado a partir de modules()[i].expanded (default true).
  // ============================================================================
  private readonly expandedMap = signal<Record<string, boolean>>({});

  constructor() {
    // Sincroniza expandedMap com o input modules sempre que mudar
    // (preserva estado existente; adiciona novas entries com expanded inicial).
    effect(() => {
      const list = this.modules();
      const prev = this.expandedMap();
      const next: Record<string, boolean> = {};
      for (const m of list) {
        next[m.id] = prev[m.id] ?? (m.expanded ?? true);
      }
      // Apenas atualiza se mudou para evitar loop infinito.
      const prevKeys = Object.keys(prev);
      const nextKeys = Object.keys(next);
      const changed =
        prevKeys.length !== nextKeys.length ||
        nextKeys.some(k => prev[k] !== next[k]);
      if (changed) this.expandedMap.set(next);
    });
  }

  /**
   * True se o modulo esta expanded (default true).
   * E.1: respeita forceMode quando ≠ 'auto' (override pelo caller).
   */
  protected isExpanded(moduleId: string): boolean {
    const force = this.forceMode();
    if (force === 'all-expanded') return true;
    if (force === 'all-collapsed') return false;
    return this.expandedMap()[moduleId] ?? true;
  }

  // ============================================================================
  // Helpers de renderizacao
  // ============================================================================

  /** Icone default per kind (sobrescrito por iconSrc/icon do AccordionItem). */
  /**
   * Icone default por kind. Os canonicos usam os mesmos icones que
   * `CONTENT_KINDS` declara (FASE 0 / 0.3), para que o accordion e o
   * `<ds-type-picker>` nao mostrem simbolos diferentes para o mesmo conceito.
   */
  protected iconForKind(kind: AccordionItemKind): string {
    switch (kind) {
      case 'live': return 'heroVideoCamera';
      case 'video': return 'heroPlayCircle';
      case 'in_person': return 'heroMapPin';
      case 'ebook': return 'heroBookOpen';
      case 'quiz': return 'heroCheckCircle';
      case 'extra': return 'heroBars3';
      // @deprecated — mantem o icone ANTIGO de proposito: trocar aqui mudaria a
      // aparencia do `step-aulas` sem que a D.3.5 tenha aberto aquele arquivo.
      case 'aula': return 'heroVideoCamera';
      default: return 'heroDocumentText';
    }
  }

  /** Mostra acao "View" (default true). */
  protected showView(item: AccordionItem): boolean {
    return item.showView !== false;
  }

  /** Mostra acao "Edit" (default true). */
  protected showEdit(item: AccordionItem): boolean {
    return item.showEdit !== false;
  }

  /** Mostra acao "Delete" (default true). */
  protected showDelete(item: AccordionItem): boolean {
    return item.showDelete !== false;
  }

  // ============================================================================
  // Handlers
  // ============================================================================
  protected onModuleEdit(moduleId: string): void {
    this.moduleEdit.emit(moduleId);
  }

  protected onModuleDelete(moduleId: string): void {
    this.moduleDelete.emit(moduleId);
  }

  protected onAddItem(moduleId: string): void {
    this.addItem.emit(moduleId);
  }

  protected onItemView(moduleId: string, itemId: string): void {
    this.itemView.emit({ moduleId, itemId });
  }

  protected onItemEdit(moduleId: string, itemId: string): void {
    this.itemEdit.emit({ moduleId, itemId });
  }

  protected onItemDelete(moduleId: string, itemId: string): void {
    this.itemDelete.emit({ moduleId, itemId });
  }

  /**
   * Alterna expanded/collapsed do modulo. Click handler do header-left.
   * E.1: no-op quando forceMode ≠ 'auto' (caller governa via header tabs).
   */
  protected onToggleModule(moduleId: string): void {
    if (this.forceMode() !== 'auto') return;
    const current = this.isExpanded(moduleId);
    const next = !current;
    this.expandedMap.update(map => ({ ...map, [moduleId]: next }));
    this.moduleToggle.emit({ moduleId, expanded: next });
  }

  /**
   * E.4 (DEC-FIG-D-AULAS-E.4.C): handler do drop do CdkDropList.
   * Repassa indices ao caller via output moduleReorder. NÃO muta o input
   * `modules` (imutável do caller — fonte da verdade é o FormArray do step).
   */
  protected onModuleDrop(event: CdkDragDrop<AccordionModule[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    this.moduleReorder.emit({
      previousIndex: event.previousIndex,
      currentIndex: event.currentIndex,
    });
  }

  // ============================================================================
  // E.9 — handlers do modo "Reorganizar aulas" per-module
  // ============================================================================

  /** True se o módulo está em modo dnd de aulas (DEC-FIG-D-AULAS-E.9.C). */
  protected isLessonsDndActive(moduleId: string): boolean {
    return this.dndLessonsModuleId() === moduleId;
  }

  /**
   * E.9: items renderizados para um módulo em modo dnd têm Ver/Editar/Deletar
   * forçados para false (DEC-FIG-D-AULAS-E.9.D). Reusa a API existente do
   * AccordionItem (showView/Edit/Delete) sem novo input no item.
   */
  protected itemsForRender(module: AccordionModule): AccordionItem[] {
    if (!this.isLessonsDndActive(module.id)) return module.items;
    return module.items.map(item => ({
      ...item,
      showView: false,
      showEdit: false,
      showDelete: false,
    }));
  }

  protected onLessonsReorderRequest(moduleId: string): void {
    this.lessonsReorderRequest.emit({ moduleId });
  }

  protected onLessonsReorderCancel(moduleId: string): void {
    this.lessonsReorderCancel.emit({ moduleId });
  }

  protected onLessonsReorderSave(moduleId: string): void {
    this.lessonsReorderSave.emit({ moduleId });
  }

  protected onLessonDrop(moduleId: string, event: CdkDragDrop<AccordionItem[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    this.lessonsReorder.emit({
      moduleId,
      previousIndex: event.previousIndex,
      currentIndex: event.currentIndex,
    });
  }
}
