var redux_1 = require('redux');
var Actions = require('../actions/actions');
var initialstate_1 = require("../store/initialstate");
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
let maincols = (state = initialstate_1.initialstate.maincols, action) => {
    switch (action.type) {
        case Actions.SET_TILECOLS: {
            let mainElement = document.getElementById('main');
            let elementwidth = mainElement.getBoundingClientRect().width;
            let columns;
            if (elementwidth > 960) {
                columns = 4;
            }
            else if (elementwidth > 600) {
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
let maintiles = (state = initialstate_1.initialstate.maintiles, action) => {
    switch (action.type) {
        case Actions.ADD_TILE:
            return [
                ...state,
                action.tile
            ];
        case Actions.REMOVE_TILE:
            return state.filter((item) => {
                return item.id != action.id;
            });
        case Actions.UPDATE_TILE:
            return [
                ...state.slice(0, action.index),
                Object.assign({}, state[action.index], {
                    content: action.content,
                    help: action.help,
                }),
                ...state.slice(action.index + 1)
            ];
        default:
            return state;
    }
};
let mainReducer = redux_1.combineReducers({
    maintiles,
    maincols,
    mainpadding,
    appnavbar,
    theme,
    colors,
    system
});
exports.mainReducer = mainReducer;
