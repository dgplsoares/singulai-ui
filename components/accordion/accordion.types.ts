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
/**
 * Kind do item — decide o icone default e a semantica.
 *
 * ====================================================================
 * D.3.5.2 — ALINHADO AOS VALORES CANONICOS DO `ContentKind`
 * ====================================================================
 * Esta uniao era `'ebook' | 'aula' | 'quiz' | 'custom'` — em PT, e o **setimo
 * vocabulario** do mesmo conceito. A FASE 0 matou seis; este sobreviveu porque
 * estava no **DS**, e a varredura olhou as features.
 *
 * Agora ela carrega os MESMOS valores de `ContentKind`
 * (`app/shared/models/content-kind.ts`). Nao e' o mesmo TIPO, e nao pode ser: o
 * DS **nao importa de `app/`** — a dependencia e' `app -> DS`, nunca o inverso.
 * O que se garante e' o vocabulario; quem converte e' o host, na borda.
 *
 * ⚠️ `'aula'` fica como **alias DEPRECIADO** de `'video'`, e nao por gosto: o
 * `step-aulas` de Cursos ainda o passa, e a `DEC-D.3.5-E` proibe abrir aquele
 * arquivo nesta fase. Ele morre na `D.3.6`, junto da tela.
 *
 * Medido antes de mexer: **15 literais em 4 arquivos** — 10 no showcase de dev,
 * 3 em Cursos (intocavel) e 2 no `live-linker`. `'custom'` tinha **0** usos.
 */
export type AccordionItemKind =
  // Canonicos — espelham `ContentKind` (FASE 0 / 0.3)
  | 'video'
  | 'live'
  | 'in_person'
  | 'ebook'
  | 'quiz'
  | 'extra'
  /** @deprecated Use `'video'`. Sobrevive so' pelo `step-aulas`, que morre na D.3.6. */
  | 'aula'
  /** Escape para itens sem kind canonico. Tinha 0 usos quando isto foi escrito. */
  | 'custom';

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
