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
  AdaptableOptions,
  HandleFdc3IntentResolutionContext,
} from '@adaptabletools/adaptable-react-aggrid';
import { columnDefs, defaultColDef } from './columnDefs';
import { rowData, TickerData } from './rowData';
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
      sideBar: 'adaptable',
      suppressMenuHide: true,
      enableRangeSelection: true,
      enableCharts: true,
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
      // @ts-ignore
      primaryKey: 'Ticker',
      userName: 'AdaptableUser',
      adaptableId: 'AdaptableConnectifiPoc',
      adaptableStateKey: 'adaptable_connectifi_poc',
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
                    tone: 'info',
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
                    tone: 'info',
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
                        return !!price ? `$ ${price}` : 'Raise: GetPrice';
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
                        return `Get Price Info for ${context.rowData.Name}`;
                      },
                      buttonStyle: (button, context) => {
                        return priceMap.has(context.rowData.Symbol)
                          ? {
                              tone: 'error',
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
          handleIntent: (eventInfo) => {
            console.log(
              `Received intent: ${eventInfo.intent}`,
              eventInfo.context,
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
              eventInfo.adaptableApi.filterApi.setColumnFilterForColumn(
                'Ticker',
                {
                  PredicateId: 'Is',
                  PredicateInputs: [eventInfo.context.id?.ticker],
                },
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
      predefinedConfig: {
        Theme: {
          Revision,
          CurrentTheme: 'dark',
        },
        Dashboard: {
          Revision,
          DashboardTitle: 'AdapTable - Connectifi',
        },
        Layout: {
          Revision,
          CurrentLayout: 'DefaultLayout',
          Layouts: [
            {
              Name: 'DefaultLayout',
              Columns: [
                'Ticker',
                'Name',
                'fdc3GetPriceColumn',
                'Sector',
                'fdc3ActionColumn',
              ],
              ColumnWidthMap: {
                fdc3GetPriceColumn: 150,
                Ticker: 110,
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
            onAdaptableReady={({ adaptableApi }) => {
              // save a reference to adaptable api
              adaptableApiRef.current = adaptableApi;
              (window as any).api = adaptableApi;
            }}
          />
          <div className="ag-theme-alpine flex-1">
            <AgGridReact gridOptions={gridOptions} modules={agGridModules} />
          </div>
        </>
      )}
    </div>
  );
};
