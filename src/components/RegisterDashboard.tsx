import React, { FC, useState } from 'react';
import { requestAPI } from '../handler';
import { App } from './App';
import { InitDashboard } from './InitDashboard';
import { Loading } from './Loading';


interface IsInitializedResponce {
    is_initialized: boolean
}


export const RegisterDashboard: FC = () => {
    const [loading, setLoading] = useState(true)
    const [isInitialized, setIsInitialized] = useState(false)

    requestAPI<IsInitializedResponce>(`/api/is_initialized`, {
        method: 'GET',
    }).then((res) => {
        setIsInitialized(res.is_initialized)
        setLoading(false)
    }).catch((err) => {
        console.log(err)
    })

    if (loading) {
        return (<Loading />)
    } else if (isInitialized) {
        return (
            <App />
        )
    } else {
        return (
            <InitDashboard
                setIsInitialized={setIsInitialized}
                setLoading={setLoading}
            />
        )
    }
}
