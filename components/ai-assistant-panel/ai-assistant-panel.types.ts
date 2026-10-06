// ============================================================================
// AI Assistant Panel — Types
// ============================================================================

/** Tab atual no header do AI panel. */
export type AiTab = 'current' | 'new' | 'chats';

/** Origem de uma mensagem na timeline. */
export type AiMessageRole = 'ai' | 'user';

/**
 * Segmento de texto com formatacao opcional. Permite destacar termos/nomes
 * dentro da mensagem (ex: "Olá, **John Doe**!").
 */
export interface AiMessageSegment {
  text: string;
  bold?: boolean;
}

/**
 * Um paragrafo: string simples (sem formatacao) OU array de segmentos
 * (com formatacao bold em alguns trechos).
 */
export type AiMessageParagraph = string | AiMessageSegment[];

/** Uma mensagem renderizada no chat (timeline). */
export interface AiMessage {
  id: string;
  role: AiMessageRole;
  /**
   * Lista de paragrafos da mensagem. Cada paragrafo eh uma string simples
   * ou array de segmentos (com bold opcional em trechos).
   */
  paragraphs: AiMessageParagraph[];
  /** Nome do agente (so para AI, ex: "Assistente IA"). */
  agentLabel?: string;
}

