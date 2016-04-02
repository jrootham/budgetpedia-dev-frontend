// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// reducers.tsx

'use strict'

import { combineReducers } from 'redux'
import { isFSA } from 'flux-standard-action'
import { handleActions } from 'redux-actions'; // handleAction doesn't work with combineReducers
import { routerReducer } from 'react-router-redux'
// ==============================================
import * as Actions from '../actions/actions'
import { initialstate } from "../local/initialstate"

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

let mainpadding = (state: any = initialstate.mainpadding, action) => {
    return state
}

let maintiles = (state: any = initialstate.maintiles, action) => {
    return state
}

let maincolsreducer = (state: any = initialstate.maincols, action) => {
    switch (action.type) {
        case Actions.SET_TILECOLS: {

            let mainElement = document.getElementById('main')

            let elementwidth: number = mainElement.getBoundingClientRect().width

            let columns: number;

            // breakpoints should be parameterized
            if (elementwidth > 960) {

                columns = 4

            } else if (elementwidth > 680) {

                columns = 3

            } else if (elementwidth > 400) {

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

// handleAction not usable with combineReducers
// https://github.com/acdlite/redux-actions/issues/23
// let maincols = handleAction(Actions.SET_TILECOLS, maincolsreducer)

// compatible with flux standard action; quickly filter out non-matching calls
let maincols = handleActions({
    [Actions.SET_TILECOLS]: maincolsreducer,
}, initialstate.maincols )

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


let {
    LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT_SUCCESS
} = Actions

// The auth reducer. The starting state sets authentication
// based on a token being in local storage. In a real app,
// we would also want a util to check if the token is expired.
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
                errorMessage:'',
            })

        case LOGIN_SUCCESS:

            return Object.assign({}, state, {
                isFetching: false,
                isAuthenticated: true,
            })

        case LOGIN_FAILURE:

            // console.log('login failure',action)
            return Object.assign({}, state, {
                isFetching: false,
                // isAuthenticated: false,
                errorMessage: action.payload.message,
                user:null,
            })

        case LOGOUT_SUCCESS:

            return Object.assign({}, state, {
                isFetching: false,
                isAuthenticated: false,
                user:null,
            })

        default:

            return state
    }
}

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

            return Object.assign({}, state, {
                isFetching: false,
                isRegistered: true,
                user: action.payload.profile,
            })

        case REGISTER_CONFIRM_FAILURE:

            return Object.assign({}, state, {
                isFetching: false,
                errorMessage: action.payload.message || action.payload,
                user: null,
            })

        default:

            return state
    }

}

let mainReducerCore = combineReducers(
    { 
        maintiles,
        maincols,
        mainpadding,
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

export { mainReducer }
