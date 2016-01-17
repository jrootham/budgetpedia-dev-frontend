// class_maintiles.tsx

/// <reference path="../../typings/material-ui/material-ui.d.ts" />
/// <reference path="../../typings-custom/material-ui.d.ts" />
/// <reference path="../../typings-custom/react-masonry-component.d.ts" />

'use strict'

// required by bundler
import * as React from 'react';

import GridList = require('material-ui/lib/grid-list/grid-list')
import GridTile = require('material-ui/lib/grid-list/grid-tile')

// import MasonryClass = require('react-masonry-component');
// var Masonry = MasonryClass(React);

import {NavTile} from "./navtile"

interface NavTilesData {
	id: number,
	style?: Object,
	content: string,
	help?:string,
}

interface NavTilesProps extends React.Props<NavTiles> {
	tiles: Array<NavTilesData>,
	style?: Object
}

// any, any required here to allow anticipated injection of maintiles by connect
// TODO try to fix this contradiction
// @store_injector(mapStateToProps)
class NavTiles extends React.Component<NavTilesProps, any>{
	render() {
		var tiles = this.props.tiles.map(function(data) {
			// key attribute is required by ReactJS
			return <NavTile key={data.id} style={data.style} markup={data.content}></NavTile>;
		});

		return (
			<GridList >
				{tiles}
			</GridList>
		);
	}
}

export { NavTiles }
