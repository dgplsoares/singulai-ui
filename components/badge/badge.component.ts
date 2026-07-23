import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { BadgeShape, BadgeSize, BadgeVariant } from './badge.types';

/**
 * Badge — pill/rounded de status, categoria ou tag.
 *
 * REDASH-FASE-A A.5 — primeiro primitivo da Listagem Core DS.
 * Substitui badges inline duplicados em IMPL-6/11/13 (mini-tables do dashboard)
 * + patterns shared espalhados (kanban-board, step-tabs-pill, etc).
 *
 * Padronizacao DEC-DSA-L: 8 variants color alinhadas com <ds-progress-bar>.
 *
 * Uso:
 *   <ds-badge variant="success">Ativo</ds-badge>
 *   <ds-badge variant="warning" shape="rounded">
 *     <ng-icon name="heroBookOpen" />
 *     Arquivo PDF
 *   </ds-badge>
 *
 * Figma:
 *   - pill (default):  patterns inline IMPL-6/11/13 (status badges das mini-tables)
 *   - rounded:         Figma 627-3162 (badge com icone, status assets de aula)
 */
@Component({
  selector: 'ds-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.scss',
})
export class BadgeComponent {
  /** Variant de cor (8 opcoes — alinhadas com <ds-progress-bar>). */
  readonly variant = input<BadgeVariant>('neutral');

  /** Tamanho do badge. Default: sm (10px font — das mini-tables). */
  readonly size = input<BadgeSize>('sm');

  /** Shape — pill (50px) ou rounded (8px). Default: pill. */
  readonly shape = input<BadgeShape>('pill');

  /** Aria-label opcional para screen readers. */
  readonly ariaLabel = input<string | null>(null);
}
