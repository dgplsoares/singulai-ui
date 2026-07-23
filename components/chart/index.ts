// Re-export do componente
export * from './chart.component';

// Re-export dos types do shared para que callers DS importem ChartConfig +
// ChartData direto via @/design-system, sem precisar tocar em
// frontend/src/app/shared/models/.
// (DEC-PREP4-A — facade do DS sobre os types existentes)
// `export type` exigido por isolatedModules quando re-exportando interfaces.
export type {
  ChartConfig,
  ChartData,
  ChartDataset,
} from '../../../app/shared/models/widget.model';
