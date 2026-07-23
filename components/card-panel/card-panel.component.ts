import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * CardPanel — Envelope de card padrao do dashboard (Figma 1088:13519, 14206,
 * 1122:9836, etc).
 *
 * Estrutura visual (Figma):
 * - Outer: bg #EFF3F8, rounded 12px
 * - Mid: border 1px #DBE0E5
 * - Inner: bg gradient + white border, rounded 12px, padding 0 12 15
 *   - Header: icon-neumorphic 34x34 + title (Bold 15 #7A94AC) + actions slot
 *   - Body: border 1px #DFE3EA, rounded 10, bg rgba(255,255,255,0.25), p:20
 *
 * Slots (via content projection):
 * - [card-panel-icon]    — icone do header (ex: icon-neumorphic 34x34)
 * - [card-panel-actions] — area direita do header (period tabs, menu, etc)
 * - [card-panel-body]    — conteudo do body
 *
 * Loading state: quando [loading]=true, body e substituido por skeleton
 * (3 linhas com shimmer animation), independente do conteudo projetado.
 *
 * Uso:
 *   <ds-card-panel title="Funil de vendas">
 *     <ds-icon-neumorphic card-panel-icon iconImageSrc="..." size="sm" />
 *     <div card-panel-actions>...period tabs + menu...</div>
 *     <div card-panel-body>...conteudo...</div>
 *   </ds-card-panel>
 */
@Component({
  selector: 'ds-card-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './card-panel.component.html',
  styleUrl: './card-panel.component.scss',
})
export class CardPanelComponent {
  /** Titulo exibido no header. */
  readonly title = input.required<string>();

  /** Quando true, body mostra skeleton loading (3 linhas shimmer). */
  readonly loading = input<boolean>(false);
}
