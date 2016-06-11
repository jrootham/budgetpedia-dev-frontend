'use strict';
const React = require('react');
const react_router_1 = require('react-router');
const app_1 = require('./app');
const hometiles_1 = require('../controllers/hometiles');
const resetpassword_1 = require('../controllers/resetpassword');
const register_1 = require('../controllers/register');
const registerpending_1 = require('../controllers/registerpending');
const registerconfirm_1 = require('../controllers/registerconfirm');
const userprofile_1 = require('../controllers/userprofile');
const nomatch_1 = require('../controllers/nomatch');
const approutes_1 = require('../apps/approutes');
let routedata = [
    { path: "resetpassword", component: resetpassword_1.default },
    { path: "register", component: register_1.default },
    { path: "register/pending", component: registerpending_1.default },
    { path: "register/confirm", component: registerconfirm_1.default },
    { path: "userprofile", component: userprofile_1.default },
    { path: "*", component: nomatch_1.default },
];
let routelist = routedata.map((item, index) => (React.createElement(react_router_1.Route, {key: 'route' + index, path: item.path, component: item.component})));
let routes = (React.createElement(react_router_1.Router, {history: react_router_1.browserHistory}, React.createElement(react_router_1.Route, {path: "/", component: app_1.default}, React.createElement(react_router_1.IndexRoute, {component: hometiles_1.default}), approutes_1.default, routelist)));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = routes;
