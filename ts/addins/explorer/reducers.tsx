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
        case actiontypes.ADD_BRANCH: {
            newstate = Object.assign({},state,{[action.payload.uid]:action.payload.settings})
            return newstate
        }

        case actiontypes.REMOVE_BRANCH: {
            newstate = Object.assign({},state)
            delete newstate[action.payload.uid]
            return newstate
        }
        
        case actiontypes.ADD_NODE: {
            let { branchuid } = action.payload
            // console.log('branchuid in ADD_NODE', branchuid, action, state)
            newstate = Object.assign({},state)
            newstate[branchuid] = Object.assign({},newstate[branchuid])
            newstate[branchuid].nodeList = 
                [...state[branchuid].nodeList,action.payload.uid]
            return newstate
        }

        case actiontypes.REMOVE_NODES: {
            let { branchuid } = action.payload
            newstate = Object.assign({},state)
            let removelist = action.payload.items
            let newList = newstate[branchuid].nodeList.filter((uid) => {
                let foundlist = removelist.filter(item => {
                    return item.uid == uid
                })
                return foundlist.length == 0
            }) 
            newstate[branchuid].nodeList = newList
            return newstate
        }

        case actiontypes.CHANGE_VIEWPOINT: {
            let { branchuid } = action.payload
            newstate = Object.assign({},state)
            newstate[branchuid] = Object.assign({},newstate[branchuid])
            newstate[branchuid].viewpoint = action.payload.viewpointname            
            return newstate
        }

        case actiontypes.CHANGE_FACET: {
            // console.log('change facet',action)
            let { branchuid } = action.payload
            newstate = Object.assign({},state)
            newstate[branchuid] = Object.assign({},newstate[branchuid])
            newstate[branchuid].facet = action.payload.facetname            
            return newstate
        }

        default:
            return state
    }
}

let nodesById = (state = { }, action) => {
    let { type } = action
    let newstate
    switch (type) {
        case actiontypes.ADD_NODE: {
            let node = state[action.payload.uid] || {}
            node = Object.assign(node,action.payload.settings)
            newstate = Object.assign({},state,{[action.payload.uid]:node})
            return newstate
        }

        case actiontypes.REMOVE_NODES: {            
            newstate = Object.assign({},state)
            let removelist = action.payload.items
            for (let removeitem of removelist) {
                delete newstate[removeitem.uid]
            }
            return newstate
        }

        case actiontypes.ADD_CELLS: {
            let newstate = Object.assign({},state)
            let nodeuid = action.payload.nodeuid
            let newnode = newstate[nodeuid] = Object.assign({},newstate[nodeuid])
            newnode.cellList = newnode.cellList || []
            let newcellList = action.payload.settings.map(setting => setting.uid)
            newnode.cellList = [...newnode.cellList, ...newcellList]
            newstate[nodeuid] = newnode
            return newstate
        }

        default:
            return state
    }
}

let cellsById = (state = { }, action) => {
    let { type } = action
    let newstate
    switch (type) {
        case actiontypes.ADD_CELLS: {
            newstate = Object.assign({},state)
            for (let setting of action.payload.settings) {
                newstate[setting.uid] = setting
            }
            return newstate
        }
        case actiontypes.REMOVE_NODES: {
            newstate = Object.assign({},state)
            for (let removeitem of action.payload.items) {
                for (let celluid of removeitem.cellList)
                delete newstate[celluid]
            }
            return newstate
        }
        default:
            return state
    }
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

export const getExplorerDeclarationData = state => state.explorer
