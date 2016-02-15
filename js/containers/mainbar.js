'use strict';
var React = require('react');
var react_redux_1 = require('react-redux');
var Actions = require('../actions/actions');
var AppBar = require('material-ui/lib/app-bar');
var LeftNav = require('material-ui/lib/left-nav');
var Card = require('material-ui/lib/card/card');
var CardTitle = require('material-ui/lib/card/card-title');
var CardText = require('material-ui/lib/card/card-text');
var CardActions = require('material-ui/lib/card/card-actions');
var IconButton = require('material-ui/lib/icon-button');
var RaisedButton = require('material-ui/lib/raised-button');
var FontIcon = require('material-ui/lib/font-icon');
var TextField = require('material-ui/lib/text-field');
var Divider = require('material-ui/lib/divider');
class MainBarClass extends React.Component {
    constructor(props) {
        super(props);
        this.handleAccountSidebarToggle = () => this.setState({ accountsidebaropen: !this.state.accountsidebaropen });
        this.handleMenuSidebarToggle = () => this.setState({ menusidebaropen: !this.state.menusidebaropen });
        this.transitionToHome = () => {
            this.setState({ accountsidebaropen: false });
            this.props.dispatch(Actions.transitionTo('/'));
        };
        this.close = () => {
            this.setState({ accountsidebaropen: false });
        };
        this.transitionToRegister = () => {
            this.setState({ accountsidebaropen: false });
            this.props.dispatch(Actions.transitionTo('/register'));
        };
        this.transitionToResetPassword = () => {
            this.setState({ accountsidebaropen: false });
            this.props.dispatch(Actions.transitionTo('/resetpassword'));
        };
        this.submitLogin = (e) => {
            e.stopPropagation();
            e.preventDefault();
            let password = this.state.elements.password.getValue();
            let userid = this.state.elements.userid.getValue();
            let passworderror = !password;
            if (!passworderror)
                passworderror = (password.length < 6 || password.length > 12);
            let useriderror = !userid;
            if (!useriderror)
                useriderror = !this.validateEmail(userid);
            let dologin = !(useriderror || passworderror);
            this.setState({ errors: { password: passworderror, userid: useriderror } });
            if (dologin) {
                let creds = {
                    password,
                    userid,
                };
                this.props.dispatch(Actions.loginUser(creds));
            }
        };
        this.validateEmail = email => {
            let pattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
            let result = pattern.test(email);
            return result;
        };
        this.state = {
            accountsidebaropen: false,
            menusidebaropen: false,
            elements: {},
            errors: { password: false, userid: false },
        };
    }
    render() {
        let { appnavbar, theme } = this.props;
        let closeicon = React.createElement(IconButton, {"style": {
            top: 0,
            right: 0,
            padding: 0,
            height: "36px",
            width: "36px",
            position: "absolute",
            zIndex: 2,
        }, "onTouchTap": this.close}, React.createElement(FontIcon, {"className": "material-icons", "color": theme.palette.primary3Color, "style": { cursor: "pointer" }}, "close"));
        let loginform = React.createElement("form", {"onSubmit": this.submitLogin}, this.props.auth.isFetching
            ? React.createElement("p", {"style": { color: "green" }}, "Checking credentials")
            : null, this.props.auth.errorMessage
            ? React.createElement("p", {"style": { color: "red" }}, this.props.auth.errorMessage)
            : null, React.createElement(CardText, null, React.createElement(TextField, {"hintText": "enter unique email (required)", "floatingLabelText": "Email Address", "ref": node => { this.state.elements.userid = node; }, "errorText": this.state.errors.userid
            ? 'this field is required, and must be in valid email format'
            : ''}), React.createElement("br", null), React.createElement(TextField, {"hintText": "enter password (required)", "floatingLabelText": "Password", "type": "password", "errorText": this.state.errors.password
            ? 'this field is required, and must be between 6 and 12 characters long'
            : '', "ref": node => { this.state.elements.password = node; }}), React.createElement("br", null)), React.createElement(CardActions, {"style": { textAlign: "center" }}, React.createElement(RaisedButton, {"type": "submit", "label": "Sign in", "className": "button-submit", "primary": true})));
        let registerprompt = React.createElement("div", null, React.createElement(CardText, null, React.createElement("a", {"href": "javascript:void(0);", "onTouchTap": this.transitionToResetPassword}, "Forgot your password?")), React.createElement(Divider, null), React.createElement(CardText, null, "Not a member?Register:"), React.createElement(CardActions, {"style": { textAlign: "center" }}, React.createElement(RaisedButton, {"type": "button", "label": "Register", "onTouchTap": this.transitionToRegister})));
        let loginsidebar = React.createElement(LeftNav, {"width": 300, "docked": false, "openRight": true, "onRequestChange": open => this.setState({ accountsidebaropen: open, }), "open": this.state.accountsidebaropen}, React.createElement(Card, {"style": { margin: "5px" }}, closeicon, React.createElement(CardTitle, {"title": "Account Sign In", "style": { paddingBottom: 0 }}), loginform, registerprompt));
        let menusidebar = React.createElement(LeftNav, {"width": 300, "docked": false, "openRight": false, "onRequestChange": open => this.setState({ menusidebaropen: open, }), "open": this.state.menusidebaropen}, React.createElement("div", null, "Menu Sidebar"));
        let menuicon = React.createElement(IconButton, {"onTouchTap": () => { this.handleMenuSidebarToggle(); }}, React.createElement(FontIcon, {"className": "material-icons", "color": theme.palette.alternateTextColor, "style": { cursor: "pointer" }}, "menu"));
        let accounticon = React.createElement(IconButton, {"onTouchTap": () => { this.handleAccountSidebarToggle(); }}, React.createElement(FontIcon, {"className": "material-icons", "color": theme.palette.alternateTextColor, "style": { cursor: "pointer" }}, "account_circle"));
        let username = React.createElement("div", {"style": {
            position: "absolute",
            bottom: 0,
            right: 0,
            fontSize: "small",
            padding: "3px",
            color: theme.palette.alternateTextColor,
        }}, appnavbar.username);
        return (React.createElement(AppBar, {"onTitleTouchTap": this.transitionToHome, "titleStyle": { cursor: 'pointer' }, "style": { position: "fixed" }, "title": React.createElement("span", null, appnavbar.title), "iconElementLeft": menuicon, "iconElementRight": accounticon}, username, loginsidebar, menusidebar));
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
