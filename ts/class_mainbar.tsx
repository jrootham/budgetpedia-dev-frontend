// class_mainbar.tsx

/// <reference path="../typings/react/react.d.ts" />
/// <reference path="../typings/react/react-dom.d.ts" />
/// <reference path="../typings/material-ui/material-ui.d.ts" />
/// <reference path="../typings-custom/material-ui.d.ts" />

// required by bundler
import * as React from 'react';

import AppBar = require('material-ui/lib/app-bar');
import IconButton = require('material-ui/lib/icon-button');
import FlatButton = require('material-ui/lib/flat-button');
import NavigationMenu = require('material-ui/lib/svg-icons/navigation/menu');
import IconMenu = require('material-ui/lib/menus/icon-menu');
import MenuItem = require('material-ui/lib/menus/menu-item');
import NavigationClose = require('material-ui/lib/svg-icons/navigation/close');
import MoreVertIcon = require('material-ui/lib/svg-icons/navigation/more-vert');

// bundler has trouble with the following
// import * as MaterialUI from 'material-ui';
// import AppBar = MaterialUI.AppBar;
// import IconButton = MaterialUI.IconButton;
// import FlatButton = MaterialUI.FlatButton;
// import NavigationMenu = MaterialUI.Icons.NavigationMenu;
// import IconMenu = MaterialUI.IconMenu;
// import MenuItem = MaterialUI.MenuItem;
// import NavigationClose = MaterialUI.Icons.NavigationMenu;
// import MoreVertIcon = MaterialUI.Icons.MoreVertIcon;

export class MainBar extends React.Component<any, any>{
	render() {
		return <AppBar title={<span>Title</span>}
/>
	}
}

// iconElementLeft = {<IconButton > <NavigationClose /></IconButton >}
// iconElementRight = {
// 			<IconMenu iconButtonElement= {
// 				<IconButton > <MoreVertIcon /></IconButton >
// 			}>
// 	<MenuItem primaryText="Refresh" />
// 	< MenuItem primaryText= "Help" />
// 		<MenuItem primaryText="Sign out" />
// 			</IconMenu >
// 		}