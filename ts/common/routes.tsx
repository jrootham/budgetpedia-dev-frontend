// routes.tsx

'use strict'

// required by bundler
import * as React from 'react'
var { Component } = React

import { Router, Route, IndexRoute, browserHistory } from 'react-router'
// import { syncHistory } from 'react-router-redux'

import App from './app'

import HomeTiles from '../controllers/hometiles'

import About from '../apps/controllers/about'
import Timeline from '../apps/controllers/timeline'
import Deputations from '../apps/controllers/deputations'
import Explorer from '../apps/controllers/explorer'
import Communities from '../apps/controllers/communities'
import SocialMedia from '../apps/controllers/socialmedia'
import Newsletter from '../apps/controllers/newsletter'
import Resources from '../apps/controllers/resources'
import JoinUs from '../apps/controllers/joinus'
import Stories from '../apps/controllers/stories'
import Demos from '../apps/controllers/demos'
import Pathways from '../apps/controllers/pathways'
import ResetPassword from '../controllers/resetpassword'
import Register from '../controllers/register'
import RegisterPending from '../controllers/registerpending'
import RegisterConfirm from '../controllers/registerconfirm'
import UserProfile from '../controllers/userprofile'
import NoMatch  from '../controllers/nomatch'

let routedata = [
    { path: "about", component: About },
    { path: "timeline", component: Timeline },
    { path: "deputations", component: Deputations },
    { path: "explorer", component: Explorer },
    { path: "communities", component: Communities },
    { path: "socialmedia", component: SocialMedia },
    { path: "newsletter", component: Newsletter },
    { path: "resources", component: Resources },
    { path: "joinus", component: JoinUs },
    { path: "stories", component: Stories },
    { path: "demos", component: Demos },
    { path: "pathways", component: Pathways },
    { path: "resetpassword", component: ResetPassword },
    { path: "register", component: Register },
    { path: "register/pending", component: RegisterPending },
    { path: "register/confirm", component: RegisterConfirm },
    { path: "userprofile", component: UserProfile },
    { path: "*", component: NoMatch },
]

const routelist = routedata.map((item, index) => {
    return <Route key = {index} path={item.path} component= {item.component} />
})

var routes = 
    <Router history={ browserHistory }>
        <Route path="/" component={ App } >
            <IndexRoute component={ HomeTiles } />
            { routelist }
        </Route>
    </Router>

export default routes
