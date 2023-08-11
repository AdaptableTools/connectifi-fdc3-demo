import { Fdc3Options } from '@adaptabletools/adaptable-react-aggrid';

const fdc3Options: Fdc3Options = {
  enableFdc3: true,
  enableLogging: true,
  gridDataContextMapping: {
    'fdc3.instrument': {
      name: '_colId.Name',
      id: {
        ticker: '_colId.Symbol',
      },
    },
  },
  intents: {
    raises: {
      ViewChart: [
        {
          contextType: 'fdc3.instrument',
          actionButton: {
            id: 'viewChartBtn',
            tooltip: 'View Chart',
            icon: {
              name: 'chart',
            },
          },
        },
      ],
      ViewNews: [
        {
          contextType: 'fdc3.instrument',
          actionButton: {
            id: 'viewNewsBtn',
            tooltip: 'View News',
            icon: {
              name: 'clipboard',
            },
          },
        },
      ],
      ViewInstrument: [
        {
          contextType: 'fdc3.instrument',
          actionButton: {
            id: 'viewInstrumentBtn',
            tooltip: 'View Instrument',
            icon: {
              name: 'visibility-on',
            },
          },
        },
      ],
    },
    listensFor: ['ViewInstrument'],
  },
  customIntents: {
    raises: {
      GetPrice: [
        {
          contextType: 'fdc3.instrument',
          actionColumn: {
            columnId: 'fdc3GetPriceColumn',
            friendlyName: 'FDC3: Get Price Info',
            button: {
              id: 'GetPriceButton',
              label: 'Get Price Info',
              icon: {
                name: 'quote',
              },
              tooltip: (button, context) => {
                return `Get Price Info for ${context.rowData.Name}`;
              },
              buttonStyle: {
                tone: 'info',
                variant: 'outlined',
              },
            },
          },
        },
      ],
    },
  },
  contexts: {
    broadcasts: {
      'fdc3.instrument': {
        contextMenu: {
          columnIds: ['Name', 'Symbol'],
        },
      },
    },
    listensFor: ['fdc3.instrument'],
  },
  handleIntent: (eventInfo) => {
    console.log(`Received intent: ${eventInfo.intent}`, eventInfo.context);
  },
  handleContext: (eventInfo) => {
    console.log(`Received context: `, eventInfo);
  },
};
