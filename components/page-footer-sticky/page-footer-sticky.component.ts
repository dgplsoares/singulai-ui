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

  readonly cancel = output<void>();
  readonly formSubmit = output<void>();
  readonly dropdownAction = output<string>();
}
