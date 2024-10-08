import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  GetContextMenuItemsParams,
  GridOptions,
} from '@ag-grid-community/core';
import {
  Adaptable,
  AdaptableApi,
  AdaptableButton,
  AdaptableOptions,
  AdaptableReadyInfo,
  DashboardButtonContext,
  HandleFdc3Context,
  HandleFdc3IntentResolutionContext,
  RowHighlightInfo,
} from '@adaptabletools/adaptable-react-aggrid';
import { columnDefs, defaultColDef } from './columnDefs';
import { rowData } from './rowData';
import { TickerData } from './TickerData';
import { agGridModules } from './agGridModules';

import {
  AdaptableMenuItem,
  ContextMenuContext,
} from '@adaptabletools/adaptable/src/PredefinedConfig/Common/Menu';
import { InfoNotes } from './InfoNotes';
import { WaitingPage } from './WaitingPage';
import { Context } from '@finos/fdc3';

const priceMap: Map<string, number> = new Map<string, number>();

const Revision = 8;

export const AdaptableAgGrid = () => {
  const [fdc3Initialised, setFdc3Initialised] = useState<boolean>(false);

  useEffect(() => {
    const handleFdc3Ready = () => {
      setFdc3Initialised(true);
    };

    // check index.html for the fdc3Ready event
    document.addEventListener('fdc3Ready', handleFdc3Ready);

    return () => {
      document.removeEventListener('fdc3Ready', handleFdc3Ready);
    };
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
      // Provide all FDC3 2.0 in FDC3 Options
      fdc3Options: {
        enableLogging: true,
        // Create a single Data Mapping - to FDC3 Instrument Context
        // Use `Name` column (defined by '_colId') as the Instrument Name
        // Use the `Symbol` field (defined by '_field') to map to Ticker (in `id` prop)
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
            // Raise 3 Intents: `ViewChart`, `ViewNews` and `ViewInstument`
            // Create an FDC3 Action Button for all 3 Intents
            // Each button will be rendered in the default FDC3 Action Column
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
            custom: {
              // Raise the Custom `GetPrice` Intent - using a bespoke FDC3 Action Column
              // When we receive a Price, display it in the column (instead of the button)
              GetPrice: [
                {
                  contextType: 'fdc3.instrument',
                  // Provide a bespoke Action Column definition
                  actionColumn: {
                    columnId: 'fdc3GetPriceColumn',
                    friendlyName: 'Get Price',
                    button: {
                      id: 'GetPriceButton',
                      label: (button, context) => {
                        const price = priceMap.get(context.rowData?.Symbol);
                        return !!price ? `$ ${price}` : 'Get Price';
                      },
                      icon: (button, context) => {
                        const price = priceMap.get(context.rowData?.Symbol);
                        return !price
                          ? {
                              name: 'quote',
                            }
                          : null;
                      },
                      tooltip: (button, context) => {
                        return `Get Price Info for ${context.rowData?.Symbol}`;
                      },
                      buttonStyle: (button, context) => {
                        return priceMap.has(context.rowData?.Symbol)
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
                        return priceMap.has(context.rowData?.Symbol);
                      },
                    },
                  },
                  // Handle the intent resolution by showing the returned Price in the Column
                  handleIntentResolution: async (
                    handleResolutionContext: HandleFdc3IntentResolutionContext,
                  ) => {
                    const intentResult =
                      await handleResolutionContext.intentResolution.getResult();
                    if (!intentResult?.type) {
                      return;
                    }
                    const adaptableApi: AdaptableApi =
                      handleResolutionContext.adaptableApi;
                    const contextData = intentResult as Context;
                    const ticker = contextData.id?.ticker;
                    const price = contextData.price;
                    if (ticker) {
                      priceMap.set(ticker, price);
                    }
                    adaptableApi.gridApi.refreshColumn('fdc3GetPriceColumn');
                  },
                },
              ],
            },
          },

          // listen for the ViewInstrument Intent
          listensFor: ['ViewInstrument'],

          // handle the Intents received
          handleIntent: (handleFDC3Context: HandleFdc3Context) => {
            const adaptableApi: AdaptableApi = handleFDC3Context.adaptableApi;
            const ticker = handleFDC3Context.context.id?.ticker;
            const upperTicker = ticker.toUpperCase();

            // Create a Row Highlight object and then jump to row and highlight it
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

            // Display an `Info` System Status Message with details of the Intent received
            adaptableApi.systemStatusApi.setInfoSystemStatus(
              'Intent Received: ' + upperTicker,
              JSON.stringify(handleFDC3Context.context),
            );
          },
        },
        contexts: {
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

          // listen for the 'fdc3.instrument' Context
          listensFor: ['fdc3.instrument'],

          // handle the Context received
          handleContext: (handleFDC3Context: HandleFdc3Context) => {
            if (handleFDC3Context.context.type === 'fdc3.instrument') {
              const adaptableApi: AdaptableApi = handleFDC3Context.adaptableApi;
              const ticker = handleFDC3Context.context.id?.ticker;

              // Filter the Grid using the received Ticker
              adaptableApi.columnFilterApi.setColumnFilterForColumn('Ticker', {
                PredicateId: 'Is',
                PredicateInputs: [handleFDC3Context.context.id?.ticker],
              });

              // Display a `Success` System Status Message with details of the Context received
              adaptableApi.systemStatusApi.setSuccessSystemStatus(
                'Context Received: ' + ticker,
                JSON.stringify(handleFDC3Context.context),
              );
            }
          },
        },

        // Narrow width of Default Action Column
        actionColumnDefaultConfiguration: {
          width: 150,
        },
      },
      layoutOptions: {
        autoSizeColumnsInLayout: true,
      },
      contextMenuOptions: {
        customContextMenu: ({
          adaptableColumn,
          defaultAdaptableMenuStructure,
        }) => {
          if (adaptableColumn.columnId !== 'Ticker') {
            return defaultAdaptableMenuStructure.filter(
              (item) => item === '-' || item.module !== 'Fdc3',
            );
          }
          const fdc3Structure = defaultAdaptableMenuStructure.filter(
            (item) => item !== '-' && item.module === 'Fdc3',
          );
          return fdc3Structure;
        },
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
              tone: 'info',
              variant: 'outlined',
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
            frameworkComponent: InfoNotes,
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
                'fdc3GetPriceColumn', // Bespoke FDC3 Action Column
                'Position',
                'Sector',
                'SectorPnl',
                'fdc3ActionColumn', // Default FDC3 Action Column
                'Performance',
              ],
            },
            {
              Name: 'Sector Layout',
              Columns: [
                'Ticker',
                'Name',
                'Price',
                'fdc3GetPriceColumn', // Bespoke FDC3 Action Column
                'Sector',
                'Position',
                'SectorPnl',
                'fdc3ActionColumn', // Default FDC3 Action Column
                'Performance',
              ],
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
        <WaitingPage />
      ) : (
        <>
          {' '}
          <Adaptable.Provider
            gridOptions={gridOptions}
            adaptableOptions={adaptableOptions}
            modules={[...agGridModules]}
            onAdaptableReady={(readyInfo: AdaptableReadyInfo) => {
              // save a reference to adaptable api
              adaptableApiRef.current = readyInfo.adaptableApi;

              (window as any).api = readyInfo.adaptableApi;
            }}
          >
            <div
              style={{ display: 'flex', flexFlow: 'column', height: '100vh' }}
            >
              <Adaptable.UI style={{ flex: 'none' }} />
              <Adaptable.AgGridReact className="ag-theme-balham" />
            </div>
          </Adaptable.Provider>
        </>
      )}
    </div>
  );
};
