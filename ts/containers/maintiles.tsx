// maintiles.tsx

'use strict'

import * as React from 'react';
import { connect as injectStore} from 'react-redux'

import { NavTiles } from "../components/navtiles"

function mapStateToProps ( state ) {

	let { maintiles, tilecols } = state

	return { 

		maintiles,
		tilecols,

	 }

}

class MainTilesClass extends React.Component<any, any> {

	handleResize() { 

		this.props.dispatch ( { type: "SET_TILECOLS" } ) 

	}

	componentWillMount() {

		// initialize
		this.props.dispatch ( { type:"SET_TILECOLS" } )

	}

	componentDidMount() {

		window.addEventListener ( 'resize', this.handleResize )

	}

	componentWillUnmount() {

		window.removeEventListener ( 'resize', this.handleResize )

	}

	render() {

		let { maintiles, tilecols } = this.props

		return (

			<NavTiles 

				tiles =		{ maintiles } 
				tilecols =	{ tilecols }

			/>
		)
	}
}

// dependency injection
var MainTiles = injectStore ( mapStateToProps ) ( MainTilesClass )

export { MainTiles }
