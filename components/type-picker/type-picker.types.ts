/**
 * Tipos publicos do <ds-type-picker> (Fase D.2.1).
 *
 * Componente de selecao de tipo via cards visuais — usado para escolher
 * o kind de uma entidade (ex: tipo de aula no offcanvas de Cursos:
 * Videoaula / Ebook / Quiz / Texto).
 *
 * Pattern visual canonico Figma 657:4912.
 */

/** Uma opcao do type-picker (1 card). */
export interface TypePickerOption {
  /** Identificador unico — emitido no two-way binding. */
  kind: string;
  /** Texto exibido sob o icone. */
  label: string;
  /** Path/URL de SVG custom (preferido — Figma fornece SVGs proprios). */
  iconSrc?: string;
  /** Heroicon como fallback quando iconSrc nao for fornecido. */
  icon?: string;
  /** Largura do icone em px (default: 24). */
  iconWidth?: number;
  /** Altura do icone em px (default: igual a iconWidth). */
  iconHeight?: number;
  /** Desabilita esta opcao especifica. */
  disabled?: boolean;
}
