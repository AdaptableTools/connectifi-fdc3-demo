import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import {
  GetContextMenuItemsParams,
  GridOptions,
} from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import AdaptableReact, {
  AdaptableApi,
  AdaptableButton,
  AdaptableOptions,
  AdaptableReadyInfo,
  CustomRenderContext,
  DashboardButtonContext,
  HandleFdc3Context,
  HandleFdc3IntentResolutionContext,
  RowHighlightInfo,
} from '@adaptabletools/adaptable-react-aggrid';
import { columnDefs, defaultColDef } from './columnDefs';
import { rowData } from './rowData';
import { TickerData } from './TickerData';
import { agGridModules } from './agGridModules';
import { ConnectifiDesktopAgent, createAgent } from '@connectifi/agent-web';
import { Fdc3CustomContext } from '@adaptabletools/adaptable/src/PredefinedConfig/Common/Fdc3Context';
import {
  AdaptableMenuItem,
  ContextMenuContext,
} from '@adaptabletools/adaptable/src/PredefinedConfig/Common/Menu';

const renderWeakMap: WeakMap<HTMLElement, Root> = new WeakMap();

const priceMap: Map<string, number> = new Map<string, number>();

const Revision = 7;

export const AdaptableAgGrid = () => {
  const [fdc3Initialised, setFdc3Initialised] = useState<boolean>(false);

  useEffect(() => {
    if ((globalThis as any).fdc3 == null) {
      createAgent('https://dev.connectifi-interop.com', 'adaptable@sandbox', {
        logLevel: 'debug',
      }).then((agent) => {
        (globalThis as any).fdc3 = agent as ConnectifiDesktopAgent;
        document.dispatchEvent(new CustomEvent('fdc3Ready', {}));
        setFdc3Initialised(true);
      });
    }
  }, []);

  const gridOptions = useMemo<GridOptions<TickerData>>(
    () => ({
      defaultColDef,
      columnDefs,
      rowData,
      sideBar: true,
      suppressMenuHide: true,
      enableRangeSelection: true,
      enableCharts: true,
      statusBar: {
        statusPanels: [
          { statusPanel: 'agTotalRowCountComponent', align: 'left' },
          { statusPanel: 'agFilteredRowCountComponent' },
          {
            key: 'Center Panel',
            statusPanel: 'AdaptableStatusPanel',
            align: 'center',
          },
        ],
      },
      getContextMenuItems: (params: GetContextMenuItemsParams<TickerData>) => {
        if (params.column?.getId() === 'Ticker') {
          return [];
        }
        return params.defaultItems ?? [];
      },
    }),
    [],
  );

  const adaptableOptions = useMemo<AdaptableOptions<TickerData>>(
    () => ({
      licenseKey: import.meta.env.VITE_ADAPTABLE_LICENSE_KEY,
      primaryKey: 'Ticker',
      userName: 'AdaptableUser',
      adaptableId: 'Adaptable Connectifi FDC3 Demo',
      adaptableStateKey: 'adaptable_connectifi_fdc3_demo',
      fdc3Options: {
        enableLogging: true,
        gridDataContextMapping: {
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
      layoutOptions: {
        autoSizeColumnsInLayout: true,
      },
      menuOptions: {
        showAdaptableContextMenu: (
          menuItem: AdaptableMenuItem,
          menuContext: ContextMenuContext<TickerData>,
        ) => {
          if (menuContext.adaptableColumn.columnId !== 'Ticker') {
            return true;
          }
          return menuItem.module === 'Fdc3';
        },
      },

      dashboardOptions: {
        buttonsLocation: 'left',
        customDashboardButtons: [
          {
            label: ' Demo Info',
            icon: {
              name: 'info',
            },
            onClick: (
              button: AdaptableButton<DashboardButtonContext>,
              context: DashboardButtonContext,
            ) => {
              context.adaptableApi.settingsPanelApi.openCustomSettingsPanel(
                'Demo Info',
              );
            },
            buttonStyle: {
              tone: 'neutral',
              variant: 'text',
            },
          },
        ],
      },
      settingsPanelOptions: {
        icon: 'ApplicationIcon',
        title: 'AdapTable - Connectifi FDC3 Demo',
        navigation: {
          items: [
            'Demo Info',
            '-',
            'CalculatedColumn',
            'FormatColumn',
            'Charting',
            '-',
            'Dashboard',
            'ToolPanel',
            'StatusBar',
            '-',
            'Alert',
            'CustomSort',
            'Layout',
            'Export',
            'StyledColumn',
            '-',
            'FlashingCell',
            'QuickSearch',
            'Query',
            'Filter',
            '-',
            'GridInfo',
            'TeamSharing',
            'Theme',
            'SystemStatus',
          ],
        },
        customSettingsPanels: [
          {
            name: 'Demo Info',
            icon: {
              name: 'info',
            },
            render: (customRenderContext: CustomRenderContext) => {
              if (customRenderContext.visible) {
                return `
                  <h1>AdapTable & Connectifi FDC3 Demo</h1>
                  <br/>
                  <div style="font-size: small;">
                 <p>This demo app illustrates some of the FDC3 features in AdapTable including:</p>
                 <br/>
                 <p style="color: lightgreen">Raising FDC3 Intents</p>
                 <p>The Blue, Orange and Red buttons in the "FDC3 Actions" column raise the <i>ViewChart</i>, <i>ViewNews</i> and <i>ViewInstruments</i> Intents respectively.</p>
                 <br/>
                 <p style="color: lightgreen">Broadcasting Context</p>
                 <p>The Green "Broadcast Instrument" button in the "FDC3 Actions" Column broadcasts Context about the current Instrument.</p>
                 <br/>
                 <p style="color: lightgreen">Listening to Raised Intents</p>
                 <p>When the ViewInstrument intent is received, the app jumps to the row and highlights it in yellow</p>
                 <br/>
                 <p style="color: lightgreen">Listen to Custom FDC3 Intents</p>
                 <p>The button in the "Get Price" Column calls the Custom <i>GetPrice</i> Intent and displays the result</p>
                 <br/>
                 <p style="color: lightgreen">Listening to Broacdast Context</p>
                 <p>When broadcast Instrument Context is received, the app filters to that Instrument</p>
                 <br/>
                 <p><i>(Note: We output content of Intents and Broadcasts we listen to as System Status messages)</i></p>
                 <br/>
                 <p style="color: lightblue; text-decoration: underline">Learn more about <a href="https://docs.adaptabletools.com/guide/handbook-fdc3" target="_new">AdapTable's FDC3 capabilites</a> </p>
                 </div>
                `;
              } else {
                console.log('unmount');
              }
              return null;
            },
          },
        ],
      },
      predefinedConfig: {
        Theme: {
          Revision,
          CurrentTheme: 'dark',
        },
        Dashboard: {
          Revision,
          DashboardTitle: 'AdapTable - Connectifi',
          Tabs: [
            {
              Name: 'FDC3 Demo',
              Toolbars: ['Layout', 'SystemStatus', 'Alert', 'Query', 'Export'],
            },
          ],
        },
        StatusBar: {
          Revision,
          StatusBars: [
            {
              Key: 'Center Panel',
              StatusBarPanels: ['Layout', 'CellSummary'],
            },
          ],
        },
        FormatColumn: {
          Revision,
          FormatColumns: [
            {
              Scope: {
                ColumnIds: ['Price'],
              },
              DisplayFormat: {
                Formatter: 'NumberFormatter',
                Options: {
                  FractionDigits: 2,
                  Prefix: '$',
                },
              },
              Style: {
                FontWeight: 'Bold',
              },
              IncludeGroupedRows: true,
            },
            {
              Scope: {
                ColumnIds: ['SectorPnl'],
              },
              Rule: {
                Predicates: [
                  {
                    PredicateId: 'GreaterThan',
                    Inputs: [1000000],
                  },
                ],
              },
              DisplayFormat: {
                Formatter: 'NumberFormatter',
                Options: {
                  Multiplier: 0.000001,
                  Suffix: 'M',
                  FractionDigits: 2,
                },
              },
              Style: {
                FontWeight: 'Bold',
              },
              IncludeGroupedRows: true,
            },
            {
              Scope: {
                ColumnIds: ['SectorPnl'],
              },
              Rule: {
                Predicates: [
                  {
                    PredicateId: 'GreaterThan',
                    Inputs: [1000],
                  },
                ],
              },
              DisplayFormat: {
                Formatter: 'NumberFormatter',
                Options: {
                  Multiplier: 0.001,
                  Suffix: 'K',
                  FractionDigits: 2,
                },
              },
              IncludeGroupedRows: true,
            },

            {
              Scope: {
                ColumnIds: ['SectorPnl'],
              },
              Rule: {
                Predicates: [
                  {
                    PredicateId: 'LessThan',
                    Inputs: [0],
                  },
                ],
              },
              DisplayFormat: {
                Formatter: 'NumberFormatter',
                Options: {
                  Multiplier: 0.001,
                  Suffix: 'K',
                  FractionDigits: 2,
                },
              },
              IncludeGroupedRows: true,
            },
            {
              Scope: {
                ColumnIds: ['SectorPnl', 'Price', 'Position'],
              },
              Rule: {
                Predicates: [
                  {
                    PredicateId: 'Positive',
                  },
                ],
              },
              Style: { ForeColor: 'Green' },
            },
            {
              Scope: {
                ColumnIds: ['SectorPnl', 'Price', 'Position'],
              },
              Rule: {
                Predicates: [
                  {
                    PredicateId: 'Negative',
                  },
                ],
              },
              Style: { ForeColor: 'Red' },
            },
            {
              Scope: {
                ColumnIds: ['SectorPnl'],
              },
              CellAlignment: 'Right',
            },
            {
              Scope: {
                ColumnIds: ['Position'],
              },
              Style: {
                FontStyle: 'Italic',
              },
              DisplayFormat: {
                Formatter: 'NumberFormatter',
                Options: {
                  Parentheses: true,
                  FractionDigits: 0,
                },
              },
              CellAlignment: 'Right',
              IncludeGroupedRows: true,
            },
          ],
        },
        CalculatedColumn: {
          Revision,
          CalculatedColumns: [
            {
              ColumnId: 'SectorPnl',
              FriendlyName: 'Sector Pnl',
              Query: {
                AggregatedScalarExpression:
                  'SUM([Position], GROUP_BY([Sector]))',
              },
              CalculatedColumnSettings: {
                DataType: 'Number',
              },
            },
          ],
        },
        Layout: {
          Revision,
          CurrentLayout: 'Table Layout',
          Layouts: [
            {
              ColumnWidthMap: {
                fdc3GetPriceColumn: 100,
                Position: 100,
                Ticker: 110,
                Price: 110,
                SectorPnl: 110,
                Sector: 150,
              },
              Name: 'Table Layout',
              Columns: [
                'Ticker',
                'Name',
                'Price',
                'fdc3GetPriceColumn',
                'Position',
                'fdc3ActionColumn',
                'Sector',
                'SectorPnl',
                'Performance',
              ],
            },
            {
              Name: 'Sector Layout',
              Columns: [
                'Ticker',
                'Name',
                'Price',
                'fdc3GetPriceColumn',
                'Sector',
                'Position',
                'SectorPnl',
                'Performance',
                'fdc3ActionColumn',
              ],
              //  ColumnWidthMap: {
              //    fdc3GetPriceColumn: 150,
              //    Ticker: 55,
              //  },
              AggregationColumns: {
                Price: 'sum',
                Position: 'sum',
                SectorPnl: 'sum',
              },
              RowGroupedColumns: ['Sector'],
            },
          ],
        },
        StyledColumn: {
          Revision,
          StyledColumns: [
            {
              ColumnId: 'Sector',
              BadgeStyle: {
                Badges: [
                  {
                    Predicate: {
                      PredicateId: 'Is',
                      Inputs: ['Industrials'],
                    },
                    Icon: {
                      name: 'building',
                    },
                    Style: {
                      BackColor: 'Red',
                      ForeColor: 'white',
                      BorderRadius: 6,
                    },
                  },
                  {
                    Predicate: {
                      PredicateId: 'Is',
                      Inputs: ['Health Care'],
                    },
                    Icon: {
                      name: 'science',
                    },
                    Style: {
                      BackColor: 'Orange',
                      ForeColor: 'Black',
                      BorderRadius: 6,
                    },
                  },
                  {
                    Predicate: {
                      PredicateId: 'Is',
                      Inputs: ['Technology'],
                    },
                    Icon: {
                      name: 'laptop',
                    },
                    Style: {
                      BackColor: 'LightBlue',
                      ForeColor: 'Black',
                      BorderRadius: 6,
                    },
                  },
                  {
                    Predicate: {
                      PredicateId: 'Is',
                      Inputs: ['Consumer'],
                    },
                    Icon: {
                      name: 'person',
                    },
                    Style: {
                      BackColor: 'DarkBlue',
                      ForeColor: 'white',
                      BorderRadius: 6,
                    },
                  },
                  {
                    Predicate: {
                      PredicateId: 'Is',
                      Inputs: ['Utilities'],
                    },
                    Icon: {
                      name: 'spanner',
                    },
                    Style: {
                      BackColor: 'DarkGreen',
                      ForeColor: 'white',
                      BorderRadius: 6,
                    },
                  },
                  {
                    Predicate: {
                      PredicateId: 'Is',
                      Inputs: ['Financials'],
                    },
                    Icon: {
                      name: 'dollar',
                    },
                    Style: {
                      BackColor: 'LightGreen',
                      ForeColor: 'black',
                      BorderRadius: 6,
                    },
                  },
                  {
                    Predicate: {
                      PredicateId: 'Is',
                      Inputs: ['Real Estate'],
                    },
                    Icon: {
                      name: 'home',
                    },
                    Style: {
                      BackColor: 'Purple',
                      ForeColor: 'white',
                      BorderRadius: 6,
                    },
                  },
                  {
                    Predicate: {
                      PredicateId: 'Is',
                      Inputs: ['Energy'],
                    },
                    Icon: {
                      name: 'lightning',
                    },
                    Style: {
                      BackColor: 'Brown',
                      ForeColor: 'white',
                      BorderRadius: 6,
                    },
                  },
                ],
              },
            },
            {
              ColumnId: 'Performance',
              SparkLineStyle: {
                options: {
                  type: 'area',
                  line: {
                    stroke: 'rgb(124, 255, 178)',
                    strokeWidth: 2,
                  },
                  padding: {
                    top: 5,
                    bottom: 5,
                  },
                  marker: {
                    size: 3,
                    shape: 'diamond',
                  },
                  highlightStyle: {
                    size: 10,
                  },
                },
              },
            },
          ],
        },
      },
    }),
    [],
  );

  const adaptableApiRef = React.useRef<AdaptableApi>();

  return (
    <div className={'flex h-screen flex-col'}>
      {!fdc3Initialised ? (
        <div>Initialising FDC3...</div>
      ) : (
        <>
          {' '}
          <AdaptableReact
            className={'flex-none'}
            gridOptions={gridOptions}
            adaptableOptions={adaptableOptions}
            renderReactRoot={(node, container) => {
              let root = renderWeakMap.get(container);
              if (!root) {
                renderWeakMap.set(container, (root = createRoot(container)));
              }
              root.render(node);
              return () => {
                root?.unmount();
              };
            }}
            onAdaptableReady={(readyInfo: AdaptableReadyInfo) => {
              // save a reference to adaptable api
              adaptableApiRef.current = readyInfo.adaptableApi;

              (window as any).api = readyInfo.adaptableApi;

              setTimeout(() => {
                //   readyInfo.gridOptions.columnApi?.autoSizeAllColumns();
              }, 200);
            }}
          />
          <div className="ag-theme-balham flex-1">
            <AgGridReact gridOptions={gridOptions} modules={agGridModules} />
          </div>
        </>
      )}
    </div>
  );
};
