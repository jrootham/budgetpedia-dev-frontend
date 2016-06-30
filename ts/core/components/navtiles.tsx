// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// navtiles.tsx

'use strict'

// required by bundler
import * as React from 'react'
var { Component } = React

import { GridList, GridTile } from 'material-ui/GridList'

import { NavTile } from "./navtile"

interface NavTilesData {

    id:         number,
    style?:     Object,
    content:    string,
    help?:      string,
    route?:     string,

}

interface NavTilesProps extends React.Props< NavTiles > {

    tiles:      Array< NavTilesData >,
    tilecols?:  number,
    padding?:   number,
    style?:     Object,
    tilecolors: Object,
    system:     Object,
    route?:     string,
    transitionTo: Function,
    cellHeight?: number,

}

class NavTiles extends Component< NavTilesProps, any > {

    render() {

        let { tiles, tilecols, padding, tilecolors, style, system, route, transitionTo, cellHeight } = this.props

        let tiles_ = tiles.map ( function ( data ) {

            return (
                <NavTile 
                    key     = { data.id } 
                    markup  = { data.content }
                    help    = { data.help } 
                    tilecolors = { tilecolors }
                    system = { system }
                    route = { data.route }
                    transitionTo = { transitionTo } />
            )
        })

        return (
            <GridList 

                style       = { style }
                children    = { tiles_ } 
                cols        = { tilecols } 
                padding     = { padding }
                cellHeight  = { cellHeight } />
        )
    }
}

export { NavTiles }
