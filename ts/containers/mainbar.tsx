// copyright (c) 2015 Henrik Bechmann, Toronto, MIT Licence
// class_mainbar.tsx

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
import { connect as injectStore} from 'react-redux'
import * as Actions from '../actions/actions'

import AppBar = require('material-ui/lib/app-bar')
import LeftNav = require('material-ui/lib/left-nav')

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
            errors:{password:false,userid:false},
        };
    }

    handleAccountSidebarToggle = () => this.setState({ accountsidebaropen: !this.state.accountsidebaropen });
    handleMenuSidebarToggle = () => this.setState({ menusidebaropen: !this.state.menusidebaropen });
    
    transitionToHome = () => {
        this.setState({ accountsidebaropen: false })
        this.props.dispatch(Actions.transitionTo('/'))
    }

    close = () => {
        this.setState({ accountsidebaropen: false })
    }

    transitionToRegister = () => {
        this.setState({ accountsidebaropen: false })
        this.props.dispatch(Actions.transitionTo('/register'))
    }

    transitionToResetPassword = () => {
        this.setState({ accountsidebaropen: false })
        this.props.dispatch(Actions.transitionTo('/resetpassword'))
    }

    submitLogin = (e) => {

        e.stopPropagation()
        e.preventDefault()

        let password=this.state.elements.password.getValue()
        let userid=this.state.elements.userid.getValue()

        let passworderror = !password
        if (!passworderror)
            passworderror = (password.length < 6 || password.length > 12)

        let useriderror = !userid
        if (!useriderror)
            useriderror = !this.validateEmail(userid)

        let dologin = !(useriderror || passworderror)

        this.setState({ errors: { password: passworderror, userid: useriderror } })

        if (dologin) {
            let creds = {
                password,
                userid,
            }
            this.props.dispatch(Actions.loginUser(creds))
        }
    }
    validateEmail = email => {
        // var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        let pattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/
        let result = pattern.test(email)
        return result
    }

    render() { 
        let { appnavbar, theme } = this.props

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
                onTouchTap={ this.close } >

                <FontIcon
                    className="material-icons"
                    color = {theme.palette.primary3Color}
                    style = {{ cursor: "pointer" }} >

                    close

                </FontIcon>

            </IconButton>

        let loginform = 
            <form onSubmit={this.submitLogin} >

                {this.props.auth.isFetching
                    ? <p style={{ color: "green" }}>Checking credentials</p>
                    : null
                }

                {this.props.auth.errorMessage
                    ? <p style={{ color: "red" }}>{this.props.auth.errorMessage}</p>
                    : null
                }

                <CardText>

                    <TextField
                        hintText="enter unique email (required)"
                        floatingLabelText="Email Address"
                        ref={node => { this.state.elements.userid = node } }
                        errorText={
                            this.state.errors.userid
                                ? 'this field is required, and must be in valid email format'
                                : ''
                        } /><br />

                    <TextField
                        hintText="enter password (required)"
                        floatingLabelText="Password"
                        type="password"
                        errorText={
                            this.state.errors.password
                                ? 'this field is required, and must be between 6 and 12 characters long'
                                : ''
                        }
                        ref={node => { this.state.elements.password = node } }
                        /><br />

                </CardText>

                <CardActions style={{ textAlign: "center" }} >

                    <RaisedButton
                        type="submit"
                        label="Sign in"
                        className="button-submit"
                        primary={true} />

                </CardActions>

            </form>

        let registerprompt = 
            <div>
                <CardText>
                    <a href="javascript:void(0);"
                        onTouchTap={this.transitionToResetPassword}>
                        Forgot your password?
                    </a>
                </CardText>

                <Divider/>

                <CardText>
                    Not a member?Register:
                </CardText>

                <CardActions style={{ textAlign: "center" }} >

                    <RaisedButton
                        type="button"
                        label="Register"
                        onTouchTap={this.transitionToRegister} />

                </CardActions>
            </div>

        let loginsidebar = 
            <LeftNav
                width = { 300} 
                docked = { false}
                openRight = { true} 
                onRequestChange = { open => this.setState({ accountsidebaropen: open, }) }
                open = { this.state.accountsidebaropen } >

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
                onRequestChange={open => this.setState({ menusidebaropen: open, }) }
                open={this.state.menusidebaropen} >

                <div>Menu Sidebar</div>

            </LeftNav>

        let menuicon = 
            <IconButton
                onTouchTap = {() => { this.handleMenuSidebarToggle() } } >

                <FontIcon
                    className = "material-icons"
                    color = {theme.palette.alternateTextColor}
                    style = {{ cursor: "pointer" }} >

                    menu

                </FontIcon>

            </IconButton>

        let accounticon = 
            <IconButton
                onTouchTap= {() => { this.handleAccountSidebarToggle() } } >

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
                onTitleTouchTap = { this.transitionToHome }
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
