"use strict";
const redux_1 = require('redux');
const initialstate_1 = require("../../local/initialstate");
const actions_1 = require('./actions');
let generationcounter = 0;
let defaults = (state = initialstate_1.default.explorer.defaults, action) => {
    return state;
};
let branchList = (state = [], action) => {
    let { type } = action;
    let newstate;
    switch (type) {
        case actions_1.types.ADD_BRANCH:
            newstate = [...state, action.payload.branchuid];
            return newstate;
        case actions_1.types.REMOVE_BRANCH:
            newstate = state.filter(item => item != action.payload.branchuid);
            return newstate;
        default:
            return state;
    }
};
let branchesById = (state = {}, action) => {
    let { type } = action;
    let newstate;
    switch (type) {
        case actions_1.types.ADD_BRANCH: {
            newstate = Object.assign({}, state, { [action.payload.branchuid]: action.payload.settings });
            return newstate;
        }
        case actions_1.types.REMOVE_BRANCH: {
            newstate = Object.assign({}, state);
            delete newstate[action.payload.branchuid];
            return newstate;
        }
        case actions_1.types.ADD_NODE: {
            let { branchuid } = action.payload;
            newstate = Object.assign({}, state);
            newstate[branchuid] = Object.assign({}, newstate[branchuid]);
            newstate[branchuid].nodeList =
                [...state[branchuid].nodeList, action.payload.nodeuid];
            return newstate;
        }
        case actions_1.types.REMOVE_NODES: {
            let { branchuid } = action.payload;
            newstate = Object.assign({}, state);
            let removelist = action.payload.items;
            let newList = newstate[branchuid].nodeList.filter((nodeuid) => {
                let foundlist = removelist.filter(item => {
                    return item.nodeuid == nodeuid;
                });
                return foundlist.length == 0;
            });
            newstate[branchuid].nodeList = newList;
            return newstate;
        }
        case actions_1.types.CHANGE_VIEWPOINT: {
            let { branchuid } = action.payload;
            newstate = Object.assign({}, state);
            newstate[branchuid] = Object.assign({}, newstate[branchuid]);
            newstate[branchuid].viewpoint = action.payload.viewpointname;
            return newstate;
        }
        case actions_1.types.CHANGE_FACET: {
            let { branchuid } = action.payload;
            newstate = Object.assign({}, state);
            newstate[branchuid] = Object.assign({}, newstate[branchuid]);
            newstate[branchuid].facet = action.payload.facetname;
            return newstate;
        }
        default:
            return state;
    }
};
let nodesById = (state = {}, action) => {
    let { type } = action;
    let newstate;
    switch (type) {
        case actions_1.types.ADD_NODE: {
            let node = state[action.payload.nodeuid] || {};
            node = Object.assign(node, action.payload.settings);
            newstate = Object.assign({}, state, { [action.payload.nodeuid]: node });
            return newstate;
        }
        case actions_1.types.REMOVE_NODES: {
            newstate = Object.assign({}, state);
            let removelist = action.payload.items;
            for (let removeitem of removelist) {
                delete newstate[removeitem.nodeuid];
            }
            return newstate;
        }
        case actions_1.types.ADD_CELLS: {
            let newstate = Object.assign({}, state);
            let nodeuid = action.payload.nodeuid;
            let newnode = Object.assign({}, newstate[nodeuid]);
            newnode.cellList = newnode.cellList || [];
            let newcellList = action.payload.settings.map(setting => setting.celluid);
            newnode.cellList = [...newnode.cellList, ...newcellList];
            newstate[nodeuid] = newnode;
            return newstate;
        }
        case actions_1.types.CHANGE_TAB: {
            let newstate = Object.assign({}, state);
            let { nodeuid } = action.payload;
            let newnode = Object.assign({}, newstate[action.payload.nodeuid]);
            newnode.cellIndex = action.payload.tabvalue;
            newstate[nodeuid] = newnode;
            return newstate;
        }
        default:
            return state;
    }
};
let cellsById = (state = {}, action) => {
    let { type } = action;
    let newstate = Object.assign({}, state);
    switch (type) {
        case actions_1.types.ADD_CELLS: {
            for (let setting of action.payload.settings) {
                newstate[setting.celluid] = setting;
            }
            return newstate;
        }
        case actions_1.types.REMOVE_NODES: {
            for (let removeitem of action.payload.items) {
                for (let celluid of removeitem.cellList)
                    delete newstate[celluid];
            }
            return newstate;
        }
        case actions_1.types.UPDATE_CELL_SELECTION: {
            let { celluid } = action.payload;
            let newcell = Object.assign({}, newstate[celluid]);
            newcell.chartSelection = action.payload.selection;
            newstate[celluid] = newcell;
            return newstate;
        }
        case actions_1.types.UPDATE_CELLS_DATASERIESNAME: {
            let cellItems = action.payload.cellItemList;
            for (let cellItem of cellItems) {
                let { celluid } = cellItem;
                let newcell = Object.assign({}, newstate[celluid]);
                newcell.nodeDataseriesName = cellItem.nodeDataseriesName;
                newstate[celluid] = newcell;
            }
            return newstate;
        }
        case actions_1.types.UPDATE_CELL_CHART_CODE: {
            let { celluid, explorerChartCode } = action.payload;
            let newcell = Object.assign({}, newstate[celluid]);
            newcell.explorerChartCode = explorerChartCode;
            newstate[celluid] = newcell;
            return newstate;
        }
        default:
            return state;
    }
};
let defaultState = {
    type: undefined, branchuid: undefined, nodeuid: undefined, celluid: undefined,
};
let lastAction = (state = defaultState, action) => {
    if (!action.payload) {
        let newstate = Object.assign({}, defaultState);
        newstate.type = action.type;
        return state;
    }
    let newstate = Object.assign({}, state);
    newstate.type = action.type;
    newstate.branchuid = action.payload.branchuid;
    newstate.nodeuid = action.payload.nodeuid;
    newstate.celluid = action.payload.celluid;
    return newstate;
};
let generation = (state = null, action) => {
    return generationcounter++;
};
let explorer = redux_1.combineReducers({
    defaults: defaults,
    branchList: branchList,
    branchesById: branchesById,
    nodesById: nodesById,
    cellsById: cellsById,
    lastAction: lastAction,
    generation: generation,
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = explorer;
exports.getExplorerDeclarationData = state => state.explorer;
