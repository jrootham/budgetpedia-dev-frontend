/// <reference path="../../typings/react/react.d.ts" />
/// <reference path="../../typings/react/react-dom.d.ts" />
/// <reference path="../../typings/react-redux/react-redux.d.ts" />
/// <reference path="../../typings-custom/react-tap-event-plugin.d.ts" />

'use strict'

// required by bundler
import * as React from 'react'
import {Component} from 'react'

import injectTapEventPlugin = require('react-tap-event-plugin')
// doesn't work:
// import * as TapPlugin from 'react-tap-event-plugin';
// import injectTapEventPlugin = TapPlugin.injectTapEventPlugin;
injectTapEventPlugin()

// import * as ReactDom from 'react-dom'
import { render } from 'react-dom'
import { createStore } from 'redux'
import { Provider } from 'react-redux'

import {MainBar} from './mainbar'
import {MainTiles} from './maintiles' 

import {mainReducer} from "../reducers/reducers"

// console.log(store.getState())

export class Main extends Component<any, any> {

	render() {
		// store made available to children through connect decorator
		return (
			<Provider store={ createStore(mainReducer) }>
				<div >
					<div style={{height:"64px"}} >
						<MainBar />
					</div>
					<div id="contentarea">
						<MainTiles />
					</div>
				</div>
			</Provider>
		)
	}

}
