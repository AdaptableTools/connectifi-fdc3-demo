import { ColDef } from '@ag-grid-community/core';
import { TickerData } from './rowData';

export const defaultColDef: ColDef = {
  editable: true,
  sortable: true,
  resizable: true,
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
    type: 'abColDefString',
  },
  {
    headerName: 'Position',
    colId: 'Position',
    type: 'abColDefNumber',
    valueGetter: () => {
      return Math.floor(Math.random() * 4990000) - 1000099;
    },
  },
  {
    headerName: 'Performance',
    colId: 'Performance',
    type: 'abColDefNumberArray',
    valueGetter: () => {
      const first = Math.floor(Math.random() * 1000) - 0;
      const second = Math.floor(Math.random() * 1000) - 0;
      const third = Math.floor(Math.random() * 1000) - 0;
      const fourth = Math.floor(Math.random() * 1000) - 0;
      return [first, second, third, fourth];
    },
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
