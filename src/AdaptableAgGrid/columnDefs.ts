import { ColDef } from '@ag-grid-community/core';
import { Car } from './rowData';

export const defaultColDef: ColDef = {
  editable: true,
  sortable: true,
  filter: true,
  floatingFilter: true,
};

export const columnDefs: ColDef<Car>[] = [
  {
    colId: 'id',
    hide: true,
    suppressColumnsToolPanel: true,
    suppressFiltersToolPanel: true,
    type: 'abColDefNumber',
  },
  {
    headerName: 'Auto Make',
    field: 'make',

    type: 'abColDefString',
  },
  {
    headerName: 'Model',
    field: 'model',

    type: 'abColDefString',
  },
  {
    headerName: 'Price',
    field: 'price',

    type: 'abColDefNumber',
  },
  {
    headerName: 'Date manufactured',
    field: 'date',
    type: 'abColDefDate',
  },
];
