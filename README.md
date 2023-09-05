
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

### Mappings

Grid Data Mappings provide the “glue” to map AG Grid’s data and columns to required FDC3 behaviour.

AdapTable looks at the mappings to work out which columns to use when creating Intents and Contexts.

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
