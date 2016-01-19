var redux_1 = require('redux');
var initialstate_1 = require("../store/initialstate");
let tilecols = (state = initialstate_1.initialstate.tilecols, action) => {
    switch (action.type) {
        case 'SET_TILECOLS': {
            let mainElement = document.getElementById('main');
            let spacewidth = mainElement.getBoundingClientRect().width;
            let columns;
            if (spacewidth > 960) {
                columns = 4;
            }
            else if (spacewidth > 600) {
                columns = 3;
            }
            else {
                columns = 2;
            }
            return columns;
        }
        default:
            return state;
    }
};
let maintiles = (state = initialstate_1.initialstate.maintiles, action) => {
    switch (action.type) {
        case 'ADD_TILE':
            return [
                ...state,
                action.tile
            ];
        case 'REMOVE_TILE':
            return state.filter((item) => {
                return item.id != action.id;
            });
        case 'UPDATE_TILE':
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
let mainReducer = redux_1.combineReducers({ maintiles, tilecols });
exports.mainReducer = mainReducer;
