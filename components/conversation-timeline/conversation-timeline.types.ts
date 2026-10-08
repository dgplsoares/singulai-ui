/**
 * ============================================================================
 * `ds-conversation-timeline` — tipos
 * ============================================================================
 *
 * ⛔⛔ **A FORMA É GENÉRICA DE PROPÓSITO, e isso é a regra de placement cobrando.**
 *
 * O decision tree do projeto pergunta, LITERAL E MECANICAMENTE: *"esse componente faria sentido
 * em outro projeto Angular sem nada de Singulai?"*. Um transcript de mensagens com autor, texto
 * e carimbo de tempo: **sim**. ⇒ ele é do DS, e por isso **não conhece** `ConversaDoLead`,
 * `agent_chat_messages`, agente, lead nem tenant. Quem traduz é o chamador.
 *
 * 📌 Se ele soubesse o que é um "lead", o próximo consumidor teria de fingir ser um lead.
 */

/**
 * De que LADO a mensagem aparece.
 *
 * ⚠️ `'them'`/`'us'` em vez de `'agente'`/`'lead'` — de novo, o DS não tem domínio. No timeline
 * do `Chat IA` o agente é `'them'` (esquerda, chapado) e o lead é `'us'` (direita, em balão),
 * mas num chat de suporte a tradução poderia ser a oposta.
 */
export type ConversationAuthorSide = 'them' | 'us';

export interface ConversationMessage {
  id: string;
  side: ConversationAuthorSide;
  text: string;
  /** ISO. Quem formata é o componente, porque o formato é do DESENHO, não do dado. */
  at: string;
  /** Iniciais do avatar. Vazio esconde o avatar. */
  initials: string;
}

/**
 * Um GRUPO de mensagens — no `Chat IA`, uma sessão de chat.
 *
 * ⭐ O agrupamento é **do desenho**: o Figma (`932:17802`) separa grupos com `gap 20px` e
 * mensagens com `25px`. ⇒ se o componente recebesse uma lista chapada, a regra de agrupamento
 * viveria no chamador E aqui.
 */
export interface ConversationGroup {
  id: string;
  messages: ConversationMessage[];
}
