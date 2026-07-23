/**
 * Tipos publicos de <ds-step-tabs> — sub-Fase E.6.A (2026-06-23).
 *
 * Tabs horizontais para steps de wizards INTERNOS de offcanvas multi-step
 * (Videoaula 4 steps, Ebook/Quiz/Texto 2 steps cada). Pixel-perfect contra
 * Figma 706:1864 (container) + 711:2111 (item inativo) + 711:2094 (item ativo).
 *
 * Diferente do <ds-segmented-tabs> (pill compact 34px sem chrome elaborado no
 * ativo); este componente tem altura maior (52px) + chrome neumorphic no
 * tab ativo + label maior (14px inativo / 13px bold ativo) + cores frias
 * #607A93 / #576B8C apropriadas para offcanvas/dialog interno.
 */

/** Item individual de um step. */
export interface StepTabItem<K extends string = string> {
  /** Identificador unico do step. */
  key: K;
  /** Label exibido a direita do icone. */
  label: string;
  /** Icone heroicon a esquerda do label (opcional). */
  iconLeft?: string;
}
