/**
 * Tipos publicos do <ds-accordion> (Fase C.3 — DEC-C-3-A).
 *
 * Discriminated union: AccordionItem.kind define o icone default e
 * semantica (ebook/aula/quiz/custom). Customers podem usar `iconSrc` ou
 * `icon` para override do icone, e `badges` para descrever status.
 */

/** Cor visual do badge (mapeada para tokens DS no SCSS). */
export type AccordionBadgeVariant = 'success' | 'warning' | 'neutral';

/** Status visual do badge (variants Figma 590:3272 — DEC-FIG-C-3). */
export interface AccordionBadge {
  /** Texto exibido no badge. */
  label: string;
  /** Cor. Default: 'neutral'. */
  variant?: AccordionBadgeVariant;
  /** Heroicon opcional a esquerda do label (ex: heroPlayCircle, heroDocument). */
  icon?: string;
}

/** Tipo do item dentro de um modulo (decide icone default). */
export type AccordionItemKind = 'ebook' | 'aula' | 'quiz' | 'custom';

/** Um item dentro de um modulo (Ebook, Aula, Quiz, ...). */
export interface AccordionItem {
  /** Identificador unico no escopo do modulo. */
  id: string;
  /** Kind do item — decide icone default e semantica. */
  kind: AccordionItemKind;
  /** Titulo do item. */
  title: string;
  /** Override do icone via SVG/imagem (preferido). */
  iconSrc?: string;
  /** Override do icone via heroicon (fallback). */
  icon?: string;
  /** Badges de status (Arquivo PDF, Roteiro, Pendente, etc). */
  badges?: AccordionBadge[];
  /** Exibe acao "View" no item. Default: true. */
  showView?: boolean;
  /** Exibe acao "Edit" no item. Default: true. */
  showEdit?: boolean;
  /** Exibe acao "Delete" no item. Default: true. */
  showDelete?: boolean;
}

/** Um modulo do accordion (com items). */
export interface AccordionModule {
  /** Identificador unico. */
  id: string;
  /** Titulo do modulo. */
  title: string;
  /** Descricao opcional sob o titulo. */
  description?: string;
  /** Items do modulo (Ebooks, Aulas, Quizzes, ...). */
  items: AccordionItem[];
  /** Estado expanded (v1: sempre expanded). Default: true. */
  expanded?: boolean;
  /** Placeholder para sub-fase futura `ds-accordion-dnd`. Default: false. */
  enableDnD?: boolean;
}

/** Payload de eventos relacionados a item dentro de modulo. */
export interface AccordionItemEvent {
  moduleId: string;
  itemId: string;
}

/**
 * Payload do evento moduleReorder (E.4 — 2026-06-22).
 * Caller usa para persistir nova ordem (moveItemInArray no FormArray +
 * updateModuleOrders + saveFormData + persistToBackend granular).
 */
export interface AccordionModuleReorderEvent {
  previousIndex: number;
  currentIndex: number;
}

/**
 * Payload dos eventos de toggle do modo "Reorganizar aulas" (E.9 — 2026-06-22).
 * Disparado em lessonsReorderRequest / lessonsReorderCancel / lessonsReorderSave.
 */
export interface AccordionLessonsReorderEvent {
  moduleId: string;
}

/**
 * Payload do drop de aula em modo DnD per-module (E.9 — 2026-06-22).
 * Caller faz moveItemInArray no FormArray.lessons do módulo + updateLessonOrders
 * (SEM persist — persist só no lessonsReorderSave).
 */
export interface AccordionLessonsReorderItemEvent {
  moduleId: string;
  previousIndex: number;
  currentIndex: number;
}
