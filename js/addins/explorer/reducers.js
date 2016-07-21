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
        case actions_1.types.REMOVE_NODE: {
            let { branchuid } = action.payload;
            newstate = Object.assign({}, state);
            let removelist = action.payload.uid;
            if (!Array.isArray(removelist)) {
                removelist = [removelist];
            }
            let newList = newstate[branchuid].nodeList.filter((uid) => {
                return (removelist.indexOf(uid) == -1);
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
        case actions_1.types.ADD_NODE:
            let node = state[action.payload.uid] || {};
            node = Object.assign(node, action.payload.settings);
            newstate = Object.assign({}, state, { [action.payload.uid]: node });
            return newstate;
        case actions_1.types.REMOVE_NODE:
            newstate = Object.assign({}, state);
            let removelist = action.payload.uid;
            if (!Array.isArray(removelist)) {
                removelist = [removelist];
            }
            for (let removeid of removelist) {
                delete newstate[removeid];
            }
            return newstate;
        default:
            return state;
    }
};
let cellsById = (state = {}, action) => {
    return state;
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
