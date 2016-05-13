'use strict';
const React = require('react');
var { Component, PropTypes } = React;
const react_redux_1 = require('react-redux');
const Actions = require('../actions/actions');
const redux_1 = require('redux');
const AppBar = require('material-ui/lib/app-bar');
const LeftNav = require('material-ui/lib/left-nav');
const basicform_1 = require('../components/basicform');
const Card = require('material-ui/lib/card/card');
const CardTitle = require('material-ui/lib/card/card-title');
const CardText = require('material-ui/lib/card/card-text');
const CardActions = require('material-ui/lib/card/card-actions');
const MenuItem = require('material-ui/lib/menus/menu-item');
const menutile_1 = require('../components/menutile');
const IconButton = require('material-ui/lib/icon-button');
const RaisedButton = require('material-ui/lib/raised-button');
const FontIcon = require('material-ui/lib/font-icon');
const Divider = require('material-ui/lib/divider');
const IconMenu = require('material-ui/lib/menus/icon-menu');
class MainBarClass extends React.Component {
    constructor(props) {
        super(props);
        this.handleAccountSidebarToggle = () => this.setState({ accountsidebaropen: !this.state.accountsidebaropen });
        this.handleMenuSidebarToggle = () => this.setState({ menusidebaropen: !this.state.menusidebaropen });
        this.close = () => {
            this.setState({ accountsidebaropen: false });
        };
        this.transitionToHome = () => {
            this.setState({ accountsidebaropen: false });
            this.props.dispatch(Actions.transitionTo('/'));
        };
        this.transitionToRegister = (e) => {
            this.setState({ accountsidebaropen: false });
            this.props.dispatch(Actions.transitionTo('/register'));
        };
        this.transitionToResetPassword = (e) => {
            this.setState({ accountsidebaropen: false });
            this.props.dispatch(Actions.transitionTo('/resetpassword'));
        };
        this.transitionToProfile = (e) => {
            this.props.dispatch(Actions.transitionTo('/userprofile'));
        };
        this.submitLogin = (elements) => {
            let creds = {};
            for (var index in elements) {
                creds[index] = elements[index].getValue();
            }
            let appbar = this;
            let callback = (result) => {
                if (result) {
                    appbar.setState({
                        accountsidebaropen: false
                    });
                }
            };
            this.props.dispatch(Actions.loginUser(creds, callback));
        };
        this.logout = () => {
            this.props.dispatch(Actions.logoutUser());
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
            errors: { password: false, email: false },
        };
    }
    render() {
        let appbar = this;
        let { appnavbar, theme, auth } = appbar.props;
        let fieldMessages = appbar.props.auth.fieldMessages || {};
        let hometiles = this.props.hometiles;
        let menutransition = (func) => {
            this.setState({
                menusidebaropen: false,
            });
            return func;
        };
        let closeicon = React.createElement(IconButton, {style: {
            top: 0,
            right: 0,
            padding: 0,
            height: "36px",
            width: "36px",
            position: "absolute",
            zIndex: 2,
        }, onTouchTap: appbar.close}, React.createElement(FontIcon, {className: "material-icons", color: theme.palette.primary3Color, style: { cursor: "pointer" }}, "close"));
        let elements = [
            {
                index: 'email',
                floatingLabelText: 'Email Address',
                hintText: "enter unique email (required)",
                type: 'email',
                required: true,
                errorText: fieldMessages['email'],
            },
            {
                index: 'password',
                floatingLabelText: 'Password',
                hintText: "enter password (required)",
                type: 'password',
                maxLength: 16,
                minLength: 6,
                required: true,
                errorText: fieldMessages['password'],
            },
        ];
        let loginform = React.createElement(basicform_1.BasicForm, {submit: appbar.submitLogin, elements: elements, submitButtonLabel: 'Sign in', errorMessage: appbar.props.auth.errorMessage});
        let registerprompt = React.createElement("div", null, React.createElement(CardText, null, React.createElement("a", {href: "javascript:void(0);", onTouchTap: appbar.transitionToResetPassword}, "Forgot your password?")), React.createElement(Divider, null), React.createElement(CardText, null, "Not a member? Register:"), React.createElement(CardActions, null, React.createElement(RaisedButton, {type: "button", label: "Register", onTouchTap: appbar.transitionToRegister})));
        let loginsidebar = React.createElement(LeftNav, {width: 300, disableSwipeToOpen: true, docked: false, openRight: true, onRequestChange: open => appbar.setState({ accountsidebaropen: open, }), open: appbar.state.accountsidebaropen}, React.createElement(Card, {style: { margin: "5px" }}, closeicon, React.createElement(CardTitle, {title: "Member Sign In", style: { paddingBottom: 0 }}), loginform, registerprompt));
        let transitionToFunc = redux_1.compose(menutransition, this.props.dispatch, Actions.transitionTo);
        let menuitems = hometiles.map(menutile => {
            return React.createElement(menutile_1.MenuTile, {transitionTo: transitionToFunc, key: menutile.id, primaryText: menutile.content.title, image: menutile.content.image, route: menutile.route});
        });
        let menusidebar = React.createElement(LeftNav, {width: 300, docked: false, openRight: false, disableSwipeToOpen: true, onRequestChange: open => appbar.setState({ menusidebaropen: open, }), open: this.state.menusidebaropen}, React.createElement(menutile_1.MenuTile, {transitionTo: transitionToFunc, key: 'home', primaryText: "Budget Commons", image: '../../public/icons/ic_home_24px.svg', route: '/'}), React.createElement(Divider, null), menuitems);
        let menuicon = React.createElement(IconButton, {onTouchTap: () => { appbar.handleMenuSidebarToggle(); }}, React.createElement(FontIcon, {className: "material-icons", color: theme.palette.alternateTextColor, style: { cursor: "pointer" }}, "menu"));
        let accountmenu = React.createElement(IconMenu, {iconButtonElement: React.createElement(IconButton, null, React.createElement(FontIcon, {className: "material-icons", color: theme.palette.alternateTextColor, style: { cursor: "pointer" }}, "account_circle")), targetOrigin: { horizontal: 'right', vertical: 'top' }, anchorOrigin: { horizontal: 'right', vertical: 'top' }}, React.createElement(MenuItem, {onTouchTap: appbar.transitionToProfile, primaryText: "Profile"}), React.createElement(MenuItem, {onTouchTap: appbar.logout, primaryText: "Sign out"}));
        let accounticon = React.createElement(IconButton, {onTouchTap: () => { appbar.handleAccountSidebarToggle(); }}, React.createElement(FontIcon, {className: "material-icons", color: theme.palette.alternateTextColor, style: { cursor: "pointer" }}, "account_circle"));
        let username = React.createElement("div", {style: {
            position: "absolute",
            bottom: 0,
            right: 0,
            fontSize: "small",
            padding: "3px",
            color: theme.palette.alternateTextColor,
        }}, auth.isAuthenticated ? auth.profile.userhandle : appnavbar.username);
        let workingmessagestate = this.props.workingmessagestate;
        return (React.createElement(AppBar, {onTitleTouchTap: appbar.transitionToHome, titleStyle: { cursor: 'pointer' }, style: { position: "fixed" }, title: React.createElement("span", null, appnavbar.title), iconElementLeft: menuicon, iconElementRight: appbar.props.auth.isAuthenticated
            ? accountmenu
            : accounticon}, username, loginsidebar, menusidebar, workingmessagestate
            ? React.createElement("div", {style: {
                position: "absolute",
                top: "54px",
                left: 0,
                textAlign: "center",
                width: "100%",
            }}, React.createElement("div", {style: {
                display: "inline-block", color: "green",
                backgroundColor: "beige",
                fontSize: "12px",
                padding: "3px",
                border: "1px solid silver",
                borderRadius: "10%"
            }}, "Working..."))
            : null));
    }
}
function mapStateToProps(state) {
    let { appnavbar, theme, auth, hometiles, workingmessagestate } = state;
    return {
        state: state,
        auth: auth,
        appnavbar: appnavbar,
        theme: theme,
        hometiles: hometiles,
        workingmessagestate: workingmessagestate,
    };
}
var MainBar = react_redux_1.connect(mapStateToProps)(MainBarClass);
exports.MainBar = MainBar;
