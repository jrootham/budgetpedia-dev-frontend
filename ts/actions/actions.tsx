// actions.tsx
///<reference path="../../typings/redux-actions/redux-actions.d.ts" />

import { createAction } from 'redux-actions';
import { routeActions } from 'react-router-redux'
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

export const SET_TILECOLS = 'SET_TILECOLS'
export const ADD_TILE = 'ADD_TILE'
export const REMOVE_TILE = 'REMOVE_TILE'
export const UPDATE_TILE = 'UPDATE_TILE'

export const setTileCols = createAction(SET_TILECOLS)

export const transitionTo = route => {
    return dispatch => {
        dispatch(routeActions.push(route))
    }
}
