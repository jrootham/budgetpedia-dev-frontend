"use strict";
const redux_1 = require('redux');
const initialstate_1 = require("../../local/initialstate");
const actions_1 = require('./actions');
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
        case actions_1.types.ADD_BRANCH:
            newstate = Object.assign({}, state, { [action.payload.uid]: action.payload.settings });
            return newstate;
        case actions_1.types.REMOVE_BRANCH:
            newstate = Object.assign({}, state);
            delete newstate[action.payload.uid];
            return newstate;
        default:
            return state;
    }
};
let nodesById = (state = {}, action) => {
    return state;
};
let cellsById = (state = {}, action) => {
    return state;
};
let explorer = redux_1.combineReducers({
    defaults: defaults,
    branchList: branchList,
    branchesById: branchesById,
    nodesById: nodesById,
    cellsById: cellsById,
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = explorer;
exports.getExplorerControlData = state => state.explorer;
