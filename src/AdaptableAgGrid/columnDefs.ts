import { ColDef } from '@ag-grid-community/core';
import { TickerData } from "./TickerData";

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
    headerName: 'Price',
    colId: 'Price',
    type: 'abColDefNumber',
    field: 'Price',
  },
  {
    headerName: 'Position',
    colId: 'Position',
    type: 'abColDefNumber',
    field: 'Position',
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
  {
    headerName: 'MyArray',
    colId: 'Array',
    type: 'abColDefNumberArray',
    field: 'Array',
    editable: true,
    floatingFilter: false,
    filter: false,
    resizable: true,
  },
];
