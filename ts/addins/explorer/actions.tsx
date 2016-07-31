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
    export const REMOVE_NODES = 'REMOVE_NODES'
    export const ADD_CELLS = 'ADD_CELLS'
    export const UPDATE_CELL_SELECTION = 'UPDATE_CELL_SELECTION'
    export const UPDATE_CELL_CHART_CODE = 'UPDATE_CELL_CHART_CODE'
    // export const REMOVE_CELLS = 'REMOVE_CELLS'
    export const CHANGE_CHART_CODE = 'CHANGE_CHART_CODE'
    export const TOGGLE_DELTA = 'TOGGLE_DELTA'
    export const CHANGE_TAB = 'CHANGE_TAB'
    export const UPDATE_CELLS_DATASERIESNAME = 'UPDATE_CELLS_DATASERIESNAME'
}

export namespace branchTypes {
    export import ADD_NODE = types.ADD_NODE
    export import REMOVE_NODES = types.REMOVE_NODES
    export import CHANGE_VIEWPOINT = types.CHANGE_VIEWPOINT
    export import CHANGE_FACET = types.CHANGE_FACET
}

export namespace nodeTypes {
    export import ADD_CELLS = types.ADD_CELLS
    // export import REMOVE_CELLS = types.REMOVE_CELLS
    export import CHANGE_CHART_CODE = types.CHANGE_CHART_CODE
    export import TOGGLE_DELTA = types.TOGGLE_DELTA
    export import CHANGE_TAB = types.CHANGE_TAB
    export import UPDATE_CELLS_DATASERIESNAME = types.UPDATE_CELLS_DATASERIESNAME

}

export namespace cellTypes {
    export import UPDATE_CELL_SELECTION = types.UPDATE_CELL_SELECTION
    export import UPDATE_CELL_CHART_CODE = types.UPDATE_CELL_CHART_CODE
    export import CHANGE_FACET = types.CHANGE_FACET
}

// --------------------[ Branch ]---------------------

export const addBranchDeclaration = createAction(
    types.ADD_BRANCH,settings => ({
        settings,
        branchuid: uuid.v4(),
    })
)
    
export const removeBranchDeclaration = createAction(
    types.REMOVE_BRANCH,branchuid => ({
        branchuid,
    })
)

export const changeViewpoint = createAction(
    types.CHANGE_VIEWPOINT, (branchuid, viewpointname) => ({
        branchuid,
        viewpointname,        
    })
)

export const changeFacet = createAction(
    types.CHANGE_FACET, (branchuid, facetname) => ({ //, nodeidlist, cellidlist) => ({
        branchuid,
        facetname
        // nodeidlist,
        // cellidlist,        
    })
)

// ----------------------[ Node ]-----------------------------

export const changeTab = createAction(
    types.CHANGE_TAB, (nodeuid, tabvalue) => ({
        nodeuid,
        tabvalue,
    })
)

export const addNodeDeclaration = createAction(
    types.ADD_NODE,(branchuid,settings) => ({
        settings,
        nodeuid: uuid.v4(),
        branchuid,
    })
)

export const removeNodeDeclarations = createAction(
    types.REMOVE_NODES,(branchuid,items) => ({
        items,
        branchuid,
    })
)

// ---------------------[ Cell ]---------------------

const _addCellDeclaration = createAction(
    types.ADD_CELLS,(nodeuid,settings) => ({
        settings,
        nodeuid,
    })
)

export const addCellDeclarations = (nodeuid,settingslist) => {
    return dispatch => {
        for (let settings of settingslist) {
            settings.celluid = uuid.v4()
        }
        dispatch(_addCellDeclaration(nodeuid,settingslist))
    }
}

export const updateCellChartSelection = createAction(
    types.UPDATE_CELL_SELECTION,(celluid, selection) => ({
        celluid,
        selection,
    })
)

export const updateCellChartCode = createAction(
    types.UPDATE_CELL_CHART_CODE, (celluid, explorerChartCode) => ({
        celluid,
        explorerChartCode,
    })
)

interface CellDataseriesNameItem {
    celluid: string,
    nodeDataseriesName: string,
}

export const updateCellsDataseriesName = createAction(
    types.UPDATE_CELLS_DATASERIESNAME, (cellItemList:CellDataseriesNameItem[]) => ({
        cellItemList,
    })
)
    
// export const removeCellDeclarations = createAction(
//     types.REMOVE_CELLS,(nodeuid,uidlist) => ({
//         uidlist,
//         nodeuid,
//     })
// )
