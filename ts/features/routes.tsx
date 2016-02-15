// routes.tsx

'use strict'

// required by bundler
import * as React from 'react'
var { Component } = React

//import { ReactCssTransitionGroup } from 'react-addons-css-transition-group'
import ReactCSSTransitionGroup = require('react-addons-css-transition-group')
import { Router, Route, IndexRoute, browserHistory } from 'react-router'
// import { syncHistory } from 'react-router-redux'

import { MainTiles } from '../containers/maintiles'
import { About } from './containers/about'
import { NoMatch } from './containers/nomatch'
import { ResetPassword } from './containers/resetpassword'
import { Register } from './containers/register'

import { Timeline } from './containers/timeline'
import { Deputations } from './containers/deputations'
import { Resources } from './containers/resources'
import { SocialMedia } from './containers/socialmedia'
import { Newsletter } from './containers/newsletter'
import { JoinUs } from './containers/joinus'
import { Stories } from './containers/stories'
import { Explorer } from './containers/explorer'

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
            <IndexRoute component={ MainTiles } />
            <Route path="about" component={ About } />
            <Route path="timeline" component={ Timeline } />
            <Route path="deputations" component={ Deputations } />
            <Route path="explorer" component={ Explorer } />
            <Route path="resources" component={ Resources } />
            <Route path="socialmedia" component={ SocialMedia } />
            <Route path="joinus" component={ JoinUs } />
            <Route path="stories" component={ Stories } />
            <Route path="resetpassword" component={ ResetPassword } />
            <Route path="register" component={ Register } />
            <Route path="newsletter" component={ Newsletter } />
            <Route path="*" component={ NoMatch } />
        </Route>
    </Router>
