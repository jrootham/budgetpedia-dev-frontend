// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// maintiles.tsx

'use strict'

import * as React from 'react';
import { connect as injectStore} from 'react-redux'
import { compose } from 'redux'
import * as Actions from '../actions/actions'

import { AppTiles } from "../components/apptiles"

const mapStateToProps = ( { hometiles, homecols, homepadding, theme, colors, system } ) => 
({ 
    hometiles,
    homecols,
    homepadding,
    theme,
    colors,
    system,
})

class HomeTilesClass extends React.Component<any, any> {

    handleHomeResize = () => { 

        this.props.dispatch ( Actions.setHomeTileCols() ) 

    }

    componentWillMount = () => {

        // initialize
        this.props.dispatch ( Actions.setHomeTileCols() )

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
                transitionTo = { compose(this.props.dispatch, Actions.transitionTo) }
                cellHeight = { 180 }
            />
        )
    }
}

// dependency injection
var HomeTiles = injectStore ( mapStateToProps ) ( HomeTilesClass )

export default HomeTiles
