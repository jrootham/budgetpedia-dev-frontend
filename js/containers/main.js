'use strict';
var React = require('react');
var { Component } = React;
var injectTapEventPlugin = require('react-tap-event-plugin');
injectTapEventPlugin();
var redux_1 = require('redux');
var thunk = require('redux-thunk');
var react_redux_1 = require('react-redux');
var mainbar_1 = require('./mainbar');
var maintoolbar_1 = require('./maintoolbar');
var reducers_1 = require("../reducers/reducers");
var react_router_1 = require('react-router');
var react_router_redux_1 = require('react-router-redux');
var routes_1 = require('../features/routes');
const reduxRouterMiddleware = react_router_redux_1.syncHistory(react_router_1.browserHistory);
const createStoreWithMiddleware = redux_1.applyMiddleware(thunk, reduxRouterMiddleware)(redux_1.createStore);
const store = createStoreWithMiddleware(reducers_1.mainReducer);
console.log('state = ', store.getState());
class Main extends Component {
    render() {
        return (React.createElement(react_redux_1.Provider, {"store": store}, React.createElement("div", null, React.createElement(mainbar_1.MainBar, null), React.createElement("div", {"style": { height: "64px" }}, " "), routes_1.routes, React.createElement("div", {"style": { height: "64px" }}, " "), React.createElement(maintoolbar_1.MainToolbar, null))));
    }
}
exports.Main = Main;
