// Re-export do componente
export * from './datatable.component';

// Re-export dos types do shared para que callers DS importem a API completa
// sem precisar tocar em frontend/src/app/shared/components/data-table/.
// (DEC-PREP3-A — facade do DS sobre os types existentes)
export * from '../../../app/shared/components/data-table/data-table.types';
