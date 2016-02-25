// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// class_mainbar.tsx
/// <reference path="../../typings/react/react.d.ts" />

/*
    TODO: 
    - add name of user under account icon at right. Currently this causes styling problems
    - control account icon color by passed in property
    - change username source to user object
    - clear login form after successful login (form.reset())
    - use getInputDOMNode().value = this.refs.input.getDOMNode(), or getValue()
    - animate and abstract the ui message board

    NOTES:
    - iconStyleRight does not work
    - style on FontIcon does not work
    - iconStyle on iconButton works
*/

/// <reference path="../../typings/material-ui/material-ui.d.ts" />
/// <reference path="../../typings-custom/material-ui.d.ts" />

'use strict'

import * as React from 'react' // required by bundler
var { Component, PropTypes } = React
import { connect as injectStore} from 'react-redux'
import * as Actions from '../actions/actions'

import AppBar = require('material-ui/lib/app-bar')
import LeftNav = require('material-ui/lib/left-nav')

import { BasicForm, elementProps } from '../components/basicform'

import Card = require('material-ui/lib/card/card')
import CardTitle = require('material-ui/lib/card/card-title')
import CardText = require('material-ui/lib/card/card-text')
import CardActions = require('material-ui/lib/card/card-actions')

// import IconMenu = require('material-ui/lib/menus/icon-menu')
import MenuItem = require('material-ui/lib/menus/menu-item')
import IconButton = require('material-ui/lib/icon-button')
import RaisedButton = require('material-ui/lib/raised-button')

import FontIcon = require('material-ui/lib/font-icon')
import TextField = require('material-ui/lib/text-field')
import Divider = require('material-ui/lib/divider')
// import Colors = require('material-ui/lib/styles/colors')
// console.log(Colors)
// import FlatButton = require('material-ui/lib/flat-button')

class MainBarClass extends React.Component<any, any> {

    constructor(props) {
        super(props);
        this.state = { 
            accountsidebaropen: false, 
            menusidebaropen: false,
            elements:{},
            errors:{password:false,email:false},
        };
    }

    handleAccountSidebarToggle = () => this.setState({ accountsidebaropen: !this.state.accountsidebaropen });
    handleMenuSidebarToggle = () => this.setState({ menusidebaropen: !this.state.menusidebaropen });
    
    close = () => {
        this.setState({ accountsidebaropen: false })
    }

    transitionToHome = () => {
        // consistent with other transition calls...
        setTimeout(()=>{        
            this.setState({ accountsidebaropen: false })
            this.props.dispatch(Actions.transitionTo('/'))
        })
    }

    transitionToRegister = (e) => {
        // avoid conflict with flipcard on home page
        setTimeout(()=>{
            this.setState({ accountsidebaropen: false })
            this.props.dispatch(Actions.transitionTo('/register'))
        })
    }

    transitionToResetPassword = (e) => {
        // avoid conflict with flipcard on home page
        setTimeout(() => {
            this.setState({ accountsidebaropen: false })
            this.props.dispatch(Actions.transitionTo('/resetpassword'))
        })
    }

    // respond to login form; assume error correction
    submitLogin = ( elements ) => {

        console.log('returned elements',elements)
        let creds = {}
        for (var index in elements) {
            creds[index] = elements[index].getValue()
        }
        console.log('creds',creds)

        this.props.dispatch(Actions.loginUser(creds))
    }

    componentDidMount = () => {
        let auth = this.props.auth
        // console.log('state in mainbar', auth)
        // close login sidebar after login
        if (auth.isAuthenticated && (!auth.isFetching) && this.state.accountsidebaropen) {
            this.setState({accountsidebaropen:false})
        }
    }

    render() { 
        let appbar = this
        let { appnavbar, theme } = appbar.props

        let closeicon =
            <IconButton
                style={{
                    top:0,
                    right:0,
                    padding: 0,
                    height: "36px",
                    width: "36px",
                    position: "absolute",
                    zIndex:2,
                }}
                onTouchTap={ appbar.close } >

                <FontIcon
                    className="material-icons"
                    color = {theme.palette.primary3Color}
                    style = {{ cursor: "pointer" }} >

                    close

                </FontIcon>

            </IconButton>

        // for login form below
        let elements:Array<elementProps> = [
            { 
                index: 'email',
                floatingLabelText: 'Email Address',
                hintText:"enter unique email (required)",
                // defaultValue: 'henrik@bechmann.ca',
                type: 'email',
                required: true,
            },
            {
                index: 'password',
                floatingLabelText: 'Password',
                hintText:"enter password (required)",
                type: 'password',
                maxLength:16,
                minLength:6,
                required: true,
            },
        ]

        let loginform = 
            <BasicForm 
                submit = { appbar.submitLogin }
                elements = { elements }
                submitButtonLabel = 'Sign up'
                errorMessage = { appbar.props.auth.errorMessage } 
            />

        let registerprompt = 
            <div>
                <CardText>
                    <a href="javascript:void(0);"
                        onTouchTap={appbar.transitionToResetPassword}>
                        Forgot your password?
                    </a>
                </CardText>

                <Divider/>

                <CardText>
                    Not a member? Register:
                </CardText>

                <CardActions>

                    <RaisedButton
                        type="button"
                        label="Register"
                        onTouchTap={appbar.transitionToRegister} />

                </CardActions>
            </div>

        let loginsidebar = 
            <LeftNav
                width = { 300} 
                docked = { false}
                openRight = { true} 
                onRequestChange = { open => appbar.setState({ accountsidebaropen: open, }) }
                open = { appbar.state.accountsidebaropen } >

                <Card style={{ margin: "5px" }} >

                    { closeicon }

                    <CardTitle title="Account Sign In" style={{ paddingBottom: 0 }} />

                    { loginform }

                    { registerprompt }
                    
                </Card>
            </LeftNav >

        let menusidebar = 
            <LeftNav
                width={300}
                docked={false}
                openRight={false}
                onRequestChange={open => appbar.setState({ menusidebaropen: open, }) }
                open={this.state.menusidebaropen} >

                <div>Menu Sidebar</div>

            </LeftNav>

        let menuicon = 
            <IconButton
                onTouchTap = {() => { appbar.handleMenuSidebarToggle() } } >

                <FontIcon
                    className = "material-icons"
                    color = {theme.palette.alternateTextColor}
                    style = {{ cursor: "pointer" }} >

                    menu

                </FontIcon>

            </IconButton>

        let accounticon = 
            <IconButton
                onTouchTap= {() => { appbar.handleAccountSidebarToggle() } } >

                <FontIcon
                    className = "material-icons"
                    color = {theme.palette.alternateTextColor}
                    style = {{ cursor: "pointer" }} >

                    account_circle

                </FontIcon>

            </IconButton> 

        let username = 
            <div style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                fontSize: "small",
                padding: "3px",
                color: theme.palette.alternateTextColor,
            }} >

                { appnavbar.username }

            </div>

        // main components

        return (
            <AppBar
                onTitleTouchTap = { appbar.transitionToHome }
                titleStyle = {{cursor:'pointer'}}
                style={ { position: "fixed" } }
                title={ <span>{ appnavbar.title }</span> }

                iconElementLeft={ menuicon }
                iconElementRight={ accounticon } >

                { username }

                { loginsidebar }

                { menusidebar }

             </AppBar>
        )
    } // render
}

function mapStateToProps(state) {

    let { appnavbar, theme, auth } = state

    return {

        state,
        auth,
        appnavbar,
        theme,
    }

}

var MainBar:typeof MainBarClass = injectStore(mapStateToProps)(MainBarClass)

export { MainBar }
