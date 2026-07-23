import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  input,
} from '@angular/core';

import {
  DataTableComponent,
  DataTableConfig,
  DataTableStateChange,
  PageChangeEvent,
  SortChangeEvent,
  SearchChangeEvent,
  FilterChangeEvent,
  SwitchChangeEvent,
} from '../../../app/shared/components/data-table';

/**
 * Datatable — wrapper thin de `<app-data-table>` (DEC-PREP3-A: composicao
 * config-only).
 *
 * Estrategia: forwarda `[data]`, `[config]`, `[loading]`, `[error]` e os
 * 9 outputs sem duplicar as ~30 props internas de `DataTableConfig<T>`.
 * Visual override aplicado via SCSS para alinhar com Figma 862:10798
 * (DEC-FIG-PREP3-4).
 *
 * Re-exporta todos os types de `data-table.types` via barrel (index.ts)
 * para que callers DS importem `DataTableConfig`, `ColumnDef`, etc. sem
 * tocar diretamente em `app/shared`.
 *
 * Acoplamento: O DS depende de `app/shared/components/data-table/`.
 * Aceitavel temporariamente (DEC-PREP3-F) ate promocao desse component
 * para o DS em fase futura.
 *
 * @example
 *   <ds-datatable
 *     [data]="courses()"
 *     [config]="tableConfig"
 *     [loading]="isLoading()"
 *     (rowClick)="onRowClick($event)"
 *     (pageChange)="onPageChange($event)"
 *   />
 */
@Component({
  selector: 'ds-datatable',
  standalone: true,
  imports: [DataTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './datatable.component.html',
  styleUrl: './datatable.component.scss',
})
export class DatatableComponent<T extends { id: string | number }> {
  /** Array de dados a renderizar. */
  readonly data = input<T[]>([]);

  /** Configuracao completa (colunas, paginacao, search, filters, etc.). */
  readonly config = input.required<DataTableConfig<T>>();

  /** Estado de loading (mostra skeleton). */
  readonly loading = input<boolean>(false);

  /** Mensagem de erro (renderiza estado de erro do app-data-table). */
  readonly error = input<string | null>(null);

  /** Filtro externo customizado (predicate por item). */
  readonly externalFilter = input<((item: T) => boolean) | null>(null);

  // --------------------------------------------------------------------------
  // Outputs — forward 1:1 com app-data-table
  // --------------------------------------------------------------------------

  /** Mudanca consolidada de estado (search/sort/pagination/filters). */
  @Output() readonly stateChange = new EventEmitter<DataTableStateChange>();

  /** Click em uma linha (item completo). */
  @Output() readonly rowClick = new EventEmitter<T>();

  /** Mudanca de selecao (modo selectable). */
  @Output() readonly selectionChange = new EventEmitter<T[]>();

  /** Solicitacao de reload (botao de reload da toolbar). */
  @Output() readonly reload = new EventEmitter<void>();

  /** Mudanca de pagina (server-side mode). */
  @Output() readonly pageChange = new EventEmitter<PageChangeEvent>();

  /** Mudanca de ordenacao (server-side mode). */
  @Output() readonly sortChange = new EventEmitter<SortChangeEvent>();

  /** Mudanca de busca (server-side mode). */
  @Output() readonly searchChange = new EventEmitter<SearchChangeEvent>();

  /** Mudanca de filtro dropdown (server-side mode). */
  @Output() readonly filterChange = new EventEmitter<FilterChangeEvent>();

  /** Mudanca em coluna switch (toggle de ativo/inativo). */
  @Output() readonly switchChange = new EventEmitter<SwitchChangeEvent<T>>();
}
