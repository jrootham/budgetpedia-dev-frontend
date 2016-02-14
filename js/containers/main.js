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
var socialmedia_1 = require('../features/containers/socialmedia');
var nomatch_1 = require('../features/containers/nomatch');
var resetpassword_1 = require('../features/containers/resetpassword');
var register_1 = require('../features/containers/register');
var newsletter_1 = require('../features/containers/newsletter');
var joinus_1 = require('../features/containers/joinus');
var stories_1 = require('../features/containers/stories');
var explorer_1 = require('../features/containers/explorer');
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
        return (React.createElement(react_redux_1.Provider, {"store": store}, React.createElement("div", null, React.createElement(mainbar_1.MainBar, null), React.createElement("div", {"style": { height: "64px" }}, " "), React.createElement(ReactCSSTransitionGroup, {"transitionName": "mainpage", "transitionEnterTimeout": 500, "transitionLeaveTimeout": 300}, React.createElement(react_router_1.Router, {"history": react_router_1.browserHistory}, React.createElement(react_router_1.Route, {"path": "/", "component": App}, React.createElement(react_router_1.IndexRoute, {"component": maintiles_1.MainTiles}), React.createElement(react_router_1.Route, {"path": "about", "component": about_1.About}), React.createElement(react_router_1.Route, {"path": "timeline", "component": timeline_1.Timeline}), React.createElement(react_router_1.Route, {"path": "deputations", "component": deputations_1.Deputations}), React.createElement(react_router_1.Route, {"path": "explorer", "component": explorer_1.Explorer}), React.createElement(react_router_1.Route, {"path": "resources", "component": resources_1.Resources}), React.createElement(react_router_1.Route, {"path": "socialmedia", "component": socialmedia_1.SocialMedia}), React.createElement(react_router_1.Route, {"path": "joinus", "component": joinus_1.JoinUs}), React.createElement(react_router_1.Route, {"path": "stories", "component": stories_1.Stories}), React.createElement(react_router_1.Route, {"path": "resetpassword", "component": resetpassword_1.ResetPassword}), React.createElement(react_router_1.Route, {"path": "register", "component": register_1.Register}), React.createElement(react_router_1.Route, {"path": "newsletter", "component": newsletter_1.Newsletter}), React.createElement(react_router_1.Route, {"path": "*", "component": nomatch_1.NoMatch})))), React.createElement("div", {"style": { height: "64px" }}, " "), React.createElement(maintoolbar_1.MainToolbar, null))));
    }
}
exports.Main = Main;
