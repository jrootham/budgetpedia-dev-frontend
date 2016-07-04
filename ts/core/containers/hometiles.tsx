// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// maintiles.tsx

'use strict'

import * as React from 'react';
import { connect } from 'react-redux'
import { compose } from 'redux'
import * as Actions from '../actions/actions'

import { AppTiles } from "../components/apptiles"

const mapStateToProps = ( { homegrid, resources } ) => 
({ 
    hometiles:homegrid.hometiles,
    homecols:homegrid.homecols,
    homepadding:homegrid.homepadding,
    theme:resources.theme,
    colors:resources.colors,
    system:resources.system,
})

class HomeTilesClass extends React.Component<any, any> {

    handleHomeResize = () => { 

        this.props.setHomeTileCols()

    }

    componentWillMount = () => {

        // initialize
        this.props.setHomeTileCols()

    }

    componentDidMount = () => {

        window.addEventListener ( 'resize', this.handleHomeResize )

    }

    componentWillUnmount = () => {

        window.removeEventListener ( 'resize', this.handleHomeResize )

    }

    render() {

        let { hometiles, homecols, homepadding, theme, colors, system } = this.props

        return (

            <AppTiles 

                style = {{margin:"16px",fontFamily:theme.fontFamily}}
                tiles =     { hometiles } 
                tilecols =  { homecols }
                padding =   { homepadding }
                tilecolors = {
                    { 
                        front: colors.blue50,
                        back: colors.amber50,
                        helpbutton: theme.palette.primary3Color,
                    }
                }
                system = { system }
                transitionTo = { this.props.transitionTo }
                cellHeight = { 180 }
            />
        )
    }
}

// dependency injection
var HomeTiles = connect ( mapStateToProps, 
    {
        transitionTo:Actions.transitionTo,
        setHomeTileCols:Actions.setHomeTileCols,
    } ) ( HomeTilesClass )

export default HomeTiles
