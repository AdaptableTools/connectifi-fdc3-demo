import { createAgent } from 'https://dev.connectifi-interop.com/agent/main.bundle.js';

const INTEROP_HOST =
  import.meta.env.VITE_CONNECTIFI_INTEROP_HOST ||
  'https://dev.connectifi-interop.com';
const APP_ID = import.meta.env.VITE_CONNECTIFI_APPID || 'adaptable@sandbox';
const LOG_LEVEL = import.meta.env.VITE_CONNECTIFI_LOG_LEVEL || 'debug';

createAgent(INTEROP_HOST, APP_ID, {
  logLevel: LOG_LEVEL,
}).then((fdc3) => {
  window.fdc3 = fdc3;
  document.dispatchEvent(new CustomEvent('fdc3Ready', {}));
});
