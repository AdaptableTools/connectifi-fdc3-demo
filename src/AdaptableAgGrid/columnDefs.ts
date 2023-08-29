import { ColDef } from '@ag-grid-community/core';
import { TickerData } from './rowData';

export const defaultColDef: ColDef = {
  editable: true,
  sortable: true,
  filter: true,
  floatingFilter: true,
};

export const columnDefs: ColDef<TickerData>[] = [
  {
    headerName: 'Company Name',
    field: 'Name',
    type: 'abColDefString',
  },
  {
    headerName: 'Sector',
    field: 'Sector',
    type: 'abColDefString',
  },
  {
    headerName: 'Ticker',
    colId: 'Ticker',
    field: 'Symbol',
    hide: true,
    type: 'abColDefString',
  },
  // {
  //   headerName: 'Contact',
  //   field: 'Contact',
  //   type: 'abColDefString',
  // },
  // {
  //   headerName: 'Email',
  //   field: 'Email',
  //   type: 'abColDefString',
  // },
];
