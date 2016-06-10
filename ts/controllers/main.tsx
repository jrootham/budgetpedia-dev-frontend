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

// import { render } from 'react-dom'
import { Provider } from 'react-redux'
// custom...
import { MainBar } from './mainbar'
// import { MainToolbar } from './maintoolbar'
import routes from '../common/routes'
import { autoLoginUser } from '../actions/actions'
import configureStore from '../common/configurestore'

const store = configureStore()

let state = store.getState()
let auth = state.auth
var token
if (!auth.isAuthenticated) {
    token = localStorage.getItem('jsonwebtoken')
    if (token) {
        let callback = result => {
            // no action required
        }
        store.dispatch(autoLoginUser(token,callback))
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
                    <div>FOR TESTING, YOU'RE IN THE WRONG SPOT! GO TO <a href="http://staging.budgetpedia.ca">staging.budgetpedia.ca</a> INSTEAD. THIS IS THE DEVELOPER'S VERSION OF THIS SITE (FOR PROTOTYPING), 
                        AND MAY CHANGE OR BREAK AT ANY TIME. ALSO, THE DATA MAY BE FAKE.
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
