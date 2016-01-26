// reducers.tsx
import { combineReducers } from 'redux'

import * as Actions from '../actions/actions'

import {initialstate} from "../store/initialstate"

let appnavbar = (state: any = initialstate.appnavbar, action) => {
	return state
}

let toolsnavbar = (state: any = initialstate.toolsnavbar, action) => {
	return state
}

let theme = (state: any = initialstate.theme) => {
	return state
}

let system = (state:any = initialstate.system) => {
	return state
}

let colors = (state: any = initialstate.colors) => {
	return state
}

let mainpadding = (state: any = initialstate.mainpadding, action) => {
	return state
}

let maincols = (state: any = initialstate.maincols, action) => {
	switch (action.type) {
		case Actions.SET_TILECOLS: {

			let mainElement = document.getElementById('main')

			let elementwidth: number = mainElement.getBoundingClientRect().width

			let columns: number;

			if (elementwidth > 960) {
				columns = 4
			} else if (elementwidth > 600) {
				columns = 3
			} else if (elementwidth > 400) {
				columns = 2
			} else {
				columns = 1
			}

			return columns
		}
		default:
			return state
	}
}

// this is a notional reducer for experimentation
let maintiles = (state: any = initialstate.maintiles, action) => {
	switch (action.type) {
		case Actions.ADD_TILE:
			return [
				...state,
				action.tile
			]
		case Actions.REMOVE_TILE:
			return state.filter((item) => {
				return item.id != action.id
			})
		case Actions.UPDATE_TILE:
			return [
				...state.slice(0, action.index),
				Object.assign({}, state[action.index], {
					content: action.content,
					help: action.help,
				}),
				...state.slice(action.index + 1)
			]

		default:
			return state
	}
}

let mainReducer = combineReducers(
	{ 
		maintiles,
		maincols,
		mainpadding,
		appnavbar, 
		theme,
		colors,
		system 
	}
)

export { mainReducer }
