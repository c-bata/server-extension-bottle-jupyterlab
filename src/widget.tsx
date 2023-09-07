import { ReactWidget } from '@jupyterlab/ui-components';
import React, { useState } from 'react';
import { App } from './components/App';
import { InitDashboard } from './components/InitDashboard';
//import { requestAPI } from './handler';


const RegisterDashboard = () => {
  //const [loading, setLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  //requestAPI<boolean>(`/api/register_dashboard_app`, {
  //  method: 'GET',
  //}).then((res) => {
  //  setIsInitialized(res);
  //}).catch((err) => {
  //  console.log(err)
  //})

  if (!isInitialized) {
    return (
      <InitDashboard setIsInitialized={setIsInitialized} />
    )
  } else
    return (
      <App />
    )
}

export class OptunaDashboardWidget extends ReactWidget {

  constructor() {
    super();
    this.addClass('jp-react-widget');
  }

  render(): JSX.Element {
    return <RegisterDashboard />;
  }
}