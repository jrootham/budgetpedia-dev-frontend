'use strict';
var React = require('react');
var react_redux_1 = require('react-redux');
var navtiles_1 = require("../components/navtiles");
function mapStateToProps(state) {
    return { maintiles: state.maintiles };
}
class MainTilesClass extends React.Component {
    render() {
        return React.createElement(navtiles_1.NavTiles, {"tiles": this.props.maintiles});
    }
}
var MainTiles = react_redux_1.connect(mapStateToProps)(MainTilesClass);
exports.MainTiles = MainTiles;
