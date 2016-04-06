// routes.tsx

'use strict'

// required by bundler
import * as React from 'react'
var { Component } = React

//import { ReactCssTransitionGroup } from 'react-addons-css-transition-group'
import ReactCSSTransitionGroup = require('react-addons-css-transition-group')
import { Router, Route, IndexRoute, browserHistory } from 'react-router'
// import { syncHistory } from 'react-router-redux'

import { HomeTiles } from '../controllers/hometiles'
import { NoMatch } from '../controllers/nomatch'
import { ResetPassword } from '../controllers/resetpassword'
import { Register } from '../controllers/register'
import { RegisterPending } from '../controllers/registerpending'
import { RegisterConfirm } from '../controllers/registerconfirm'

import { About } from './controllers/about'
import { Timeline } from './controllers/timeline'
import { Deputations } from './controllers/deputations'
import { Resources } from './controllers/resources'
import { SocialMedia } from './controllers/socialmedia'
import { Newsletter } from './controllers/newsletter'
import { JoinUs } from './controllers/joinus'
import { Stories } from './controllers/stories'
import { Explorer } from './controllers/explorer'
import { Demos } from './controllers/demos'
import { Pathways } from './controllers/pathways'

class App extends Component<any, any> {
    render() {
        return (
            <div>
                <ReactCSSTransitionGroup
                    component="div"
                    transitionName="mainpage"
                    transitionEnterTimeout={300}
                    transitionLeave={false} >
                    {
                        React.cloneElement(this.props.children, {
                            key: this.props.location.pathname
                        })
                    }
                </ReactCSSTransitionGroup>

            </div>
        )
    }
}

export var routes = 
    <Router history={ browserHistory }>
        <Route path="/" component={ App }>
            <IndexRoute component={ HomeTiles } />
            <Route path="about" component={ About } />
            <Route path="timeline" component={ Timeline } />
            <Route path="deputations" component={ Deputations } />
            <Route path="explorer" component={ Explorer } />
            <Route path="resources" component={ Resources } />
            <Route path="socialmedia" component={ SocialMedia } />
            <Route path="newsletter" component={ Newsletter } />
            <Route path="joinus" component={ JoinUs } />
            <Route path="stories" component={ Stories } />
            <Route path="demos" component={ Demos } />
            <Route path="pathways" component={ Pathways } />
            <Route path="resetpassword" component={ ResetPassword } />
            <Route path="register" component={ Register } />
            <Route path="register/pending" component={ RegisterPending } />
            <Route path="register/confirm" component={ RegisterConfirm } />
            <Route path="*" component={ NoMatch } />
        </Route>
    </Router>
