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

export type FormFieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url';

export interface FormFieldOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}
