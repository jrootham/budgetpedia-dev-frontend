// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// maintiles.tsx

'use strict'

import * as React from 'react';
import { connect } from 'react-redux'
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

        this.props.setTileCols()

    }

    componentWillMount = () => {

        // initialize
        this.props.setTileCols()

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
                tiles =     { maintiles } 
                tilecols =  { maincols }
                padding =   { mainpadding }
                tilecolors = {
                    { 
                        front: colors.blue50,
                        back: colors.amber50,
                        helpbutton: theme.palette.primary3Color,
                    }
                }
                system = { system }
                transitionTo = { this.props.transitionTo }
                cellHeight = { 200 }

            />
        )
    }
}

// dependency injection
var MainTiles = connect ( mapStateToProps,
    {
        transitionTo:Actions.transitionTo,
        setTileCols:Actions.setHomeTileCols,
    }) ( MainTilesClass )

export { MainTiles }
