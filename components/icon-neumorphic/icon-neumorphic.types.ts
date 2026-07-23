// ============================================================================
// IconNeumorphic — Types
// Doc: .claude/design-system/components/page-header.md (referencia ao icone)
// Estilo neumorphic conforme tokens/shadows.md (effects-neumorfismo)
// ============================================================================

export type IconNeumorphicSize = 'sm' | 'md' | 'lg';

export type IconNeumorphicVariant =
  | 'default'   // tom neutro neumorphic padrao
  | 'apex'      // azul Apex Singulai
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'purple';

export interface IconNeumorphicSizeMap {
  /** Tamanho do container (size x size em px) */
  container: number;
  /** Tamanho do icone interno em px */
  inner: number;
  /** Border-radius do container */
  radius: string;
}

// inner = lado da bounding-box quadrada do glyph (width = height em px).
// Calibrado para deixar breathing room visivel em torno do icone, conforme
// Figma 1088:14397 (button-navigation onde glyph ocupa ~45% do container).
// Container - inner = breathing total (sm:16 / md:22 / lg:28 → 8/11/14 cada lado).
export const ICON_NEUMORPHIC_SIZES: Record<IconNeumorphicSize, IconNeumorphicSizeMap> = {
  sm: { container: 28, inner: 12, radius: 'var(--ds-radius-sm)' },
  md: { container: 40, inner: 18, radius: 'var(--ds-radius-lg)' },
  lg: { container: 50, inner: 22, radius: 'var(--ds-radius-lg)' },
};
