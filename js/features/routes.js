'use strict';
const React = require('react');
var { Component } = React;
const ReactCSSTransitionGroup = require('react-addons-css-transition-group');
const react_router_1 = require('react-router');
const maintiles_1 = require('../controllers/maintiles');
const nomatch_1 = require('../controllers/nomatch');
const resetpassword_1 = require('../controllers/resetpassword');
const register_1 = require('../controllers/register');
const about_1 = require('./controllers/about');
const timeline_1 = require('./controllers/timeline');
const deputations_1 = require('./controllers/deputations');
const resources_1 = require('./controllers/resources');
const socialmedia_1 = require('./controllers/socialmedia');
const newsletter_1 = require('./controllers/newsletter');
const joinus_1 = require('./controllers/joinus');
const stories_1 = require('./controllers/stories');
const explorer_1 = require('./controllers/explorer');
class App extends Component {
    render() {
        return (React.createElement("div", null, React.createElement(ReactCSSTransitionGroup, {component: "div", transitionName: "mainpage", transitionEnterTimeout: 300, transitionLeave: false}, React.cloneElement(this.props.children, {
            key: this.props.location.pathname
        }))));
    }
}
exports.routes = React.createElement(react_router_1.Router, {history: react_router_1.browserHistory}, React.createElement(react_router_1.Route, {path: "/", component: App}, React.createElement(react_router_1.IndexRoute, {component: maintiles_1.MainTiles}), React.createElement(react_router_1.Route, {path: "about", component: about_1.About}), React.createElement(react_router_1.Route, {path: "timeline", component: timeline_1.Timeline}), React.createElement(react_router_1.Route, {path: "deputations", component: deputations_1.Deputations}), React.createElement(react_router_1.Route, {path: "explorer", component: explorer_1.Explorer}), React.createElement(react_router_1.Route, {path: "resources", component: resources_1.Resources}), React.createElement(react_router_1.Route, {path: "socialmedia", component: socialmedia_1.SocialMedia}), React.createElement(react_router_1.Route, {path: "joinus", component: joinus_1.JoinUs}), React.createElement(react_router_1.Route, {path: "stories", component: stories_1.Stories}), React.createElement(react_router_1.Route, {path: "resetpassword", component: resetpassword_1.ResetPassword}), React.createElement(react_router_1.Route, {path: "register", component: register_1.Register}), React.createElement(react_router_1.Route, {path: "newsletter", component: newsletter_1.Newsletter}), React.createElement(react_router_1.Route, {path: "*", component: nomatch_1.NoMatch})));
