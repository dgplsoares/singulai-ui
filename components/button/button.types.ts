// ============================================================================
// Button — Types
// Doc: .claude/design-system/components/button-neumorphic.md
// DEC-DS-001: refactor button-neumorphic — variants 'solid' + 'outline' com
//             8 colorVariants substituem modal-primary/modal-cancel (deprecated).
// ============================================================================

/**
 * Variants do botao. Cada uma cobre um contexto especifico de uso.
 *
 * NOVOS (DS-2.1 — DEC-DS-001):
 * - solid: botao primario com bg solido + inner shadows duplas + outer shadow
 *          5-layer. Usa colorVariant para definir cor (substitui modal-primary).
 * - outline: botao secundario com border + bg transparente (substitui modal-cancel).
 *            (variant 'ghost' real — sem bg/border, so texto + hover bg — fica
 *             para implementacao futura.)
 *
 * NOVOS (BTN-1 v2 — DEC-BTN-V2-A/B/D — 2026-05-17):
 * - action-icon: botao de acao em datatable rows OU inline accordion. LABEL-AWARE:
 *                sem children = icon-only 28x28 neumorphic (row action); com children
 *                = pill icon+text (inline accordion action). 3 colorVariants:
 *                info (azul, view) / danger (vermelho, delete) / warning (amarelo,
 *                edit). Cobre Familias 1+2 do Figma buttons-inner-singulai.svg.
 * - action-add: botao "+ Adicionar X" / "Plataformas" em header datatable de pages
 *               de listagem OU footer de accordion. MODE-AWARE: default = outline
 *               branco neumorphic; variantColor="primary" = filled azul. Sempre
 *               icon+text. Cobre Familias 3+4 do Figma. NOTA: NAO confundir com
 *               variant="action" (reservado para Reorganizar/Personalizar do
 *               dashboard principal — contextos diferentes).
 *
 * EXISTENTES:
 * - primary-cta: CTA grande com gradient animado (Card Welcome, "Criar curso com IA")
 * - action: botao de acao do header do dashboard PRINCIPAL (Reorganizar,
 *           Personalizar — ds-page-header__dashboard-actions). NAO usar para
 *           "+ Adicionar X" das listagens (usar action-add).
 * - icon: botao pequeno na coluna actions de datatable (view/edit/delete) —
 *         LEGACY, sera deprecated. Novos usos: prefira action-icon (DEC-BTN-V2-B).
 * - submit: botao de submit em forms (AI Assistant prompt, etc)
 * - sidebar: botoes do sidebar (logo, search, avatar)
 * - nav-tab: tab interno em cards
 * - pagination: numero de pagina em datatable footer
 * - toggle-status: switch ativo/inativo em datatable
 *
 * DEPRECATED (mantidos para retrocompat — remover em DS-2.2):
 * - modal-primary: usar `<ds-button variant="solid" colorVariant="...">`.
 * - modal-cancel: usar `<ds-button variant="outline" colorVariant="primary">`.
 *
 * Os botoes do combo header (darkmode/notif/ai-assistant) NAO sao variants
 * desta tipologia — vivem como componentes dedicados em components/header-combo/.
 */
export type ButtonVariant =
  | 'primary-cta'
  | 'solid'
  | 'outline'
  | 'action'
  | 'action-icon'
  | 'action-add'
  | 'icon'
  | 'submit'
  | 'sidebar'
  | 'modal-cancel'
  | 'modal-primary'
  | 'nav-tab'
  | 'pagination'
  | 'toggle-status';

/** Tamanho do botao. Default: md. */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Cor da variant. Aplicado em solid/outline (DEC-DS-001) e tambem em modal-primary
 * (deprecated) + badges/icones por contexto.
 *
 * NOVOS (DS-2.1):
 * - primary: apex-blue-300 (#3E6FCA) — acao primaria padrao
 * - secondary: apex-blue-500 (#2558B3) — acao primaria escura
 * - tertiary: apex-blue-700 (#0B1D3F) — acao mais escura/contrastante
 * - warning: amarelo-mostarda (#A8841C)
 * - dark: cinza-quase-preto (#2D2D34)
 * - goal: TBD — Figma node pendente (sera adicionado quando chegar)
 *
 * EXISTENTES (mantidos):
 * - success, danger, info, apex (alias de primary), alert (alias de warning)
 */
export type ButtonVariantColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'dark'
  | 'goal'
  | 'apex'
  | 'alert'
  | 'info';

/** Tipo HTML do botao. Default: button (nao submete forms acidentalmente). */
export type ButtonType = 'button' | 'submit' | 'reset';
