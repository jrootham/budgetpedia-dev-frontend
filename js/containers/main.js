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
var react_router_1 = require('react-router');
var react_router_redux_1 = require('react-router-redux');
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');
var about_1 = require('../features/containers/about');
var timeline_1 = require('../features/containers/timeline');
var deputations_1 = require('../features/containers/deputations');
var resources_1 = require('../features/containers/resources');
var socialresources_1 = require('../features/containers/socialresources');
var nomatch_1 = require('../features/containers/nomatch');
const reduxRouterMiddleware = react_router_redux_1.syncHistory(react_router_1.browserHistory);
const createStoreWithMiddleware = redux_1.applyMiddleware(thunk, reduxRouterMiddleware)(redux_1.createStore);
const store = createStoreWithMiddleware(reducers_1.mainReducer);
class App extends Component {
    render() {
        return (React.createElement("div", null, React.createElement(ReactCSSTransitionGroup, {"component": "div", "transitionName": "mainpage", "transitionEnterTimeout": 300, "transitionLeave": false}, React.cloneElement(this.props.children, {
            key: this.props.location.pathname
        }))));
    }
}
class Main extends Component {
    render() {
        return (React.createElement(react_redux_1.Provider, {"store": store}, React.createElement("div", null, React.createElement(mainbar_1.MainBar, null), React.createElement("div", {"style": { height: "64px" }}, " "), React.createElement(ReactCSSTransitionGroup, {"transitionName": "mainpage", "transitionEnterTimeout": 500, "transitionLeaveTimeout": 300}, React.createElement(react_router_1.Router, {"history": react_router_1.browserHistory}, React.createElement(react_router_1.Route, {"path": "/", "component": App}, React.createElement(react_router_1.IndexRoute, {"component": maintiles_1.MainTiles}), React.createElement(react_router_1.Route, {"path": "about", "component": about_1.About}), React.createElement(react_router_1.Route, {"path": "timeline", "component": timeline_1.Timeline}), React.createElement(react_router_1.Route, {"path": "deputations", "component": deputations_1.Deputations}), React.createElement(react_router_1.Route, {"path": "resources", "component": resources_1.Resources}), React.createElement(react_router_1.Route, {"path": "socialresources", "component": socialresources_1.SocialResources}), React.createElement(react_router_1.Route, {"path": "*", "component": nomatch_1.NoMatch})))), React.createElement("div", {"style": { height: "64px" }}, " "), React.createElement(maintoolbar_1.MainToolbar, null))));
    }
}
exports.Main = Main;
