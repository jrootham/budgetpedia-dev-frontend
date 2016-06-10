// routes.tsx

'use strict'

// required by bundler
import * as React from 'react'
var { Component } = React

import { Router, Route, IndexRoute, browserHistory } from 'react-router'
// import { syncHistory } from 'react-router-redux'

import App from './app'

import { HomeTiles } from '../controllers/hometiles'
import { NoMatch } from '../controllers/nomatch'
import { ResetPassword } from '../controllers/resetpassword'
import { Register } from '../controllers/register'
import { RegisterPending } from '../controllers/registerpending'
import { RegisterConfirm } from '../controllers/registerconfirm'
import { UserProfile } from '../controllers/userprofile'

import { About } from '../apps/controllers/about'
import { Timeline } from '../apps/controllers/timeline'
import { Deputations } from '../apps/controllers/deputations'
import { Resources } from '../apps/controllers/resources'
import { SocialMedia } from '../apps/controllers/socialmedia'
import { Newsletter } from '../apps/controllers/newsletter'
import { JoinUs } from '../apps/controllers/joinus'
import { Stories } from '../apps/controllers/stories'
import { Explorer } from '../apps/controllers/explorer'
import { Demos } from '../apps/controllers/demos'
import { Pathways } from '../apps/controllers/pathways'
import { Communities } from '../apps/controllers/communities'

export var routes = 
    <Router history={ browserHistory }>
        <Route path="/" component={ App }>
            <IndexRoute component={ HomeTiles } />
            <Route path="about" component={ About } />
            <Route path="timeline" component={ Timeline } />
            <Route path="deputations" component={ Deputations } />
            <Route path="explorer" component={ Explorer } />
            <Route path="communities" component={ Communities } />
            <Route path="socialmedia" component={ SocialMedia } />
            <Route path="newsletter" component={ Newsletter } />
            <Route path="resources" component={ Resources } />
            <Route path="joinus" component={ JoinUs } />
            <Route path="stories" component={ Stories } />
            <Route path="demos" component={ Demos } />
            <Route path="pathways" component={ Pathways } />
            <Route path="resetpassword" component={ ResetPassword } />
            <Route path="register" component={ Register } />
            <Route path="register/pending" component={ RegisterPending } />
            <Route path="register/confirm" component={ RegisterConfirm } />
            <Route path="userprofile" component={ UserProfile } />
            <Route path="*" component={ NoMatch } />
        </Route>
    </Router>
