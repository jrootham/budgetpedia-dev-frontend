'use strict';
const React = require('react');
var { Component } = React;
const react_router_1 = require('react-router');
const app_1 = require('./app');
const hometiles_1 = require('../controllers/hometiles');
const about_1 = require('../apps/controllers/about');
const timeline_1 = require('../apps/controllers/timeline');
const deputations_1 = require('../apps/controllers/deputations');
const explorer_1 = require('../apps/controllers/explorer');
const communities_1 = require('../apps/controllers/communities');
const socialmedia_1 = require('../apps/controllers/socialmedia');
const newsletter_1 = require('../apps/controllers/newsletter');
const resources_1 = require('../apps/controllers/resources');
const joinus_1 = require('../apps/controllers/joinus');
const stories_1 = require('../apps/controllers/stories');
const demos_1 = require('../apps/controllers/demos');
const pathways_1 = require('../apps/controllers/pathways');
const resetpassword_1 = require('../controllers/resetpassword');
const register_1 = require('../controllers/register');
const registerpending_1 = require('../controllers/registerpending');
const registerconfirm_1 = require('../controllers/registerconfirm');
const userprofile_1 = require('../controllers/userprofile');
const nomatch_1 = require('../controllers/nomatch');
let routedata = [
    { path: "about", component: about_1.default },
    { path: "timeline", component: timeline_1.default },
    { path: "deputations", component: deputations_1.default },
    { path: "explorer", component: explorer_1.default },
    { path: "communities", component: communities_1.default },
    { path: "socialmedia", component: socialmedia_1.default },
    { path: "newsletter", component: newsletter_1.default },
    { path: "resources", component: resources_1.default },
    { path: "joinus", component: joinus_1.default },
    { path: "stories", component: stories_1.default },
    { path: "demos", component: demos_1.default },
    { path: "pathways", component: pathways_1.default },
    { path: "resetpassword", component: resetpassword_1.default },
    { path: "register", component: register_1.default },
    { path: "register/pending", component: registerpending_1.default },
    { path: "register/confirm", component: registerconfirm_1.default },
    { path: "userprofile", component: userprofile_1.default },
    { path: "*", component: nomatch_1.default },
];
const routelist = routedata.map((item, index) => {
    return React.createElement(react_router_1.Route, {key: index, path: item.path, component: item.component});
});
var routes = React.createElement(react_router_1.Router, {history: react_router_1.browserHistory}, React.createElement(react_router_1.Route, {path: "/", component: app_1.default}, React.createElement(react_router_1.IndexRoute, {component: hometiles_1.default}), routelist));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = routes;
