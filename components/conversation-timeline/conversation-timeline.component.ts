import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { ThumbnailAvatarComponent } from '../thumbnail-avatar/thumbnail-avatar.component';
import { ConversationGroup } from './conversation-timeline.types';

/**
 * ============================================================================
 * `ds-conversation-timeline` — o transcript de uma conversa
 * ============================================================================
 *
 * ⭐ **Figma `932:17802`** (o `timeline` do offcanvas do lead, aba `Chat IA`), medido com
 * `get_design_context`:
 *
 * ```
 * timeline   flex column · gap 20px      (entre GRUPOS)
 *   grupo    flex column · gap 25px      (entre MENSAGENS)
 *   them     esquerda · gap 10px · avatar 26px círculo · texto SEM balão · Manrope Regular 13
 *   us       direita  · gap  3px · avatar 26px círculo · balão #E7EDF5 15/10 raio 15 · SemiBold
 *   meta     Poppins ITÁLICO 10px · line-height 12px
 * ```
 *
 * ⚠️ **24px em vez dos 26px do Figma — `DEC-LEAD-H`, divergência DECLARADA.** A escala do DS é
 * `xs 24 · sm 32 · md 40`; acrescentar um tamanho fora dela por **2px** quebraria a escala para
 * todos os consumidores. ⛔ Está escrito aqui para que ninguém a "descubra" depois como defeito.
 *
 * ⛔ **NÃO é o `ai-chat-timeline` de `features/courses/`.** Aquele tem **16.868 linhas** na
 * pasta e é a maquinaria do chat de CRIAÇÃO DE PRODUTO (fluxos, preview, handoff, ferramentas).
 * Reusá-lo para exibir um histórico seria arrastar um motor para mostrar uma foto.
 *
 * ⛔ **E não conhece domínio** (ver os tipos): sem lead, sem agente, sem tenant.
 */
@Component({
  selector: 'ds-conversation-timeline',
  standalone: true,
  imports: [ThumbnailAvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './conversation-timeline.component.html',
  styleUrl: './conversation-timeline.component.scss',
})
export class ConversationTimelineComponent {
  readonly groups = input.required<ConversationGroup[]>();

  /**
   * `17/04/2026, 17:00:00` — o formato do Figma, **com segundos**.
   *
   * ⛔ **`pt-BR` explícito, nunca o locale do navegador.** O desenho fixa dia/mês/ano; deixar o
   * runtime decidir faria o mesmo registro aparecer como `4/17/2026` para quem abrisse o painel
   * com o navegador em inglês — e o gestor leria a data errada sem nada acusar.
   *
   * ⚠️ **Data inválida devolve o texto cru**, não `Invalid Date`. A fonte é o servidor, mas um
   * ISO malformado não pode virar ruído na tela: é a família *"falha capturada e não propagada
   * é falha invisível"* resolvida pelo lado honesto — mostra-se o que veio.
   */
  formatar(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
      return iso;
    }
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }
}
