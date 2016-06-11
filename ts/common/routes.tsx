// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// routes.tsx

'use strict'

import * as React from 'react'

import { Router, Route, IndexRoute, browserHistory } from 'react-router'

import App from './app'

// TODO: isolate hometiles as plugin
import HomeTiles from '../controllers/hometiles'

import ResetPassword from '../controllers/resetpassword'
import Register from '../controllers/register'
import RegisterPending from '../controllers/registerpending'
import RegisterConfirm from '../controllers/registerconfirm'
import UserProfile from '../controllers/userprofile'
import NoMatch  from '../controllers/nomatch'

import approutes from '../apps/approutes'

let routedata = [

    { path: "resetpassword", component: ResetPassword },
    { path: "register", component: Register },
    { path: "register/pending", component: RegisterPending },
    { path: "register/confirm", component: RegisterConfirm },
    { path: "userprofile", component: UserProfile },
    { path: "*", component: NoMatch }, // must be LAST, or else will pre-empt other paths
]

let routelist = routedata.map((item, index) => (
   <Route key = {'route'+index} path={item.path} component = {item.component} />
))

let routes = (
    <Router history={ browserHistory }>
        <Route path="/" component={ App } >
            <IndexRoute component={ HomeTiles } />
            {approutes}
            {routelist}
        </Route>
    </Router>)

export default routes
