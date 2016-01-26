// actions.tsx

export const SET_TILECOLS = 'SET_TILECOLS'
export const ADD_TILE = 'ADD_TILE'
export const REMOVE_TILE = 'REMOVE_TILE'
export const UPDATE_TILE = 'UPDATE_TILE'

export function setTileCols() {
	return {
		type: SET_TILECOLS,
	}
}