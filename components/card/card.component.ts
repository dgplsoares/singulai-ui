import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  computed,
  input,
} from '@angular/core';

import { IconNeumorphicComponent } from '../icon-neumorphic';
import {
  CardDropdownItem,
  CardNavTab,
  CardState,
  CardVariant,
} from './card.types';

/**
 * Card — container generico do DS Singulai.
 *
 * Estrutura:
 *  - Header (opcional): icon-neumorphic + titulo + nav-tabs + dropdown opcoes
 *  - Body: <ng-content> projecao livre
 *  - Estados especiais: loading (skeleton), empty, error (via slots)
 *
 * Uso:
 *   <ds-card title="Uso do Plano" icon="heroChartBar" variant="default">
 *     <p>Conteudo do body</p>
 *   </ds-card>
 *
 *   <ds-card title="Receitas" icon="heroBanknotes"
 *            [navTabs]="periodTabs" (tabChange)="onPeriod($event)">
 *     <chart-area-component />
 *   </ds-card>
 */
@Component({
  selector: 'ds-card',
  standalone: true,
  imports: [IconNeumorphicComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent {
  /** Titulo exibido no header. Se ausente e variant != inner-card, header e oculto. */
  readonly title = input<string | null>(null);

  /** Icone neumorphic do header (nome registrado em provideIcons). */
  readonly icon = input<string | null>(null);

  /** Variant do card. Default: default. */
  readonly variant = input<CardVariant>('default');

  /** Estado especial. Default: default (mostra ng-content). */
  readonly state = input<CardState>('default');

  /** Tabs de navegacao no header (period-selector, view-mode, etc). */
  readonly navTabs = input<CardNavTab[] | null>(null);

  /** Itens do dropdown de opcoes (kebab no canto direito). */
  readonly dropdownItems = input<CardDropdownItem[] | null>(null);

  /** Aria label do card como regiao. Default: o titulo. */
  readonly ariaLabel = input<string | null>(null);

  /** Emitido quando uma tab e clicada. */
  @Output() readonly tabChange = new EventEmitter<string>();

  /** Emitido quando um item do dropdown e clicado. */
  @Output() readonly dropdownAction = new EventEmitter<string>();

  /** Header e visivel se ha icon ou titulo, e variant != inner-card. */
  protected readonly hasHeader = computed(
    () =>
      this.variant() !== 'inner-card' &&
      (Boolean(this.title()) || Boolean(this.icon())),
  );

  protected readonly accessibleLabel = computed(
    () => this.ariaLabel() ?? this.title() ?? 'Card',
  );

  protected readonly isDashboard = computed(() => this.variant() === 'dashboard');
  protected readonly isInner = computed(() => this.variant() === 'inner-card');

  protected onTabClick(key: string): void {
    this.tabChange.emit(key);
  }

  protected onDropdownClick(key: string): void {
    this.dropdownAction.emit(key);
  }

  // Estado de dropdown aberto/fechado (controle simples)
  protected readonly dropdownOpen = computed(() => false);

  // Toggle nao implementado nesta versao DS-2.1 — dropdown abre/fecha sera
  // implementado em DS-2.1.B com Angular CDK Overlay (componente proprio).
  // Por enquanto, o evento dropdownAction e disparado direto se o consumer
  // implementar o overlay externamente, ou o consumer usa o slot [card-actions].
}
