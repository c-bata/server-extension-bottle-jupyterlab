import { ReactWidget } from '@jupyterlab/ui-components';

import React from 'react';
import { App } from "./components/App";


export class OptunaDashboardWidget extends ReactWidget {
  /**
   * Constructs a new CounterWidget.
   */
  constructor() {
    super();
    this.addClass('jp-react-widget');
  }

  render(): JSX.Element {
    return <App />;
  }
}