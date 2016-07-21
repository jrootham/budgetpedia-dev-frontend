"use strict";
const redux_actions_1 = require('redux-actions');
let uuid = require('node-uuid');
var types;
(function (types) {
    types.ADD_BRANCH = 'ADD_BRANCH';
    types.REMOVE_BRANCH = 'REMOVE_BRANCH';
    types.ADD_NODE = 'ADD_NODE';
    types.REMOVE_NODE = 'REMOVE_NODE';
    types.ADD_CELL = 'ADD_CELL';
    types.REMOVE_CELL = 'REMOVE_CELL';
    types.CHANGE_VIEWPOINT = 'CHANGE_VIEWPOINT';
    types.CHANGE_FACET = 'CHANGE_FACET';
})(types = exports.types || (exports.types = {}));
var branchtypes;
(function (branchtypes) {
    branchtypes.ADD_NODE = types.ADD_NODE;
    branchtypes.REMOVE_NODE = types.REMOVE_NODE;
    branchtypes.CHANGE_VIEWPOINT = types.CHANGE_VIEWPOINT;
    branchtypes.CHANGE_FACET = types.CHANGE_FACET;
})(branchtypes = exports.branchtypes || (exports.branchtypes = {}));
exports.addBranchDeclaration = redux_actions_1.createAction(types.ADD_BRANCH, settings => ({
    settings: settings,
    uid: uuid.v4(),
}));
exports.removeBranchDeclaration = redux_actions_1.createAction(types.REMOVE_BRANCH, uid => ({
    uid: uid,
}));
exports.changeViewpoint = redux_actions_1.createAction(types.CHANGE_VIEWPOINT, (branchuid, viewpointname) => ({
    branchuid: branchuid,
    viewpointname: viewpointname,
}));
exports.changeFacet = redux_actions_1.createAction(types.CHANGE_FACET, (branchuid, facetname) => ({
    branchuid: branchuid,
    facetname: facetname,
}));
exports.addNodeDeclaration = redux_actions_1.createAction(types.ADD_NODE, (branchuid, settings) => ({
    settings: settings,
    uid: uuid.v4(),
    branchuid: branchuid,
}));
exports.removeNodeDeclaration = redux_actions_1.createAction(types.REMOVE_NODE, (branchuid, uid) => ({
    uid: uid,
    branchuid: branchuid,
}));
exports.addCellDeclaration = redux_actions_1.createAction(types.ADD_CELL, (nodeuid, settings) => ({
    settings: settings,
    uid: uuid.v4(),
    nodeuid: nodeuid,
}));
exports.removeCellDeclaration = redux_actions_1.createAction(types.REMOVE_CELL, (nodeuid, uid) => ({
    uid: uid,
    nodeuid: nodeuid,
}));
