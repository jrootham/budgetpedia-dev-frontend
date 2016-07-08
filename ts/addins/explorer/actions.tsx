// actions.tsx
import { createAction } from 'redux-actions';
let uuid = require('node-uuid') // use uuid.v4() for unique id

export namespace types {
    export const ADD_BRANCH = 'ADD_BRANCH'
    export const REMOVE_BRANCH = 'REMOVE_BRANCH'
}

export const addBranch = createAction(
    types.ADD_BRANCH,settings => ({
        settings,
        uid: uuid.v4(),
    })
)
    
export const removeBranch = createAction(
    types.REMOVE_BRANCH,uid => ({
        uid,
    })
)
