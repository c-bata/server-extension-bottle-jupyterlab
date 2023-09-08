import { ReactWidget } from '@jupyterlab/ui-components';
import React, { useState } from 'react';
import { App } from './components/App';
import { InitDashboard } from './components/InitDashboard';
import { requestAPI } from './handler';


interface isInitializedResponce {
  is_initialized: boolean
}

const RegisterDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

  requestAPI<isInitializedResponce>(`/api/is_initialized`, {
    method: 'GET',
  }).then((res) => {
    setIsInitialized(res.is_initialized)
    setLoading(false)
  }).catch((err) => {
    console.log(err)
  })

  if (loading) {
    return (
      <div>Loading...</div>
    )
  } else if (isInitialized) {
    return (
      <App />
    )
  } else {
    return (
      <InitDashboard setIsInitialized={setIsInitialized} />
    )
  }
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