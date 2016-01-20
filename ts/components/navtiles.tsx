// navtiles.tsx

/// <reference path="../../typings/material-ui/material-ui.d.ts" />
/// <reference path="../../typings-custom/material-ui.d.ts" />
/// <reference path="../../typings-custom/react-masonry-component.d.ts" />

'use strict'

// required by bundler
import * as React from 'react'
var { Component } = React

import GridList = require('material-ui/lib/grid-list/grid-list')
import GridTile = require('material-ui/lib/grid-list/grid-tile')

import { NavTile } from "./navtile"

interface NavTilesData {

	id: 		number,
	style?: 	Object,
	content: 	string,
	help?: 		string,

}

interface NavTilesProps extends React.Props< NavTiles > {

	tiles: 		Array< NavTilesData >,
	tilecols?:	number,
	style?: 	Object,

}

class NavTiles extends Component< NavTilesProps, any > {

	render() {

		let { tiles, tilecols } = this.props

		let tiles_ = tiles.map ( function ( data ) {

			return (

				<NavTile 

					key 	= { data.id } 
					style 	= { data.style } 
					markup 	= { data.content }
					help 	= { data.help } 
				>

				</NavTile >
			)
		})

		return (
			<GridList 

				children 	= { tiles_ } 
				cols 		= { tilecols } 

			/>
		)
	}
}

export { NavTiles }
