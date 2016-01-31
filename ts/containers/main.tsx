/// <reference path="../../typings/react/react.d.ts" />
/// <reference path="../../typings/react/react-dom.d.ts" />
/// <reference path="../../typings/react-redux/react-redux.d.ts" />
/// <reference path="../../typings/redux-thunk/redux-thunk" />
/// <reference path="../../typings-custom/react-tap-event-plugin.d.ts" />

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

// create a store that has redux-thunk middleware enabled
const createStoreWithMiddleware = applyMiddleware(
	thunk
)(createStore);


export class Main extends Component<any, any> {

	render() {
		// store made available to children through connect = injectStore
		return (
			<Provider store={ createStoreWithMiddleware ( mainReducer ) }>
				<div >
					<MainBar />
					<div style={{ height: "64px" }} > {/* space for top fixed appbar */}
					</div>
					<div id="contentarea">
						<MainTiles />
					</div>
					<div style={{ height: "64px" }} > {/* space for bottom fixed toolbar */}
					</div>
					<MainToolbar />
				</div>
			</Provider>
		)
	}

}
