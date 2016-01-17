// maintiles.tsx

'use strict'

import * as React from 'react';
import { connect as inject_store} from 'react-redux'

import {NavTiles} from "../components/navtiles"

function mapStateToProps(state) {
	return { maintiles: state.maintiles }
}

class MainTilesClass extends React.Component<any, any> {
	render() {
		return <NavTiles tiles={this.props.maintiles} />
	}
}

var MainTiles = inject_store(mapStateToProps)(MainTilesClass)

export {MainTiles}
