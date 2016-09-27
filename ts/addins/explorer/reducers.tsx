// explorer reducers.tsx
import { combineReducers } from 'redux'
import initialstate from "../../local/initialstate"
import { types as actiontypes} from './actions'
import { BranchSettings } from './modules/interfaces'
import { TimeScope } from './constants'

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
                console.error('System Error: branchuid for move up at beginning of list already', branchuid, newstate)
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
                console.error('System Error: branchuid for move down at end of list already', branchuid, newstate)
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
            let newbranchstate:BranchSettings = Object.assign({},newstate[branchuid])
            newbranchstate.viewpoint = action.payload.viewpointname
            newbranchstate.version = newbranchstate.defaultVersions[newbranchstate.viewpoint]
            newbranchstate.aspect = newbranchstate.defaultAspects[newbranchstate.version]          
            newstate[branchuid] = newbranchstate
            return newstate
        }

        case actiontypes.CHANGE_VERSION: {
            let { branchuid } = action.payload
            newstate = Object.assign({},state)
            let newbranchstate:BranchSettings = Object.assign({},newstate[branchuid])
            newbranchstate.version = action.payload.versionname
            newbranchstate.aspect = newbranchstate.defaultAspects[newbranchstate.version]          
            newstate[branchuid] = newbranchstate
            return newstate
        }

        case actiontypes.CHANGE_ASPECT: {
            let { branchuid } = action.payload
            newstate = Object.assign({},state)
            newstate[branchuid] = Object.assign({},newstate[branchuid])
            newstate[branchuid].aspect = action.payload.aspectname
            return newstate
        }

        case actiontypes.TOGGLE_SHOW_OPTIONS: {
            let { branchuid } = action.payload
            newstate = Object.assign({},state)
            newstate[branchuid] = Object.assign({},newstate[branchuid])
            newstate[branchuid].showOptions = action.payload.value
            return newstate
        }

        case actiontypes.CHANGE_BRANCH_DATA: {
            let { branchuid } = action.payload
            newstate = Object.assign({},state)
            newstate[branchuid] = Object.assign({},newstate[branchuid])
            newstate[branchuid].branchDataGeneration++
            // console.log('reducer changed data counter',newstate[branchuid].branchDataGeneration)
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

        // TODO empty chartSlection - empty array rather than null
        case actiontypes.UPDATE_CELL_SELECTION: {

            let { celluid } = action.payload
            let newcell = Object.assign({},newstate[celluid])

            let chartSelection = action.payload.selection
            // console.log('chartSelection',chartSelection)
            if (Array.isArray(chartSelection) && chartSelection.length == 0) {
                chartSelection = null
            }
            // newcell.chartSelection = chartSelection

            let newChartConfigs = Object.assign({},newcell.chartConfigs)
            let yearSettings = Object.assign({},newChartConfigs[newcell.yearScope])
            yearSettings.chartSelection = chartSelection
            newChartConfigs[newcell.yearScope] = yearSettings
            newcell.chartConfigs = newChartConfigs

            newstate[celluid] = newcell

            // console.log('newstate from selection',newstate)
            return newstate
        }

        // case actiontypes.UPDATE_CELLS_DATASERIESNAME: {

        //     let cellItems = action.payload.cellItemList
        //     for ( let cellItem of cellItems) {
        //         let { celluid } = cellItem
        //         let newcell = Object.assign({},newstate[celluid])
        //         newcell.nodeDataseriesName = cellItem.nodeDataseriesName
        //         newstate[celluid] = newcell
        //     }
        //     return newstate
        // }

        case actiontypes.UPDATE_CELL_CHART_CODE: {

            let { celluid, explorerChartCode } = action.payload
            let newcell = Object.assign({},newstate[celluid])

            let newChartConfigs = Object.assign({},newcell.chartConfigs)
            let yearSettings = Object.assign({},newChartConfigs[newcell.yearScope])
            yearSettings.explorerChartCode = explorerChartCode
            newChartConfigs[newcell.yearScope] = yearSettings
            newcell.chartConfigs = newChartConfigs

            newstate[celluid] = newcell
            // console.log('newstate from chart code',newstate)
            return newstate

        }

        case actiontypes.UPDATE_CELL_YEAR_SELECTIONS: {

            let { celluid, leftyear, rightyear } = action.payload
            let newcell = Object.assign({},newstate[celluid])

            let newYearSelections = Object.assign({},newcell.yearSelections)

            newYearSelections.leftYear = leftyear
            newYearSelections.rightYear = rightyear

            newcell.yearSelections = newYearSelections

            newstate[celluid] = newcell

            return newstate
        }

        case actiontypes.NORMALIZE_CELL_YEAR_DEPENDENCIES: {
            let { cellList, yearsRange } = action.payload
            let { start: startYear, end: endYear } = yearsRange
            let yearSpan = endYear - startYear
            // console.log('NORMALIZE_CELL_YEAR_DEPENDENCIES', cellList, yearsRange, startYear, endYear, yearSpan)
            for (let celluid of cellList) {
                // console.log('BEFORE',newstate[celluid])
                let newcell = Object.assign({},newstate[celluid])
                if ( yearSpan == 0 ) {
                    newcell.yearScope = TimeScope[TimeScope.OneYear]
                }
                let range = Object.assign({}, newcell.yearSelections)
                if ( range.leftYear < startYear || range.leftYear > endYear ) {
                    range.leftYear = startYear
                }
                if ( range.rightYear > endYear || range.rightYear < startYear ) {
                    range.rightYear = endYear
                }
                newcell.yearSelections = range
                newstate[celluid] = newcell
                // console.log('AFTER',newstate[celluid])
            }

            return newstate
        }

        default:
            return state
    }
}

let lastActionDefaultState = {
    type:undefined, branchuid:undefined, nodeuid:undefined,celluid:undefined, explorer:undefined,
    generation:null,
}

let lastAction = (state = lastActionDefaultState , action) => {

    // console.log('lastAction from source', action, generationcounter)

    let newstate = Object.assign({},state)
    if (!action.payload && !(action.type == actiontypes.RESET_LAST_ACTION)) {
        let newstate = Object.assign({}, lastActionDefaultState)
        newstate.type = action.type
        return newstate
    }

    let { type } = action
    switch (type) {
        case actiontypes.RESET_LAST_ACTION: {
            let newstate = Object.assign({}, lastActionDefaultState)
            newstate.type = action.type
            newstate.explorer = action.meta.explorer
            newstate.generation = generationcounter
            return newstate
        }

        default: {
            if (action.meta) {
                newstate.explorer = action.meta.explorer
            }
            let { payload } = action
            newstate.type = action.type
            newstate.branchuid = payload.branchuid
            newstate.nodeuid = payload.nodeuid
            newstate.celluid = payload.celluid
            newstate.generation = generationcounter
            // console.log('lastaction newstate', newstate)
            return newstate
        }

    }
}

/*
    There's a race condition which overwrites lastAction before being distributed.
    This compensates by saveing types by uid rather than type
*/
let lastTargetedAction = (state = {counter:null} , action) => {

    if (!action.payload || !action.meta ) {
        return state
    }
    let { payload } = action

    if (!payload.branchuid && !payload.nodeuid && !payload.celluid) {
        return state
    }

    let newstate = Object.assign({},state)

    switch (action.type) {
        case actiontypes.REMOVE_BRANCH:
            delete newstate[payload.branchuid]
            return newstate
        case actiontypes.REMOVE_NODES:
            delete newstate[payload.nodeuid]
            for (let removeitem of payload.items) {
                for (let celluid of removeitem.cellList)
                    delete newstate[celluid]
            }
            return newstate
    }

    if (payload.branchuid) {
        newstate[payload.branchuid] = {
            type: action.type,
            generation: generationcounter,
            branch:true,
        }
    }

    if (payload.nodeuid) {
        newstate[payload.nodeuid] = {
            type: action.type,
            generation: generationcounter,
            node: true
        }
    }

    if (payload.celluid) {
        newstate[payload.celluid] = {
            type: action.type,
            generation: generationcounter,
            cell: true,
        }
    }

    newstate.counter = {generation:generationcounter}

    return newstate

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
        lastTargetedAction,
        generation,
})

export default explorer

export const getExplorerDeclarationData = state => state.explorer
