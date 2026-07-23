import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroPlus,
  heroCheck,
} from '@ng-icons/heroicons/outline';

/**
 * <ds-segmented-button>
 *
 * Sub-Fase E.2.7 (2026-06-21). DEC-FIG-D-AULAS-E.2.7.A.
 *
 * Botão standalone com chrome neumorphic do <ds-segmented-tabs>. Pixel-perfect
 * contra Figma 602:872 (size=sm) e 608:1173 (size=lg).
 *
 * Compartilha o frame visual com <ds-segmented-tabs> mas com 1 botão só:
 * - border #d5dee9 + outer shadow neumorphic (2-layer)
 * - bg gradient: linear-gradient(5.85deg, #FFF 8.6%, #f6f9fb 30.8%, #f6f9fb 49.5%, #d9e0ee 78.4%)
 * - inset radius 8px + inset shadow + text #466fa9 Manrope SemiBold
 *
 * Sizes:
 * - sm: padding 12px, text 12px, icon 10px, h:34px (header CTA, Figma 602:872)
 * - lg: padding 30x15, text 14px, icon 10px, auto-height (large CTA, Figma 608:1173)
 *
 * USO ESPERADO: botões "Adicionar X" em headers de cards (sm) e CTAs ao final
 * de listagens (lg). PROIBIDO usar para tabs (use <ds-segmented-tabs>) ou para
 * ações primárias de form (use <ds-button variant=solid>).
 */
@Component({
  selector: 'ds-segmented-button',
  standalone: true,
  imports: [CommonModule, NgIcon],
  providers: [
    provideIcons({
      heroPlus,
      heroCheck,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './segmented-button.component.html',
  styleUrl: './segmented-button.component.scss',
})
export class SegmentedButtonComponent {
  // ============================================================================
  // Inputs
  // ============================================================================

  /** Label do botão. */
  readonly label = input.required<string>();

  /** Ícone heroicon à esquerda (opcional). */
  readonly iconLeft = input<string | undefined>(undefined);

  /** Tamanho: sm (header CTA) | lg (footer CTA grande). */
  readonly size = input<'sm' | 'lg'>('sm');

  /** Estado disabled. */
  readonly disabled = input<boolean>(false);

  /** Aria-label opcional (default = label). */
  readonly ariaLabel = input<string | undefined>(undefined);

  // ============================================================================
  // Outputs
  // ============================================================================
  readonly clicked = output<void>();

  // ============================================================================
  // Handlers
  // ============================================================================
  protected onClick(event: Event): void {
    if (this.disabled()) return;
    event.stopPropagation();
    this.clicked.emit();
  }
}
