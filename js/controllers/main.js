'use strict';
const React = require('react');
var { Component } = React;
const injectTapEventPlugin = require('react-tap-event-plugin');
const MuiThemeProvider_1 = require('material-ui/styles/MuiThemeProvider');
const getMuiTheme_1 = require('material-ui/styles/getMuiTheme');
injectTapEventPlugin();
const react_redux_1 = require('react-redux');
const mainbar_1 = require('./mainbar');
const routes_1 = require('../common/routes');
const actions_1 = require('../actions/actions');
const configurestore_1 = require('../common/configurestore');
const store = configurestore_1.default();
let state = store.getState();
let auth = state.auth;
var token;
if (!auth.isAuthenticated) {
    token = localStorage.getItem('jsonwebtoken');
    if (token) {
        let callback = result => {
        };
        store.dispatch(actions_1.autoLoginUser(token, callback));
    }
}
class Main extends Component {
    render() {
        let globalmessage = this.props.globalmessage;
        return (React.createElement(MuiThemeProvider_1.default, {muiTheme: getMuiTheme_1.default()}, React.createElement(react_redux_1.Provider, {store: store}, React.createElement("div", null, React.createElement(mainbar_1.MainBar, null), React.createElement("div", {style: { height: "64px" }}, " "), globalmessage, routes_1.default))));
    }
}
exports.Main = Main;
