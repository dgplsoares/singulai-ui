import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

import { ThumbnailAvatarSize } from './thumbnail-avatar.types';

/**
 * ThumbnailAvatar — avatar quadrado-arredondado com gradiente top-down + iniciais.
 *
 * REDASH-FASE-A A.7 — Figma 875-21663.
 *
 * Pattern visual: container rounded-square (10px) com fundo gradiente
 * linear top-down (#5C8DE2 -> #27467C) + 2 letras (iniciais) brancas
 * centralizadas em Manrope SemiBold. Quando `src` e fornecido, renderiza
 * <img> ocupando 100% e mantem o radius. Fallback automatico para iniciais
 * caso `src` falhe (onerror).
 *
 * Diferenca vs cell type='avatar' do <app-data-table>:
 *   - data-table: circle + gradient blue-to-purple
 *   - ds-thumbnail-avatar: rounded-square + gradient azul Singulai (#5C8DE2/#27467C)
 *
 * Uso:
 *   <ds-thumbnail-avatar name="Joao da Silva" size="md" />
 *   <ds-thumbnail-avatar name="Maria" src="/img/maria.jpg" size="sm" />
 *
 * Figma: 875-21663 (size=md base 40px)
 */
@Component({
  selector: 'ds-thumbnail-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './thumbnail-avatar.component.html',
  styleUrl: './thumbnail-avatar.component.scss',
})
export class ThumbnailAvatarComponent {
  /**
   * Nome completo do usuario/entidade. Usado para gerar iniciais (fallback)
   * e como alt da imagem quando `src` esta presente.
   */
  readonly name = input.required<string>();

  /**
   * URL da imagem. Quando ausente OU vazia, renderiza fallback (iniciais).
   */
  readonly src = input<string | null>(null);

  /** Tamanho. Default: md (40px — Figma 875-21663). */
  readonly size = input<ThumbnailAvatarSize>('md');

  /**
   * Aria-label custom. Quando ausente, usa `name`. Util quando o thumbnail
   * ja esta em um contexto rotulado (ex: cell composite com nome ao lado).
   */
  readonly ariaLabel = input<string | null>(null);

  /** Iniciais derivadas do `name`. Maximo 2 letras, maiusculas. */
  protected readonly initials = computed(() => {
    const raw = (this.name() ?? '').trim();
    if (!raw) return '';

    const words = raw.split(/\s+/).filter(Boolean);
    if (words.length === 0) return '';

    if (words.length === 1) {
      // Uma palavra apenas — 2 primeiras letras
      return words[0].slice(0, 2).toUpperCase();
    }

    // Multiplas palavras — primeira letra da primeira + primeira da ultima
    const first = words[0][0] ?? '';
    const last = words[words.length - 1][0] ?? '';
    return (first + last).toUpperCase();
  });

  /** Flag computada — mostra <img> quando ha src valido. */
  protected readonly hasImage = computed(() => {
    const url = this.src();
    return !!url && url.trim().length > 0;
  });
}
