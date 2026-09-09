// ============================================================================
// Design System Singulai — Barrel Export
// Importar componentes via:
//   import { ButtonComponent, CardComponent } from '@/design-system';
//
// SCSS:
//   @use 'design-system/tokens' as ds;
//   @use 'design-system/themes/light';
// ============================================================================

// Services
export * from './services';

// Directives
export * from './directives';

// Components — exports adicionados conforme blocos B-H sao implementados
export * from './components/ai-assistant-panel';
export * from './components/icon-neumorphic';
export * from './components/button';
export * from './components/header-combo';
export * from './components/card';
export * from './components/callout';
export * from './components/char-counter';
export * from './components/form-field';
export * from './components/number-stepper';
export * from './components/form-section';
export * from './components/page-footer-sticky';
export * from './components/image-dropzone';
export * from './components/page-nav';
export * from './components/accordion';
export * from './components/type-picker';
export * from './components/accordion-item';
export * from './components/card-panel';
export * from './components/nav-footer';
export * from './components/page-layout';
export * from './components/page-header';
export * from './components/progress-bar';
export * from './components/route-progress';
export * from './components/segmented-tabs';
export * from './components/segmented-button';
export * from './components/step-tabs';
export * from './components/sidebar-left-nav';
export * from './components/statsbar-card';
export * from './components/toast';
export * from './components/modal-confirm';
export * from './components/datatable';
export * from './components/chart';
export * from './components/dropdown-menu';
export * from './components/pipeline-funnel';
export * from './components/kanban-board';

// Fase A — DS-3.0 Listagem Core (componentes para listagens CRUD)
export * from './components/badge';
export * from './components/empty-state';
export * from './components/thumbnail-avatar';
export * from './components/skeleton';
export * from './components/offcanvas';
export * from './components/stats-bar';
export * from './components/filter-dropdown';

// Sub-Fase E.6.B (2026-06-30) — Rich text editor headless com toolbar DS
export * from './components/rich-text-editor';

// Sub-Fase E.6.B.2.5 (2026-06-30) — File-dropzone canônico (sucede
// <ds-image-dropzone> que fica @deprecated como alias image-only).
export * from './components/file-dropzone';
