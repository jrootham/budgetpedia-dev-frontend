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
import { MainTiles } from './maintiles' 
import { MainToolbar } from './maintoolbar'
import { mainReducer } from "../reducers/reducers"
import { Router, Route, IndexRoute, browserHistory } from 'react-router'
import { syncHistory } from 'react-router-redux'
//import { ReactCssTransitionGroup } from 'react-addons-css-transition-group'
import ReactCSSTransitionGroup = require('react-addons-css-transition-group')
// import createBrowserHistory from 'history/lib/createBrowserHistory'

import { About } from '../features/containers/about'
import { Timeline } from '../features/containers/timeline'
import { Deputations } from '../features/containers/deputations'
import { Resources } from '../features/containers/resources'
import { SocialMedia } from '../features/containers/socialmedia'
import { NoMatch } from '../features/containers/nomatch'
import { ResetPassword } from '../features/containers/resetpassword'
import { Register } from '../features/containers/register'
import { Newsletter } from '../features/containers/newsletter'
import { JoinUs } from '../features/containers/joinus'
import { Explorer } from '../features/containers/explorer'

const reduxRouterMiddleware = syncHistory(browserHistory)

// create a store that has redux-thunk middleware enabled
const createStoreWithMiddleware = applyMiddleware(
	thunk,
	reduxRouterMiddleware
)(createStore);

const store = createStoreWithMiddleware(mainReducer)

class App extends Component<any, any> {
	render() {
		return (
			<div>
        <ReactCSSTransitionGroup
			component="div"
			transitionName="mainpage"
			transitionEnterTimeout={300}
			transitionLeave={false}
			>
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

export class Main extends Component<any, any> {

	render() {
		// store made available to children through connect = injectStore
		return (
			<Provider store={ store }>
				<div >
					<MainBar />
					<div style={{ height: "64px" }} > {/* space for top fixed appbar */}
					</div>
                    <ReactCSSTransitionGroup
                        transitionName = "mainpage"
                        transitionEnterTimeout={ 500 }
                        transitionLeaveTimeout={ 300 }>
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
                            <Route path="resetpassword" component={ ResetPassword } />
                            <Route path="register" component={ Register } />
                            <Route path="newsletter" component={ Newsletter } />
                            <Route path="*" component={ NoMatch } />
                        </Route>
                    </Router>
                    </ReactCSSTransitionGroup>
                    <div style={{ height: "64px" }} > {/* space for bottom fixed toolbar */}
					</div>
					<MainToolbar />
				</div>
			</Provider>
		)
	}
}
