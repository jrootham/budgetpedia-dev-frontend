// reducers.tsx
import { combineReducers } from 'redux'

// maintiles reducer
import {initialstate} from "../store/initialstate"

let tilecols = (state: any = initialstate.tilecols, action) => {
	switch (action.type) {
		case 'SET_TILECOLS': {

			let mainElement = document.getElementById('main')

			let spacewidth: number = mainElement.getBoundingClientRect().width

			let columns: number;

			if (spacewidth > 960) {
				columns = 4
			} else if (spacewidth > 600) {
				columns = 3
			} else {
				columns = 2
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
		case 'ADD_TILE':
			return [
				...state,
				action.tile
			]
		case 'REMOVE_TILE':
			return state.filter((item) => {
				return item.id != action.id
			})
		case 'UPDATE_TILE':
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

let mainReducer = combineReducers({ maintiles, tilecols })

export {mainReducer}
