import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';

import { FormSectionComponent as AppFormSectionComponent } from '../../../app/shared/components/form-section/form-section.component';

/**
 * FormSection (DS) — wrap thin de `<app-form-section>` shared (DEC-C-B2 step 2).
 *
 * Apos aprovacao do smoke visual standalone no showcase, o SCSS canonico
 * pixel-perfect (Figma 590:1220/1242/1243) foi propagado para o shared,
 * alcancando os ~95 consumidores diretos automaticamente. Este wrap thin
 * expõe API limpa via `@/design-system` para os wizards Fase D e demais
 * features novas, sem tocar em `app/shared`.
 *
 * Acoplamento: O DS depende de `app/shared/components/form-section/`.
 * Aceitavel temporariamente (DEC-C-B2), igual ao pattern ja vigente em
 * `<ds-datatable>` desde G.4.3 (DEC-PREP3-F).
 *
 * @example Basico
 *   <ds-form-section title="Informacoes basicas" icon="heroClipboardDocumentList">
 *     <div class="form-row">...</div>
 *   </ds-form-section>
 *
 * @example Colapsavel
 *   <ds-form-section
 *     title="Configuracoes avancadas"
 *     subtitle="Opcoes adicionais"
 *     icon="heroCog6Tooth"
 *     [collapsible]="true"
 *     [collapsed]="true"
 *   >
 *     <div class="form-row">...</div>
 *   </ds-form-section>
 */
@Component({
  selector: 'ds-form-section',
  standalone: true,
  imports: [AppFormSectionComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './form-section.component.html',
  styleUrl: './form-section.component.scss',
})
export class FormSectionComponent {
  /** Titulo da secao (header). */
  readonly title = input<string>('');

  /** Icone heroicon do header (default: heroClipboardDocumentList). */
  readonly icon = input<string>('heroClipboardDocumentList');

  /** Subtitulo opcional (abaixo do title). */
  readonly subtitle = input<string>('');

  /** Permite colapsar a secao via click no header. */
  readonly collapsible = input<boolean>(false);

  /** Estado inicial colapsado (so aplica quando collapsible=true). */
  readonly collapsed = input<boolean>(false);

  /** Classe CSS adicional para o container. */
  readonly containerClass = input<string>('');
}
