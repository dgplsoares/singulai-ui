/**
 * <ds-file-dropzone> — types re-exportados do shared component.
 *
 * Sub-Fase E.6.B.2.5 (2026-06-30 — DEC-E.6.B.2.5-A). O componente shared
 * subjacente (frontend/src/app/shared/components/image-dropzone/) mantém
 * a fonte-da-verdade dos tipos. Este re-export permite:
 *
 *   1. Consumers importarem via '@/design-system':
 *      import { FileDropzoneKind, FileDropzonePayload } from '@/design-system';
 *
 *   2. Unit tests do DS assertirem contra KIND_DEFAULTS sem instanciar
 *      componente:
 *      import { KIND_DEFAULTS } from '@/design-system';
 *      expect(KIND_DEFAULTS.presentation.maxSizeMb).toBe(50);
 */
export type {
  FileDropzoneKind,
  FileDropzonePayload,
} from '../../../app/shared/components/image-dropzone/image-dropzone.component';

export { KIND_DEFAULTS } from '../../../app/shared/components/image-dropzone/image-dropzone.component';

export type { FileUploadKind } from '../../../app/shared/services/file-upload.service';
