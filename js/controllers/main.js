'use strict';
const React = require('react');
const injectTapEventPlugin = require('react-tap-event-plugin');
injectTapEventPlugin();
require('isomorphic-fetch');
const actions_1 = require('../actions/actions');
const configurestore_1 = require('../common/configurestore');
const root_1 = require('../common/root');
const store = configurestore_1.default();
let state = store.getState();
let auth = state.auth;
var token;
if (!auth.isAuthenticated) {
    token = localStorage.getItem('jsonwebtoken');
    if (token) {
        let callback = result => {
        };
        store.dispatch(actions_1.autoLoginUser(token, callback));
    }
}
const Main = ({ globalmessage, version }) => (React.createElement(root_1.default, {store: store, globalmessage: globalmessage}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Main;
