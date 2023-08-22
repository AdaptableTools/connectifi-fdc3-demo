import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { GridOptions } from '@ag-grid-community/core';
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

const renderWeakMap: WeakMap<HTMLElement, Root> = new WeakMap();

const priceMap: Map<string, number> = new Map<string, number>();

const Revision = 3;

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
    }),
    [],
  );

  const adaptableOptions = useMemo<AdaptableOptions<TickerData>>(
    () => ({
      licenseKey: import.meta.env.VITE_ADAPTABLE_LICENSE_KEY,
      primaryKey: 'Symbol',
      userName: 'AdaptableUser',
      adaptableId: 'AdaptableConnectifiPoc',
      adaptableStateKey: 'adaptable_connectifi_poc',
      layoutOptions: {
        autoSizeColumnsInLayout: true,
      },
      fdc3Options: {
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
                    label: (button, context) => {
                      const price = priceMap.get(context.rowData.Symbol);
                      return `${price}` ?? 'Get Price';
                    },
                    icon: {
                      name: 'quote',
                    },
                    tooltip: (button, context) => {
                      return `Get Price Info for ${context.rowData.Name}`;
                    },
                    buttonStyle: (button, context) => {
                      return priceMap.has(context.rowData.Symbol)
                        ? {
                            tone: 'success',
                            variant: 'outlined',
                          }
                        : {
                            tone: 'info',
                            variant: 'outlined',
                          };
                    },
                  },
                },
                handleIntentResolution: async (
                  params: HandleFdc3IntentResolutionContext,
                ) => {
                  console.log('handleIntentResolution', params);
                  const intentResult =
                    await params.intentResolution.getResult();
                  console.log('intentResult', intentResult);
                  if (!intentResult?.type) {
                    return;
                  }
                  const contextData = intentResult as Fdc3CustomContext;
                  const ticker = contextData.id?.ticker;
                  const price = contextData.price;
                  if (ticker) {
                    console.log('setting price for ticker', ticker, price);
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
          console.log(
            `Received intent: ${eventInfo.intent}`,
            eventInfo.context,
          );
        },
        handleContext: (eventInfo) => {
          console.log(`Received context: `, eventInfo);
        },
      },
      predefinedConfig: {
        Theme: {
          Revision,
          CurrentTheme: 'dark',
        },
        Dashboard: {
          Revision,
          DashboardTitle: 'Adaptable - Connectifi',
        },
        Layout: {
          Revision,
          CurrentLayout: 'DefaultLayout',
          Layouts: [
            {
              Name: 'DefaultLayout',
              Columns: [
                'Name',
                'fdc3GetPriceColumn',
                'Sector',
                'Symbol',
                'fdc3ActionColumn',
              ],
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
