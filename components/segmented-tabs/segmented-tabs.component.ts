import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  input,
} from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroXMark } from '@ng-icons/heroicons/outline';

import { SegmentedTabItem } from './segmented-tabs.types';

/**
 * SegmentedTabs — segmented control de tabs com visual neumorphic.
 *
 * Reusa o mesmo padrao visual do Figma (1149:14721 e variantes):
 *   Outer frame: gradient + neumorphic shadow + border 1px white + radius 10
 *   Tabs inativos: bg #F6F8FB + inset shadow
 *   Tab ativo: bg transparente + radius 8 (full)
 *   Border-radius das pontas: primeiro left, ultimo right (dinamico via $first/$last)
 *
 * Uso:
 *   <ds-segmented-tabs
 *     [items]="tabItems()"
 *     [activeKey]="active()"
 *     (tabChange)="onTabChange($event)"
 *     (itemClose)="onItemClose($event)"
 *   />
 *
 * Items closable:
 *   { key: 'current', label: 'Chat atual...', closable: true }
 *   → renderiza X ao final. Click no X emite (itemClose) com a key.
 *
 * Acessibilidade:
 *   - Cada tab eh um <button type="button"> (selecao via click/space/enter)
 *   - Close eh <span role="button" tabindex="0"> (HTML invalido aninhar
 *     button dentro de button — pattern adotado eh o mesmo do MUI Chip)
 *   - aria-pressed reflete estado active
 */
@Component({
  selector: 'ds-segmented-tabs',
  standalone: true,
  imports: [NgIconComponent],
  providers: [provideIcons({ heroXMark })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './segmented-tabs.component.html',
  styleUrl: './segmented-tabs.component.scss',
})
export class SegmentedTabsComponent<K extends string = string> {
  /** Lista de tabs a renderizar. Border-radius nas pontas e automatico. */
  readonly items = input.required<SegmentedTabItem<K>[]>();

  /** Tab atualmente selecionada (key). null = nenhum selecionado. */
  readonly activeKey = input<K | null>(null);

  /** Emite a key do tab clicado. */
  @Output() readonly tabChange = new EventEmitter<K>();

  /**
   * Emite a key do item cujo close (X) foi acionado. So dispara em items
   * com `closable: true`. O click no X NAO dispara (tabChange) — apenas
   * (itemClose).
   */
  @Output() readonly itemClose = new EventEmitter<K>();

  protected onTabClick(item: SegmentedTabItem<K>): void {
    if (item.disabled) return;
    this.tabChange.emit(item.key);
  }

  protected onCloseClick(event: Event, key: K): void {
    // Para nao acionar o click do parent (tabChange)
    event.stopPropagation();
    this.itemClose.emit(key);
  }

  protected onCloseKey(event: Event, key: K): void {
    event.stopPropagation();
    event.preventDefault();
    this.itemClose.emit(key);
  }
}
