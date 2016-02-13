var redux_1 = require('redux');
var Actions = require('../actions/actions');
var initialstate_1 = require("../store/initialstate");
var flux_standard_action_1 = require('flux-standard-action');
var redux_actions_1 = require('redux-actions');
var react_router_redux_1 = require('react-router-redux');
let appnavbar = (state = initialstate_1.initialstate.appnavbar, action) => {
    return state;
};
let toolsnavbar = (state = initialstate_1.initialstate.toolsnavbar, action) => {
    return state;
};
let theme = (state = initialstate_1.initialstate.theme) => {
    return state;
};
let system = (state = initialstate_1.initialstate.system) => {
    return state;
};
let colors = (state = initialstate_1.initialstate.colors) => {
    return state;
};
let mainpadding = (state = initialstate_1.initialstate.mainpadding, action) => {
    return state;
};
let maintiles = (state = initialstate_1.initialstate.maintiles, action) => {
    return state;
};
let maincolsreducer = (state = initialstate_1.initialstate.maincols, action) => {
    switch (action.type) {
        case Actions.SET_TILECOLS: {
            let mainElement = document.getElementById('main');
            let elementwidth = mainElement.getBoundingClientRect().width;
            let columns;
            if (elementwidth > 960) {
                columns = 4;
            }
            else if (elementwidth > 680) {
                columns = 3;
            }
            else if (elementwidth > 400) {
                columns = 2;
            }
            else {
                columns = 1;
            }
            return columns;
        }
        default:
            return state;
    }
};
let maincols = redux_actions_1.handleActions({
    [Actions.SET_TILECOLS]: maincolsreducer,
}, initialstate_1.initialstate.maincols);
let mainReducerCore = redux_1.combineReducers({
    maincols,
    mainpadding,
    appnavbar,
    theme,
    colors,
    system,
    maintiles,
    routing: react_router_redux_1.routeReducer,
});
let mainReducer = (state, action) => {
    if (!flux_standard_action_1.isFSA(action)) {
        console.error('non-FSA action', action);
        throw 'non-FSA action, see console for details';
    }
    else {
        return mainReducerCore(state, action);
    }
};
exports.mainReducer = mainReducer;
