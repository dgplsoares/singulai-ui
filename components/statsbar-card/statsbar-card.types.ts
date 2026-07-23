// ============================================================================
// StatsbarCard — Types
// Doc: .claude/design-system/components/statsbar-card.md (TBD)
// ============================================================================

/**
 * 7 colorVariants do statsbar card. Cada variant define:
 * - cor do title
 * - cor do icon-bg circle
 * - cor do icon (quando renderizado via heroicon — currentColor)
 *
 * Mapeamento Figma 1088:14316 (statsbar do main-dashboard):
 *   success — Card 1 "Assinantes" (#344D36 + #DDEDDF)
 *   purple  — Card 2 "Alunos Ativos" (#5D537E + #E4DDFF)
 *   warning — Card 3 "Tickets em Aberto" (#94825B + #F5ECD8)
 *   info    — Card 4 "Novos Leads" (#426FB3 + #E8F1FF)
 *   danger  — Pixel-perfect Figma 875:21597 alunos-list Bloqueados (#9F8686 + #F2E5E5) — DEC-G4.1-A3
 *   neutral — Variante neutra (#5C6F8E + #E5EBF2)
 *
 * Mapeamento Figma 814:9571 (Ensino Dashboard StatsBar — Fase E.1):
 *   pink    — Card "Assinantes" (#BC7CBB + #F3E5F0) — adicionado MT-E.1-3
 *
 * Mapeamento Figma 915:12404 (CRM Leads StatsBar — G.4.2 refinos):
 *   magenta — Card "Atendidos por IA" (#A932A1 + #FBE8FA) — adicionado G.4.2
 */
export type StatsbarCardVariant =
  | 'success'
  | 'purple'
  | 'warning'
  | 'info'
  | 'danger'
  | 'neutral'
  | 'pink'
  | 'magenta';

/** Direcao do delta — up (positivo) ou down (negativo). */
export type StatsbarCardDeltaDirection = 'up' | 'down';
