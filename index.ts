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
// `PORT.3` — ampliar imagem de uma coleção (galeria do portfólio). Sem nada de Singulai ⇒ DS.
export * from './components/lightbox';
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

// `DIV-D3-1` (2026-09-10) — a regra de iniciais passa a ter UM dono.
// ⛔ A dívida foi medida três vezes e cresceu nas duas: 5 → 9 → 12 implementações.
//    Aplicar a mesma regra em N lugares é como ela dobrou; por isso virou função.
export * from './utils/iniciais';

// ⭐ `LEAD-ABAS` `LA.3` — o transcript de conversa. Entra no DS pelo decision tree lido LITERAL:
//    *"faria sentido em outro projeto Angular sem nada de Singulai?"* → sim. Por isso ele não
//    conhece lead, agente nem tenant; quem traduz é o chamador.
// ⛔⛔ `LEAD-ABAS` `LA.3` — O `ds-conversation-timeline` **NÃO É EXPORTADO DAQUI**, e isso é
//    MEDIDO, não esquecimento.
//
//    Exportá-lo daqui quebrou o `ng build --configuration production`:
//      ✘ bundle initial exceeded maximum budget. Budget 2.60 MB was not met by 3.86 kB
//
//    Experimento de UMA variável, rodado nos dois sentidos:
//      com `export * from './components/conversation-timeline'`  -> ERRO de budget
//      com import por CAMINHO no consumidor                      -> passa (2.60 MB exatos)
//
//    ⇒ este barril é importado EAGERLY pelo código inicial, e o decorador `@Component` derrota
//      o tree-shaking: tudo o que sai daqui entra no chunk INICIAL, mesmo que só uma rota LAZY
//      use. O `lead-detail-offcanvas` é lazy (`app.routes.ts` → `loadComponent`) e ainda assim
//      o componente caía no inicial pelo barril.
//
//    ⚠️ **E o orçamento está em 100,0% — 2.60 MB de 2.60 MB.** Não há folga: o PRÓXIMO
//      componente que alguém exportar daqui quebra o build. Isso é dívida de projeto, não desta
//      fase: `DIV-DS-BARRIL-INICIAL` no livro-razão.
//
//    ⇒ Quem precisar dele importa pelo caminho:
//      `import { ConversationTimelineComponent } from '@/design-system/components/conversation-timeline';`
//    🔲 E ele TAMBÉM não está no showcase (`DIV-LEAD-SHOWCASE`) — achável só pelo MCP, por ora.
