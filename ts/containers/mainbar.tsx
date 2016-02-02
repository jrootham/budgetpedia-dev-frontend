// class_mainbar.tsx

/*
	TODO: 
	- add name of user under account icon at right. Currently this causes styling problems
		consider creating compound component for inclusion as iconElementRight
	- add slide in menu on left attached to hamburger icon

	NOTES:
	- iconStyleRight does not work
	- style on FontIcon does not work
	- iconStyle on iconButton works
*/

/// <reference path="../../typings/material-ui/material-ui.d.ts" />
/// <reference path="../../typings-custom/material-ui.d.ts" />

'use strict'

// import MUI = require('material-ui')
// console.log(MUI)

// required by bundler
import * as React from 'react'
import { connect as injectStore} from 'react-redux'
import * as Actions from '../actions/actions'

import AppBar = require('material-ui/lib/app-bar')
import IconButton = require('material-ui/lib/icon-button')
import FontIcon = require('material-ui/lib/font-icon')
// import Colors = require('material-ui/lib/styles/colors')
// console.log(Colors)
// import FlatButton = require('material-ui/lib/flat-button')

// the following should be a font icon
import NavigationMenu = require('material-ui/lib/svg-icons/navigation/menu')
// import NavigationClose = require('material-ui/lib/svg-icons/navigation/close')
// import MoreVertIcon = require('material-ui/lib/svg-icons/navigation/more-vert')

// import IconMenu = require('material-ui/lib/menus/icon-menu')
// import MenuItem = require('material-ui/lib/menus/menu-item')

function mapStateToProps(state) {

	let { appnavbar, theme } = state

	return {

		appnavbar,
		theme,
	}

}

class MainBarClass extends React.Component<any, any> {

	transitionToHome = () => {
		this.props.dispatch(Actions.transitionTo('/'))
	}

	render() { 
		let { appnavbar, theme } = this.props

		return (
			<AppBar 

				onTitleTouchTap = { this.transitionToHome }

				titleStyle = {{cursor:'pointer'}}

				style={
					{ position: "fixed" }
				} 

				title={
					<span>{ appnavbar.title }</span>
				}

				iconElementLeft={
					
					<IconButton
						onTouchTap={
							() => { alert('menu list goes here') } 
						}
					>

						<NavigationMenu />

					</IconButton>
				}

				iconElementRight={

					<IconButton 
						onTouchTap={
							() => { alert('account options go here') } 
						}
					>

						<FontIcon 
							className = "material-icons"
						>

							account_circle

						</FontIcon>

					</IconButton>
				}
			>
				<div 
					style={
						{ position:"absolute",
							bottom:0,
							right:0,
							fontSize:"small",
							padding:"3px",
							color:theme.palette.alternateTextColor,
						}
					}
				>
					{ appnavbar.username }
				</div>
			</AppBar>
		)
	} // render
}

var MainBar = injectStore(mapStateToProps)(MainBarClass)

export { MainBar }
