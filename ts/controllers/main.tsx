// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence

'use strict'

import * as React from 'react'

// required by material-ui
import injectTapEventPlugin = require( 'react-tap-event-plugin' )
injectTapEventPlugin()
import { autoLoginUser } from '../actions/actions'
import configureStore from '../common/configurestore'
import Root from '../common/root'

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

//TODO: assign version to state (DEVELOPMENT|STAGING|PRODUCTION)
const Main = ({globalmessage, version}) => (
    <Root store={store} globalmessage={globalmessage} />
)

export default Main

