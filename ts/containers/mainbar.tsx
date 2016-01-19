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

// required by bundler
import * as React from 'react'

import AppBar = require('material-ui/lib/app-bar')
import IconButton = require('material-ui/lib/icon-button')
import FontIcon = require('material-ui/lib/font-icon')
// import FlatButton = require('material-ui/lib/flat-button')

// the following should be a font icon
import NavigationMenu = require('material-ui/lib/svg-icons/navigation/menu')
// import NavigationClose = require('material-ui/lib/svg-icons/navigation/close')
// import MoreVertIcon = require('material-ui/lib/svg-icons/navigation/more-vert')

// import IconMenu = require('material-ui/lib/menus/icon-menu')
// import MenuItem = require('material-ui/lib/menus/menu-item')

export class MainBar extends React.Component<any, any> {
	render() {
		return (
			<AppBar 

				style={
					{ position: "fixed" }
				} 

				title={
					<span>Tribal Commons Group Information Manager</span>
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

						iconStyle={
							{ marginTop: "-6px", fontSize: "36px" }
						}
					>

						<FontIcon 
							className = "material-icons"
						>
							account_circle
						</FontIcon>

					</IconButton>
				}

			/>
		)
	} // render
}
