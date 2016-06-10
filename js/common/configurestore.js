"use strict";
const redux_1 = require('redux');
const react_router_1 = require('react-router');
const react_router_redux_1 = require('react-router-redux');
const redux_thunk_1 = require('redux-thunk');
const reducers_1 = require("../reducers/reducers");
const reduxRouterMiddleware = react_router_redux_1.routerMiddleware(react_router_1.browserHistory);
const store = redux_1.createStore(reducers_1.mainReducer, redux_1.applyMiddleware(reduxRouterMiddleware, redux_thunk_1.default));
const configureStore = () => {
    return store;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = configureStore;
