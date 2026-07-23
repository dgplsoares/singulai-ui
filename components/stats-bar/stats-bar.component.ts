import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';

import { StatsBarColumns } from './stats-bar.types';

/**
 * StatsBar — container horizontal para N <ds-statsbar-card>.
 *
 * REDASH-FASE-A A.2 (revisado 2026-05-12, DEC-DSA-M revisada).
 *
 * Pattern visual extraido do `showcase__statsbar` (showcase canonico, ja
 * validado em producao no dashboard principal) — bg `#EFF3F8` + gradient
 * light + border `#DBE0E5` + radius 12px + inner white shadow.
 *
 * Slot-based: aceita N `<ds-statsbar-card>` filhos via `<ng-content>`. Caller
 * compoe o markup — o container apenas fornece o chrome do Figma + layout
 * responsive (desktop flex row, mobile 2x2 grid).
 *
 * **Mantem 6 colors** do `<ds-statsbar-card>` (success/purple/warning/info/
 * danger/neutral). Legado `<app-stats-bar>` permanece em `app/shared/` sem
 * facade DS.
 *
 * **Figma master:** DEC-FIG-A-2 (25 URLs catalogadas em
 * `links-figma-redesign-telas.md` linhas 604-644) — padrao unico para todos
 * os dashboards + listagens internas. Amostras: 787-5195 (Cursos sem delta),
 * 842-10268 (Lives com delta).
 *
 * @example
 *   <ds-stats-bar [columns]="4">
 *     <ds-statsbar-card title="Lives Realizadas" value="97" delta="5%" variant="info" />
 *     <ds-statsbar-card title="Lives Agendadas" value="3" delta="5%" variant="warning" />
 *     <ds-statsbar-card title="Audiencia Media" value="127" delta="5%" variant="success" />
 *     <ds-statsbar-card title="Gravacoes" value="42" delta="5%" variant="purple" />
 *   </ds-stats-bar>
 */
@Component({
  selector: 'ds-stats-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stats-bar.component.html',
  styleUrl: './stats-bar.component.scss',
})
export class StatsBarComponent {
  /**
   * Numero de colunas. Default 4. Em mobile (<=991px) sempre vira 2x2 grid
   * independente do valor, exceto quando columns=1 ou 2 (mantem).
   */
  readonly columns = input<StatsBarColumns>(4);

  /** Aria-label do container — para screen readers. */
  readonly ariaLabel = input<string>('Estatisticas');
}
