import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroVideoCamera,
  heroBookOpen,
  heroCheckCircle,
  heroBars3,
  heroQuestionMarkCircle,
  heroDocumentText,
  heroAcademicCap,
  heroCalendarDays,
  heroUserGroup,
  heroCurrencyDollar,
  heroPhoto,
  heroMagnifyingGlass,
} from '@ng-icons/heroicons/outline';
import { TypePickerOption } from './type-picker.types';

/**
 * <ds-type-picker>
 *
 * Cards visuais para selecao de tipo (kind). Usado no offcanvas de
 * criacao/edicao de aulas (Cursos), sessoes (Mentorias) e programacao
 * (Eventos) da Fase D.
 *
 * Pixel-perfect contra Figma 657:4912 (4 cards: Videoaula/Ebook/Quiz/Texto).
 *
 * API discriminated union (DEC-D-H): TypePickerOption[] com kind tipado.
 *
 * LIGHTMODE-FIRST: zero :host-context(.dark).
 *
 * Componente NOVO standalone (D.2.1 — DEC-D-A herdada).
 *
 * @example
 * <ds-type-picker
 *   [options]="[
 *     { kind: 'videoaula', label: 'Videoaula', iconSrc: '...' },
 *     { kind: 'ebook', label: 'Ebook', icon: 'heroBookOpen' },
 *   ]"
 *   [selectedKind]="kind()"
 *   (selectedKindChange)="kind.set($event)"
 * />
 */
@Component({
  selector: 'ds-type-picker',
  standalone: true,
  imports: [CommonModule, NgIcon],
  providers: [
    provideIcons({
      heroVideoCamera,
      heroBookOpen,
      heroCheckCircle,
      heroBars3,
      heroQuestionMarkCircle,
      heroDocumentText,
      heroAcademicCap,
      heroCalendarDays,
      heroUserGroup,
      heroCurrencyDollar,
      heroPhoto,
      heroMagnifyingGlass,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './type-picker.component.html',
  styleUrl: './type-picker.component.scss',
})
export class TypePickerComponent {
  /** Opcoes a renderizar (1 card por opcao). */
  readonly options = input.required<TypePickerOption[]>();

  /** Kind atualmente selecionado (null = nenhum). */
  readonly selectedKind = input<string | null>(null);

  /** Desabilita TODOS os cards (override do disabled per-option). */
  readonly disabled = input<boolean>(false);

  /**
   * Aria-label do grupo de radio buttons.
   * Default: 'Selecione um tipo'.
   */
  readonly ariaLabel = input<string>('Selecione um tipo');

  /** Emitido quando o usuario seleciona um card. */
  readonly selectedKindChange = output<string>();

  /** Verifica se a opcao esta selecionada. */
  protected isSelected(option: TypePickerOption): boolean {
    return this.selectedKind() === option.kind;
  }

  /** Verifica se a opcao esta desabilitada (global ou per-option). */
  protected isDisabled(option: TypePickerOption): boolean {
    return this.disabled() || option.disabled === true;
  }

  protected onSelect(option: TypePickerOption): void {
    if (this.isDisabled(option)) return;
    if (this.isSelected(option)) return; // no-op se ja selecionado
    this.selectedKindChange.emit(option.kind);
  }

  /** Tamanho do icone para o template (com defaults). */
  protected iconDimensions = computed(() => (option: TypePickerOption) => {
    const w = option.iconWidth ?? 24;
    const h = option.iconHeight ?? w;
    return { width: `${w}px`, height: `${h}px` };
  });
}
