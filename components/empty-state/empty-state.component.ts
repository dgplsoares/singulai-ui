import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  input,
} from '@angular/core';
import { NgIconComponent } from '@ng-icons/core';

import { ButtonComponent } from '../button';
import { EmptyStateSize, EmptyStateVariant } from './empty-state.types';

/**
 * EmptyState — placeholder padronizado para listagens vazias, buscas sem
 * resultado, recursos nao criados ou erros de carregamento.
 *
 * REDASH-FASE-A A.6 — segundo primitivo da Listagem Core DS.
 * Pattern visual: icone centralizado em cima + title + description (opcional)
 * + CTA (opcional) abaixo.
 *
 * NAO inclui envelope/card chrome — e apenas o conteudo interno. Caller decide
 * se envolve em <ds-card-panel> body, offcanvas, full page, etc.
 *
 * Uso:
 *   <ds-empty-state
 *     icon="heroVideoCamera"
 *     title="Nenhuma live vinculada a este curso"
 *     variant="default"
 *     size="sm"
 *   />
 *
 *   <ds-empty-state
 *     icon="heroMagnifyingGlass"
 *     title="Nenhum resultado encontrado"
 *     description="Tente outros termos de busca ou ajuste os filtros."
 *     ctaLabel="Limpar filtros"
 *     variant="no-results"
 *     (ctaClick)="onClearFilters()"
 *   />
 *
 * Figma: 764-6987 (size=sm pattern em card-panel body)
 */
@Component({
  selector: 'ds-empty-state',
  standalone: true,
  imports: [NgIconComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
})
export class EmptyStateComponent {
  /**
   * Heroicon name (ex: 'heroInbox', 'heroVideoCamera', 'heroMagnifyingGlass').
   * Caller deve registrar o icone via `provideIcons()`.
   * Mutuamente exclusivo com iconImageSrc.
   */
  readonly icon = input<string | null>(null);

  /**
   * Caminho do SVG asset (relativo a public/). Use quando o icone nao tem
   * equivalente em heroicons OU precisa de visual com filter/gradient.
   * Mutuamente exclusivo com icon.
   */
  readonly iconImageSrc = input<string | null>(null);

  /** Title principal — obrigatorio. Manrope Regular/SemiBold conforme size. */
  readonly title = input.required<string>();

  /** Description opcional — linha de contexto abaixo do title. */
  readonly description = input<string | null>(null);

  /** Label do botao CTA. Quando ausente, CTA nao e renderizado. */
  readonly ctaLabel = input<string | null>(null);

  /** Icone do CTA (heroicon). Renderizado a esquerda do label do botao. */
  readonly ctaIcon = input<string | null>(null);

  /**
   * Variant semantica. Marca semantica (ARIA/tracking/analytics) — todas
   * usam mesma cor de icone (#5C6F8E) por decisao do usuario 2026-05-12.
   * Padrao: default.
   */
  readonly variant = input<EmptyStateVariant>('default');

  /** Tamanho do empty state. Default: sm (Figma 764-6987). */
  readonly size = input<EmptyStateSize>('sm');

  /** Aria-label do CTA. Quando ausente, usa ctaLabel. */
  readonly ctaAriaLabel = input<string | null>(null);

  /** Emitido ao clicar no CTA. */
  @Output() readonly ctaClick = new EventEmitter<void>();

  protected onCtaClick(): void {
    this.ctaClick.emit();
  }
}
