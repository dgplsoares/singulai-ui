// ============================================================================
// Toast — Types
// Doc: .claude/roadmap/dashboard-redesign.md (PREP-2)
// Spec: .claude/links-figma-redesign-telas.md regras gerais 6 + linha 159
// ============================================================================

/**
 * 4 variants semanticas do toast. Mesmo conjunto usado no resto do DS
 * (statsbar-card, button variantColor, etc.).
 */
export type ToastVariant = 'success' | 'info' | 'warning' | 'error';

/**
 * Instancia de um toast empilhado no service. Cada toast tem id unico
 * (gerado pelo service) para dismiss programatico ou pelo botao X.
 *
 * `duration` e interno — fixo por variant (4s success/info/warning, 6s error).
 * API publica do service nao expoe customizacao por instancia (decisao A1).
 */
export interface ToastInstance {
  /** Id unico (incremental simples). */
  readonly id: number;

  /** Variant visual + cor + icone. */
  readonly variant: ToastVariant;

  /** Mensagem textual a exibir. Sem markup HTML — texto puro. */
  readonly message: string;
}

/**
 * Duracao default por variant (em ms). Definida no service, nao exposta
 * na API publica.
 */
export const TOAST_DEFAULT_DURATION_MS: Record<ToastVariant, number> = {
  success: 4000,
  info: 4000,
  warning: 4000,
  error: 6000,
};

/**
 * Maximo de toasts simultaneos visiveis. Quando excedido, o mais antigo
 * (FIFO) e descartado para dar espaco ao novo.
 */
export const TOAST_MAX_STACK = 5;
