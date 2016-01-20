'use strict';
var React = require('react');
var react_redux_1 = require('react-redux');
var navtiles_1 = require("../components/navtiles");
function mapStateToProps(state) {
    let { maintiles, tilecols } = state;
    return {
        maintiles,
        tilecols,
    };
}
class MainTilesClass extends React.Component {
    handleResize() {
        this.props.dispatch({ type: "SET_TILECOLS" });
    }
    componentWillMount() {
        this.props.dispatch({ type: "SET_TILECOLS" });
    }
    componentDidMount() {
        window.addEventListener('resize', this.handleResize);
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }
    render() {
        let { maintiles, tilecols } = this.props;
        return (React.createElement(navtiles_1.NavTiles, {"tiles": maintiles, "tilecols": tilecols}));
    }
}
var MainTiles = react_redux_1.connect(mapStateToProps)(MainTilesClass);
exports.MainTiles = MainTiles;
