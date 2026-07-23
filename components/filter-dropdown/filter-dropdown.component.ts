import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  computed,
  input,
  signal,
} from '@angular/core';
import { ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroChevronDown, heroFunnel } from '@ng-icons/heroicons/outline';

import {
  FilterDropdownPosition,
  FilterDropdownItem,
  FilterDropdownMode,
} from './filter-dropdown.types';

/**
 * FilterDropdown — multi-select filter via overlay com checkboxes neumorphic.
 *
 * REDASH-FASE-A A.4 (Figma 952-15654 / 952-16189 / 952-16231 / 952-16238).
 *
 * Pattern visual:
 *   - Trigger: pill neumorphic (bg #EDF1F6 + drop/inset shadows) com icon
 *     filter a esquerda + label + chevron a direita
 *   - Overlay: container neumorphic com lista vertical de checkboxes round
 *   - Checkbox: 16x16 round, selecionado tem gradient azul + shadow externo
 *     neumorphic; nao-selecionado tem bg #E3EDF7 + inset neumorphic
 *
 * Comportamento multi-select (DEC-DSA-O):
 *   - Caller passa `options: FilterDropdownItem[]` + `selectedValues: string[]`
 *   - Componente renderiza checkboxes; click em cada toggla o value em
 *     `selectedValues` (emitido via filtersChange)
 *   - Click fora / ESC fecha o overlay
 *   - Pattern "Todos" (primeiro item, value='all' ou similar) e
 *     responsabilidade do caller — para implementar "select all" usar o
 *     proprio handler para zerar ou popular o array
 *
 * @example
 *   <ds-filter-dropdown
 *     [options]="[
 *       { value: 'all',       label: 'Todos',       count: 7 },
 *       { value: 'confirmed', label: 'Confirmados', count: 3 },
 *       { value: 'pending',   label: 'Pendentes',   count: 2 },
 *       { value: 'reversed',  label: 'Estornados',  count: 2 }
 *     ]"
 *     [selectedValues]="['all']"
 *     triggerLabel="Todos"
 *     (filtersChange)="onFilterChange($event)"
 *   />
 */
@Component({
  selector: 'ds-filter-dropdown',
  standalone: true,
  imports: [OverlayModule, NgIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ heroChevronDown, heroFunnel })],
  templateUrl: './filter-dropdown.component.html',
  styleUrl: './filter-dropdown.component.scss',
})
export class FilterDropdownComponent {
  /** Lista de opcoes de filtro. */
  readonly options = input.required<FilterDropdownItem[]>();

  /** Values atualmente selecionados. Controlado pelo caller. */
  readonly selectedValues = input<string[]>([]);

  /**
   * Label do trigger button. Pattern Figma: nome do filtro ativo
   * (ex: 'Todos', 'Confirmados', 'Multiplos').
   */
  readonly triggerLabel = input<string>('Filtro');

  /**
   * Icone do trigger (heroicon). Default: heroFunnel (icone filter padrao
   * do Figma). Caller pode override (ex: heroAdjustmentsHorizontal).
   */
  readonly triggerIcon = input<string>('heroFunnel');

  /** Posicao do overlay relativa ao trigger. Default: bottom-start. */
  readonly position = input<FilterDropdownPosition>('bottom-start');

  /** Aria-label do trigger button. */
  readonly ariaLabel = input<string>('Filtrar');

  /** Largura minima do overlay. Default: 200px. */
  readonly minWidth = input<string>('200px');

  /**
   * Modo de selecao (DEC-G4.3-F). Default 'multi' (retrocompat).
   * 'single': click substitui selecao + fecha overlay.
   */
  readonly mode = input<FilterDropdownMode>('multi');

  /** Emitido com o novo array de selectedValues apos toggle. */
  @Output() readonly filtersChange = new EventEmitter<string[]>();

  /** Emitido ao abrir/fechar. */
  @Output() readonly openChange = new EventEmitter<boolean>();

  // ----- State interno -----

  protected readonly isOpen = signal<boolean>(false);

  /** Mapeamento de FilterDropdownPosition para ConnectedPosition CDK. */
  protected readonly positions = computed<ConnectedPosition[]>(() => {
    const pos = this.position();
    switch (pos) {
      case 'bottom-start':
        return [{
          originX: 'start', originY: 'bottom',
          overlayX: 'start', overlayY: 'top',
          offsetY: 4,
        }];
      case 'bottom-end':
        return [{
          originX: 'end', originY: 'bottom',
          overlayX: 'end', overlayY: 'top',
          offsetY: 4,
        }];
      case 'top-start':
        return [{
          originX: 'start', originY: 'top',
          overlayX: 'start', overlayY: 'bottom',
          offsetY: -4,
        }];
      case 'top-end':
        return [{
          originX: 'end', originY: 'top',
          overlayX: 'end', overlayY: 'bottom',
          offsetY: -4,
        }];
    }
  });

  protected toggle(): void {
    this.setOpen(!this.isOpen());
  }

  protected close(): void {
    this.setOpen(false);
  }

  /** Verifica se um value esta selecionado (para data-attr no template). */
  protected isSelected(value: string): boolean {
    return this.selectedValues().includes(value);
  }

  /**
   * Click em uma option.
   * - single: substitui a selecao por [value] e fecha overlay
   * - multi: toggla o value (add/remove) e mantem overlay aberto
   */
  protected onOptionClick(option: FilterDropdownItem): void {
    if (option.disabled) return;

    if (this.mode() === 'single') {
      this.filtersChange.emit([option.value]);
      this.close();
      return;
    }

    const current = this.selectedValues();
    const isSelected = current.includes(option.value);
    const next = isSelected
      ? current.filter(v => v !== option.value)
      : [...current, option.value];
    this.filtersChange.emit(next);
  }

  private setOpen(value: boolean): void {
    if (this.isOpen() === value) return;
    this.isOpen.set(value);
    this.openChange.emit(value);
  }
}
