'use strict';
const React = require('react');
var { Component } = React;
const injectTapEventPlugin = require('react-tap-event-plugin');
const MuiThemeProvider_1 = require('material-ui/styles/MuiThemeProvider');
const getMuiTheme_1 = require('material-ui/styles/getMuiTheme');
injectTapEventPlugin();
const redux_1 = require('redux');
const react_redux_1 = require('react-redux');
const react_router_1 = require('react-router');
const react_router_redux_1 = require('react-router-redux');
const redux_thunk_1 = require('redux-thunk');
const reducers_1 = require("../reducers/reducers");
const mainbar_1 = require('./mainbar');
const routes_1 = require('../apps/routes');
const Actions = require('../actions/actions');
const reduxRouterMiddleware = react_router_redux_1.routerMiddleware(react_router_1.browserHistory);
const store = redux_1.createStore(reducers_1.mainReducer, redux_1.applyMiddleware(reduxRouterMiddleware, redux_thunk_1.default));
let state = store.getState();
let auth = state.auth;
var token;
if (!auth.isAuthenticated) {
    token = localStorage.getItem('jsonwebtoken');
    if (token) {
        let callback = result => {
        };
        store.dispatch(Actions.autoLoginUser(token, callback));
    }
}
class Main extends Component {
    render() {
        return (React.createElement(MuiThemeProvider_1.default, {muiTheme: getMuiTheme_1.default()}, React.createElement(react_redux_1.Provider, {store: store}, React.createElement("div", null, React.createElement(mainbar_1.MainBar, null), React.createElement("div", {style: { height: "64px" }}, " "), React.createElement("div", null, "FOR TESTING, YOU'RE IN THE WRONG SPOT! GO TO ", React.createElement("a", {href: "http://staging.budgetpedia.ca"}, "staging.budgetpedia.ca"), " INSTEAD. THIS IS THE DEVELOPER'S VERSION OF THIS SITE (FOR PROTOTYPING)," + ' ' + "AND MAY CHANGE OR BREAK AT ANY TIME. ALSO, THE DATA MAY BE FAKE."), routes_1.routes))));
    }
}
exports.Main = Main;
