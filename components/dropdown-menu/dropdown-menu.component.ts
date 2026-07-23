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
import { NgIconComponent } from '@ng-icons/core';

import { DropdownMenuItem, DropdownMenuPosition } from './dropdown-menu.types';

/**
 * DropdownMenu — overlay menu reusavel ancorado num trigger projetado.
 *
 * Usado em:
 *   - Header do `<ds-card variant="dashboard">` — botao kebab (3 pontos) abre
 *     menu de opcoes do card (Atualizar, links internos, etc)
 *   - Filtros de listagem (Fase A — `<ds-filter-dropdown>` pode reusar)
 *   - Account dropdown da sidebar (DS-2.2)
 *
 * Implementacao via CDK Overlay (FlexibleConnectedPositionStrategy) — fecha
 * em click fora, ESC, e click no proprio item.
 *
 * Uso:
 *   <ds-dropdown-menu
 *     [items]="dropdownItems"
 *     position="bottom-end"
 *     (itemSelect)="onMenuClick($event)"
 *   >
 *     <button trigger>⋮</button>
 *   </ds-dropdown-menu>
 *
 * O conteudo projetado e o trigger (button kebab, link, etc). O dropdown
 * abre/fecha ao click do trigger automaticamente.
 */
@Component({
  selector: 'ds-dropdown-menu',
  standalone: true,
  imports: [OverlayModule, NgIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dropdown-menu.component.html',
  styleUrl: './dropdown-menu.component.scss',
})
export class DropdownMenuComponent {
  /** Items do dropdown (action buttons + dividers). */
  readonly items = input.required<DropdownMenuItem[]>();

  /** Posicao do dropdown relativa ao trigger. Default: bottom-end. */
  readonly position = input<DropdownMenuPosition>('bottom-end');

  /** Aria-label do menu — para screen readers. */
  readonly ariaLabel = input<string>('Menu de opcoes');

  /**
   * Largura minima do menu (CSS). Default: '180px'. Quando consumer precisa
   * menu mais largo (ex: items longos), passar valor custom (ex: '240px').
   */
  readonly minWidth = input<string>('180px');

  /** Emitido com a `key` do item selecionado. */
  @Output() readonly itemSelect = new EventEmitter<string>();

  /** Emitido quando o estado open/close muda. */
  @Output() readonly openChange = new EventEmitter<boolean>();

  // ----- State interno -----

  protected readonly isOpen = signal<boolean>(false);

  /** Mapeamento de DropdownMenuPosition para ConnectedPosition do CDK. */
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

  /**
   * Toggle dropdown — chamado pelo click no trigger projetado.
   * **PUBLIC para uso imperativo via @ViewChild** (ex: page chama
   * `dropdownMenuRef.toggle()` em resposta a um trigger externo como
   * o botao "Personalizar" do <ds-page-header>).
   */
  toggle(): void {
    this.setOpen(!this.isOpen());
  }

  /**
   * Fecha o dropdown — usado por overlay outside-click + ESC + item-select.
   * **PUBLIC para uso imperativo via @ViewChild**.
   */
  close(): void {
    this.setOpen(false);
  }

  /**
   * Abre o dropdown — uso imperativo via @ViewChild.
   */
  open(): void {
    this.setOpen(true);
  }

  protected onItemClick(item: DropdownMenuItem): void {
    if (item.disabled || item.divider || item.header) return;
    this.itemSelect.emit(item.key);
    if (!item.keepOpen) this.close();
  }

  private setOpen(value: boolean): void {
    if (this.isOpen() === value) return;
    this.isOpen.set(value);
    this.openChange.emit(value);
  }
}
