import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ImageDropzoneComponent as SharedFileDropzoneComponent } from '../../../app/shared/components/image-dropzone/image-dropzone.component';
import type { FileDropzoneKind, FileDropzonePayload, FileUploadKind } from './file-dropzone.types';

/**
 * <ds-file-dropzone> — DS wrapper canônico do file-dropzone.
 *
 * Sub-Fase E.6.B.2.5 (2026-06-30 — DEC-E.6.B.2.5-A). Thin wrapper signal-based
 * sobre <app-file-dropzone> shared (frontend/src/app/shared/components/
 * image-dropzone/). Expõe API completa pós-E.6.B.2.4:
 *   - fileKind + KIND_DEFAULTS auto-resolvidos
 *   - fileUrl (canônico) — alias imageUrl continua funcional no shared
 *   - fileUploaded emitindo FileDropzonePayload completo
 *   - showUrlInput togglable per consumer
 *   - uploadEndpoint override quando necessário
 *
 * SUCESSOR de <ds-image-dropzone> (Fase C.5, agora @deprecated). Consumers
 * legados de <ds-image-dropzone> continuam funcionando — o wrapper C.5 vira
 * apenas alias com API restrita (image-only outputs).
 *
 * PLACEMENT NOTE: o componente shared subjacente depende do FileUploadService
 * (upload-service Python). Este DS wrapper NÃO é framework-agnostic no sentido
 * estrito da regra de placement — é exposição sob namespace DS para
 * discoverability + showcase + MCP catalog. Split em DS puro + Singulai
 * adapter é debt pós-V1.
 *
 * @example Uso mínimo — presentation (Ebook Step 2):
 * <ds-file-dropzone
 *   [fileUrl]="form.get('fileUrl')?.value"
 *   fileKind="presentation"
 *   [showUrlInput]="false"
 *   context="lesson-ebook"
 *   (fileUploaded)="onEbookUploaded($event)"
 *   (fileRemoved)="onEbookRemoved()"
 * />
 *
 * @example Uso com override:
 * <ds-file-dropzone
 *   fileKind="document"
 *   [maxSizeMb]="20"
 *   acceptHint="Só PDF"
 *   accept="application/pdf"
 *   (fileUploaded)="onDocUploaded($event)"
 * />
 *
 * @see Engram decision/E.6.B.2.5-file-dropzone-ds-wrapper
 */
@Component({
  selector: 'ds-file-dropzone',
  standalone: true,
  imports: [SharedFileDropzoneComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    // O wrapper nao tinha estilo nenhum, entao o host ficava `display: inline`
    // envolvendo um filho `display: block; width: 100%`. Caixa visual e caixa de
    // layout divergiam, e a area util nao era a que o usuario via.
    `
      :host {
        display: block;
        width: 100%;
      }
    `,
  ],
  template: `
    <app-file-dropzone
      [fileKind]="fileKind()"
      [fileUrl]="fileUrl()"
      [context]="context()"
      [label]="label()"
      [aspectHint]="aspectHint()"
      [maxSizeMb]="maxSizeMb()!"
      [accept]="accept()!"
      [acceptHint]="acceptHint()!"
      [uploadEndpoint]="uploadEndpoint()!"
      [showUrlInput]="showUrlInput()"
      [skipInternalUpload]="skipInternalUpload()"
      [readOnly]="readOnly()"
      (fileUploaded)="fileUploaded.emit($event)"
      (fileRemoved)="fileRemoved.emit()"
      (fileSelected)="fileSelected.emit($event)"
    />
  `,
})
export class FileDropzoneComponent {
  /** Kind do arquivo — determina preview strategy + KIND_DEFAULTS. */
  readonly fileKind = input<FileDropzoneKind>('image');

  /** URL do arquivo atual (canônico, funciona para qualquer kind). */
  readonly fileUrl = input<string | null>(null);

  /** Contexto do upload (ex: 'website', 'lesson-ebook'). */
  readonly context = input<string>('website');

  /** Label visual acima do dropzone. */
  readonly label = input<string>('Arquivo');

  /** Dica de aspect ratio recomendado (linha secundária no idle state). */
  readonly aspectHint = input<string>('');

  /**
   * Override de tamanho máximo em MB. Se `undefined`, KIND_DEFAULTS[fileKind]
   * decide (image=5MB, document/presentation/any=50MB).
   */
  readonly maxSizeMb = input<number | undefined>(undefined);

  /**
   * Override de MIME whitelist. Se `undefined`, KIND_DEFAULTS[fileKind] decide.
   */
  readonly accept = input<string | undefined>(undefined);

  /**
   * Override do texto informativo do accept. Se `undefined`,
   * KIND_DEFAULTS[fileKind] decide.
   */
  readonly acceptHint = input<string | undefined>(undefined);

  /**
   * Override do endpoint do upload-service. Se `undefined`,
   * KIND_DEFAULTS[fileKind] decide (image→'image', resto→'slide').
   */
  readonly uploadEndpoint = input<FileUploadKind | undefined>(undefined);

  /**
   * Se `true`, exibe botão "Ou cole uma URL". Default `true` matches shared.
   */
  readonly showUrlInput = input<boolean>(true);

  /**
   * FIX pós-smoke E.6.B (2026-07-01): quando `true`, o dropzone NÃO chama
   * FileUploadService — apenas emite (fileSelected) com o File selecionado.
   * Consumer é responsável por processar upload custom (ex: video-upload
   * com FFmpeg + Bunny CDN chunked). Após upload custom completar, consumer
   * pode passar o URL via [fileUrl] para renderizar chip preview.
   */
  readonly skipInternalUpload = input<boolean>(false);

  /**
   * E.6-close.5a-fix3 (2026-07-31): quando `true`, o dropzone renderiza
   * modo somente-leitura — mostra chip preview do arquivo se houver mas
   * SEM botão de remover (lixeira), SEM drop area editável, SEM URL input.
   * Usado em view mode dos offcanvas de aula (videoaula tab Slides,
   * ebook tab Ebook) para respeitar que view = só visualiza, não altera.
   * Se `fileUrl` está setado: mostra chip + botão de visualizar/download
   * apenas. Se vazio: renderiza empty state text-only sem drop CTA.
   */
  readonly readOnly = input<boolean>(false);

  /** Emite payload completo {url, filename?, size?, contentType?} após upload. */
  readonly fileUploaded = output<FileDropzonePayload>();

  /** Emite quando user clica remover ou envia URL manual vazia. */
  readonly fileRemoved = output<void>();

  /**
   * FIX pós-smoke E.6.B (2026-07-01): emitido quando `skipInternalUpload=true`
   * e user seleciona arquivo (via drop ou click). Consumer processa upload
   * próprio. Preserva UI visual do dropzone (idle drag-drop + validações).
   */
  readonly fileSelected = output<File>();
}
