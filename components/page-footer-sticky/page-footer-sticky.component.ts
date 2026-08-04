import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  FormActionsFooterComponent,
  DropdownAction,
} from '../../../app/shared/components/form-actions-footer';

/** Re-export do tipo do dropdown (consumidores DS importam daqui). */
export type FooterDropdownAction = DropdownAction;

/**
 * <ds-page-footer-sticky>
 *
 * Wrap thin (DEC-PREP3-A: composicao config-only) de <app-form-actions-footer>
 * shared. Pixel-perfect Figma 590:1353 vive no shared — DS apenas re-exporta
 * a API com nomenclatura DS canonica para consumidores que importam do
 * '@/design-system'.
 *
 * Refator C.2 (DEC-C-B2 SHOWCASE-FIRST):
 *   1. Standalone com SCSS embutido (validacao isolada showcase)
 *   2. SCSS canonico propagado para o shared
 *   3. DS standalone convertido para wrap thin (esta versao)
 */
@Component({
  selector: 'ds-page-footer-sticky',
  standalone: true,
  imports: [FormActionsFooterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-form-actions-footer
      [isSaving]="isSaving()"
      [isEditMode]="isEditMode()"
      [submitLabel]="submitLabel() ?? ''"
      [cancelLabel]="cancelLabel()"
      [submitDisabled]="submitDisabled()"
      [submitType]="submitType()"
      [showDropdown]="showDropdown()"
      [dropdownActions]="dropdownActions()"
      [showCancelButton]="showCancelButton()"
      [showSubmitButton]="showSubmitButton()"
      (cancel)="cancel.emit()"
      (formSubmit)="formSubmit.emit()"
      (dropdownAction)="dropdownAction.emit($event)"
    />
  `,
})
export class PageFooterStickyComponent {
  readonly isSaving = input<boolean>(false);
  readonly isEditMode = input<boolean>(false);
  readonly submitLabel = input<string | undefined>(undefined);
  readonly cancelLabel = input<string>('Cancelar');
  readonly submitDisabled = input<boolean>(false);
  readonly submitType = input<'submit' | 'button'>('submit');
  readonly showDropdown = input<boolean>(false);
  readonly dropdownActions = input<FooterDropdownAction[]>([]);
  readonly showCancelButton = input<boolean>(true);
  /**
   * D.3.2b-1 (2026-08-03): simetrico de showCancelButton — esconde o botao de
   * submit, deixando so o Cancelar (que o Figma rotula "Fechar").
   *
   * POR QUE EXISTE: telas de CRUD inline (offcanvas de Categorias, Figma
   * 1073-10373) disparam as requisicoes por botoes DENTRO do body — o footer
   * so fecha o painel. O "Fechar" do Figma tem exatamente os tokens do botao
   * Cancelar, entao nao ha botao/SCSS novo: basta poder omitir o submit.
   *
   * NAO E BYPASS DA DEC-OFFCANVAS-FRAME — e o que permite esses offcanvas
   * continuarem usando o footer DS canonico em vez de montar footer manual.
   *
   * Default true: nenhum consumidor existente muda.
   */
  readonly showSubmitButton = input<boolean>(true);

  readonly cancel = output<void>();
  readonly formSubmit = output<void>();
  readonly dropdownAction = output<string>();
}
