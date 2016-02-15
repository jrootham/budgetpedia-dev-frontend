// copyright (c) 2015 Henrik Bechmann, Toronto, MIT Licence
// maintiles.tsx

'use strict'

import * as React from 'react';
import { connect as injectStore} from 'react-redux'
import { compose } from 'redux'
import * as Actions from '../actions/actions'

import { NavTiles } from "../components/navtiles"

function mapStateToProps ( state ) {

	let { maintiles, maincols, mainpadding, theme, colors, system } = state

	return { 

		maintiles,
		maincols,
		mainpadding,
		theme,
		colors,
		system,

	 }

}

class MainTilesClass extends React.Component<any, any> {

	handleResize = () => { 

		this.props.dispatch ( Actions.setTileCols() ) 

	}

	componentWillMount = () => {

		// initialize
		this.props.dispatch ( Actions.setTileCols() )

	}

	componentDidMount = () => {

		window.addEventListener ( 'resize', this.handleResize )

	}

	componentWillUnmount = () => {

		window.removeEventListener ( 'resize', this.handleResize )

	}

	render() {

		let { maintiles, maincols, mainpadding, theme, colors, system } = this.props

		return (

			<NavTiles 

				style = {{margin:0,fontFamily:theme.fontFamily}}
				tiles =		{ maintiles } 
				tilecols =	{ maincols }
				padding = 	{ mainpadding }
				tilecolors = {
					{ 
						front: colors.blue50,
						back: colors.amber50,
						helpbutton: theme.palette.primary3Color,
					}
				}
				system = { system }
                transitionTo = { compose(this.props.dispatch, Actions.transitionTo) }
                cellHeight = { 200 }

			/>
		)
	}
}

// dependency injection
var MainTiles = injectStore ( mapStateToProps ) ( MainTilesClass )

export { MainTiles }
