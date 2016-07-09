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
})(types = exports.types || (exports.types = {}));
exports.addBranch = redux_actions_1.createAction(types.ADD_BRANCH, settings => ({
    settings: settings,
    uid: uuid.v4(),
}));
exports.removeBranch = redux_actions_1.createAction(types.REMOVE_BRANCH, uid => ({
    uid: uid,
}));
exports.addNode = redux_actions_1.createAction(types.ADD_NODE, (branchuid, settings) => ({
    settings: settings,
    uid: uuid.v4(),
    branchuid: branchuid,
}));
exports.removeNode = redux_actions_1.createAction(types.REMOVE_NODE, (branchuid, uid) => ({
    uid: uid,
    branchuid: branchuid,
}));
exports.addCell = redux_actions_1.createAction(types.ADD_CELL, (nodeuid, settings) => ({
    settings: settings,
    uid: uuid.v4(),
    nodeuid: nodeuid,
}));
exports.removeCell = redux_actions_1.createAction(types.REMOVE_CELL, (nodeuid, uid) => ({
    uid: uid,
    nodeuid: nodeuid,
}));
