// initialstate.tsx

'use strict'

// https://design.google.com/icons/

/* ================= theme details: ==================== */

import theme = require('material-ui/lib/styles/raw-themes/light-raw-theme')

// fontFamily: "Roboto, sans-serif"
// palette: Object
// 	accent1Color: "#ff4081"
// 	accent2Color: "#f5f5f5"
// 	accent3Color: "#9e9e9e"
// 	alternateTextColor: "#ffffff"
// 	borderColor: "#e0e0e0"
// 	canvasColor: "#ffffff"
// 	clockCircleColor: "rgba(0,0,0,0.07)"
// 	disabledColor: "rgba(0,0,0,0.3)"
// 	pickerHeaderColor: "#00bcd4"
// 	primary1Color: "#00bcd4"
// 	primary2Color: "#0097a7"
// 	primary3Color: "#bdbdbd"
// 	textColor: "rgba(0, 0, 0, 0.87)"
// spacing: Object
// 	desktopDropDownMenuFontSize: 15
// 	desktopDropDownMenuItemHeight: 32
// 	desktopGutter: 24
// 	desktopGutterLess: 16
// 	desktopGutterMini: 8
// 	desktopGutterMore: 32
// 	desktopKeylineIncrement: 64
// 	desktopLeftNavMenuItemHeight: 48
// 	desktopSubheaderHeight: 48
// 	desktopToolbarHeight: 56
// 	iconSize: 24

/* ======================================== */

import colors = require('material-ui/lib/styles/colors')

let appnavbar = {
	title: 'Toronto Budget Commons',
	username: 'anonymous',
	accountoptions: [],
	menuoptions: [],
}

let toolsnavbar = {

}

// for more detail: https://www.npmjs.com/package/snifferjs
let system = {
	ischrome: /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
}


let maincols: number = 2 // default
let mainpadding: number = 0
let maintiles: [Object] = [
	{
		id: 6,
		content: `<h3>About Budget Commons</h3> 
		<p><em>[content pending]</em></p>`,
		index: 0,
		route: 'about',
	},
	{
		id: 7,
		content: `<h3>Budget Timeline</h3>
		<p><em>[content pending]</em></p>`,
		help: `<h3>About Budget Timeline</h3>
		<p><em>[content pending]</em></p>`,
		index: 1,
		route:'timeline',
	},
	{
		id: 1,
		content: `<h3>Deputation Helper</h3>
		<p><em>[content pending]</em></p>`,
		help: `<h3>About Deputation Helper</h3>
		<p><em>[content pending]</em></p>`,
		index: 2,
		route:'deputations',
	},
	{
		id: 2,
		content: `<h3>Budget Resources</h3>
		<p><em>[content pending]</em></p>`,
		help: `<h3>About Budget Resources</h3>
		<p><em>[content pending]</em></p>`,
		index: 3,
		route:'resources',
	},
	{
		id: 8,
		content: `<h3>Social Media Resources</h3>
		<p><em>[content pending]</em></p>`,
		help: `<h3>About Social Media Resources</h3>
		<p><em>[content pending]</em></p>`,
		index: 4,
		route:'socialresources',
	},
];

export var initialstate = {
	maintiles,
	maincols,
	mainpadding,
	appnavbar,
	toolsnavbar,
	theme,
	colors,
	system,
}
