// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence

'use strict'

// required by bundler
import * as React from 'react'
var { Component } = React

// required by material-ui
import injectTapEventPlugin = require( 'react-tap-event-plugin' )
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
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
import * as Actions from '../actions/actions'

const reduxRouterMiddleware = routerMiddleware( browserHistory )

const store = createStore(
    mainReducer,
    applyMiddleware(reduxRouterMiddleware, thunkMiddleware)
)

let state = store.getState()
let auth = state.auth
var token
if (!auth.isAuthenticated) {
    token = localStorage.getItem('jsonwebtoken')
    if (token) {
        let callback = result => {
            // no action required
        }
        store.dispatch(Actions.autoLoginUser(token,callback))
    }
}

export class Main extends Component<any, any> {

    render() {
        // store made available to children through connect = injectStore
        return (
            <MuiThemeProvider muiTheme = {getMuiTheme()}>
            <Provider store={ store }>
                <div >
                    <MainBar />
                    <div style={{ height: "64px" }} > {/* space for top fixed appbar */}
                    </div>
                    <div>THIS IS THE DEVELOPER'S VERSION OF THIS SITE (FOR PROTOTYPING), 
                        AND MAY CHANGE OR BREAK AT ANY TIME. ALSO, PLEASE NOTE THAT THE DATA
                        HAS NOT BEEN VETTED.
                    </div>

                    { routes }
                    
                </div>
            </Provider>
            </MuiThemeProvider>
        )
    }
    
}

// <div style={{ height: "64px" }} > {/* space for bottom fixed toolbar */}
// </div>
// <MainToolbar />
