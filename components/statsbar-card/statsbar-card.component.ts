import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import {
  StatsbarCardDeltaDirection,
  StatsbarCardVariant,
} from './statsbar-card.types';

/**
 * StatsbarCard — Card horizontal do statsbar (Figma 1088:14316).
 *
 * Layout: [icon-bg] + [title (bold 14) / value (extra-bold 20) + delta-badge].
 *
 * Uso:
 *   <ds-statsbar-card
 *     title="Assinantes"
 *     value="323"
 *     delta="5%"
 *     deltaDirection="up"
 *     variant="success"
 *     iconImageSrc="branding/icons/statsbar/01-assinantes.svg"
 *   />
 *
 * 6 colorVariants: success / purple / warning / info / danger / neutral.
 *
 * Inverse polarity (inversePolarity): inverte a cor do delta — quando true e a
 * direcao e UP, mostra como negativo (danger). Use quando o aumento da
 * metrica e ruim (ex: "Tickets em aberto" subindo).
 */
@Component({
  selector: 'ds-statsbar-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './statsbar-card.component.html',
  styleUrl: './statsbar-card.component.scss',
})
export class StatsbarCardComponent {
  /** Titulo do card (label da metrica). */
  readonly title = input.required<string>();

  /** Valor numerico/textual da metrica (ex: "323", "1.5k"). */
  readonly value = input.required<string | number>();

  /** Delta % a ser exibido no badge (ex: "5%"). Quando ausente, badge oculto. */
  readonly delta = input<string | null>(null);

  /** Direcao da seta do delta. Default: up. */
  readonly deltaDirection = input<StatsbarCardDeltaDirection>('up');

  /**
   * Inverte a polaridade do delta — quando true:
   *   - up   = ruim (vermelho)
   *   - down = bom (verde)
   * Default: false (up=bom, down=ruim).
   */
  readonly inversePolarity = input<boolean>(false);

  /** ColorVariant do card. */
  readonly variant = input<StatsbarCardVariant>('neutral');

  /**
   * Caminho do SVG do icone (relativo a public/). Renderizado dentro do
   * icon-bg circle 50x50.
   */
  readonly iconImageSrc = input<string | null>(null);

  /** Largura natural do icone interno (px). Default: 22. */
  readonly iconWidth = input<number>(22);

  /** Altura natural do icone interno (px). Default: 22. */
  readonly iconHeight = input<number>(22);

  /**
   * Polaridade efetiva do delta — calcula se e positivo (verde) ou negativo
   * (vermelho) com base em deltaDirection + inversePolarity.
   */
  protected readonly deltaPolarity = computed<'positive' | 'negative'>(() => {
    const dir = this.deltaDirection();
    const inverse = this.inversePolarity();
    if (dir === 'up') return inverse ? 'negative' : 'positive';
    return inverse ? 'positive' : 'negative';
  });
}
