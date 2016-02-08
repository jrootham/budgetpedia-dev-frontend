// class_mainbar.tsx

/*
    TODO: 
    - add name of user under account icon at right. Currently this causes styling problems
        consider creating compound component for inclusion as iconElementRight
    - add slide in menu on left attached to hamburger icon
    - control account icon color by passed in property
    - change username source to user object

    NOTES:
    - iconStyleRight does not work
    - style on FontIcon does not work
    - iconStyle on iconButton works
*/

/// <reference path="../../typings/material-ui/material-ui.d.ts" />
/// <reference path="../../typings-custom/material-ui.d.ts" />

'use strict'

// import MUI = require('material-ui')
// console.log(MUI)

// required by bundler
import * as React from 'react'
import { connect as injectStore} from 'react-redux'
import * as Actions from '../actions/actions'

import AppBar = require('material-ui/lib/app-bar')
import IconMenu = require('material-ui/lib/menus/icon-menu')
import MenuItem = require('material-ui/lib/menus/menu-item')
import IconButton = require('material-ui/lib/icon-button')
import FontIcon = require('material-ui/lib/font-icon')
import LeftNav = require('material-ui/lib/left-nav')
import TextField = require('material-ui/lib/text-field')
import RaisedButton = require('material-ui/lib/raised-button')
import CardTitle = require('material-ui/lib/card/card-title')
import Card = require('material-ui/lib/card/card')
import CardText = require('material-ui/lib/card/card-text')
import CardActions = require('material-ui/lib/card/card-actions')
import Divider = require('material-ui/lib/divider')
// import Colors = require('material-ui/lib/styles/colors')
// console.log(Colors)
// import FlatButton = require('material-ui/lib/flat-button')

// the following should be a font icon
import NavigationMenu = require('material-ui/lib/svg-icons/navigation/menu')
// import NavigationClose = require('material-ui/lib/svg-icons/navigation/close')
// import MoreVertIcon = require('material-ui/lib/svg-icons/navigation/more-vert')

// import IconMenu = require('material-ui/lib/menus/icon-menu')
// import MenuItem = require('material-ui/lib/menus/menu-item')

function mapStateToProps(state) {

    let { appnavbar, theme } = state

    return {

        appnavbar,
        theme,
    }

}

class MainBarClass extends React.Component<any, any> {


    constructor(props) {
        super(props);
        this.state = { 
            accountsidebaropen: false, 
            menusidebaropen: false,
        };
    }

    handleAccountSidebarToggle = () => this.setState({ accountsidebaropen: !this.state.accountsidebaropen });
    handleMenuSidebarToggle = () => this.setState({ menusidebaropen: !this.state.menusidebaropen });
    
    transitionToHome = () => {
        this.props.dispatch(Actions.transitionTo('/'))
    }

    transitionToRegister = () => {
        this.setState({ accountsidebaropen: false })
        this.props.dispatch(Actions.transitionTo('/register'))
    }

    transitionToResetPassword = () => {
        this.setState({ accountsidebaropen: false })
        this.props.dispatch(Actions.transitionTo('/resetpassword'))
    }
    // {pattern = "/^[a-z0-9._%+-]+ @[a-z0-9.-]+\.[a-z]{2, 4}$/" }

    render() { 
        let { appnavbar, theme } = this.props

        return (
            <AppBar 

                onTitleTouchTap = { this.transitionToHome }

                titleStyle = {{cursor:'pointer'}}

                style={
                    { position: "fixed" }
                } 

                title={
                    <span>{ appnavbar.title }</span>
                }

                iconElementLeft={
                    
                    <IconButton
                    onTouchTap = {() => {this.handleMenuSidebarToggle() }}
                    >

                        <NavigationMenu />

                    </IconButton>
                }

                iconElementRight={

                    <IconButton
                        onTouchTap= {() => {this.handleAccountSidebarToggle()}}
                        >
                        <FontIcon
                            className = "material-icons"
                            color = "white"
                            style = {{ cursor: "pointer" }}
                            >
                            account_circle
                        </FontIcon>
                    </IconButton>
                }
            >
                <div 
                    style={
                        { position:"absolute",
                            bottom:0,
                            right:0,
                            fontSize:"small",
                            padding:"3px",
                            color:theme.palette.alternateTextColor,
                        }
                    }
                >
                    { appnavbar.username }
                </div>
                <LeftNav 
                    width={300} 
                    docked={false}
                    openRight={true} 
                    onRequestChange={open => this.setState({ accountsidebaropen:open, }) }
                    open={this.state.accountsidebaropen} >
                    <Card style={{margin:"5px"}}>
                    <CardTitle title="Account Sign In" style={{paddingBottom:0}}/>
                    <CardText>
                    <TextField 
                        hintText="enter unique email"
                        floatingLabelText="Email Address"
                        /><br />
                    <TextField
                        hintText="enter password"
                        floatingLabelText="Password"
                        type="password"
                        /><br />
                    </CardText>
                    <CardActions style={{textAlign:"center"}}>
                    <RaisedButton type="submit" label="Sign in" className="button-submit" primary={true} />
                    </CardActions>
                    <CardText>
                    <a href="javascript:void(0);" 
                        onTouchTap={this.transitionToResetPassword}>
                        Forgot your password?
                    </a>
                    </CardText>
                    <Divider/>
                    <CardText>
                        Not a member? Register:
                    </CardText>
                    <CardActions style={{ textAlign: "center" }}>
                    <RaisedButton
                        type="button" 
                        label="Register" 
                        onTouchTap={this.transitionToRegister}
                    />
                    </CardActions>
                    </Card>
                </LeftNav>
                <LeftNav
                    width={300}
                    docked={false}
                    openRight={false}
                    onRequestChange={open => this.setState({ menusidebaropen: open, }) }
                    open={this.state.menusidebaropen} >
                    <div>Menu Sidebar</div>
                </LeftNav>
             </AppBar>
        )
    } // render
}

var MainBar:typeof MainBarClass = injectStore(mapStateToProps)(MainBarClass)

export { MainBar }
