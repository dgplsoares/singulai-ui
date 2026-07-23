// Re-export do componente DS
export { OffcanvasComponent } from './offcanvas.component';

// Re-export dos types do shared para que callers DS importem a API completa
// sem precisar tocar em frontend/src/app/shared/components/offcanvas/.
// (DEC-DSA-K facade do DS sobre os types existentes — pattern de ds-datatable)
export type {
  OffcanvasCloseEvent,
  OffcanvasConfig,
  OffcanvasOpenEvent,
  OffcanvasOpenOptions,
  OffcanvasPosition,
  OffcanvasResult,
  OffcanvasSize,
  OffcanvasTemplateContext,
} from '../../../app/shared/components/offcanvas/offcanvas.types';
