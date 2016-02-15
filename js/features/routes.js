'use strict';
var React = require('react');
var { Component } = React;
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');
var react_router_1 = require('react-router');
var maintiles_1 = require('../containers/maintiles');
var about_1 = require('./containers/about');
var nomatch_1 = require('./containers/nomatch');
var resetpassword_1 = require('./containers/resetpassword');
var register_1 = require('./containers/register');
var timeline_1 = require('./containers/timeline');
var deputations_1 = require('./containers/deputations');
var resources_1 = require('./containers/resources');
var socialmedia_1 = require('./containers/socialmedia');
var newsletter_1 = require('./containers/newsletter');
var joinus_1 = require('./containers/joinus');
var stories_1 = require('./containers/stories');
var explorer_1 = require('./containers/explorer');
class App extends Component {
    render() {
        return (React.createElement("div", null, React.createElement(ReactCSSTransitionGroup, {"component": "div", "transitionName": "mainpage", "transitionEnterTimeout": 300, "transitionLeave": false}, React.cloneElement(this.props.children, {
            key: this.props.location.pathname
        }))));
    }
}
exports.routes = React.createElement(react_router_1.Router, {"history": react_router_1.browserHistory}, React.createElement(react_router_1.Route, {"path": "/", "component": App}, React.createElement(react_router_1.IndexRoute, {"component": maintiles_1.MainTiles}), React.createElement(react_router_1.Route, {"path": "about", "component": about_1.About}), React.createElement(react_router_1.Route, {"path": "timeline", "component": timeline_1.Timeline}), React.createElement(react_router_1.Route, {"path": "deputations", "component": deputations_1.Deputations}), React.createElement(react_router_1.Route, {"path": "explorer", "component": explorer_1.Explorer}), React.createElement(react_router_1.Route, {"path": "resources", "component": resources_1.Resources}), React.createElement(react_router_1.Route, {"path": "socialmedia", "component": socialmedia_1.SocialMedia}), React.createElement(react_router_1.Route, {"path": "joinus", "component": joinus_1.JoinUs}), React.createElement(react_router_1.Route, {"path": "stories", "component": stories_1.Stories}), React.createElement(react_router_1.Route, {"path": "resetpassword", "component": resetpassword_1.ResetPassword}), React.createElement(react_router_1.Route, {"path": "register", "component": register_1.Register}), React.createElement(react_router_1.Route, {"path": "newsletter", "component": newsletter_1.Newsletter}), React.createElement(react_router_1.Route, {"path": "*", "component": nomatch_1.NoMatch})));
