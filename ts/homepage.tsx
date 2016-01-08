/// <reference path="../typings/react/react.d.ts" />
/// <reference path="../typings/react/react-dom.d.ts" />
/// <reference path="../typings-custom/react-tap-event-plugin.d.ts" />

import * as React from 'react';
import * as ReactDom from 'react-dom';

import {MainBar} from './class_mainbar';
import {MainTiles} from './class_maintiles';

import injectTapEventPlugin = require('react-tap-event-plugin');
// doesn't work:
// import * as TapPlugin from 'react-tap-event-plugin';
// import injectTapEventPlugin = TapPlugin.injectTapEventPlugin;
injectTapEventPlugin();

// test data, should come from database
var defaultStyle = {
	border: '2px solid green', 
	'width':'180px',
	height: '100px',
	marginTop:'10px',
	padding:'3px'
}
var tileData = [
	{ 
		id:1,
		style: defaultStyle,
		content: "<em>First something saasdfasdf asdfasdfasd</em>" 
	},
	{
		id: 2,
		style: defaultStyle,
		content: "Second"
	},
	{
		id: 3,
		style: defaultStyle,
		content: "Third"
	},
	{
		id: 4,
		style: defaultStyle,
		content: "Fourth"
	},
	{
		id: 5,
		style: defaultStyle,
		content: "Fifth"
	},
	{
		id: 6,
		style: defaultStyle,
		content: "Sixth"
	},
];

ReactDom.render(<MainBar />, document.getElementById('container'));

ReactDom.render(<MainTiles tiledata={tileData}/>, document.getElementById('tiles'));
