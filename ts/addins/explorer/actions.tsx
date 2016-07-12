// actions.tsx
import { createAction } from 'redux-actions';
let uuid = require('node-uuid') // use uuid.v4() for unique id

export namespace types {
    export const ADD_BRANCH = 'ADD_BRANCH'
    export const REMOVE_BRANCH = 'REMOVE_BRANCH'
    export const ADD_NODE = 'ADD_NODE'
    export const REMOVE_NODE = 'REMOVE_NODE'
    export const ADD_CELL = 'ADD_CELL'
    export const REMOVE_CELL = 'REMOVE_CELL'
    export const CHANGE_VIEWPOINT = 'CHANGE_VIEWPOINT'
}

export namespace branchtypes {
    export import ADD_NODE = types.ADD_NODE
    export import REMOVE_NODE = types.REMOVE_NODE
    export import CHANGE_VIEWPOINT = types.CHANGE_VIEWPOINT
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

export const changeViewpoint = createAction(
    types.CHANGE_VIEWPOINT, (branchuid, viewpointname) => ({
        branchuid,
        viewpointname,        
    })
)

export const addNode = createAction(
    types.ADD_NODE,(branchuid,settings) => ({
        settings,
        uid: uuid.v4(),
        branchuid,
    })
)
    
export const removeNode = createAction(
    types.REMOVE_NODE,(branchuid,uid) => ({
        uid,
        branchuid,
    })
)
export const addCell = createAction(
    types.ADD_CELL,(nodeuid,settings) => ({
        settings,
        uid: uuid.v4(),
        nodeuid,
    })
)
    
export const removeCell = createAction(
    types.REMOVE_CELL,(nodeuid,uid) => ({
        uid,
        nodeuid,
    })
)
