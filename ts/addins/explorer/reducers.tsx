// explorer reducers.tsx
import { combineReducers } from 'redux'
import initialstate from "../../local/initialstate"
import { types as actiontypes} from './actions'

let generationcounter = 0

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
        
        case actiontypes.ADD_NODE:
            newstate = Object.assign({},state)
            newstate[action.payload.branchuid] = Object.assign({},newstate[action.payload.branchuid])
            newstate[action.payload.branchuid].nodeList = 
                [...state[action.payload.branchuid].nodeList,action.payload.uid]
            return newstate

        case actiontypes.REMOVE_NODE:
            newstate = Object.assign({},state)
            let removelist = action.payload.uid
            if (!Array.isArray(removelist)) {
                removelist = [removelist]
            }
            let newList = newstate[action.payload.branchuid].nodeList.filter((uid) => {
                return (removelist.indexOf(uid) == -1)
            }) 
            newstate[action.payload.branchuid].nodeList = newList
            return newstate

        default:
            return state
    }
}

let nodesById = (state = { }, action) => {
    let { type } = action
    let newstate
    switch (type) {
        case actiontypes.ADD_NODE:
            newstate = Object.assign({},state,{[action.payload.uid]:action.payload.settings})
            return newstate

        case actiontypes.REMOVE_NODE:
            newstate = Object.assign({},state)
            let removelist = action.payload.uid
            if (!Array.isArray(removelist)) {
                removelist = [removelist]
            }
            for (let removeid of removelist) {
                delete newstate[removeid]
            }
            return newstate

        default:
            return state
    }
}

let cellsById = (state = { }, action) => {
    return state
}

let lastAction = (state = null, action) => {
    return action.type
}

let generation = (state = null, action) => {
    return generationcounter++
}

let explorer = combineReducers({
        defaults,
        branchList,
        branchesById,
        nodesById,
        cellsById,
        lastAction,
        generation,
})

export default explorer

export const getExplorerControlData = state => state.explorer
