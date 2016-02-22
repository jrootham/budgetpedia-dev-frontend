'use strict';
var React = require('react');
var { Component, PropTypes } = React;
var react_redux_1 = require('react-redux');
var Actions = require('../actions/actions');
var AppBar = require('material-ui/lib/app-bar');
var LeftNav = require('material-ui/lib/left-nav');
var basicform_1 = require('../components/basicform');
var Card = require('material-ui/lib/card/card');
var CardTitle = require('material-ui/lib/card/card-title');
var CardText = require('material-ui/lib/card/card-text');
var CardActions = require('material-ui/lib/card/card-actions');
var IconButton = require('material-ui/lib/icon-button');
var RaisedButton = require('material-ui/lib/raised-button');
var FontIcon = require('material-ui/lib/font-icon');
var Divider = require('material-ui/lib/divider');
class MainBarClass extends React.Component {
    constructor(props) {
        super(props);
        this.handleAccountSidebarToggle = () => this.setState({ accountsidebaropen: !this.state.accountsidebaropen });
        this.handleMenuSidebarToggle = () => this.setState({ menusidebaropen: !this.state.menusidebaropen });
        this.close = () => {
            this.setState({ accountsidebaropen: false });
        };
        this.transitionToHome = () => {
            setTimeout(() => {
                this.setState({ accountsidebaropen: false });
                this.props.dispatch(Actions.transitionTo('/'));
            });
        };
        this.transitionToRegister = (e) => {
            setTimeout(() => {
                this.setState({ accountsidebaropen: false });
                this.props.dispatch(Actions.transitionTo('/register'));
            });
        };
        this.transitionToResetPassword = (e) => {
            setTimeout(() => {
                this.setState({ accountsidebaropen: false });
                this.props.dispatch(Actions.transitionTo('/resetpassword'));
            });
        };
        this.submitLogin = (elements) => {
            console.log('returned elements', elements);
            let creds = {};
            for (var index in elements) {
                creds[index] = elements[index].getValue();
            }
            console.log('creds', creds);
            this.props.dispatch(Actions.loginUser(creds));
        };
        this.componentDidMount = () => {
            let auth = this.props.auth;
            if (auth.isAuthenticated && (!auth.isFetching) && this.state.accountsidebaropen) {
                this.setState({ accountsidebaropen: false });
            }
        };
        this.state = {
            accountsidebaropen: false,
            menusidebaropen: false,
            elements: {},
            errors: { password: false, userid: false },
        };
    }
    render() {
        let appbar = this;
        let { appnavbar, theme } = appbar.props;
        let closeicon = React.createElement(IconButton, {"style": {
            top: 0,
            right: 0,
            padding: 0,
            height: "36px",
            width: "36px",
            position: "absolute",
            zIndex: 2,
        }, "onTouchTap": appbar.close}, React.createElement(FontIcon, {"className": "material-icons", "color": theme.palette.primary3Color, "style": { cursor: "pointer" }}, "close"));
        let elements = [
            {
                index: 'userid',
                floatingLabelText: 'Email Address',
                hintText: "enter unique email (required)",
                type: 'email',
                required: true,
            },
            {
                index: 'password',
                floatingLabelText: 'Password',
                hintText: "enter password (required)",
                type: 'password',
                maxLength: 16,
                minLength: 6,
                required: true,
            },
        ];
        let loginform = React.createElement(basicform_1.BasicForm, {"submit": appbar.submitLogin, "elements": elements, "submitButtonLabel": 'Sign up', "errorMessage": appbar.props.auth.errorMessage});
        let registerprompt = React.createElement("div", null, React.createElement(CardText, null, React.createElement("a", {"href": "javascript:void(0);", "onTouchTap": appbar.transitionToResetPassword}, "Forgot your password?")), React.createElement(Divider, null), React.createElement(CardText, null, "Not a member? Register:"), React.createElement(CardActions, null, React.createElement(RaisedButton, {"type": "button", "label": "Register", "onTouchTap": appbar.transitionToRegister})));
        let loginsidebar = React.createElement(LeftNav, {"width": 300, "docked": false, "openRight": true, "onRequestChange": open => appbar.setState({ accountsidebaropen: open, }), "open": appbar.state.accountsidebaropen}, React.createElement(Card, {"style": { margin: "5px" }}, closeicon, React.createElement(CardTitle, {"title": "Account Sign In", "style": { paddingBottom: 0 }}), loginform, registerprompt));
        let menusidebar = React.createElement(LeftNav, {"width": 300, "docked": false, "openRight": false, "onRequestChange": open => appbar.setState({ menusidebaropen: open, }), "open": this.state.menusidebaropen}, React.createElement("div", null, "Menu Sidebar"));
        let menuicon = React.createElement(IconButton, {"onTouchTap": () => { appbar.handleMenuSidebarToggle(); }}, React.createElement(FontIcon, {"className": "material-icons", "color": theme.palette.alternateTextColor, "style": { cursor: "pointer" }}, "menu"));
        let accounticon = React.createElement(IconButton, {"onTouchTap": () => { appbar.handleAccountSidebarToggle(); }}, React.createElement(FontIcon, {"className": "material-icons", "color": theme.palette.alternateTextColor, "style": { cursor: "pointer" }}, "account_circle"));
        let username = React.createElement("div", {"style": {
            position: "absolute",
            bottom: 0,
            right: 0,
            fontSize: "small",
            padding: "3px",
            color: theme.palette.alternateTextColor,
        }}, appnavbar.username);
        return (React.createElement(AppBar, {"onTitleTouchTap": appbar.transitionToHome, "titleStyle": { cursor: 'pointer' }, "style": { position: "fixed" }, "title": React.createElement("span", null, appnavbar.title), "iconElementLeft": menuicon, "iconElementRight": accounticon}, username, loginsidebar, menusidebar));
    }
}
function mapStateToProps(state) {
    let { appnavbar, theme, auth } = state;
    return {
        state,
        auth,
        appnavbar,
        theme,
    };
}
var MainBar = react_redux_1.connect(mapStateToProps)(MainBarClass);
exports.MainBar = MainBar;
