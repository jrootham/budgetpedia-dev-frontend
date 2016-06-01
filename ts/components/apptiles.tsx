// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// navtiles.tsx

'use strict'

// required by bundler
import * as React from 'react'
var { Component } = React

import GridList from 'material-ui/GridList'

import { AppTile } from "./apptile"

interface NavTilesData {

    id:         number,
    style?:     Object,
    content:    string,
    help?:      string,
    route?:     string,
    image?:     string,

}

interface AppTilesProps extends React.Props< AppTiles > {

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

class AppTiles extends Component< AppTilesProps, any > {

    render() {

        let { tiles, tilecols, padding, tilecolors, style, system, route, transitionTo, cellHeight } = this.props

        let tiles_ = tiles.map ( function ( data ) {

            return (
                <AppTile 
                    key     = { data.id } 
                    content  = { data.content }
                    image = {data.image}
                    tilecolors = { tilecolors }
                    system = { system }
                    route = { data.route }
                    transitionTo = { transitionTo } 
                    />
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

export { AppTiles }
