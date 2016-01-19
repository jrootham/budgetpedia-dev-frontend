// maintiles.tsx

'use strict'

import * as React from 'react';
import { connect as injectStore} from 'react-redux'

import { NavTiles } from "../components/navtiles"

function mapStateToProps(state) {
	return { 
		maintiles: state.maintiles,
		tilecols:state.tilecols,
	 }
}

class MainTilesClass extends React.Component<any, any> {

	handleResize = () => { 
		this.props.dispatch({ type: "SET_TILECOLS" }) 
	}

	componentWillMount() {
		// initialize
		this.props.dispatch({type:"SET_TILECOLS"})
	}

	componentDidMount() {
		window.addEventListener('resize',this.handleResize)
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.handleResize)
	}

	render() {
		return <NavTiles tiles={this.props.maintiles} tilecols={this.props.tilecols}/>
	}
}

var MainTiles = injectStore ( mapStateToProps ) ( MainTilesClass )

export { MainTiles }
