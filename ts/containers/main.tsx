// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
/// <reference path="../../typings/react/react.d.ts" />
/// <reference path="../../typings/react/react-dom.d.ts" />
/// <reference path="../../typings/react-redux/react-redux.d.ts" />
/// <reference path="../../typings/redux-thunk/redux-thunk" />
/// <reference path="../../typings-custom/react-tap-event-plugin.d.ts" />
/// <reference path="../../typings/react-router/react-router.d.ts" />
/// <reference path="../../typings/react-router-redux/react-router-redux.d.ts" />i
/// <reference path="../../typings/react/react-addons-css-transition-group" />

'use strict'

// required by bundler
import * as React from 'react'
var { Component } = React

// required by material-ui
import injectTapEventPlugin = require('react-tap-event-plugin')
injectTapEventPlugin()

// import * as ReactDom from 'react-dom'
import { render } from 'react-dom'
import { createStore, applyMiddleware } from 'redux'
import thunk = require('redux-thunk')
import { Provider } from 'react-redux'
import { MainBar } from './mainbar'
// import { MainTiles } from './maintiles' 
import { MainToolbar } from './maintoolbar'
import { mainReducer } from "../reducers/reducers"
import { browserHistory } from 'react-router'
import { syncHistory } from 'react-router-redux'

import { routes } from '../features/routes'

const reduxRouterMiddleware = syncHistory(browserHistory)

// create a store that has redux-thunk middleware enabled
const createStoreWithMiddleware = applyMiddleware(
    thunk,
    reduxRouterMiddleware
)(createStore);

const store = createStoreWithMiddleware(mainReducer)

console.log('state = ',store.getState())

export class Main extends Component<any, any> {

    render() {
        // store made available to children through connect = injectStore
        return (
            <Provider store={ store }>
                <div >
                    <MainBar />
                    <div style={{ height: "64px" }} > {/* space for top fixed appbar */}
                    </div>

                    { routes }

                    <div style={{ height: "64px" }} > {/* space for bottom fixed toolbar */}
                    </div>
                    <MainToolbar />
                </div>
            </Provider>
        )
    }
}
