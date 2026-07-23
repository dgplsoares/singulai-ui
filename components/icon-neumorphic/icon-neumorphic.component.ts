import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { NgIconComponent } from '@ng-icons/core';

import {
  ICON_NEUMORPHIC_SIZES,
  IconNeumorphicSize,
  IconNeumorphicVariant,
} from './icon-neumorphic.types';

/**
 * IconNeumorphic — Container com moldura neumorphic envolvendo um icone.
 *
 * Uso:
 *   <ds-icon-neumorphic icon="heroChartBar" size="md" variant="apex" />
 *
 * O nome do icone deve ser registrado via `provideIcons()` no provider do
 * componente que o consome (padrao @ng-icons).
 */
@Component({
  selector: 'ds-icon-neumorphic',
  standalone: true,
  imports: [NgIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './icon-neumorphic.component.html',
  styleUrl: './icon-neumorphic.component.scss',
})
export class IconNeumorphicComponent {
  /**
   * Nome do icone (ex: 'heroChartBar', 'heroDocument'). Registrado via provideIcons
   * no consumidor. Use APENAS quando nao houver iconImageSrc.
   */
  readonly icon = input<string | null>(null);

  /**
   * Caminho do SVG (relativo a public/). Quando presente, renderiza <img> ao
   * inves de <ng-icon>, util para icones do Figma sem equivalente em heroicons.
   */
  readonly iconImageSrc = input<string | null>(null);

  /** Tamanho do container neumorphic. Default: md (40x40). */
  readonly size = input<IconNeumorphicSize>('md');

  /** Variante de cor do icone interno. Default: default (cinza-azulado). */
  readonly variant = input<IconNeumorphicVariant>('default');

  /** Label de acessibilidade. Quando ausente, container e marcado como decorativo. */
  readonly ariaLabel = input<string | null>(null);

  /**
   * Frameless — quando true, omite a moldura neumorphic (background, sombras,
   * border). Renderiza apenas o glyph interno, com o tamanho `inner` da size
   * escolhida. Util quando precisa do mesmo pipeline de icone (file SVG via
   * iconImageSrc OU heroicon via icon) mas sem o frame visual — ex: icones
   * em headers de modal, body texts, badges.
   *
   * Pattern (per pedido do usuario): icones devem ser componentizados para
   * que substituicao do arquivo SVG propague automaticamente. Frameless
   * cobre os usos sem moldura mantendo o mesmo componente DS.
   */
  readonly frameless = input<boolean>(false);

  protected readonly dimensions = computed(() => ICON_NEUMORPHIC_SIZES[this.size()]);
}
