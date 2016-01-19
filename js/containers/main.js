'use strict';
var React = require('react');
var { Component } = React;
var injectTapEventPlugin = require('react-tap-event-plugin');
injectTapEventPlugin();
var redux_1 = require('redux');
var react_redux_1 = require('react-redux');
var mainbar_1 = require('./mainbar');
var maintiles_1 = require('./maintiles');
var reducers_1 = require("../reducers/reducers");
class Main extends Component {
    render() {
        return (React.createElement(react_redux_1.Provider, {"store": redux_1.createStore(reducers_1.mainReducer)}, React.createElement("div", null, React.createElement("div", {"style": { height: "64px" }}, " ", React.createElement(mainbar_1.MainBar, null)), React.createElement("div", {"id": "contentarea"}, React.createElement(maintiles_1.MainTiles, null)))));
    }
}
exports.Main = Main;
