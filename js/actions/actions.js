var redux_actions_1 = require('redux-actions');
var react_router_redux_1 = require('react-router-redux');
exports.SET_TILECOLS = 'SET_TILECOLS';
exports.ADD_TILE = 'ADD_TILE';
exports.REMOVE_TILE = 'REMOVE_TILE';
exports.UPDATE_TILE = 'UPDATE_TILE';
exports.setTileCols = redux_actions_1.createAction(exports.SET_TILECOLS);
exports.transitionTo = route => {
    return dispatch => {
        dispatch(react_router_redux_1.routeActions.push(route));
    };
};
