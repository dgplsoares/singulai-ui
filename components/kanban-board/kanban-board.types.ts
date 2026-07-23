/**
 * KanbanBoard Types — DS
 *
 * Tipos e interfaces para o componente <ds-kanban-board>.
 * Genérico e reutilizável (Leads, Tarefas, Propostas, etc).
 *
 * DEC-G4-D2 (Diogo 2026-05-17): componente promovido para o DS a partir
 * de shared/components/kanban-board. Refator inclui:
 * - Variantes semânticas (info/success/warning/...) alinhadas com BTN-1 v3
 *   no lugar de cores Tailwind cruas (blue/green/...)
 * - LIGHTMODE-FIRST: zero classes dark
 * - Tokens neumórficos do DS no SCSS
 */

import { TemplateRef } from '@angular/core';

/**
 * Variantes semânticas para cor da coluna do Kanban.
 * Alinhadas com a convenção do DS (BTN-1 v3 usa as mesmas em variantColor).
 */
export type KanbanVariantColor =
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  | 'purple'
  | 'orange'
  | 'pink'
  | 'teal'
  | 'neutral';

/**
 * Coluna do Kanban.
 *
 * @template T Tipo do item dos cards (ex: LeadKanbanCard).
 */
export interface KanbanColumn<T = unknown> {
  /** Identificador único da coluna (ex: 'new', 'qualified', 'won'). */
  id: string;

  /** Label exibido no header da coluna. */
  label: string;

  /** Variante semântica de cor (header/badge/borda). */
  color: KanbanVariantColor;

  /** Items/cards desta coluna. */
  items: T[];

  /** Contagem de items (opcional, se diferente de items.length). */
  count?: number;

  /** Valor total dos items (opcional, para pipeline em R$). */
  totalValue?: number;

  /** Se a coluna aceita novos items via drag. */
  droppable?: boolean;

  /** Se os items podem ser arrastados desta coluna. */
  draggable?: boolean;

  /** Limite máximo de items na coluna (WIP limit). */
  limit?: number;
}

/**
 * Configuração do KanbanBoard.
 */
export interface KanbanBoardConfig<T = unknown> {
  /** Função para extrair o ID único do item. */
  trackBy: (item: T) => string | number;

  /** Template customizado para renderizar o card. */
  cardTemplate?: TemplateRef<KanbanCardContext<T>>;

  /** Altura mínima das colunas (ex: '400px', '60vh'). */
  minColumnHeight?: string;

  /** Largura das colunas (ex: '280px', '300px'). */
  columnWidth?: string;

  /** Mostrar contagem de items no header. */
  showCount?: boolean;

  /** Mostrar valor total no header (se disponível). */
  showTotalValue?: boolean;

  /** Formato do valor (ex: 'BRL', 'USD'). */
  valueFormat?: string;

  /** Habilitar drag-and-drop. */
  enableDragDrop?: boolean;

  /** Mostrar indicador de coluna vazia. */
  showEmptyState?: boolean;

  /** Mensagem de coluna vazia. */
  emptyStateMessage?: string;

  /** Permitir scroll horizontal automático. */
  autoScroll?: boolean;

  /** Classe CSS adicional para o container. */
  containerClass?: string;

  /** Classe CSS adicional para as colunas. */
  columnClass?: string;

  /** Classe CSS adicional para os cards. */
  cardClass?: string;
}

/**
 * Contexto passado para o template do card.
 */
export interface KanbanCardContext<T = unknown> {
  /** Item do card. */
  $implicit: T;

  /** Índice do item na coluna. */
  index: number;

  /** Coluna pai. */
  column: KanbanColumn<T>;

  /** Se o card está sendo arrastado. */
  isDragging: boolean;
}

/**
 * Evento de drag-and-drop (movimentação entre colunas ou reorder).
 */
export interface KanbanDropEvent<T = unknown> {
  /** Item que foi movido. */
  item: T;

  /** ID da coluna de origem. */
  previousColumnId: string;

  /** ID da coluna de destino. */
  currentColumnId: string;

  /** Índice anterior na coluna de origem. */
  previousIndex: number;

  /** Novo índice na coluna de destino. */
  currentIndex: number;
}

/**
 * Evento de clique no card.
 */
export interface KanbanCardClickEvent<T = unknown> {
  /** Item clicado. */
  item: T;

  /** Coluna do item. */
  column: KanbanColumn<T>;

  /** Evento do mouse original. */
  event: MouseEvent;
}

/**
 * Evento de clique no header da coluna.
 */
export interface KanbanColumnClickEvent<T = unknown> {
  /** Coluna clicada. */
  column: KanbanColumn<T>;

  /** Evento do mouse original. */
  event: MouseEvent;
}
