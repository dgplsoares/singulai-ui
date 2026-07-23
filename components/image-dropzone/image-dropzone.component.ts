import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ImageDropzoneComponent as SharedImageDropzoneComponent } from '../../../app/shared/components/image-dropzone/image-dropzone.component';

/**
 * <ds-image-dropzone> — @deprecated use `<ds-file-dropzone>` a partir da
 * Sub-Fase E.6.B.2.5 (2026-06-30, DEC-E.6.B.2.5-A).
 *
 * Wrap thin (DEC-PREP3-A: composição config-only) de <app-image-dropzone>
 * shared. Continua funcional 100% — só expõe API image-only (imageUrl,
 * imageUploaded, imageRemoved). Para casos non-image (PDF/PPT/PPTX/DOCX
 * via fileKind='document'|'presentation'|'any' com KIND_DEFAULTS auto),
 * use `<ds-file-dropzone>` que expõe a API completa pós-E.6.B.2.4:
 *   - fileKind + KIND_DEFAULTS auto-resolvidos
 *   - fileUrl (canônico)
 *   - fileUploaded emitindo FileDropzonePayload {url, filename?, size?,
 *     contentType?}
 *   - showUrlInput togglable
 *   - uploadEndpoint override
 *
 * Refactor history:
 *   - C.5 (SHOWCASE-FIRST DEC-C-B2 + DEC-C-H hibrido + DEC-C-I alinhamento):
 *     wrap thin standalone com SCSS embutido → convertido para wrap thin.
 *   - E.6.B.2.5 (2026-06-30): marcado @deprecated. Sucessor <ds-file-dropzone>
 *     em ../file-dropzone/.
 *
 * @deprecated Use `<ds-file-dropzone>` (frontend/src/design-system/components/
 *             file-dropzone/). Este wrapper permanecerá funcional até
 *             remoção em v2 do rename infra pós-golive.
 */
@Component({
  selector: 'ds-image-dropzone',
  standalone: true,
  imports: [SharedImageDropzoneComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-image-dropzone
      [imageUrl]="imageUrl()"
      [context]="context()"
      [label]="label()"
      [maxSizeMb]="maxSizeMb()"
      [accept]="accept()"
      [aspectHint]="aspectHint()"
      [acceptHint]="acceptHint()"
      (imageUploaded)="imageUploaded.emit($event)"
      (imageRemoved)="imageRemoved.emit()"
    />
  `,
})
export class ImageDropzoneComponent {
  readonly imageUrl = input<string | null>(null);
  readonly context = input<string>('website');
  readonly label = input<string>('Imagem');
  readonly maxSizeMb = input<number>(5);
  readonly accept = input<string>('image/jpeg,image/png,image/webp,image/gif');
  readonly aspectHint = input<string>('');
  readonly acceptHint = input<string>('JPG, JPEG, WebP ou PNG');

  readonly imageUploaded = output<string>();
  readonly imageRemoved = output<void>();
}
