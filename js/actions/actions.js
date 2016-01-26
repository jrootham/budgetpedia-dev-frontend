exports.SET_TILECOLS = 'SET_TILECOLS';
exports.ADD_TILE = 'ADD_TILE';
exports.REMOVE_TILE = 'REMOVE_TILE';
exports.UPDATE_TILE = 'UPDATE_TILE';
function setTileCols() {
    return {
        type: exports.SET_TILECOLS,
    };
}
exports.setTileCols = setTileCols;
