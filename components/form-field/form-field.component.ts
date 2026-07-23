import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { NgIconComponent } from '@ng-icons/core';

import {
  FormFieldOption,
  FormFieldSize,
  FormFieldType,
  FormFieldVariant,
} from './form-field.types';

let uidCounter = 0;

/**
 * FormField — campo de formulario unificado do DS Singulai.
 *
 * Cobre 5 variants essenciais (DS-2.1): text, textarea, select, toggle, search.
 * Restantes (checkbox, radio, date, time, color, file-upload, multi-select)
 * em DS-2.2.
 *
 * Implementa ControlValueAccessor para integracao com Angular Reactive Forms
 * e Template-driven forms.
 *
 * Uso (Reactive Forms):
 *   <ds-form-field
 *     variant="text"
 *     label="Titulo do Curso"
 *     placeholder="Ex: Design de Interfaces"
 *     formControlName="title"
 *     [required]="true"
 *   />
 *
 * Uso (Template-driven):
 *   <ds-form-field
 *     variant="select"
 *     label="Categoria"
 *     [(ngModel)]="categoria"
 *     [options]="categoriasOptions"
 *   />
 */
@Component({
  selector: 'ds-form-field',
  standalone: true,
  imports: [FormsModule, NgIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormFieldComponent),
      multi: true,
    },
  ],
})
export class FormFieldComponent implements ControlValueAccessor {
  /** Variant do campo. Obrigatorio. */
  readonly variant = input.required<FormFieldVariant>();

  /** Tamanho. Default: md. */
  readonly size = input<FormFieldSize>('md');

  /** Tipo HTML do input (so para variant=text). Default: text. */
  readonly type = input<FormFieldType>('text');

  /** Label exibido acima do input. */
  readonly label = input<string | null>(null);

  /** Placeholder do input. */
  readonly placeholder = input<string>('');

  /** Texto de hint abaixo do input. */
  readonly hint = input<string | null>(null);

  /** Mensagem de erro (override do estado interno). */
  readonly errorMessage = input<string | null>(null);

  /** Marca como obrigatorio (asterisco no label + aria-required). */
  readonly required = input<boolean>(false);

  /** Estado disabled. */
  readonly disabled = input<boolean>(false);

  /** Estado de loading (spinner no canto direito). */
  readonly loading = input<boolean>(false);

  /** Numero de linhas (so textarea). Default: 4. */
  readonly rows = input<number>(4);

  /** Maximo de caracteres. */
  readonly maxLength = input<number | null>(null);

  /** Opcoes (so variant=select). */
  readonly options = input<FormFieldOption[] | null>(null);

  /** Pre-fixo aria-describedby externo (para concat com hint/error internos). */
  readonly externalDescribedBy = input<string | null>(null);

  // --------------------------------------------------------------------------
  // Asset overrides (split-ready). Defaults preservam paths Singulai atuais.
  // --------------------------------------------------------------------------
  readonly chevronDownIconSrc = input<string>('branding/icons/form/chevron-down.svg');
  readonly searchIconSrc = input<string>('branding/icons/form/search.svg');

  /** Emite a cada mudanca (alem do ngModel/formControl). */
  @Output() readonly valueChange = new EventEmitter<unknown>();

  /** Emite ao perder foco. */
  @Output() readonly blurred = new EventEmitter<FocusEvent>();

  /** ID unico do campo (para label-for + aria-describedby). */
  protected readonly fieldId = `ds-field-${++uidCounter}`;
  protected readonly hintId = `${this.fieldId}-hint`;
  protected readonly errorId = `${this.fieldId}-error`;

  // Estado interno
  protected readonly value = signal<unknown>('');
  protected readonly touched = signal<boolean>(false);
  protected readonly internalDisabled = signal<boolean>(false);

  // Estado disabled efetivo (input OU CVA)
  protected readonly isDisabled = computed(
    () => this.disabled() || this.internalDisabled(),
  );

  // Estado de erro: ha errorMessage E foi tocado
  protected readonly hasError = computed(
    () => Boolean(this.errorMessage()) && this.touched(),
  );

  // Aria-describedby concatenado: externo + hint + error
  protected readonly ariaDescribedBy = computed(() => {
    const parts: string[] = [];
    if (this.externalDescribedBy()) parts.push(this.externalDescribedBy()!);
    if (this.hint()) parts.push(this.hintId);
    if (this.hasError()) parts.push(this.errorId);
    return parts.length > 0 ? parts.join(' ') : null;
  });

  // Tamanho do valor atual (usado para counter no textarea)
  protected readonly valueLength = computed(() => {
    const v = this.value();
    return typeof v === 'string' ? v.length : 0;
  });

  // CVA callbacks
  private onChangeFn: (v: unknown) => void = () => {};
  private onTouchedFn: () => void = () => {};

  // ----- ControlValueAccessor -----
  writeValue(value: unknown): void {
    this.value.set(value);
  }

  registerOnChange(fn: (v: unknown) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.internalDisabled.set(isDisabled);
  }

  // ----- Handlers internos -----
  protected onInput(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const newValue =
      this.variant() === 'toggle'
        ? (target as HTMLInputElement).checked
        : target.value;
    this.value.set(newValue);
    this.onChangeFn(newValue);
    this.valueChange.emit(newValue);
  }

  protected onBlur(event: FocusEvent): void {
    this.touched.set(true);
    this.onTouchedFn();
    this.blurred.emit(event);
  }

  protected clearSearch(): void {
    if (this.isDisabled()) return;
    this.value.set('');
    this.onChangeFn('');
    this.valueChange.emit('');
  }
}
