// reducers.tsx
import { combineReducers } from 'redux'

// maintiles reducer
import {initialstate} from "../store/initialstate"

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

let mainReducer = combineReducers({ maintiles })

export {mainReducer}
