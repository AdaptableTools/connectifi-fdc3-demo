import * as React from 'react';
import { AdaptableAgGrid } from './AdaptableAgGrid';
import { LicenseManager } from '@ag-grid-enterprise/core';

const AG_GRID_LICENSE_KEY = import.meta.env.VITE_AG_GRID_LICENSE_KEY;
LicenseManager.setLicenseKey(AG_GRID_LICENSE_KEY);

function App() {
  return (
    <div className="selection:bg-green-900">
      <AdaptableAgGrid></AdaptableAgGrid>
    </div>
  );
}

export default App;
