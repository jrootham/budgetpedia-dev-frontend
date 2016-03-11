'use strict';
const redux_1 = require('redux');
const flux_standard_action_1 = require('flux-standard-action');
const redux_actions_1 = require('redux-actions');
const react_router_redux_1 = require('react-router-redux');
const Actions = require('../actions/actions');
const initialstate_1 = require("../store/initialstate");
let appnavbar = (state = initialstate_1.initialstate.appnavbar, action) => {
    return state;
};
let toolsnavbar = (state = initialstate_1.initialstate.toolsnavbar, action) => {
    return state;
};
let theme = (state = initialstate_1.initialstate.theme) => {
    return state;
};
let system = (state = initialstate_1.initialstate.system) => {
    return state;
};
let colors = (state = initialstate_1.initialstate.colors) => {
    return state;
};
let mainpadding = (state = initialstate_1.initialstate.mainpadding, action) => {
    return state;
};
let maintiles = (state = initialstate_1.initialstate.maintiles, action) => {
    return state;
};
let maincolsreducer = (state = initialstate_1.initialstate.maincols, action) => {
    switch (action.type) {
        case Actions.SET_TILECOLS: {
            let mainElement = document.getElementById('main');
            let elementwidth = mainElement.getBoundingClientRect().width;
            let columns;
            if (elementwidth > 960) {
                columns = 4;
            }
            else if (elementwidth > 680) {
                columns = 3;
            }
            else if (elementwidth > 400) {
                columns = 2;
            }
            else {
                columns = 1;
            }
            return columns;
        }
        default:
            return state;
    }
};
let maincols = redux_actions_1.handleActions({
    [Actions.SET_TILECOLS]: maincolsreducer,
}, initialstate_1.initialstate.maincols);
let { LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT_SUCCESS } = Actions;
function auth(state = {
        isFetching: false,
        isAuthenticated: localStorage.getItem('id_token') ? true : false
    }, action) {
    switch (action.type) {
        case LOGIN_REQUEST:
            return Object.assign({}, state, {
                isFetching: true,
                isAuthenticated: false,
                user: action.payload.creds,
                errorMessage: '',
            });
        case LOGIN_SUCCESS:
            return Object.assign({}, state, {
                isFetching: false,
                isAuthenticated: true,
            });
        case LOGIN_FAILURE:
            console.log('login failure', action);
            return Object.assign({}, state, {
                isFetching: false,
                errorMessage: action.payload.message,
                user: null,
            });
        case LOGOUT_SUCCESS:
            return Object.assign({}, state, {
                isFetching: false,
                isAuthenticated: false,
                user: null,
            });
        default:
            return state;
    }
}
let { REGISTER_REQUEST, REGISTER_SUCCESS, REGISTER_FAILURE, } = Actions;
function register(state = {
        isFetching: false,
        isRegistered: false
    }, action) {
    switch (action.type) {
        case REGISTER_REQUEST:
            return Object.assign({}, state, {
                isFetching: true,
                isAuthenticated: false,
                user: action.payload.profile,
                errorMessage: '',
            });
        case REGISTER_SUCCESS:
            return Object.assign({}, state, {
                isFetching: false,
                isAuthenticated: true,
                user: null,
            });
        case REGISTER_FAILURE:
            return Object.assign({}, state, {
                isFetching: false,
                errorMessage: action.payload.message,
                user: null,
            });
        default:
            return state;
    }
}
let mainReducerCore = redux_1.combineReducers({
    maincols: maincols,
    mainpadding: mainpadding,
    appnavbar: appnavbar,
    theme: theme,
    colors: colors,
    system: system,
    maintiles: maintiles,
    routing: react_router_redux_1.routerReducer,
    auth: auth,
    register: register,
});
let mainReducer = (state, action) => {
    if (!flux_standard_action_1.isFSA(action)) {
        console.error('non-FSA action', action);
        throw 'non-FSA action, see console for details';
    }
    else {
        return mainReducerCore(state, action);
    }
};
exports.mainReducer = mainReducer;
