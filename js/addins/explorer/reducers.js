"use strict";
const redux_1 = require('redux');
const initialstate_1 = require("../../local/initialstate");
let defaults = (state = initialstate_1.default.explorer.defaults, action) => {
    return state;
};
let branchList = (state = [], action) => {
    return state;
};
let branchesById = (state = {}, action) => {
    return state;
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
