// actions.tsx
import { createAction } from 'redux-actions';
let uuid = require('node-uuid') // use uuid.v4() for unique id

export namespace types {
    export const ADD_BRANCH = 'ADD_BRANCH'
    export const REMOVE_BRANCH = 'REMOVE_BRANCH'
    export const CHANGE_VIEWPOINT = 'CHANGE_VIEWPOINT'
    export const CHANGE_VERSION = 'CHANGE_VERSION'
    export const CHANGE_ASPECT = 'CHANGE_ASPECT'
    export const TOGGLE_INFLATION_ADJUSTED = 'TOGGLE_INFLATION_ADJUSTED'
    export const TOGGLE_SHOW_OPTIONS = 'TOGGLE_SHOW_OPTIONS'
    export const ADD_NODE = 'ADD_NODE'
    export const REMOVE_NODES = 'REMOVE_NODES'
    export const RESET_LAST_ACTION = 'RESET_LAST_ACTION'
    export const BRANCH_MOVE_UP = 'BRANCH_MOVE_UP'
    export const BRANCH_MOVE_DOWN = 'BRANCH_MOVE_DOWN'

    export const ADD_CELLS = 'ADD_CELLS'
    export const CHANGE_TAB = 'CHANGE_TAB'
    export const UPDATE_CELLS_DATASERIESNAME = 'UPDATE_CELLS_DATASERIESNAME'
    
    export const UPDATE_CELL_SELECTION = 'UPDATE_CELL_SELECTION'
    export const UPDATE_CELL_CHART_CODE = 'UPDATE_CELL_CHART_CODE'
    export const TOGGLE_DELTA = 'TOGGLE_DELTA'
}

export namespace branchTypes {
    export import ADD_NODE = types.ADD_NODE
    export import REMOVE_NODES = types.REMOVE_NODES
    export import CHANGE_VIEWPOINT = types.CHANGE_VIEWPOINT
    export import CHANGE_VERSION = types.CHANGE_VERSION
    export import CHANGE_ASPECT = types.CHANGE_ASPECT
    export import TOGGLE_INFLATION_ADJUSTED = types.TOGGLE_INFLATION_ADJUSTED
    export import TOGGLE_SHOW_OPTIONS = types.TOGGLE_SHOW_OPTIONS
    
}

export namespace nodeTypes {
    export import ADD_CELLS = types.ADD_CELLS
    export import CHANGE_TAB = types.CHANGE_TAB
    export import UPDATE_CELLS_DATASERIESNAME = types.UPDATE_CELLS_DATASERIESNAME

}

export namespace cellTypes {
    export import TOGGLE_DELTA = types.TOGGLE_DELTA
    export import UPDATE_CELL_SELECTION = types.UPDATE_CELL_SELECTION
    export import UPDATE_CELL_CHART_CODE = types.UPDATE_CELL_CHART_CODE
}

// --------------------[ Branch ]---------------------

export const addBranchDeclaration = createAction(
    types.ADD_BRANCH,(refbranchuid, settings) => ({
        settings,
        branchuid: uuid.v4(),
        refbranchuid,
    }), () => ({
        explorer:true
    })
)
    
export const removeBranchDeclaration = createAction(
    types.REMOVE_BRANCH,branchuid => ({
        branchuid, 
    }), () => ({
        explorer:true
    })
)

export const changeViewpoint = createAction(
    types.CHANGE_VIEWPOINT, (branchuid, viewpointname) => ({
        branchuid,
        viewpointname,        
    }), () => ({
        explorer:true
    })
)

export const changeVersion = createAction(
    types.CHANGE_VERSION, (branchuid, versionname) => ({
        branchuid,
        versionname,        
    }), () => ({
        explorer:true
    })
)

export const changeAspect = createAction(
    types.CHANGE_ASPECT, (branchuid, aspectname) => ({ //, nodeidlist, cellidlist) => ({
        branchuid,
        aspectname,
        // nodeidlist,
        // cellidlist,        
    }), () => ({
        explorer:true
    })
)

export const toggleShowOptions = createAction(
    types.TOGGLE_SHOW_OPTIONS, (branchuid, value) => ({
        branchuid,
        value,        
    }), () => ({
        explorer:true
    })
)

// ----------------------[ Node ]-----------------------------

export const changeTab = createAction(
    types.CHANGE_TAB, (branchuid, nodeuid, tabvalue) => ({
        nodeuid,
        tabvalue,
        branchuid,
    }), () => ({
        explorer:true
    })
)

export const addNodeDeclaration = createAction(
    types.ADD_NODE,(branchuid,settings) => ({
        settings,
        nodeuid: uuid.v4(),
        branchuid,
    }), () => ({
        explorer:true
    })
)

export const removeNodeDeclarations = createAction(
    types.REMOVE_NODES,(branchuid,items) => ({
        items,
        branchuid,
    }), () => ({
        explorer:true
    })
)

// ---------------------[ Cell ]---------------------

const _addCellDeclaration = createAction(
    types.ADD_CELLS,(branchuid, nodeuid,settings) => ({
        branchuid,
        settings,
        nodeuid,
    }), () => ({
        explorer:true
    })
)

export const addCellDeclarations = (branchuid, nodeuid, settingslist) => {
    return dispatch => {
        for (let settings of settingslist) {
            settings.celluid = uuid.v4()
        }
        dispatch(_addCellDeclaration(branchuid,nodeuid,settingslist))
    }
}

export const updateCellChartSelection = createAction(
    types.UPDATE_CELL_SELECTION,(branchuid,nodeuid,celluid, selection) => ({
        celluid,
        selection,
        nodeuid,
        branchuid,
    }), () => ({
        explorer:true
    })
)

export const updateCellChartCode = createAction(
    types.UPDATE_CELL_CHART_CODE, (branchuid, nodeuid, celluid, explorerChartCode) => ({
        branchuid,
        nodeuid,
        celluid,
        explorerChartCode,
    }), () => ({
        explorer:true
    })
)

interface CellDataseriesNameItem {
    celluid: string,
    nodeDataseriesName: string,
}

export const updateCellsDataseriesName = createAction(
    types.UPDATE_CELLS_DATASERIESNAME, (cellItemList:CellDataseriesNameItem[]) => ({
        cellItemList,
    }), () => ({
        explorer:false // state change only!
    })
)

export const resetLastAction = createAction(
    types.RESET_LAST_ACTION, () => ({

    }), () => ({
        explorer:true
    })
)
    
export const branchMoveUp = createAction(
    types.BRANCH_MOVE_UP, (branchuid) => ({
        branchuid,
    }), () => ({
        explorer:false
    })
)

export const branchMoveDown = createAction(
    types.BRANCH_MOVE_DOWN, (branchuid) => ({
        branchuid,
    }), () => ({
        explorer:false
    })
)

// export const removeCellDeclarations = createAction(
//     types.REMOVE_CELLS,(nodeuid,uidlist) => ({
//         uidlist,
//         nodeuid,
//     })
// )
