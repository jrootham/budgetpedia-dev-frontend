"use strict";
const redux_actions_1 = require('redux-actions');
let uuid = require('node-uuid');
var types;
(function (types) {
    types.ADD_BRANCH = 'ADD_BRANCH';
    types.REMOVE_BRANCH = 'REMOVE_BRANCH';
    types.CHANGE_VIEWPOINT = 'CHANGE_VIEWPOINT';
    types.CHANGE_FACET = 'CHANGE_FACET';
    types.TOGGLE_INFLATION_ADJUSTED = 'TOGGLE_INFLATION_ADJUSTED';
    types.ADD_NODE = 'ADD_NODE';
    types.REMOVE_NODES = 'REMOVE_NODES';
    types.ADD_CELLS = 'ADD_CELLS';
    types.UPDATE_CELL_SELECTION = 'UPDATE_CELL_SELECTION';
    types.UPDATE_CELL_CHART_CODE = 'UPDATE_CELL_CHART_CODE';
    types.CHANGE_CHART_CODE = 'CHANGE_CHART_CODE';
    types.TOGGLE_DELTA = 'TOGGLE_DELTA';
    types.CHANGE_TAB = 'CHANGE_TAB';
    types.UPDATE_CELLS_DATASERIESNAME = 'UPDATE_CELLS_DATASERIESNAME';
})(types = exports.types || (exports.types = {}));
var branchTypes;
(function (branchTypes) {
    branchTypes.ADD_NODE = types.ADD_NODE;
    branchTypes.REMOVE_NODES = types.REMOVE_NODES;
    branchTypes.CHANGE_VIEWPOINT = types.CHANGE_VIEWPOINT;
    branchTypes.CHANGE_FACET = types.CHANGE_FACET;
})(branchTypes = exports.branchTypes || (exports.branchTypes = {}));
var nodeTypes;
(function (nodeTypes) {
    nodeTypes.ADD_CELLS = types.ADD_CELLS;
    nodeTypes.CHANGE_CHART_CODE = types.CHANGE_CHART_CODE;
    nodeTypes.TOGGLE_DELTA = types.TOGGLE_DELTA;
    nodeTypes.CHANGE_TAB = types.CHANGE_TAB;
    nodeTypes.UPDATE_CELLS_DATASERIESNAME = types.UPDATE_CELLS_DATASERIESNAME;
})(nodeTypes = exports.nodeTypes || (exports.nodeTypes = {}));
var cellTypes;
(function (cellTypes) {
    cellTypes.UPDATE_CELL_SELECTION = types.UPDATE_CELL_SELECTION;
    cellTypes.UPDATE_CELL_CHART_CODE = types.UPDATE_CELL_CHART_CODE;
    cellTypes.CHANGE_FACET = types.CHANGE_FACET;
})(cellTypes = exports.cellTypes || (exports.cellTypes = {}));
exports.addBranchDeclaration = redux_actions_1.createAction(types.ADD_BRANCH, settings => ({
    settings: settings,
    branchuid: uuid.v4(),
}));
exports.removeBranchDeclaration = redux_actions_1.createAction(types.REMOVE_BRANCH, branchuid => ({
    branchuid: branchuid,
}));
exports.changeViewpoint = redux_actions_1.createAction(types.CHANGE_VIEWPOINT, (branchuid, viewpointname) => ({
    branchuid: branchuid,
    viewpointname: viewpointname,
}));
exports.changeFacet = redux_actions_1.createAction(types.CHANGE_FACET, (branchuid, facetname) => ({
    branchuid: branchuid,
    facetname: facetname
}));
exports.changeTab = redux_actions_1.createAction(types.CHANGE_TAB, (branchuid, nodeuid, tabvalue) => ({
    nodeuid: nodeuid,
    tabvalue: tabvalue,
    branchuid: branchuid,
}));
exports.addNodeDeclaration = redux_actions_1.createAction(types.ADD_NODE, (branchuid, settings) => ({
    settings: settings,
    nodeuid: uuid.v4(),
    branchuid: branchuid,
}));
exports.removeNodeDeclarations = redux_actions_1.createAction(types.REMOVE_NODES, (branchuid, items) => ({
    items: items,
    branchuid: branchuid,
}));
const _addCellDeclaration = redux_actions_1.createAction(types.ADD_CELLS, (nodeuid, settings) => ({
    settings: settings,
    nodeuid: nodeuid,
}));
exports.addCellDeclarations = (nodeuid, settingslist) => {
    return dispatch => {
        for (let settings of settingslist) {
            settings.celluid = uuid.v4();
        }
        dispatch(_addCellDeclaration(nodeuid, settingslist));
    };
};
exports.updateCellChartSelection = redux_actions_1.createAction(types.UPDATE_CELL_SELECTION, (branchuid, nodeuid, celluid, selection) => ({
    celluid: celluid,
    selection: selection,
    nodeuid: nodeuid,
    branchuid: branchuid,
}));
exports.updateCellChartCode = redux_actions_1.createAction(types.UPDATE_CELL_CHART_CODE, (celluid, explorerChartCode) => ({
    celluid: celluid,
    explorerChartCode: explorerChartCode,
}));
exports.updateCellsDataseriesName = redux_actions_1.createAction(types.UPDATE_CELLS_DATASERIESNAME, (cellItemList) => ({
    cellItemList: cellItemList,
}));
