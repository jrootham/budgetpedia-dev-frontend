'use strict';
var React = require('react');
var react_redux_1 = require('react-redux');
var Actions = require('../actions/actions');
var AppBar = require('material-ui/lib/app-bar');
var IconButton = require('material-ui/lib/icon-button');
var FontIcon = require('material-ui/lib/font-icon');
var LeftNav = require('material-ui/lib/left-nav');
var TextField = require('material-ui/lib/text-field');
var RaisedButton = require('material-ui/lib/raised-button');
var CardTitle = require('material-ui/lib/card/card-title');
var Card = require('material-ui/lib/card/card');
var CardText = require('material-ui/lib/card/card-text');
var CardActions = require('material-ui/lib/card/card-actions');
var Divider = require('material-ui/lib/divider');
var NavigationMenu = require('material-ui/lib/svg-icons/navigation/menu');
function mapStateToProps(state) {
    let { appnavbar, theme } = state;
    return {
        appnavbar,
        theme,
    };
}
class MainBarClass extends React.Component {
    constructor(props) {
        super(props);
        this.handleAccountSidebarToggle = () => this.setState({ accountsidebaropen: !this.state.accountsidebaropen });
        this.handleMenuSidebarToggle = () => this.setState({ menusidebaropen: !this.state.menusidebaropen });
        this.transitionToHome = () => {
            this.props.dispatch(Actions.transitionTo('/'));
        };
        this.transitionToRegister = () => {
            this.setState({ accountsidebaropen: false });
            this.props.dispatch(Actions.transitionTo('/register'));
        };
        this.transitionToResetPassword = () => {
            this.setState({ accountsidebaropen: false });
            this.props.dispatch(Actions.transitionTo('/resetpassword'));
        };
        this.state = {
            accountsidebaropen: false,
            menusidebaropen: false,
        };
    }
    render() {
        let { appnavbar, theme } = this.props;
        return (React.createElement(AppBar, {"onTitleTouchTap": this.transitionToHome, "titleStyle": { cursor: 'pointer' }, "style": { position: "fixed" }, "title": React.createElement("span", null, appnavbar.title), "iconElementLeft": React.createElement(IconButton, {"onTouchTap": () => { this.handleMenuSidebarToggle(); }}, React.createElement(NavigationMenu, null)), "iconElementRight": React.createElement(IconButton, {"onTouchTap": () => { this.handleAccountSidebarToggle(); }}, React.createElement(FontIcon, {"className": "material-icons", "color": theme.palette.alternateTextColor, "style": { cursor: "pointer" }}, "account_circle"))}, React.createElement("div", {"style": {
            position: "absolute",
            bottom: 0,
            right: 0,
            fontSize: "small",
            padding: "3px",
            color: theme.palette.alternateTextColor,
        }}, appnavbar.username), React.createElement(LeftNav, {"width": 300, "docked": false, "openRight": true, "onRequestChange": open => this.setState({ accountsidebaropen: open, }), "open": this.state.accountsidebaropen}, React.createElement(Card, {"style": { margin: "5px" }}, React.createElement(CardTitle, {"title": "Account Sign In", "style": { paddingBottom: 0 }}), React.createElement(CardText, null, React.createElement(TextField, {"hintText": "enter unique email", "floatingLabelText": "Email Address"}), React.createElement("br", null), React.createElement(TextField, {"hintText": "enter password", "floatingLabelText": "Password", "type": "password"}), React.createElement("br", null)), React.createElement(CardActions, {"style": { textAlign: "center" }}, React.createElement(RaisedButton, {"type": "submit", "label": "Sign in", "className": "button-submit", "primary": true})), React.createElement(CardText, null, React.createElement("a", {"href": "javascript:void(0);", "onTouchTap": this.transitionToResetPassword}, "Forgot your password?")), React.createElement(Divider, null), React.createElement(CardText, null, "Not a member? Register:"), React.createElement(CardActions, {"style": { textAlign: "center" }}, React.createElement(RaisedButton, {"type": "button", "label": "Register", "onTouchTap": this.transitionToRegister})))), React.createElement(LeftNav, {"width": 300, "docked": false, "openRight": false, "onRequestChange": open => this.setState({ menusidebaropen: open, }), "open": this.state.menusidebaropen}, React.createElement("div", null, "Menu Sidebar"))));
    }
}
var MainBar = react_redux_1.connect(mapStateToProps)(MainBarClass);
exports.MainBar = MainBar;
