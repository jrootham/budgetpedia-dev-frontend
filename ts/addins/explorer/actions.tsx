// actions.tsx
import { createAction } from 'redux-actions';
let uuid = require('node-uuid') // use uuid.v4() for unique id

export namespace types {
    export const ADD_BRANCH = 'ADD_BRANCH'
    export const REMOVE_BRANCH = 'REMOVE_BRANCH'
    export const CHANGE_VIEWPOINT = 'CHANGE_VIEWPOINT'
    export const CHANGE_FACET = 'CHANGE_FACET'
    export const TOGGLE_INFLATION_ADJUSTED = 'TOGGLE_INFLATION_ADJUSTED'
    export const ADD_NODE = 'ADD_NODE'
    export const REMOVE_NODE = 'REMOVE_NODE'
    export const ADD_CELL = 'ADD_CELL'
    export const REMOVE_CELL = 'REMOVE_CELL'
    export const CHANGE_CHART_CODE = 'CHANGE_CHART_CODE'
    export const TOGGLE_DELTA = 'TOGGLE_DELTA'
}

export namespace branchTypes {
    export import ADD_NODE = types.ADD_NODE
    export import REMOVE_NODE = types.REMOVE_NODE
    export import CHANGE_VIEWPOINT = types.CHANGE_VIEWPOINT
    export import CHANGE_FACET = types.CHANGE_FACET
}

export namespace nodeTypes {
    export import ADD_CELL = types.ADD_CELL
    export import REMOVE_CELL = types.REMOVE_CELL
    export import CHANGE_CHART_CODE = types.CHANGE_CHART_CODE
    export import TOGGLE_DELTA = types.TOGGLE_DELTA
}

export const addBranchDeclaration = createAction(
    types.ADD_BRANCH,settings => ({
        settings,
        uid: uuid.v4(),
    })
)
    
export const removeBranchDeclaration = createAction(
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

export const changeFacet = createAction(
    types.CHANGE_FACET, (branchuid, facetname) => ({
        branchuid,
        facetname,        
    })
)

export const addNodeDeclaration = createAction(
    types.ADD_NODE,(branchuid,settings) => ({
        settings,
        uid: uuid.v4(),
        branchuid,
    })
)

export const removeNodeDeclaration = createAction(
    types.REMOVE_NODE,(branchuid,uid) => ({
        uid,
        branchuid,
    })
)

export const addCellDeclaration = createAction(
    types.ADD_CELL,(nodeuid,settings) => ({
        settings,
        uid: uuid.v4(),
        nodeuid,
    })
)
    
export const removeCellDeclaration = createAction(
    types.REMOVE_CELL,(nodeuid,uid) => ({
        uid,
        nodeuid,
    })
)
