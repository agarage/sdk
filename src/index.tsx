/* @refresh reload */
console.log("Host page index.tsx loaded");

import { render } from 'solid-js/web'
import './index.css'
import App from './App.tsx'

const root = document.getElementById('root')

render(() => <App />, root!)

SDK.exposeHandler({
    handlerFn: (body: any) => {
        console.log("Handler called with body:", body);
    }
})
