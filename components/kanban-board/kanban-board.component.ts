import {
  Component,
  ContentChild,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  computed,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

import {
  KanbanBoardConfig,
  KanbanCardClickEvent,
  KanbanCardContext,
  KanbanColumn,
  KanbanColumnClickEvent,
  KanbanDropEvent,
  KanbanVariantColor,
} from './kanban-board.types';

/**
 * KanbanBoardComponent — DS
 *
 * Quadro Kanban genérico para visualização em pipeline.
 *
 * Features:
 * - Drag-and-drop entre colunas (CDK DragDrop)
 * - Template customizado para cards (ContentChild)
 * - Contagem e valor total por coluna
 * - WIP limit por coluna
 * - 100% Signals (reactive)
 * - LIGHTMODE-FIRST (sem variantes dark)
 * - Tokens neumórficos do DS no SCSS
 *
 * @example
 * <ds-kanban-board
 *   [columns]="leadColumns()"
 *   [config]="kanbanConfig"
 *   (cardClick)="onLeadClick($event)"
 *   (cardDrop)="onLeadDrop($event)"
 * >
 *   <ng-template #cardTemplate let-lead let-column="column">
 *     <div class="lead-card">
 *       <h4>{{ lead.name }}</h4>
 *       <p>{{ lead.email }}</p>
 *     </div>
 *   </ng-template>
 * </ds-kanban-board>
 */
@Component({
  selector: 'ds-kanban-board',
  standalone: true,
  imports: [CommonModule, CdkDropListGroup, CdkDropList, CdkDrag],
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class KanbanBoardComponent<T extends { id: string | number }> {
  // ==================== INPUTS ====================

  /** Colunas do kanban. */
  @Input() set columns(value: KanbanColumn<T>[]) {
    this.columnsSignal.set(value);
  }
  get columns(): KanbanColumn<T>[] {
    return this.columnsSignal();
  }

  readonly columnsSignal = signal<KanbanColumn<T>[]>([]);

  /** Configuração do kanban. */
  @Input() config: KanbanBoardConfig<T> = {
    trackBy: (item) => item.id,
    showCount: true,
    showTotalValue: false,
    enableDragDrop: true,
    showEmptyState: true,
    emptyStateMessage: 'Nenhum item',
    columnWidth: '280px',
    minColumnHeight: '400px',
  };

  /** Estado de loading. */
  @Input() set loading(value: boolean) {
    this._loading.set(value);
  }
  get loading(): boolean {
    return this._loading();
  }

  private _loading = signal<boolean>(false);

  // ==================== OUTPUTS ====================

  /** Emitido quando um card é clicado. */
  @Output() cardClick = new EventEmitter<KanbanCardClickEvent<T>>();

  /** Emitido quando um card é movido para outra coluna. */
  @Output() cardDrop = new EventEmitter<KanbanDropEvent<T>>();

  /** Emitido quando o header de uma coluna é clicado. */
  @Output() columnClick = new EventEmitter<KanbanColumnClickEvent<T>>();

  // ==================== CONTENT CHILDREN ====================

  /** Template customizado para renderizar o card. */
  @ContentChild('cardTemplate') cardTemplate?: TemplateRef<KanbanCardContext<T>>;

  // ==================== INTERNAL STATE ====================

  /** ID do item sendo arrastado. */
  draggingItemId = signal<string | number | null>(null);

  // ==================== COMPUTED ====================

  /** Total de items em todas as colunas. */
  totalItems = computed(() =>
    this.columnsSignal().reduce((sum, col) => sum + col.items.length, 0),
  );

  /** Lista de IDs das colunas (para conectar drop lists). */
  columnIds = computed(() => this.columnsSignal().map((col) => `column-${col.id}`));

  // ==================== METHODS ====================

  /** Retorna o ID único de uma coluna para o CDK. */
  getColumnDropListId(column: KanbanColumn<T>): string {
    return `column-${column.id}`;
  }

  /** Formata o valor para exibição. */
  formatValue(value: number | undefined): string {
    if (value === undefined || value === null) return '';

    const format = this.config.valueFormat || 'BRL';

    if (format === 'BRL') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(value);
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: format,
    }).format(value);
  }

  /** Verifica se a coluna está no limite (WIP limit). */
  isColumnAtLimit(column: KanbanColumn<T>): boolean {
    if (!column.limit) return false;
    return column.items.length >= column.limit;
  }

  /** Handler de clique no card. */
  onCardClick(item: T, column: KanbanColumn<T>, event: MouseEvent): void {
    if (this.draggingItemId()) return;

    this.cardClick.emit({ item, column, event });
  }

  /** Handler de clique no header da coluna. */
  onColumnHeaderClick(column: KanbanColumn<T>, event: MouseEvent): void {
    this.columnClick.emit({ column, event });
  }

  /** Handler de início de drag. */
  onDragStarted(item: T): void {
    this.draggingItemId.set(this.config.trackBy(item));
  }

  /** Handler de fim de drag. */
  onDragEnded(): void {
    this.draggingItemId.set(null);
  }

  /** Handler de drop do CDK DragDrop. */
  onDrop(event: CdkDragDrop<T[]>, targetColumn: KanbanColumn<T>): void {
    const previousColumnId = event.previousContainer.id.replace('column-', '');
    const currentColumnId = targetColumn.id;

    if (event.previousContainer === event.container) {
      // Mesmo container — apenas reordenar
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Container diferente — transferir item
      const item = event.previousContainer.data[event.previousIndex];

      if (this.isColumnAtLimit(targetColumn)) {
        return;
      }

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );

      this.cardDrop.emit({
        item,
        previousColumnId,
        currentColumnId,
        previousIndex: event.previousIndex,
        currentIndex: event.currentIndex,
      });
    }
  }

  /** Predicate de drop por coluna (respeitando droppable + WIP limit). */
  canDropPredicate = (column: KanbanColumn<T>) => {
    return (): boolean => {
      if (column.droppable === false) return false;
      if (this.isColumnAtLimit(column)) return false;
      return true;
    };
  };

  /** Cria o contexto para o template do card. */
  getCardContext(item: T, index: number, column: KanbanColumn<T>): KanbanCardContext<T> {
    return {
      $implicit: item,
      index,
      column,
      isDragging: this.draggingItemId() === this.config.trackBy(item),
    };
  }

  /** TrackBy para ngFor de colunas. */
  trackByColumnId(_index: number, column: KanbanColumn<T>): string {
    return column.id;
  }

  /** TrackBy para ngFor de items. */
  trackByItemId = (_index: number, item: T): string | number => this.config.trackBy(item);

  // ==================== TEMPLATE HELPERS ====================

  /** Obtém o título de um item (name ou title). */
  getItemTitle(item: T): string {
    const anyItem = item as Record<string, unknown>;
    return (anyItem['name'] as string) || (anyItem['title'] as string) || `Item ${item.id}`;
  }

  /** Obtém o email de um item. */
  getItemEmail(item: T): string | null {
    const anyItem = item as Record<string, unknown>;
    return (anyItem['email'] as string) || null;
  }

  /** Obtém o valor de um item (value ou leadValue). */
  getItemValue(item: T): number | null {
    const anyItem = item as Record<string, unknown>;
    const value = anyItem['value'] ?? anyItem['leadValue'];
    return typeof value === 'number' ? value : null;
  }
}
