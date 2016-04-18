'use strict';
const redux_1 = require('redux');
const flux_standard_action_1 = require('flux-standard-action');
const redux_actions_1 = require('redux-actions');
const react_router_redux_1 = require('react-router-redux');
const Actions = require('../actions/actions');
const initialstate_1 = require("../local/initialstate");
let budgetdata = (state = initialstate_1.initialstate.budgetdata, action) => {
    return state;
};
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
let homepadding = (state = initialstate_1.initialstate.homepadding, action) => {
    return state;
};
let hometiles = (state = initialstate_1.initialstate.hometiles, action) => {
    return state;
};
let homecolsreducer = (state = initialstate_1.initialstate.homecols, action) => {
    switch (action.type) {
        case Actions.SET_HOMETILECOLS: {
            let mainElement = document.getElementById('main');
            let elementwidth = mainElement.getBoundingClientRect().width;
            let columns;
            if (elementwidth > 960) {
                columns = 5;
            }
            else if (elementwidth > 760) {
                columns = 4;
            }
            else if (elementwidth > 480) {
                columns = 3;
            }
            else if (elementwidth > 200) {
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
let homecols = redux_actions_1.handleActions({
    [Actions.SET_HOMETILECOLS]: homecolsreducer,
}, initialstate_1.initialstate.homecols);
let { LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT_SUCCESS, AUTO_LOGIN_REQUEST, AUTO_LOGIN_SUCCESS, AUTO_LOGIN_FAILURE, } = Actions;
function auth(state = {
        isFetching: false,
        isAuthenticated: false,
    }, action) {
    switch (action.type) {
        case LOGIN_REQUEST:
        case AUTO_LOGIN_REQUEST:
            return Object.assign({}, state, {
                isFetching: true,
                isAuthenticated: false,
                user: action.payload.creds,
                token: null,
                fieldMessages: null,
                errorMessage: '',
                profile: null,
            });
        case LOGIN_SUCCESS:
        case AUTO_LOGIN_SUCCESS:
            return Object.assign({}, state, {
                user: null,
                token: action.payload.token,
                profile: action.payload.profile,
                isFetching: false,
                isAuthenticated: true,
            });
        case AUTO_LOGIN_FAILURE:
            return state;
        case LOGIN_FAILURE:
            let fieldMessages = {};
            let data = action.payload.data || [];
            let i, message = null;
            for (i = 0; i < data.length; i++) {
                fieldMessages[data[i].key] = data[i].message;
            }
            if (action.payload.data) {
                action.payload.message = null;
            }
            return Object.assign({}, state, {
                isFetching: false,
                fieldMessages: fieldMessages,
                errorMessage: action.payload.message,
                user: null,
                token: null,
            });
        case LOGOUT_SUCCESS:
            return Object.assign({}, state, {
                isFetching: false,
                isAuthenticated: false,
                profile: null,
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
                isRegistered: false,
                user: action.payload.profile,
                errorMessage: null,
                fieldMessages: null,
            });
        case REGISTER_SUCCESS:
            return Object.assign({}, state, {
                isFetching: false,
                isRegistered: true,
                user: action.payload.profile,
            });
        case REGISTER_FAILURE:
            let fieldMessages = {};
            let data = action.payload.data || [];
            let i, message = null;
            for (i = 0; i < data.length; i++) {
                fieldMessages[data[i].key] = data[i].message;
            }
            if (action.payload.data) {
                action.payload.message = null;
            }
            return Object.assign({}, state, {
                isFetching: false,
                fieldMessages: fieldMessages,
                errorMessage: action.payload.message,
                user: null,
            });
        default:
            return state;
    }
}
let { REGISTER_CONFIRM_REQUEST, REGISTER_CONFIRM_SUCCESS, REGISTER_CONFIRM_FAILURE, } = Actions;
function registerconfirm(state = {
        isFetching: false,
        isConfirmed: false
    }, action) {
    switch (action.type) {
        case REGISTER_CONFIRM_REQUEST:
            return Object.assign({}, state, {
                isFetching: true,
                isRegistered: false,
                confirmtoken: action.payload.confirmtoken,
                errorMessage: null,
                user: null,
            });
        case REGISTER_CONFIRM_SUCCESS:
            return Object.assign({}, state, {
                isFetching: false,
                isRegistered: true,
                user: action.payload.profile,
                confirmtoken: null,
            });
        case REGISTER_CONFIRM_FAILURE:
            return Object.assign({}, state, {
                isFetching: false,
                errorMessage: action.payload.message || action.payload,
            });
        default:
            return state;
    }
}
let mainReducerCore = redux_1.combineReducers({
    maintiles: maintiles,
    maincols: maincols,
    mainpadding: mainpadding,
    hometiles: hometiles,
    homecols: homecols,
    homepadding: homepadding,
    appnavbar: appnavbar,
    budgetdata: budgetdata,
    theme: theme,
    colors: colors,
    system: system,
    routing: react_router_redux_1.routerReducer,
    auth: auth,
    register: register,
    registerconfirm: registerconfirm,
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
