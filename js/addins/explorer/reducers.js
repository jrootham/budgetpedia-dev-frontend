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
            newstate = [...state, action.payload.uid];
            return newstate;
        case actions_1.types.REMOVE_BRANCH:
            newstate = state.filter(item => item != action.payload.uid);
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
            newstate = Object.assign({}, state, { [action.payload.uid]: action.payload.settings });
            return newstate;
        }
        case actions_1.types.REMOVE_BRANCH: {
            newstate = Object.assign({}, state);
            delete newstate[action.payload.uid];
            return newstate;
        }
        case actions_1.types.ADD_NODE: {
            let { branchuid } = action.payload;
            newstate = Object.assign({}, state);
            newstate[branchuid] = Object.assign({}, newstate[branchuid]);
            newstate[branchuid].nodeList =
                [...state[branchuid].nodeList, action.payload.uid];
            return newstate;
        }
        case actions_1.types.REMOVE_NODES: {
            let { branchuid } = action.payload;
            newstate = Object.assign({}, state);
            let removelist = action.payload.items;
            let newList = newstate[branchuid].nodeList.filter((uid) => {
                let foundlist = removelist.filter(item => {
                    return item.uid == uid;
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
            let node = state[action.payload.uid] || {};
            node = Object.assign(node, action.payload.settings);
            newstate = Object.assign({}, state, { [action.payload.uid]: node });
            return newstate;
        }
        case actions_1.types.REMOVE_NODES: {
            newstate = Object.assign({}, state);
            let removelist = action.payload.items;
            for (let removeitem of removelist) {
                delete newstate[removeitem.uid];
            }
            return newstate;
        }
        case actions_1.types.ADD_CELLS: {
            let newstate = Object.assign({}, state);
            let nodeuid = action.payload.nodeuid;
            let newnode = newstate[nodeuid] = Object.assign({}, newstate[nodeuid]);
            newnode.cellList = newnode.cellList || [];
            let newcellList = action.payload.settings.map(setting => setting.uid);
            newnode.cellList = [...newnode.cellList, ...newcellList];
            newstate[nodeuid] = newnode;
            return newstate;
        }
        default:
            return state;
    }
};
let cellsById = (state = {}, action) => {
    let { type } = action;
    let newstate;
    switch (type) {
        case actions_1.types.ADD_CELLS: {
            newstate = Object.assign({}, state);
            for (let setting of action.payload.settings) {
                newstate[setting.uid] = setting;
            }
            return newstate;
        }
        case actions_1.types.REMOVE_NODES: {
            newstate = Object.assign({}, state);
            for (let removeitem of action.payload.items) {
                for (let celluid of removeitem.cellList)
                    delete newstate[celluid];
            }
            return newstate;
        }
        default:
            return state;
    }
};
let lastAction = (state = null, action) => {
    return action.type;
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
