// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence

'use strict'

// required by bundler
import * as React from 'react'
var { Component } = React

// required by material-ui
import injectTapEventPlugin = require( 'react-tap-event-plugin' )
injectTapEventPlugin()

// import * as ReactDom from 'react-dom'
import { render } from 'react-dom'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import { browserHistory } from 'react-router'
import { routerMiddleware } from 'react-router-redux'
import  thunkMiddleware from 'redux-thunk'
//====================================
import { mainReducer } from "../reducers/reducers"
import { MainBar } from './mainbar'
import { MainToolbar } from './maintoolbar'
import { routes } from '../apps/routes'

const reduxRouterMiddleware = routerMiddleware( browserHistory )

const store = createStore(
    mainReducer,
    applyMiddleware( thunkMiddleware, reduxRouterMiddleware )
)

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
