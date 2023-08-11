export interface Car {
  id: number;
  make: string;
  model: string;
  price: number;
  date: string;
}

export const rowData: Car[] = [
  { id: 1, make: 'Toyota', model: 'Celica', price: 35000, date: '2010-01-02' },
  { id: 2, make: 'Ford', model: 'Mondeo', price: 32000, date: '2012-01-02' },
  { id: 3, make: 'Ford', model: 'Fiesta', price: 22000, date: '2014-01-02' },
  { id: 4, make: 'Porsche', model: 'Boxter', price: 72000, date: '2016-01-02' },
  { id: 5, make: 'Ford', model: 'Galaxy', price: 14900, date: '2010-08-08' },
  {
    id: 6,
    make: 'Porsche',
    model: 'Mission',
    price: 53500,
    date: '2014-07-02',
  },
  {
    id: 7,
    make: 'Mitsubishi',
    model: 'Outlander',
    price: 4500,
    date: '2018-05-02',
  },
  { id: 8, make: 'Toyota', model: 'Yaris', price: 30000, date: '2017-03-02' },
  { id: 9, make: 'Ford', model: 'Mondeo', price: 46000, date: '2019-01-02' },
  {
    id: 10,
    make: 'Toyota',
    model: 'Corolla',
    price: 31000,
    date: '2016-08-04',
  },
];
