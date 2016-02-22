// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// actions.tsx
///<reference path="../../typings/redux-actions/redux-actions.d.ts" />
///<reference path="../../typings-custom/isomorphic-fetch.d.ts" />

import { createAction } from 'redux-actions';
/*
    https://github.com/acdlite/redux-actions
    actions must be FSA - Flux Standard Actions:
    {
        type
        payload?
        error?
        meta?
    }
    createAction(type, payloadCreator = Identity, ?metaCreator)
*/
import { routeActions } from 'react-router-redux'
import fetch = require('isomorphic-fetch')

/*------------- tile management -----------*/

export const SET_TILECOLS = 'SET_TILECOLS'
// the following three to be implemented
export const ADD_TILE = 'ADD_TILE'
export const REMOVE_TILE = 'REMOVE_TILE'
export const UPDATE_TILE = 'UPDATE_TILE'

export const setTileCols = createAction(SET_TILECOLS)

export const transitionTo = route => {
    return dispatch => {
        dispatch(routeActions.push(route))
    }
}

/*------------- login management -----------*/

export const LOGIN_REQUEST = 'LOGIN_REQUEST'
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS'
export const LOGIN_FAILURE = 'LOGIN_FAILURE'

let requestLogin = createAction(
    LOGIN_REQUEST,
    creds => { 
        return {
            // isFetching: true,
            // isAuthenticated: false,
            message:'',
            creds,
        }
    }
) 

let receiveLogin = createAction(
    LOGIN_SUCCESS,
    user => {
        return {
            // isFetching: false,
            // isAuthenticated: true,
            id_token: user.id_token,
        }
    }
)

let loginError = createAction(
    LOGIN_FAILURE,
    message => {
        return {
            // isFetching: false,
            // isAuthenticated: false,
            message
        }
    }
)

// call the api
export const loginUser = creds => {

    let config = {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `userid=${creds.userid}&password=${creds.password}`
    }
    return dispatch => {
        dispatch(requestLogin(creds))
        fetch('/api/login', config)
            .then(response => {
                console.log('response = ',response)
                if (response.status >= 400) {
                    throw new Error("Response from server: " + 
                        response.statusText + ' (' + 
                        response.status + ')')
                }
                response.json().then(user => ({ user, response }))
            })
            .then(({ user, response }) => {
                console.log('user block', user, response)
                if (!response.ok) {
                    // If there was a problem, we want to
                    // dispatch the error condition
                    dispatch(loginError(user.message))
                    // return Promise.reject(user) // ???
                } else {
                    // If login was successful, set the token in local storage
                    localStorage.setItem('id_token', user.id_token)
                    // Dispatch the success action
                    dispatch(receiveLogin(user))
                }
            })
            .catch(err => { 
                dispatch(loginError(err.message))
                console.log('System Error: ', err.message) 
            })
    }
}

/*------------- logout management -----------*/

export const LOGOUT_REQUEST = 'LOGOUT_REQUEST'
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS'
export const LOGOUT_FAILURE = 'LOGOUT_FAILURE'

let requestLogout = createAction(
    LOGOUT_REQUEST,
    () => {
        return {
            isFetching: true,
            isAuthenticated: true
        }
    }
)

let receiveLogout = createAction(
    LOGOUT_SUCCESS,
    () => {
        return {
            isFetching: false,
            isAuthenticated: false
        }
    }
)

// Logs the user out
export const logoutUser = () => {
    return dispatch => {
        dispatch(requestLogout())
        localStorage.removeItem('id_token')
        dispatch(receiveLogout())
    }
}

/*------------- registration management -----------*/

export const REGISTER_REQUEST = 'REGISTER_REQUEST'
export const REGISTER_SUCCESS = 'REGISTER_SUCCESS'
export const REGISTER_FAILURE = 'REGISTER_FAILURE'

let requestRegister = createAction(
    REGISTER_REQUEST,
    creds => {
        return {
            // isFetching: true,
            // isAuthenticated: false,
            message: '',
            creds,
        }
    }
)

let receiveRegister = createAction(
    REGISTER_SUCCESS,
    user => {
        return {
            // isFetching: false,
            // isAuthenticated: true,
            id_token: user.id_token,
        }
    }
)

let registerError = createAction(
    REGISTER_FAILURE,
    message => {
        return {
            // isFetching: false,
            // isAuthenticated: false,
            message
        }
    }
)

// call the api
export const registerUser = creds => {

    let config = {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `userid=${creds.userid}&password=${creds.password}`
    }
    return dispatch => {
        dispatch(requestRegister(creds))
        fetch('/api/login', config)
            .then(response => {
                console.log('response = ', response)
                if (response.status >= 400) {
                    throw new Error("Response from server: " +
                        response.statusText + ' (' +
                        response.status + ')')
                }
                response.json().then(user => ({ user, response }))
            })
            .then(({ user, response }) => {
                console.log('user block', user, response)
                if (!response.ok) {
                    // If there was a problem, we want to
                    // dispatch the error condition
                    dispatch(loginError(user.message))
                    // return Promise.reject(user) // ???
                } else {
                    // If login was successful, set the token in local storage
                    // localStorage.setItem('id_token', user.id_token)
                    // Dispatch the success action
                    dispatch(receiveRegister(user))
                }
            })
            .catch(err => {
                dispatch(registerError(err.message))
                console.log('System Error: ', err.message)
            })
    }
}
