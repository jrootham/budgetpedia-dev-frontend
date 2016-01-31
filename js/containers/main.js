'use strict';
var React = require('react');
var { Component } = React;
var injectTapEventPlugin = require('react-tap-event-plugin');
injectTapEventPlugin();
var redux_1 = require('redux');
var thunk = require('redux-thunk');
var react_redux_1 = require('react-redux');
var mainbar_1 = require('./mainbar');
var maintiles_1 = require('./maintiles');
var maintoolbar_1 = require('./maintoolbar');
var reducers_1 = require("../reducers/reducers");
const createStoreWithMiddleware = redux_1.applyMiddleware(thunk)(redux_1.createStore);
class Main extends Component {
    render() {
        return (React.createElement(react_redux_1.Provider, {"store": createStoreWithMiddleware(reducers_1.mainReducer)}, React.createElement("div", null, React.createElement(mainbar_1.MainBar, null), React.createElement("div", {"style": { height: "64px" }}, " "), React.createElement("div", {"id": "contentarea"}, React.createElement(maintiles_1.MainTiles, null)), React.createElement("div", {"style": { height: "64px" }}, " "), React.createElement(maintoolbar_1.MainToolbar, null))));
    }
}
exports.Main = Main;
