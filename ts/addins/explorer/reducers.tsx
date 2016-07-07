// explorer reducers.tsx
import { combineReducers } from 'redux'
import initialstate from "../../local/initialstate"
import { types as actiontypes} from './actions'

let defaults = (state = initialstate.explorer.defaults, action) => {
    return state
}

let branchList = (state = [], action) => {
    let { type } = action
    let newstate
    switch (type) {
        case actiontypes.ADD_BRANCH:
            newstate = [...state,action.payload.uid]
            return newstate
            
        case actiontypes.REMOVE_BRANCH:
            newstate = state.filter(item => item != action.payload.uid)
            return newstate

        default:
            return state
    }
}

let branchesById:{[index:string]:any} = (state = { }, action) => {
    let { type } = action
    let newstate
    switch (type) {
        case actiontypes.ADD_BRANCH:
            newstate = Object.assign({},state,{[action.payload.uid]:action.payload.settings})
            return newstate

        case actiontypes.REMOVE_BRANCH:
            newstate = Object.assign({},state)
            delete newstate[action.payload.uid]
            return newstate
        
        default:
            return state
    }
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
