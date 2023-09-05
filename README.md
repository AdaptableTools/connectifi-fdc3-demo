
## Introduction

This demo app illustrates the some AdapTable FDC3 2.0 featues using the [Connectifi Sandbox](https://www.connectifi.co/) as the desktop agent.

AdapTable provides comprehensive [FDC3 functionality](https://docs.adaptabletools.com/guide/handbook-fdc3) including ability to raise and listen to Intents and broadcast and listen to Context.

It requires AdapTable Version 16.0.3 and higher (and AG Grid 30.0 and higher).

## The Demo

The app leverages the Connectifi Sandbox to show how to use the FDC3 capabilities in AdapTable to interop with other applications it widgets.

> The data in the app is meaningless **dummy data**; only the Tickers are real.

The app primarily uses the Instrument Context to manage intents and broadcasts, but all FDC3 context types are available out of the box in AdapTable.

In the app users are able **

## AdapTable FDC3 

Using FDC3 in AdapTable is a 2-step process:

1. FDC3 Mappings are defined - essentially creating context using DataGrid fields and columns
2. Intents are Raised (and listened to) and Contexts are Broadcast (and listened to) using the Mappings created in Stage 1

> AdapTable provides FDC3 UI Components (Action Columns and Context Menus) to make this behaviour easily configurable

### FDC3 Mappings

Grid Data Mappings provide the “glue” to map AG Grid’s data and columns to required FDC3 behaviour.

> AdapTable looks at the mappings to work out which columns to use when creating Intents and Contexts.

This app has a single Mapping (to the [FDC3 Instrument Context](https://fdc3.finos.org/docs/context/ref/Instrument)) but there is no limit to how many mappings are allowed:

```
fdc3Options: {
  // Provide a single Instrument Mapping
  // Use the `Name` column and the `Symbol` field
  gridDataContextMapping: {
    'fdc3.instrument': {
      name: '_colId.Name',
      id: {
        ticker: '_field.Symbol',
      },
    },
  },
}
```

### FDC3 Intents

AdapTable allows users to both **raise** and **listen to** FDC3 Intents.

> Both are configured using the ```intents``` property in FDC3 Options.

#### Raising Intents

Intents are raised using the `raises` property (in the `intents` section)

It contains a list of the Intents being raised with the key being the name of the Intent (e.g. ```ViewInstrument```).

Each Intent raised contains a contextType property which refers to an FDC3 Grid Data Mapping (see above).

It also contains behaviour using the FDC3 UI Components; this is typically either:

- an FDC3 Action Column Button definition (which is then displayed in the default FDC3 Action Column)
- a full, bespoke, FDC3 Action Column

> AdapTable provides the `defaultFDC3` property to show default Icons (and tooltips) in the buttons

In this demo we raise 3 FDC3 Intents and provide an Action Button definition for each:

> We also raise a Custom Intent which is discussed below

- `ViewChart`
- `ViewNews`
- `ViewInstrument`

```
raises: {
  // Raise 3 Intents: `ViewChart`, `ViewNews` and `ViewInstument`
  // Create an FDC3 Action Button for all 3 - each of which will be rendered in default FDC3 Action Column
  // Note: All 3 Intents use the mapping that was created in `gridDataContextMapping`
  ViewChart: [
    {
      contextType: 'fdc3.instrument',
      actionButton: {
        id: 'viewChartBtn',
        tooltip: 'Raise: ViewChart',
        icon: '_defaultFdc3',
        buttonStyle: {
          tone: 'info',
          variant: 'outlined',
        },
      },
    },
  ],
  ViewNews: [
    {
      contextType: 'fdc3.instrument',
      actionButton: {
        id: 'viewNewsBtn',
        tooltip: 'Raise: ViewNews',
        icon: '_defaultFdc3',
        buttonStyle: {
          variant: 'outlined',
          tone: 'warning',
        },
      },
    },
  ],
  ViewInstrument: [
    {
      contextType: 'fdc3.instrument',
      actionButton: {
        id: 'viewInstrumentBtn',
        tooltip: 'Raise: ViewInstrument',
        icon: {
          name: 'visibility-on',
        },
        buttonStyle: {
          tone: 'error',
          variant: 'outlined',
        },
      },
    },
  ],
},
```

#### Listening for Intents

Intents are listened for using the `listensFor` property (in the `intents` section).

It is typically accompanied by an implementation of the `handleIntent` property which is used to perform the necesary accompanying behaviour.

In this demo we listen for the `ViewInstrument` Intent and we then:

- jump to and highlight the row in yellow for 5 seconds which contains the instrument
- send a System Status message displaying the Context received:

```
// listen for the `ViewInstrument` Intent
listensFor: ['ViewInstrument'],

// handle the Intent
handleIntent: (handleContext: HandleFdc3Context) => {
  const adaptableApi: AdaptableApi = handleContext.adaptableApi;
  const ticker = handleContext.context.id?.ticker;

  // Create a Row Highlight object and then jump to the row and higlight it
  const rowHighlightInfo: RowHighlightInfo = {
    primaryKeyValue: ticker,
    timeout: 5000,
    highlightStyle: {
      BackColor: 'Yellow',
      ForeColor: 'Black',
    },
  };
  adaptableApi.gridApi.jumpToRow(ticker);
  adaptableApi.gridApi.highlightRow(rowHighlightInfo);

  // Display an `Info` System Status Message with details of the Intent received
  adaptableApi.systemStatusApi.setInfoSystemStatus(
    'Intent Received: ' + ticker,
    JSON.stringify(handleContext.context),
  );
},
```


### FDC3 Context

AdapTable allows users to Broadcast (and listen to FDC3 Context).

> Both are configured using the ```contexts``` property in FDC3 Options.

#### Broadcasting Context

FDC3 Context is broadcast using the `broadcasts` property.

This contains a list of contexts to broadcast together with details of how to broadcast.

> The key is the Context mapping created in FDC3 Grid Data Mappings

There are 3 main ways to broadcast content - each of which uses an AdapTable FDC3 UI Component:

- an FDC3 Action Column Button definition (which is then displayed in the default FDC3 Action Column)
- a full, bespoke, FDC3 Action Column
- a Context Menu Item

In this app we Broadcast FDC3 Instrument in 2 ways:

- a Context Menu Item in the Name and Ticker columns
- an FDC3 Action Button

```
// Broadcast FDC3 Instrument in 2 ways:
// using a Context Menu Item in Ticker and Name columns
// via a FDC3 Action Button (which will be rendered in the default FDC3 Action Column)
// Note: The Context uses the mapping that was created in `gridDataContextMapping`
broadcasts: {
  'fdc3.instrument': {
    contextMenu: {
      columnIds: ['Ticker', 'Name'],
      icon: '_defaultFdc3',
    },
    actionButton: {
      id: 'broadcastInstrumentBtn',
      icon: { name: 'broadcast' },
      tooltip: `Broadcast: Instrument`,
      buttonStyle: {
        tone: 'success',
        variant: 'outlined',
      },
    },
  },
},
```

#### Listening for Context

FDC3 Context is listened for using the `listensFor` property (in the `contexts` section).

It is typically accompanied by an implementation of the `handleContext` property which is used to perform the necesary accompanying behaviour.

In this demo we listen for the `ViewInstrument` Intent and we then:

- jump to and highlight the row in yellow for 5 seconds which contains the instrument
- send a System Status message displaying the Context received:


```
// listen for the `ViewInstrument` Context
listensFor: ['ViewInstrument'],

// handle the Context received
handleContext: (eventInfo) => {
  if (eventInfo.context.type === 'fdc3.instrument') {
    const adaptableApi: AdaptableApi = eventInfo.adaptableApi;
    const ticker = eventInfo.context.id?.ticker;

    // Filter the Grid using the received Ticker
    adaptableApi.filterApi.setColumnFilterForColumn('Ticker', {
      PredicateId: 'Is',
      PredicateInputs: [eventInfo.context.id?.ticker],
    });

    // Display a `Success` System Status Message with details of the Context received
    adaptableApi.systemStatusApi.setSuccessSystemStatus(
      'Context Received: ' + ticker,
      JSON.stringify(eventInfo.context),
    );
  }
},
```

### Custom FDC3


### FDC3 UI Components

```
        // Make width of Default Action Column Smaller
        actionColumnDefaultConfiguration: {
          width: 150,
        },

```


### Putting It All Together

```
    fdc3Options: {
        enableLogging: true,
        gridDataContextMapping: {
          // Provide a single Instrument Mapping
          // Use the `Name` column and the `Symbol` field
          'fdc3.instrument': {
            name: '_colId.Name',
            id: {
              ticker: '_field.Symbol',
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
                  tooltip: 'Raise: ViewChart',
                  icon: '_defaultFdc3',
                  buttonStyle: {
                    tone: 'info',
                    variant: 'outlined',
                  },
                },
              },
            ],
            ViewNews: [
              {
                contextType: 'fdc3.instrument',
                actionButton: {
                  id: 'viewNewsBtn',
                  tooltip: 'Raise: ViewNews',
                  icon: '_defaultFdc3',
                  buttonStyle: {
                    variant: 'outlined',
                    tone: 'warning',
                  },
                },
              },
            ],
            ViewInstrument: [
              {
                contextType: 'fdc3.instrument',
                actionButton: {
                  id: 'viewInstrumentBtn',
                  tooltip: 'Raise: ViewInstrument',
                  icon: {
                    name: 'visibility-on',
                  },
                  buttonStyle: {
                    tone: 'error',
                    variant: 'outlined',
                  },
                },
              },
            ],
            custom: {
              GetPrice: [
                {
                  contextType: 'fdc3.instrument',
                  actionColumn: {
                    columnId: 'fdc3GetPriceColumn',
                    friendlyName: 'Get Price',
                    button: {
                      id: 'GetPriceButton',
                      label: (button, context) => {
                        const price = priceMap.get(context.rowData.Symbol);
                        return !!price ? `$ ${price}` : 'Get Price';
                      },
                      icon: (button, context) => {
                        const price = priceMap.get(context.rowData.Symbol);
                        return !price
                          ? {
                              name: 'quote',
                            }
                          : null;
                      },
                      tooltip: (button, context) => {
                        return `Get Price Info for ${context.rowData.Symbol}`;
                      },
                      buttonStyle: (button, context) => {
                        return priceMap.has(context.rowData.Symbol)
                          ? {
                              tone: 'success',
                              variant: 'text',
                            }
                          : {
                              tone: 'info',
                              variant: 'outlined',
                            };
                      },
                      disabled: (button, context) => {
                        return priceMap.has(context.rowData.Symbol);
                      },
                    },
                  },
                  handleIntentResolution: async (
                    params: HandleFdc3IntentResolutionContext,
                  ) => {
                    const intentResult =
                      await params.intentResolution.getResult();
                    if (!intentResult?.type) {
                      return;
                    }
                    const contextData = intentResult as Fdc3CustomContext;
                    const ticker = contextData.id?.ticker;
                    const price = contextData.price;
                    if (ticker) {
                      priceMap.set(ticker, price);
                    }
                    // @ts-ignore
                    params.adaptableApi.gridApi.refreshCells(null, [
                      'fdc3GetPriceColumn',
                    ]);
                  },
                },
              ],
            },
          },
          listensFor: ['ViewInstrument'],
          handleIntent: (eventInfo: HandleFdc3Context) => {
            const adaptableApi: AdaptableApi = eventInfo.adaptableApi;
            const ticker = eventInfo.context.id?.ticker;
            const upperTicker = ticker.toUpperCase();
            const rowHighlightInfo: RowHighlightInfo = {
              primaryKeyValue: upperTicker,
              timeout: 5000,
              highlightStyle: {
                BackColor: 'Yellow',
                ForeColor: 'Black',
              },
            };

            adaptableApi.gridApi.jumpToRow(upperTicker);
            adaptableApi.gridApi.highlightRow(rowHighlightInfo);
            adaptableApi.systemStatusApi.setInfoSystemStatus(
              'Intent Received: ' + upperTicker,
              JSON.stringify(eventInfo.context),
            );
          },
        },
        contexts: {
          broadcasts: {
            'fdc3.instrument': {
              contextMenu: {
                columnIds: ['Ticker', 'Name'],
                icon: '_defaultFdc3',
              },
              actionButton: {
                id: 'broadcastInstrumentBtn',
                icon: { name: 'broadcast' },
                tooltip: `Broadcast: Instrument`,
                buttonStyle: {
                  tone: 'success',
                  variant: 'outlined',
                },
              },
            },
          },
          listensFor: ['fdc3.instrument'],
          handleContext: (eventInfo) => {
            if (eventInfo.context.type === 'fdc3.instrument') {
              const adaptableApi: AdaptableApi = eventInfo.adaptableApi;
              const ticker = eventInfo.context.id?.ticker;
              adaptableApi.filterApi.setColumnFilterForColumn('Ticker', {
                PredicateId: 'Is',
                PredicateInputs: [eventInfo.context.id?.ticker],
              });
              adaptableApi.systemStatusApi.setSuccessSystemStatus(
                'Context Received: ' + ticker,
                JSON.stringify(eventInfo.context),
              );
            }
          },
        },
        actionColumnDefaultConfiguration: {
          width: 150,
        },
      },
```

## The Tech Bits

Provide the AdapTable and AG Grid licenses as environment variables (in `.env` file or in your CI/CD pipeline)
- VITE_ADAPTABLE_LICENSE_KEY
- VITE_AG_GRID_LICENSE_KEY

### Installing

> This project uses [node](http://nodejs.org) and a package manager ([npm](https://npmjs.com), [yarn](https://yarnpkg.com/) or [pnpm](https://pnpm.io/)).

```sh
$ cd path-to-your-project
$ npm install

# pnpm install
# yarn install
```
### Usage

To run:

```sh
$ npm run dev

# pnpm run dev
# yarn run dev
```


## Licences

An [AdapTable Licence](https://docs.adaptabletools.com/guide/licensing) provides access to all product features as well as quarterly updates and enhancements through the lifetime of the licence, comprehensive support, and access to all 3rd party libraries.

Licences can be purchased individually, for a team, for an organisation or for integration into software for onward sale.

We can make a Trial Licence available for a short period of time to allow you to try out AdapTable for yourself.

Please contact [`sales@adaptabletools.com`](mailto:sales@adaptabletools.com) for more information.

## Help

Developers can learn how to access AdapTable programmatically at [AdapTable Documentation](https://docs.adaptabletools.com).  

Here you can see a large number of AdapTable demos each showing a different feature, function or option in AdapTable.

## Demo

To see AdapTable in action visit our [Demo Site](https://www.adaptabletools.com/demos) which contains a few larger demos.

## More Information

General information about Adaptable Tools is available at our [Website](http://www.adaptabletools.com) 
