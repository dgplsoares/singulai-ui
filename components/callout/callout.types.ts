/**
 * Tom do aviso.
 *
 * `info` e' o unico desenhado hoje (Figma `760:5891`). Os outros tres existem
 * porque a mesma caixa vai receber avisos de outras naturezas — e acrescentar
 * variante depois exigiria mexer no componente, no showcase e no catalogo do
 * MCP de uma vez. O custo agora e' uma linha de SCSS por tom.
 */
export type CalloutVariant = 'info' | 'success' | 'warning' | 'danger';
