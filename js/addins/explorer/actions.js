"use strict";
const redux_actions_1 = require('redux-actions');
let uuid = require('node-uuid');
var types;
(function (types) {
    types.ADD_BRANCH = 'ADD_BRANCH';
    types.REMOVE_BRANCH = 'REMOVE_BRANCH';
    types.CHANGE_VIEWPOINT = 'CHANGE_VIEWPOINT';
    types.CHANGE_VERSION = 'CHANGE_VERSION';
    types.CHANGE_ASPECT = 'CHANGE_ASPECT';
    types.TOGGLE_INFLATION_ADJUSTED = 'TOGGLE_INFLATION_ADJUSTED';
    types.TOGGLE_SHOW_OPTIONS = 'TOGGLE_SHOW_OPTIONS';
    types.ADD_NODE = 'ADD_NODE';
    types.REMOVE_NODES = 'REMOVE_NODES';
    types.RESET_LAST_ACTION = 'RESET_LAST_ACTION';
    types.BRANCH_MOVE_UP = 'BRANCH_MOVE_UP';
    types.BRANCH_MOVE_DOWN = 'BRANCH_MOVE_DOWN';
    types.ADD_CELLS = 'ADD_CELLS';
    types.CHANGE_TAB = 'CHANGE_TAB';
    types.UPDATE_CELLS_DATASERIESNAME = 'UPDATE_CELLS_DATASERIESNAME';
    types.UPDATE_CELL_SELECTION = 'UPDATE_CELL_SELECTION';
    types.UPDATE_CELL_TIMECODE = 'UPDATE_CELL_TIMECODE';
    types.UPDATE_CELL_CHART_CODE = 'UPDATE_CELL_CHART_CODE';
    types.TOGGLE_DELTA = 'TOGGLE_DELTA';
    types.TOGGLE_NET = 'TOGGLE_NET';
    types.TOGGLE_VARIANCE = 'TOGGLE_VARIANCE';
})(types = exports.types || (exports.types = {}));
var branchTypes;
(function (branchTypes) {
    branchTypes.ADD_NODE = types.ADD_NODE;
    branchTypes.REMOVE_NODES = types.REMOVE_NODES;
    branchTypes.CHANGE_VIEWPOINT = types.CHANGE_VIEWPOINT;
    branchTypes.CHANGE_VERSION = types.CHANGE_VERSION;
    branchTypes.CHANGE_ASPECT = types.CHANGE_ASPECT;
    branchTypes.TOGGLE_INFLATION_ADJUSTED = types.TOGGLE_INFLATION_ADJUSTED;
    branchTypes.TOGGLE_SHOW_OPTIONS = types.TOGGLE_SHOW_OPTIONS;
})(branchTypes = exports.branchTypes || (exports.branchTypes = {}));
var nodeTypes;
(function (nodeTypes) {
    nodeTypes.ADD_CELLS = types.ADD_CELLS;
    nodeTypes.CHANGE_TAB = types.CHANGE_TAB;
    nodeTypes.UPDATE_CELLS_DATASERIESNAME = types.UPDATE_CELLS_DATASERIESNAME;
})(nodeTypes = exports.nodeTypes || (exports.nodeTypes = {}));
var cellTypes;
(function (cellTypes) {
    cellTypes.UPDATE_CELL_SELECTION = types.UPDATE_CELL_SELECTION;
    cellTypes.UPDATE_CELL_TIMECODE = types.UPDATE_CELL_TIMECODE;
    cellTypes.UPDATE_CELL_CHART_CODE = types.UPDATE_CELL_CHART_CODE;
    cellTypes.TOGGLE_DELTA = types.TOGGLE_DELTA;
    cellTypes.TOGGLE_NET = types.TOGGLE_NET;
    cellTypes.TOGGLE_VARIANCE = types.TOGGLE_VARIANCE;
})(cellTypes = exports.cellTypes || (exports.cellTypes = {}));
exports.addBranchDeclaration = redux_actions_1.createAction(types.ADD_BRANCH, (refbranchuid, settings) => ({
    settings: settings,
    branchuid: uuid.v4(),
    refbranchuid: refbranchuid,
}), () => ({
    explorer: true
}));
exports.removeBranchDeclaration = redux_actions_1.createAction(types.REMOVE_BRANCH, branchuid => ({
    branchuid: branchuid,
}), () => ({
    explorer: true
}));
exports.changeViewpoint = redux_actions_1.createAction(types.CHANGE_VIEWPOINT, (branchuid, viewpointname) => ({
    branchuid: branchuid,
    viewpointname: viewpointname,
}), () => ({
    explorer: true
}));
exports.changeVersion = redux_actions_1.createAction(types.CHANGE_VERSION, (branchuid, versionname) => ({
    branchuid: branchuid,
    versionname: versionname,
}), () => ({
    explorer: true
}));
exports.changeAspect = redux_actions_1.createAction(types.CHANGE_ASPECT, (branchuid, aspectname) => ({
    branchuid: branchuid,
    aspectname: aspectname,
}), () => ({
    explorer: true
}));
exports.toggleShowOptions = redux_actions_1.createAction(types.TOGGLE_SHOW_OPTIONS, (branchuid, value) => ({
    branchuid: branchuid,
    value: value,
}), () => ({
    explorer: true
}));
exports.changeTab = redux_actions_1.createAction(types.CHANGE_TAB, (branchuid, nodeuid, tabvalue) => ({
    nodeuid: nodeuid,
    tabvalue: tabvalue,
    branchuid: branchuid,
}), () => ({
    explorer: true
}));
exports.addNodeDeclaration = redux_actions_1.createAction(types.ADD_NODE, (branchuid, settings) => ({
    settings: settings,
    nodeuid: uuid.v4(),
    branchuid: branchuid,
}), () => ({
    explorer: true
}));
exports.removeNodeDeclarations = redux_actions_1.createAction(types.REMOVE_NODES, (branchuid, items) => ({
    items: items,
    branchuid: branchuid,
}), () => ({
    explorer: true
}));
const _addCellDeclaration = redux_actions_1.createAction(types.ADD_CELLS, (branchuid, nodeuid, settings) => ({
    branchuid: branchuid,
    settings: settings,
    nodeuid: nodeuid,
}), () => ({
    explorer: true
}));
exports.addCellDeclarations = (branchuid, nodeuid, settingslist) => {
    return dispatch => {
        for (let settings of settingslist) {
            settings.celluid = uuid.v4();
        }
        dispatch(_addCellDeclaration(branchuid, nodeuid, settingslist));
    };
};
exports.updateCellChartSelection = redux_actions_1.createAction(types.UPDATE_CELL_SELECTION, (branchuid, nodeuid, celluid, selection) => ({
    celluid: celluid,
    selection: selection,
    nodeuid: nodeuid,
    branchuid: branchuid,
}), () => ({
    explorer: true
}));
exports.updateCellChartCode = redux_actions_1.createAction(types.UPDATE_CELL_CHART_CODE, (branchuid, nodeuid, celluid, explorerChartCode) => ({
    branchuid: branchuid,
    nodeuid: nodeuid,
    celluid: celluid,
    explorerChartCode: explorerChartCode,
}), () => ({
    explorer: true
}));
exports.updateCellsDataseriesName = redux_actions_1.createAction(types.UPDATE_CELLS_DATASERIESNAME, (cellItemList) => ({
    cellItemList: cellItemList,
}), () => ({
    explorer: false
}));
exports.resetLastAction = redux_actions_1.createAction(types.RESET_LAST_ACTION, () => ({}), () => ({
    explorer: true
}));
exports.branchMoveUp = redux_actions_1.createAction(types.BRANCH_MOVE_UP, (branchuid) => ({
    branchuid: branchuid,
}), () => ({
    explorer: false
}));
exports.branchMoveDown = redux_actions_1.createAction(types.BRANCH_MOVE_DOWN, (branchuid) => ({
    branchuid: branchuid,
}), () => ({
    explorer: false
}));
