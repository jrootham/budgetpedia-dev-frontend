// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// reducers.tsx

// TODO: co-locate selectors here: get...(...)

'use strict'

import { combineReducers } from 'redux'
import { isFSA } from 'flux-standard-action'
import { handleActions } from 'redux-actions'; // handleAction doesn't work with combineReducers
import { routerReducer } from 'react-router-redux'
// ==============================================
import * as Actions from '../actions/actions'
import { initialstate } from "../../local/initialstate"

let budgetdata = (state: any = initialstate.budgetdata, action) => {
    return state
}

let appnavbar = (state: any = initialstate.appnavbar, action) => {
    return state
}

let toolsnavbar = (state: any = initialstate.toolsnavbar, action) => {
    return state
}

let theme = (state: any = initialstate.theme) => {
    return state
}

let system = (state:any = initialstate.system) => {
    return state
}

let colors = (state: any = initialstate.colors) => {
    return state
}

let workingmessagestate = (state:any = initialstate.workingmessagestate, action) => {
    switch (action.type) {
        case Actions.SHOW_WORKING_MESSAGE: {
            return true
        }
        case Actions.HIDE_WORKING_MESSAGE: {
            return false
        }
        default:
            return state
    }
}

let homepadding = (state: any = initialstate.homepadding, action) => {
    return state
}

let hometiles = (state: any = initialstate.hometiles, action) => {
    return state
}

let homecolsreducer = (state: any = initialstate.homecols, action) => {
    switch (action.type) {
        case Actions.SET_HOMETILECOLS: {

            let mainElement = document.getElementById('main')

            let elementwidth: number = mainElement.getBoundingClientRect().width

            let columns: number;

            // breakpoints should be parameterized
            if (elementwidth > 960) {

                columns = 5
                
            } else if (elementwidth > 760) {

                columns = 4

            } else if (elementwidth > 480) {

                columns = 3

            } else if (elementwidth > 200) {

                columns = 2

            } else {

                columns = 1

            }

            return columns

        }
        default:

            return state

    }
}

let homecols = handleActions({
    [Actions.SET_HOMETILECOLS]: homecolsreducer,
}, initialstate.homecols)

// ==================================================================
// -------------------[ LOGIN AND AUTO-LOGIN ]-----------------------

let {
    LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT_SUCCESS,
    AUTO_LOGIN_REQUEST, AUTO_LOGIN_SUCCESS, AUTO_LOGIN_FAILURE,
} = Actions

// The auth reducer. The starting state sets authentication
// based on a token being in local storage. In a real app,
// we would also want a util to check if the token is expired.
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
                user: action.payload.creds, // user requesting authentication
                token: null,
                fieldMessages: null,
                errorMessage:'',
                profile: null, // profile of authenticated user
            })

        case LOGIN_SUCCESS:
        case AUTO_LOGIN_SUCCESS:

            return Object.assign({}, state, {
                user: null,
                token: action.payload.token,
                profile: action.payload.profile,
                isFetching: false,
                isAuthenticated: true,
            })

        case AUTO_LOGIN_FAILURE:
            return state // take no action

        case LOGIN_FAILURE:
            let fieldMessages = {}
            let data = action.payload.data || []
            let i, message = null
            for (i = 0; i < data.length; i++) {
                // TODO: should map internal field name to field presentation title here
                fieldMessages[data[i].key] = data[i].message
            }
            if (action.payload.data) {
                action.payload.message = null
            }

            return Object.assign({}, state, {
                isFetching: false,
                fieldMessages,
                errorMessage: action.payload.message,
                user: null,
                token: null,
            })

        case LOGOUT_SUCCESS:

            return Object.assign({}, state, {
                isFetching: false,
                isAuthenticated: false,
                profile:null,
                token: null,
            })

        default:

            return state
    }
}

// =======================================================================
// -----------------------------[ registration ]--------------------------

let {
    REGISTER_REQUEST, 
    REGISTER_SUCCESS, 
    REGISTER_FAILURE,
} = Actions

// The auth reducer. The starting state sets authentication
// based on a token being in local storage. In a real app,
// we would also want a util to check if the token is expired.
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
            })

        case REGISTER_SUCCESS:

            return Object.assign({}, state, {
                isFetching: false,
                isRegistered: true,
                user:action.payload.profile,
            })

        case REGISTER_FAILURE:

            // console.log('register failure action = ', action)
            let fieldMessages = {}
            let data = action.payload.data || []
            let i, message = null
            for (i = 0; i < data.length; i++) {
                // TODO: should map internal field name to field presentation title here
                fieldMessages[data[i].key] = data[i].message
            }
            if (action.payload.data) {
                action.payload.message = null
            }
            // console.log('register failure fieldMessages = ', fieldMessages)
            return Object.assign({}, state, {
                isFetching: false,
                fieldMessages,
                errorMessage: action.payload.message,
                user: null,
            })

        default:

            return state
    }
}

// ===========================================================================================
// --------------------------------[ registration confirmation ]------------------------------

let {
    REGISTER_CONFIRM_REQUEST, 
    REGISTER_CONFIRM_SUCCESS, 
    REGISTER_CONFIRM_FAILURE,
} = Actions

function registerconfirm(state = {
    isFetching: false,
    isConfirmed: false
}, action) {

    switch (action.type) {

        case REGISTER_CONFIRM_REQUEST:
            return Object.assign({}, state, {
                isFetching: true,
                isConfirmed: false,
                confirmtoken: action.payload.confirmtoken,
                errorMessage: null,
                user: null,
            })

        case REGISTER_CONFIRM_SUCCESS:

            console.log('register confirm success',action)
            return Object.assign({}, state, {
                isFetching: false,
                isConfirmed: true,
                user: action.payload.data,
            })

        case REGISTER_CONFIRM_FAILURE:

            return Object.assign({}, state, {
                isFetching: false,
                errorMessage: action.payload.message || action.payload,
            })

        default:

            return state
    }

}

let mainReducerCore = combineReducers(
    { 
        // maintiles,
        // maincols,
        // mainpadding,
        hometiles,
        homecols,
        homepadding,
        appnavbar,
        budgetdata,
        // toolsnavbar, 
        theme,
        colors,
        system,
        
        routing:routerReducer, 
        auth,
        register,
        registerconfirm,
        workingmessagestate,
    }
)

let mainReducer = (state,action) => {
    if (!isFSA( action )) {

        console.error('non-FSA action',action)
        throw 'non-FSA action, see console for details'

    } else {

        return mainReducerCore(state,action)
        
    }
}

export default mainReducer
