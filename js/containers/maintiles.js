'use strict';
var React = require('react');
var react_redux_1 = require('react-redux');
var navtiles_1 = require("../components/navtiles");
function mapStateToProps(state) {
    return {
        maintiles: state.maintiles,
        tilecols: state.tilecols,
    };
}
class MainTilesClass extends React.Component {
    constructor(...args) {
        super(...args);
        this.handleResize = () => {
            this.props.dispatch({ type: "SET_TILECOLS" });
        };
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
        return React.createElement(navtiles_1.NavTiles, {"tiles": this.props.maintiles, "tilecols": this.props.tilecols});
    }
}
var MainTiles = react_redux_1.connect(mapStateToProps)(MainTilesClass);
exports.MainTiles = MainTiles;
