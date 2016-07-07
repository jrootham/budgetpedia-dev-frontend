// reducers.tsx
import { combineReducers } from 'redux'
import initialstate from "../../local/initialstate"

let defaults = (state = initialstate.explorer.defaults, action) => {
    return state
}

let branchList = (state = [], action) => {
    return state
}

let branchesById:{[index:string]:any} = (state = { }, action) => {
    return state
}

let nodesById = (state = { }, action) => {
    return state
}

let cellsById = (state = { }, action) => {
    return state
}

let explorer = combineReducers({
        defaults,
        branchList,
        branchesById,
        nodesById,
        cellsById,    
})

export default explorer

export const getExplorerControlData = state => state.explorer
