export { AccordionComponent } from './accordion.component';
export type {
  AccordionBadge,
  AccordionBadgeVariant,
  AccordionItem,
  AccordionItemEvent,
  AccordionItemKind,
  AccordionModule,
  // D.3.5.3: payloads dos outputs de reordenacao. Estavam declarados como
  // publicos em `accordion.types.ts` e as saidas do componente ja' os emitiam,
  // mas o barrel nao os reexportava — quem ligasse `(moduleReorder)` ou
  // `(lessonsReorder)` nao tinha como tipar o handler sem importar por caminho
  // profundo. Drift, nao mudanca de contrato.
  AccordionLessonsReorderEvent,
  AccordionLessonsReorderItemEvent,
  AccordionModuleReorderEvent,
} from './accordion.types';
