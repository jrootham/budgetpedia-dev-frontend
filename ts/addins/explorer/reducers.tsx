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
        case actiontypes.ADD_BRANCH: {
            let {refbranchuid, branchuid} = action.payload
            if (!refbranchuid) {
                newstate = [...state,action.payload.branchuid]
            } else {
                newstate = [...state] 
                let index = newstate.indexOf(refbranchuid)
                if (index == -1) {
                    console.error('System error; could not find rebranchid', refbranchuid, state)
                    newstate.push(branchuid)
                } else {
                    newstate.splice(index + 1, 0, branchuid)
                }
            }
            return newstate
        }
            
        case actiontypes.REMOVE_BRANCH: {
            newstate = state.filter(item => item != action.payload.branchuid)
            return newstate
        }

        case actiontypes.BRANCH_MOVE_UP: {
            newstate = [...state]
            let { branchuid } = action.payload
            let pos = newstate.indexOf(branchuid)
            if (pos == -1) {
                console.error('System Error: branchuid not found in list', branchuid, newstate )
                return newstate
            }
            if (pos == 0) {
                console.log('System Error: branchuid for move up at beginning of list already', branchuid, newstate)
                return newstate
            }
            let oldbranchuid = newstate[pos - 1]
            newstate[pos - 1] = branchuid
            newstate[pos] = oldbranchuid
            return newstate
        }

        case actiontypes.BRANCH_MOVE_DOWN: {
            newstate = [...state]
            let { branchuid } = action.payload
            let pos = newstate.indexOf(branchuid)
            if (pos == -1) {
                console.error('System Error: branchuid not found in list', branchuid, newstate )
                return newstate
            }
            if (pos == newstate.length - 1) {
                console.log('System Error: branchuid for move down at end of list already', branchuid, newstate)
                return newstate
            }
            let oldbranchuid = newstate[pos + 1]
            newstate[pos + 1] = branchuid
            newstate[pos] = oldbranchuid
            return newstate
        }

        default:
            return state
    }
}

let branchesById:{[index:string]:any} = (state = { }, action) => {
    let { type } = action
    let newstate
    switch (type) {
        case actiontypes.ADD_BRANCH: {
            newstate = Object.assign({},state,{[action.payload.branchuid]:action.payload.settings})
            return newstate
        }

        case actiontypes.REMOVE_BRANCH: {
            newstate = Object.assign({},state)
            delete newstate[action.payload.branchuid]
            return newstate
        }
        
        case actiontypes.ADD_NODE: {
            let { branchuid } = action.payload
            // console.log('branchuid in ADD_NODE', branchuid, action, state)
            newstate = Object.assign({},state)
            newstate[branchuid] = Object.assign({},newstate[branchuid])
            newstate[branchuid].nodeList = 
                [...state[branchuid].nodeList,action.payload.nodeuid]
            return newstate
        }

        case actiontypes.REMOVE_NODES: {
            let { branchuid } = action.payload
            newstate = Object.assign({},state)
            let removelist = action.payload.items
            let newList = newstate[branchuid].nodeList.filter((nodeuid) => {
                let foundlist = removelist.filter(item => {
                    return item.nodeuid == nodeuid
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
            let node = state[action.payload.nodeuid] || {}
            node = Object.assign(node,action.payload.settings)
            newstate = Object.assign({},state,{[action.payload.nodeuid]:node})
            return newstate
        }

        case actiontypes.REMOVE_NODES: {            
            newstate = Object.assign({},state)
            let removelist = action.payload.items
            for (let removeitem of removelist) {
                delete newstate[removeitem.nodeuid]
            }
            return newstate
        }

        case actiontypes.ADD_CELLS: {
            let newstate = Object.assign({},state)
            let nodeuid = action.payload.nodeuid
            let newnode = Object.assign({},newstate[nodeuid])
            newnode.cellList = newnode.cellList || []
            let newcellList = action.payload.settings.map(setting => setting.celluid)
            newnode.cellList = [...newnode.cellList, ...newcellList]
            newstate[nodeuid] = newnode
            return newstate
        }

        case actiontypes.CHANGE_TAB: {
            let newstate = Object.assign({},state)
            let { nodeuid } = action.payload
            let newnode = Object.assign({},newstate[action.payload.nodeuid])
            newnode.cellIndex = action.payload.tabvalue
            newstate[nodeuid] = newnode
            return newstate
        }

        default:
            return state
    }
}

let cellsById = (state = { }, action) => {
    let { type } = action
    let newstate = Object.assign({},state)
    switch (type) {
        case actiontypes.ADD_CELLS: {

            for (let setting of action.payload.settings) {
                newstate[setting.celluid] = setting
            }
            return newstate
        }
        case actiontypes.REMOVE_NODES: {

            for (let removeitem of action.payload.items) {
                for (let celluid of removeitem.cellList)
                    delete newstate[celluid]
            }
            return newstate
        }

        case actiontypes.UPDATE_CELL_SELECTION: {

            let { celluid } = action.payload
            let newcell = Object.assign({},newstate[celluid])
            newcell.chartSelection = action.payload.selection
            newstate[celluid] = newcell
            return newstate
        }

        case actiontypes.UPDATE_CELLS_DATASERIESNAME: {

            // console.log('reducer update_cells_dataseriesname')

            let cellItems = action.payload.cellItemList
            for ( let cellItem of cellItems) {
                let { celluid } = cellItem
                let newcell = Object.assign({},newstate[celluid])
                newcell.nodeDataseriesName = cellItem.nodeDataseriesName
                newstate[celluid] = newcell
            }
            return newstate
        }

        case actiontypes.UPDATE_CELL_CHART_CODE: {
            let { celluid, explorerChartCode } = action.payload
            let newcell = Object.assign({},newstate[celluid])
            newcell.explorerChartCode = explorerChartCode
            newstate[celluid] = newcell
            return newstate
        }

        default:
            return state
    }
}

let defaultState = {
    type:undefined, branchuid:undefined, nodeuid:undefined,celluid:undefined, explorer:undefined,
}

let lastAction = (state = defaultState , action) => {
    // console.log('action',action)
    if (!action.payload && !(action.type == actiontypes.RESET_LAST_ACTION)) {
        let newstate = Object.assign({}, defaultState)
        newstate.type = action.type
        return newstate
    }

    let { type } = action
    let newstate = Object.assign({},state)
    switch (type) {
        case actiontypes.RESET_LAST_ACTION: {
            let newstate = Object.assign({}, defaultState)
            newstate.type = action.type
            newstate.explorer = action.meta.explorer
            return newstate
        }

        default: {
            if (action.meta) {
                newstate.explorer = action.meta.explorer
            }
            newstate.type = action.type
            newstate.branchuid = action.payload.branchuid
            newstate.nodeuid = action.payload.nodeuid
            newstate.celluid = action.payload.celluid
            return newstate
        }

    }
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
