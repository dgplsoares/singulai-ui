/**
 * ⭐ **O ACENTO É UMA UNIÃO FECHADA, não um hex solto.** O Figma usa quatro cores de título
 * (`#3e70bd` · `#db6b1a` · `#46969c` · `#503c97`), uma por tipo de evento. Aceitar o hex como
 * input deixaria o DS sem paleta própria e faria cada consumidor repetir os literais.
 * ⛔ E o DS **não conhece lead, chat nem status** — quem traduz tipo→acento é a tela, como o
 * `ds-conversation-timeline` já faz com `'them' | 'us'`.
 */
export type DsActivityAccent = 'blue' | 'orange' | 'teal' | 'purple';

export interface DsActivityBadge {
  label: string;
  tone: DsActivityAccent;
}

export interface DsActivityItem {
  id: string;
  /** Nome do heroicon, como o consumidor o registra. */
  icon: string;
  title: string;
  description: string;
  /** ISO. ⛔ O DS **não** formata data de domínio: recebe pronto para exibir. */
  at: string;
  badges: DsActivityBadge[];
  accent: DsActivityAccent;
}
