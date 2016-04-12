'use strict';
const React = require('react');
var { Component } = React;
const ReactCSSTransitionGroup = require('react-addons-css-transition-group');
const react_router_1 = require('react-router');
const hometiles_1 = require('../controllers/hometiles');
const nomatch_1 = require('../controllers/nomatch');
const resetpassword_1 = require('../controllers/resetpassword');
const register_1 = require('../controllers/register');
const registerpending_1 = require('../controllers/registerpending');
const registerconfirm_1 = require('../controllers/registerconfirm');
const about_1 = require('./controllers/about');
const timeline_1 = require('./controllers/timeline');
const deputations_1 = require('./controllers/deputations');
const resources_1 = require('./controllers/resources');
const socialmedia_1 = require('./controllers/socialmedia');
const newsletter_1 = require('./controllers/newsletter');
const joinus_1 = require('./controllers/joinus');
const stories_1 = require('./controllers/stories');
const explorer_1 = require('./controllers/explorer');
const demos_1 = require('./controllers/demos');
const pathways_1 = require('./controllers/pathways');
const communities_1 = require('./controllers/communities');
class App extends Component {
    render() {
        return (React.createElement("div", null, React.createElement(ReactCSSTransitionGroup, {component: "div", transitionName: "mainpage", transitionEnterTimeout: 300, transitionLeave: false}, React.cloneElement(this.props.children, {
            key: this.props.location.pathname
        }))));
    }
}
exports.routes = React.createElement(react_router_1.Router, {history: react_router_1.browserHistory}, React.createElement(react_router_1.Route, {path: "/", component: App}, React.createElement(react_router_1.IndexRoute, {component: hometiles_1.HomeTiles}), React.createElement(react_router_1.Route, {path: "about", component: about_1.About}), React.createElement(react_router_1.Route, {path: "timeline", component: timeline_1.Timeline}), React.createElement(react_router_1.Route, {path: "deputations", component: deputations_1.Deputations}), React.createElement(react_router_1.Route, {path: "explorer", component: explorer_1.Explorer}), React.createElement(react_router_1.Route, {path: "communities", component: communities_1.Communities}), React.createElement(react_router_1.Route, {path: "socialmedia", component: socialmedia_1.SocialMedia}), React.createElement(react_router_1.Route, {path: "newsletter", component: newsletter_1.Newsletter}), React.createElement(react_router_1.Route, {path: "resources", component: resources_1.Resources}), React.createElement(react_router_1.Route, {path: "joinus", component: joinus_1.JoinUs}), React.createElement(react_router_1.Route, {path: "stories", component: stories_1.Stories}), React.createElement(react_router_1.Route, {path: "demos", component: demos_1.Demos}), React.createElement(react_router_1.Route, {path: "pathways", component: pathways_1.Pathways}), React.createElement(react_router_1.Route, {path: "resetpassword", component: resetpassword_1.ResetPassword}), React.createElement(react_router_1.Route, {path: "register", component: register_1.Register}), React.createElement(react_router_1.Route, {path: "register/pending", component: registerpending_1.RegisterPending}), React.createElement(react_router_1.Route, {path: "register/confirm", component: registerconfirm_1.RegisterConfirm}), React.createElement(react_router_1.Route, {path: "*", component: nomatch_1.NoMatch})));
