import { createAgent } from 'https://dev.connectifi-interop.com/agent/main.bundle.js';

const url =
  import.meta.env.VITE_CONNECTIFI_INTEROP_HOST ||
  'https://dev.connectifi-interop.com';
const sandbox = import.meta.env.VITE_CONNECTIFI_APPID || 'adaptable@sandbox';
const logLevel = import.meta.env.VITE_CONNECTIFI_LOG_LEVEL || 'debug';

createAgent(url, sandbox, {
  logLevel: logLevel,
}).then((fdc3) => {
  window.fdc3 = fdc3;
  document.dispatchEvent(new CustomEvent('fdc3Ready', {}));
});
