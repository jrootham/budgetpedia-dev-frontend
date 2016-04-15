// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// actions.tsx

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
import { routerActions } from 'react-router-redux'

import { getQuery } from '../utilities/utilities'

/*------------- tile management -----------*/

export const SET_TILECOLS = 'SET_TILECOLS'
export const SET_HOMETILECOLS = 'SET_HOMETILECOLS'
// the following three to be implemented
export const ADD_TILE = 'ADD_TILE'
export const REMOVE_TILE = 'REMOVE_TILE'
export const UPDATE_TILE = 'UPDATE_TILE'

export const setTileCols = createAction(SET_TILECOLS)

export const setHomeTileCols = createAction(SET_HOMETILECOLS)

export const transitionTo = route => {
    return dispatch => {
        dispatch(routerActions.push(route))
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
            data:null,
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
            token: user.token,
            profile: user.profile,
        }
    }
)

let loginError = createAction(
    LOGIN_FAILURE,
    (message, data?) => {
        return {
            // isFetching: false,
            // isAuthenticated: false,
            message,
            data,
        }
    }
)

// call the api
export const loginUser = creds => {

    let config:RequestInit = {
        method: 'POST',
        headers: { "Content-Type": "application/x-www-form-urlencoded", },
        body: `email=${creds.email}&password=${creds.password}`,
    }
    return dispatch => {
        dispatch(requestLogin(creds))
        fetch('/api/login/credentials', config)
            .then(response => {
                // console.log('request response = ', response)
                if (response.status >= 500) {
                    throw new Error("Response from server: " +
                        response.statusText + ' (' +
                        response.status + ')')
                }
                return response.text().then(text => {
                    return { text, response }
                })
            })
            .then(({text, response}) => {
                let json, isJson
                try {
                    json = JSON.parse(text)
                    isJson = true

                } catch (e) {
                    isJson = false
                }
                if (!isJson || !response.ok) {
                    // If there was a problem, we want to
                    // dispatch the error condition
                    if (isJson) {
                        // json.data = field level data
                        dispatch(loginError(json.message, json.data))
                    } else
                        dispatch(loginError(text))
                    // return Promise.reject(user) // ???
                } else {
                    // save token
                    localStorage.setItem('jsonwebtoken',json.token)
                    // Dispatch the success action
                    dispatch(() => {
                        dispatch(receiveLogin(json))
                    })
                }
            })
            .catch(err => {
                dispatch(loginError(err.message))
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
        localStorage.removeItem('jsonwebtoken')
        dispatch(receiveLogout())
    }
}

//===================================================
//------------- REGISTRATION MANAGEMENT -------------
//===================================================

export const REGISTER_REQUEST = 'REGISTER_REQUEST'
export const REGISTER_SUCCESS = 'REGISTER_SUCCESS'
export const REGISTER_FAILURE = 'REGISTER_FAILURE'

let requestRegister = createAction(
    REGISTER_REQUEST,
    profile => {
        return {
            // isFetching: true,
            // isRegistered: false,
            // message: '',
            profile,
        }
    }
)

let receiveRegister = createAction(
    REGISTER_SUCCESS,
    profile => {
        return {
            // isFetching: false,
            // isRegistered: true,
            profile,
        }
    }
)

let registerError = createAction(
    REGISTER_FAILURE,
    (message, data?) => {
        return {
            // isFetching: false,
            message,
            data,
        }
    }
)

// call the api
export const registerUser = profile => {

    let data = {
        profile,
        origin: location.origin,
    }

    let config: RequestInit = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        // timeout: 3000, // TODO: test this!
    }
    return dispatch => {
        dispatch(requestRegister(data))
        fetch('/api/register/new', config)
            .then(response => {
                // console.log('request response = ', response)
                if (response.status >= 500) {
                    throw new Error("Response from server: " +
                        response.statusText + ' (' +
                        response.status + ')')
                }
                return response.text().then(text => {
                    return { text, response }
                })
            })
            .then(({text, response}) => {
                let json, isJson
                try {
                    json = JSON.parse(text)
                    isJson = true

                } catch (e) {
                    isJson = false
                }
                if (!isJson || !response.ok) {
                    // If there was a problem, we want to
                    // dispatch the error condition
                    if (isJson) {
                        // json.data = field level data
                        dispatch(registerError(json.message, json.data))
                    } else
                        dispatch(registerError(text))
                    // return Promise.reject(user) // ???
                } else {
                    // Dispatch the success action
                    dispatch(() => { 
                        dispatch(receiveRegister(json))
                        return Promise.resolve() // experimenting with thunks...
                    }).then(() => {
                        // switch to pending page
                        dispatch(transitionTo('/register/pending'))
                    })
                }
            })
            .catch(err => {
                dispatch(registerError(err.message))
            })
    }
}

//================================================================
//------------- REGISTRATION CONFIMRATION MANAGEMENT -------------
//================================================================

export const REGISTER_CONFIRM_REQUEST = 'REGISTER_CONFIRM_REQUEST'
export const REGISTER_CONFIRM_SUCCESS = 'REGISTER_CONFIRM_SUCCESS'
export const REGISTER_CONFIRM_FAILURE = 'REGISTER_CONFIRM_FAILURE'

let requestConfirmRegister = createAction(
    REGISTER_CONFIRM_REQUEST,
    confirmtoken => {
        return {
            // isFetching: true,
            // isConfirmed: false,
            // message: '',
            confirmtoken,
            // jwt:null,
        }
    }
)

let receiveConfirmRegister = createAction(
    REGISTER_CONFIRM_SUCCESS,
    jwt => {
        return {
            // isFetching: false,
            // isConfirmed: true,
            jwt,
        }
    }
)

let registerConfirmError = createAction(
    REGISTER_CONFIRM_FAILURE,
    (message) => {
        return {
            // isFetching: false,
            // confirmtoken:null,
            message,
        }
    }
)

export const confirmUser = () => {

    let uri = location.href
    let query = getQuery(uri)
    let data = {
        token: query['token']
    }
    // console.log('token = ', data.token)
    return dispatch => {
        if (!data.token) {
            dispatch(registerConfirmError('No regitration token is available'))
        } else {

            let config: RequestInit = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                // timeout: 3000, // TODO: test this!
            }

            dispatch(requestConfirmRegister(data))
            fetch('/api/register/confirm', config)
                .then(response => {
                    // console.log('confirm request response = ', response)
                    if (response.status >= 500) {
                        throw new Error("Response from server: " +
                            response.statusText + ' (' +
                            response.status + ')')
                    }
                    return response.text().then(text => {
                        return { text, response }
                    })
                })
                .then(({text, response}) => {
                    let json, isJson
                    // console.log('reply text', text)
                    try {
                        json = JSON.parse(text)
                        isJson = true
                        console.log('reply json', json)
                    } catch (e) {
                        isJson = false
                    }
                    console.log('response = ',text, response)
                    if (!isJson || !response.ok) {
                        // If there was a problem, we want to
                        // dispatch the error condition
                        if (isJson) {
                            // json.data = field level data
                            dispatch(registerConfirmError(json.message || json.error))
                        } else
                            dispatch(registerConfirmError(text))
                        // return Promise.reject(user) // ???
                    } else {
                        // Dispatch the success action
                        dispatch(() => {
                            dispatch(receiveConfirmRegister(json))
                            // return Promise.resolve() // experimenting with thunks...
                        })
                        // .then(() => { // autologin

                        // })
                    }
                })
                .catch(err => {
                    console.log('err.message',err.message)
                    dispatch(registerConfirmError(err.message))
                })

        }

    }
    
}
