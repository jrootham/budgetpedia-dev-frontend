// maintoolbar.tsx

/// <reference path="../../typings-custom/material-ui.d.ts" />
/// <reference path="../../typings/material-ui/material-ui.d.ts" />

import * as React from 'react';
import { connect as injectStore} from 'react-redux'

import IconButton = require('material-ui/lib/icon-button')
import FontIcon = require('material-ui/lib/font-icon')
import Toolbar = require('material-ui/lib/toolbar/toolbar')
import ToolbarGroup = require('material-ui/lib/toolbar/toolbar-group')

function mapStateToProps(state) {

	let { toolsnavbar, theme } = state

	return {

		toolsnavbar,
		theme,

	}

}

class MainToolbarClass extends React.Component<any, any> {
	render() {
		let { appnavbar, theme } = this.props

		return (
			<Toolbar style={{ 
				position: "fixed", 
				bottom: 0, 
				display: "flex", 
				justifyContent: "center", 
				borderTop:"2px solid silver" 
			}}>
				<ToolbarGroup style={{ 
					float: "none", 
					width: "60%", 
					display: "flex", 
					justifyContent: "space-around" 
				}} >
	    			<IconButton><FontIcon className="material-icons">arrow_back</FontIcon></IconButton>
					<IconButton><FontIcon className="material-icons">radio_button_unchecked</FontIcon></IconButton>
					<IconButton><FontIcon className="material-icons">check_box_outline_blank</FontIcon></IconButton>
				</ToolbarGroup>
    		</Toolbar>
		)
	} // render
}

var MainToolbar = injectStore(mapStateToProps)(MainToolbarClass)

export { MainToolbar }
