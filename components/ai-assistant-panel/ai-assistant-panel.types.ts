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

// ============================================================================
// G1 (DEC-CHAT1-API-6): Settings dropdown data-switchers
// ============================================================================

/** Nivel de criatividade enviado ao LLM. Default: 'medium'. */
export type AiCreativityLevel = 'low' | 'medium' | 'high';

/** Tom de voz da resposta. Default: 'casual'. */
export type AiVoiceTone = 'formal' | 'casual' | 'tecnico';

/**
 * Configuracoes do prompt enviadas ao LLM via payload (G1+G2 / fire-and-forget).
 * Backend ignora por ora (DEC-CHAT1-API-7); quando implementar, usa
 * transparentemente.
 */
export interface AiPromptConfig {
  /** Criatividade do output (low/medium/high). */
  criatividade: AiCreativityLevel;

  /** Tom de voz (formal/casual/tecnico). */
  tomVoz: AiVoiceTone;

  /** Buscar fontes externas (ja existia como `searchExternal` no legacy). */
  searchExternal: boolean;

  /** Reasoning estendido (ja existia como `extendedThinking` no legacy). */
  extendedThinking: boolean;
}

/** Valor default usado quando localStorage vazio. */
export const DEFAULT_AI_PROMPT_CONFIG: AiPromptConfig = {
  criatividade: 'medium',
  tomVoz: 'casual',
  searchExternal: false,
  extendedThinking: false,
};
