// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// maintiles.tsx

'use strict'

import * as React from 'react';
import { connect } from 'react-redux'
import { compose } from 'redux'
import * as Actions from '../actions/actions'

import { AppTiles } from "../components/apptiles"
import {Card, CardTitle, CardText, CardActions} from 'material-ui/Card'

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
            <div>

            <Card>
            <CardTitle>
            Welcome to Budgetpedia. We're all about government budgets.
            </CardTitle>
            <CardText>
            <p style={{margin:0, padding:0}}>Explore the Toronto budget with our Budget Explorer. 
            See a sample of Toronto's annual budget decision process at our Budget Roadmap.</p>
            <p>We welcome you to join us (and contribute!) at any of our digital places:</p>
            <ul>
            <li>For discussions: our Facebook group (facebook.com/groups/budgetpedia)</li>
            <li>For lists of resources: our Facebook page (facebook.com/bugetpedia)</li>
            <li>For notifications: Twitter (twitter.com/budgetpedia)</li>
            <li>For in-depth articles: Medium (medium.com/budgetpedia)</li>
            <li>For technical discussions: our Google forum (groups.google.com/d/forum/budgetpedia)</li>
            </ul>
            <p>Below are tiles leading to more information about the Budgetpedia Project.</p>
            </CardText>
            </Card>

            <AppTiles 

                style = {
                    {
                        margin:"16px",
                        fontFamily:theme.fontFamily,
                    }
                }
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
            </div>
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
