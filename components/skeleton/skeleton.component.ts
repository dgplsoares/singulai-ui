import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

import { SkeletonVariant } from './skeleton.types';

/**
 * Skeleton — placeholder shimmer reutilizavel para estados de loading.
 *
 * REDASH-FASE-A A.8.
 *
 * Pattern visual: gradient linear shimmer (1.6s ease-in-out infinite) sobre
 * tons #E5EBF2 -> #F3F6FB. Pattern canonico extraido de
 * `<ds-card-panel>` (loading state).
 *
 * Primitivos (line/circle/rect) aceitam width/height/radius custom via
 * inputs. Composites (card/row/chart/statsbar/list-item) renderizam
 * layouts pre-definidos e ignoram width/height/radius — caller controla
 * apenas tamanho do container externo se precisar.
 *
 * Uso:
 *   <ds-skeleton variant="line" width="80%" />
 *   <ds-skeleton variant="circle" width="40px" />
 *   <ds-skeleton variant="card" />
 *   <ds-skeleton variant="row" count="3" />
 *   <ds-skeleton variant="list-item" count="5" />
 */
@Component({
  selector: 'ds-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './skeleton.component.html',
  styleUrl: './skeleton.component.scss',
})
export class SkeletonComponent {
  /** Variant — primitivo ou composite. */
  readonly variant = input.required<SkeletonVariant>();

  /**
   * Largura. Aceita qualquer valor CSS ('80%', '120px', 'auto').
   * Aplicado apenas em primitivos (line/circle/rect). Em circle, usado
   * tambem como height (mantem 1:1).
   */
  readonly width = input<string | null>(null);

  /**
   * Altura. Aceita qualquer valor CSS. Aplicado apenas em primitivos
   * (line/rect). Para line, default = 14px.
   */
  readonly height = input<string | null>(null);

  /**
   * Border-radius. Aceita qualquer valor CSS. Aplicado apenas em rect.
   * Para line/circle ja existem radius fixos (4px / 50%).
   */
  readonly radius = input<string | null>(null);

  /**
   * Repeticoes (apenas para variants que aceitam multiplos itens:
   * row, list-item, line). Default: 1.
   */
  readonly count = input<number>(1);

  /** Aria-label. Default: "Carregando...". */
  readonly ariaLabel = input<string>('Carregando...');

  /** Array iteravel derivado de `count` para @for. */
  protected readonly items = computed(() =>
    Array.from({ length: Math.max(1, this.count()) }),
  );

  /** Style inline para primitivos line/rect. */
  protected readonly primitiveStyle = computed(() => {
    const v = this.variant();
    if (v !== 'line' && v !== 'rect' && v !== 'circle') {
      return {};
    }

    const w = this.width();
    const h = this.height();
    const r = this.radius();

    if (v === 'circle') {
      const dim = w ?? '40px';
      return { width: dim, height: dim };
    }

    const style: Record<string, string> = {};
    if (w) style['width'] = w;
    if (h) style['height'] = h;
    if (v === 'rect' && r) style['border-radius'] = r;
    return style;
  });
}
