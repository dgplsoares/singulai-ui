import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * ============================================================================
 * `ds-route-progress` — a barra que diz "seu clique funcionou"
 * ============================================================================
 *
 * 🔔 NASCEU DE UM SMOKE DO FUNDADOR (2026-09-08), com a queixa exata:
 * *"o usuário clica e fica aguardando algo acontecer... ele fica repetindo o clique"*.
 *
 * ⛔ A CAUSA, MEDIDA — e não era atraso proposital:
 * ```
 * delay artificial em guard/resolver  ->  NENHUM
 * estrategia de preload               ->  NENHUMA (padrao: baixa o chunk NO CLIQUE)
 * quem escuta NavigationStart         ->  NINGUEM (so' NavigationEnd)
 * chunks                              ->  284, o maior com 3,2 MB (Zoom SDK)
 * ```
 * ⇒ Entre o clique e a tela, o browser BAIXA UM ARQUIVO PELA REDE — e nada na interface diz
 *   isso, porque ninguem escutava o INICIO da navegacao. O skeleton so' aparece depois do
 *   download, que e' justamente quando o usuario ja' clicou de novo.
 *
 * ============================================================================
 * ⚠️ POR QUE INDETERMINADA, e nao o `ds-progress-bar`
 * ============================================================================
 * O `ds-progress-bar` exige `value` — ele mede uma GRANDEZA CONHECIDA (uso do plano, funil).
 * Aqui nao ha' grandeza: nao se sabe quanto falta para o chunk chegar. Fingir uma porcentagem
 * seria inventar dado na barra que existe para dar confianca.
 *
 * ⚠️ E APARECE NA HORA, sem atraso de cortesia. O padrao comum e' esperar ~150ms para nao
 * piscar em navegacao instantanea — mas o pedido do fundador foi explicito: *"instantaneamente
 * após o clique"*. Piscar de leve custa menos que um clique repetido.
 *
 * ⭐ Componente do DS por construcao: qualquer app Angular com rota lazy quer isto, e nao ha'
 * uma linha de dominio Singulai aqui. Ele NAO conhece o Router — recebe `ativo` e desenha.
 * Quem observa a navegacao e' o `AppComponent`, e por isso o componente e' testavel sem router.
 */
@Component({
  selector: 'ds-route-progress',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './route-progress.component.html',
  styleUrl: './route-progress.component.scss',
})
export class RouteProgressComponent {
  /** Quando `true`, a barra aparece e anima. */
  readonly ativo = input.required<boolean>();

  /**
   * Rotulo lido por leitor de tela. ⚠️ A barra e' puramente visual para quem enxerga; sem isto
   * ela seria invisivel para quem nao enxerga — e o problema que ela resolve (nao saber se o
   * clique pegou) e' pior nesse caso, nao melhor.
   */
  readonly rotulo = input<string>('Carregando página');
}
