'use strict';
const React = require('react');
var { Component } = React;
const injectTapEventPlugin = require('react-tap-event-plugin');
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
        return (React.createElement(react_redux_1.Provider, {store: store}, React.createElement("div", null, React.createElement(mainbar_1.MainBar, null), React.createElement("div", {style: { height: "64px" }}, " "), React.createElement("div", null, "THIS IS THE DEVELOPER'S VERSION OF THIS SITE (FOR PROTOTYPING)," + ' ' + "AND MAY CHANGE OR BREAK AT ANY TIME. ALSO, IT LIKELY USES FAKE DATA."), routes_1.routes)));
    }
}
exports.Main = Main;
