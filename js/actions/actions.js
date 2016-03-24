"use strict";
const redux_actions_1 = require('redux-actions');
const react_router_redux_1 = require('react-router-redux');
exports.SET_TILECOLS = 'SET_TILECOLS';
exports.ADD_TILE = 'ADD_TILE';
exports.REMOVE_TILE = 'REMOVE_TILE';
exports.UPDATE_TILE = 'UPDATE_TILE';
exports.setTileCols = redux_actions_1.createAction(exports.SET_TILECOLS);
exports.transitionTo = route => {
    return dispatch => {
        dispatch(react_router_redux_1.routerActions.push(route));
    };
};
exports.LOGIN_REQUEST = 'LOGIN_REQUEST';
exports.LOGIN_SUCCESS = 'LOGIN_SUCCESS';
exports.LOGIN_FAILURE = 'LOGIN_FAILURE';
let requestLogin = redux_actions_1.createAction(exports.LOGIN_REQUEST, creds => {
    return {
        message: '',
        creds: creds,
    };
});
let receiveLogin = redux_actions_1.createAction(exports.LOGIN_SUCCESS, user => {
    return {
        id_token: user.id_token,
    };
});
let loginError = redux_actions_1.createAction(exports.LOGIN_FAILURE, message => {
    return {
        message: message
    };
});
exports.loginUser = creds => {
    let config = {
        method: 'POST',
        headers: { "Content-Type": "application/x-www-form-urlencoded", },
        body: `email=${creds.email}&password=${creds.password}`,
    };
    return dispatch => {
        dispatch(requestLogin(creds));
        fetch('/api/login', config)
            .then(response => {
            if (response.status >= 400) {
                throw new Error("Response from server: " +
                    response.statusText + ' (' +
                    response.status + ')');
            }
            return response.json().then(user => {
                return { user: user, response: response };
            });
        })
            .then(({ user, response }) => {
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
exports.REGISTER_REQUEST = 'REGISTER_REQUEST';
exports.REGISTER_SUCCESS = 'REGISTER_SUCCESS';
exports.REGISTER_FAILURE = 'REGISTER_FAILURE';
let requestRegister = redux_actions_1.createAction(exports.REGISTER_REQUEST, profile => {
    return {
        isFetching: true,
        isRegistered: false,
        message: '',
        profile: profile,
    };
});
let receiveRegister = redux_actions_1.createAction(exports.REGISTER_SUCCESS, profile => {
    return {
        isFetching: false,
        isRegistered: true,
        profile: profile,
    };
});
let registerError = redux_actions_1.createAction(exports.REGISTER_FAILURE, (message, data) => {
    return {
        message: message,
        data: data,
    };
});
exports.registerUser = profile => {
    let data = {
        profile: profile,
        origin: location.origin,
    };
    let config = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    };
    return dispatch => {
        dispatch(requestRegister(data));
        fetch('/api/register/new', config)
            .then(response => {
            if (response.status >= 500) {
                throw new Error("Response from server: " +
                    response.statusText + ' (' +
                    response.status + ')');
            }
            return response.text().then(text => {
                return { text: text, response: response };
            });
        })
            .then(({ text, response }) => {
            let json, isJson;
            try {
                json = JSON.parse(text);
                isJson = true;
            }
            catch (e) {
                isJson = false;
            }
            if (!isJson || !response.ok) {
                if (isJson) {
                    dispatch(registerError(json.message, json.data));
                }
                else
                    dispatch(registerError(text));
            }
            else {
                dispatch(() => {
                    dispatch(receiveRegister(json));
                    return Promise.resolve();
                }).then(() => {
                    dispatch(exports.transitionTo('/register/pending'));
                });
            }
        })
            .catch(err => {
            dispatch(registerError(err.message));
        });
    };
};
