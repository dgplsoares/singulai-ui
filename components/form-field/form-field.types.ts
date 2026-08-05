// ============================================================================
// FormField — Types
// Doc: .claude/design-system/components/form-fields.md
// DS-2.1 cobre 5 variants essenciais. DS-2.2 completa com checkbox, radio,
// date, time, color, file-upload, multi-select.
// ============================================================================

export type FormFieldVariant =
  | 'text'
  | 'textarea'
  | 'select'
  | 'toggle'
  | 'search';

export type FormFieldSize = 'sm' | 'md' | 'lg';

/**
 * Tipo HTML do input, aplicado apenas em `variant="text"`.
 *
 * Os tres temporais entraram na D.3.4 (`DEC-D.3.4-2`). O DS nao tinha campo de
 * data nenhum, e por isso Cursos e Eventos usam `<input type="date">` cru com
 * classe local — drift que esta fase nao propaga. `datetime-local` cobre
 * "Data/Hora Inicio" e "Data/Hora Termino" do agregado; `date` cobre as duas
 * datas da promocao no step Monetizacao.
 *
 * Nao ha mascara nem formatador aqui: o valor e' o do input nativo
 * (`YYYY-MM-DD` ou `YYYY-MM-DDTHH:mm`). Converter para/de ISO 8601 e' do
 * consumidor — e ATENCAO ao fazer isso: `new Date('2026-04-17')` e' meia-noite
 * UTC e renderiza 16/04 em UTC-3. A listagem de Mentorias resolveu lendo as
 * partes da string (`mentorings-list.page.ts:79-104`).
 */
export type FormFieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'date'
  | 'datetime-local'
  | 'time';

export interface FormFieldOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}
