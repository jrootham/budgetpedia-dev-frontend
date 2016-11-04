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

    transitionTo = (e, target) => {

        e.stopPropagation()
        e.preventDefault()
        var _this = this;
        _this.props.transitionTo(target)

    }

    render() {

        let { hometiles, homecols, homepadding, theme, colors, system } = this.props

        return (
            <div>

            <Card style={{backgroundImage:"url(./public/icons/budgetpedia-pale.jpg",
                backgroundSize:"cover"}}>
            <div style = {{float:"left",margin:"9px 3px 3px 3px"}}>
                <img style={{width:"100px"}} src= "./public/icons/budgetpedia-logo.png" />
            </div>
            <CardTitle>
            Welcome to Budgetpedia. We're all about government budgets.
            </CardTitle>
            <CardText>
            <p style={{margin:0, padding:0}}>Explore the Toronto budget with our <a 
                href="javascript:void(0);"
                onTouchTap={ e => {this.transitionTo(e,'explorer')}}>Budget Explorer</a>. 
            See a sample of Toronto's annual budget decision process at our <a 
                href="javascript:void(0);"
                onTouchTap={ e => {this.transitionTo(e,'roadmap')}}>Budget Roadmap</a>.</p>
            <p>We welcome you to join us (and contribute!) on any of our digital platforms:</p>
            <ul>
            <li><a 
                    href="http://facebook.com/groups/budgetpedia" 
                    target="_blank">
                    <img style={{height:"16px",verticalAlign:"middle"}} src="./public/icons/facebook.png"/></a> For 
                    discussions: our Facebook group (<a 
                    href="http://facebook.com/groups/budgetpedia" 
                    target="_blank">
                    facebook.com/groups/budgetpedia</a>)</li>
            <li><a 
                href="http://facebook.com/budgetpedia" 
                target="_blank">
                <img style={{height:"16px",verticalAlign:"middle"}} src="./public/icons/facebook.png"/></a> For 
                lists of resources: our Facebook page (<a 
                href="http://facebook.com/budgetpedia" 
                target="_blank">facebook.com/budgetpedia</a>)</li>
            <li><a 
                href="http://twitter.com/budgetpedia" 
                target="_blank">
                <img style={{height:"16px",verticalAlign:"middle"}} src="./public/icons/twitter.png"/></a> For 
                notifications: Twitter (<a 
                href="http://twitter.com/budgetpedia" 
                target="_blank">twitter.com/budgetpedia</a>)</li>
            <li><a href="http://medium.com/budgetpedia"
                target = "_blank">
                <img style={{height:"16px",verticalAlign:"middle"}} src="./public/icons/medium.png"/></a> For 
                in-depth articles: Medium (
                <a href="http://medium.com/budgetpedia"
                target = "_blank">medium.com/budgetpedia</a>)</li>
            <li><a href="http://groups.google.com/d/forum/budgetpedia"
                target="_blank">
                <img style={{height:"16px",verticalAlign:"middle"}} src="./public/icons/g-logo.png"/></a> For 
                technical discussions: our Google forum (
                <a href="http://groups.google.com/d/forum/budgetpedia"
                target="_blank">groups.google.com/d/forum/budgetpedia</a>)</li>
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
