import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Output,
  computed,
  input,
} from '@angular/core';
import { NgIconComponent } from '@ng-icons/core';

import {
  ButtonSize,
  ButtonType,
  ButtonVariant,
  ButtonVariantColor,
} from './button.types';

/**
 * Button — componente unificado de botao do Design System Singulai.
 *
 * Cobre 10+ variants em um unico componente, com estados consistentes
 * (default, hover, active, disabled, loading, focus visible).
 *
 * Uso:
 *   <ds-button variant="primary-cta" (clicked)="onClick()">Criar curso</ds-button>
 *   <ds-button variant="icon" iconLeft="heroEye" ariaLabel="Visualizar" />
 *   <ds-button variant="modal-primary" variantColor="danger">Excluir</ds-button>
 */
@Component({
  selector: 'ds-button',
  standalone: true,
  imports: [NgIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  /** Variant do botao. Obrigatorio. */
  readonly variant = input.required<ButtonVariant>();

  /** Tamanho. Default: md. */
  readonly size = input<ButtonSize>('md');

  /** Cor da variant (so usado em modal-primary e contextos com paleta multipla). */
  readonly variantColor = input<ButtonVariantColor>('apex');

  /** Tipo HTML. Default: button (nao submete forms acidentalmente). */
  readonly type = input<ButtonType>('button');

  /** Icone a esquerda do label. Nome do registry @ng-icons. */
  readonly iconLeft = input<string | null>(null);

  /** Imagem (SVG/PNG) a esquerda — alternativa ao iconLeft para assets do Figma. */
  readonly iconImageSrc = input<string | null>(null);

  /** Tamanho da imagem (so quando iconImageSrc usado). Default: '20px'. */
  readonly iconImageSize = input<string>('20px');

  /**
   * `16.4` — de que lado do rótulo o `iconImageSrc` aparece.
   *
   * ⛔ DEFAULT `'left'` DE PROPÓSITO: era o único comportamento até aqui, e há
   *    consumidores vivos contando com ele. Input novo que muda o default silencioso
   *    é o modo de falha que este projeto já pagou — quem não passar nada continua
   *    exatamente como antes.
   *
   * 📌 Origem: Figma `559:40436` põe o ícone DEPOIS do texto nos dois botões do fluxo
   *    de geração (`Configurar do curso` e `Gerar curso com IA`). O DS só sabia pôr à
   *    esquerda, e a regra do projeto manda ESTENDER o DS em vez de montar o controle
   *    por fora.
   */
  readonly iconImagePosition = input<'left' | 'right'>('left');

  /**
   * Override opcional do tamanho do icone (heroicon via iconLeft/iconRight).
   * Default null: usa o mapeamento size sm/md/lg → 12/14/16px abaixo.
   * Use para casos onde o icone precisa diferir do tamanho padrao do button
   * (ex: action-icon size=md em datatable row actions com icon 17px —
   * DEC-G4.3-N).
   */
  readonly iconSizeOverride = input<string | null>(null);

  /** Icone a direita do label (ex: chevron). */
  readonly iconRight = input<string | null>(null);

  /** Botao desabilitado. */
  readonly disabled = input<boolean>(false);

  /** Estado de loading — substitui icones por spinner e desabilita. */
  readonly loading = input<boolean>(false);

  /** Aria-label para botoes que nao tem texto visivel (ex: variant=icon). */
  readonly ariaLabel = input<string | null>(null);

  /** Estado active (so afeta variants com toggle: nav-tab, pagination, toggle-status). */
  readonly active = input<boolean>(false);

  /** Conteudo do botao via projection (label + qualquer markup customizado). */

  /** Evento de click — disparado apenas quando habilitado e nao em loading. */
  @Output() readonly clicked = new EventEmitter<MouseEvent>();

  /** Estado computado: nao interativo se disabled OU loading. */
  protected readonly isDisabled = computed(() => this.disabled() || this.loading());

  /**
   * Tamanho do icone interno. Usa `iconSizeOverride` quando passado;
   * caso contrario, mapeia o `size` do botao para o default (sm/md/lg).
   */
  protected readonly iconSize = computed(() => {
    const override = this.iconSizeOverride();
    if (override) return override;
    const map: Record<ButtonSize, string> = { sm: '12px', md: '14px', lg: '16px' };
    return map[this.size()];
  });

  @HostBinding('class.ds-button-host') readonly hostClass = true;

  protected onClick(event: MouseEvent): void {
    if (this.isDisabled()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.clicked.emit(event);
  }
}
