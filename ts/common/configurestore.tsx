// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// configurestore.tsx

import { createStore, applyMiddleware } from 'redux'
import { browserHistory } from 'react-router'
import { routerMiddleware } from 'react-router-redux'
import thunkMiddleware from 'redux-thunk'

import { mainReducer } from "../reducers/reducers"

const reduxRouterMiddleware = routerMiddleware(browserHistory)

// TODO: this is an incorrect construct -- the second argument should be for persisted 
// stores; the first argument should be the combined reducers
const store = createStore(
    mainReducer,
    applyMiddleware(reduxRouterMiddleware, thunkMiddleware)
)

const configureStore = () => {
    return store
}

export default configureStore