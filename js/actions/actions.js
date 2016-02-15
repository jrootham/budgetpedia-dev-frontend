var redux_actions_1 = require('redux-actions');
var react_router_redux_1 = require('react-router-redux');
var fetch = require('isomorphic-fetch');
exports.SET_TILECOLS = 'SET_TILECOLS';
exports.ADD_TILE = 'ADD_TILE';
exports.REMOVE_TILE = 'REMOVE_TILE';
exports.UPDATE_TILE = 'UPDATE_TILE';
exports.setTileCols = redux_actions_1.createAction(exports.SET_TILECOLS);
exports.transitionTo = route => {
    return dispatch => {
        dispatch(react_router_redux_1.routeActions.push(route));
    };
};
exports.LOGIN_REQUEST = 'LOGIN_REQUEST';
exports.LOGIN_SUCCESS = 'LOGIN_SUCCESS';
exports.LOGIN_FAILURE = 'LOGIN_FAILURE';
let requestLogin = redux_actions_1.createAction(exports.LOGIN_REQUEST, creds => {
    return {
        creds,
    };
});
let receiveLogin = redux_actions_1.createAction(exports.LOGIN_SUCCESS, user => {
    return {
        id_token: user.id_token,
    };
});
let loginError = redux_actions_1.createAction(exports.LOGIN_FAILURE, message => {
    return {
        message
    };
});
exports.loginUser = creds => {
    let config = {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `userid=${creds.userid}&password=${creds.password}`
    };
    return dispatch => {
        dispatch(requestLogin(creds));
        fetch('/api/login', config)
            .then(response => {
            console.log('response = ', response);
            if (response.status >= 400) {
                throw new Error("Bad response from server: " +
                    response.statusText + ' (' +
                    response.status + ')');
            }
            response.json().then(user => ({ user, response }));
        })
            .then(({ user, response }) => {
            console.log('user block');
            if (!response.ok) {
                dispatch(loginError(user.message));
            }
            else {
                localStorage.setItem('id_token', user.id_token);
                dispatch(receiveLogin(user));
            }
        })
            .catch(err => {
            dispatch(loginError(err.message));
            console.log('Error: ', err.message);
        });
    };
};
exports.LOGOUT_REQUEST = 'LOGOUT_REQUEST';
exports.LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
exports.LOGOUT_FAILURE = 'LOGOUT_FAILURE';
let requestLogout = redux_actions_1.createAction(exports.LOGOUT_REQUEST, () => {
    return {
        isFetching: true,
        isAuthenticated: true
    };
});
let receiveLogout = redux_actions_1.createAction(exports.LOGOUT_SUCCESS, () => {
    return {
        isFetching: false,
        isAuthenticated: false
    };
});
exports.logoutUser = () => {
    return dispatch => {
        dispatch(requestLogout());
        localStorage.removeItem('id_token');
        dispatch(receiveLogout());
    };
};
