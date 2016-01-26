'use strict';
var React = require('react');
var react_redux_1 = require('react-redux');
var Actions = require('../actions/actions');
var navtiles_1 = require("../components/navtiles");
function mapStateToProps(state) {
    let { maintiles, maincols, mainpadding, theme, colors, system } = state;
    return {
        maintiles,
        maincols,
        mainpadding,
        theme,
        colors,
        system,
    };
}
class MainTilesClass extends React.Component {
    constructor(...args) {
        super(...args);
        this.handleResize = () => {
            this.props.dispatch(Actions.setTileCols());
        };
        this.componentWillMount = () => {
            this.props.dispatch(Actions.setTileCols());
        };
        this.componentDidMount = () => {
            window.addEventListener('resize', this.handleResize);
        };
        this.componentWillUnmount = () => {
            window.removeEventListener('resize', this.handleResize);
        };
    }
    render() {
        let { maintiles, maincols, mainpadding, theme, colors, system } = this.props;
        return (React.createElement(navtiles_1.NavTiles, {"style": { margin: 0, fontFamily: theme.fontFamily }, "tiles": maintiles, "tilecols": maincols, "padding": mainpadding, "tilecolors": {
            front: colors.blue50,
            back: colors.amber50,
            helpbutton: theme.palette.primary3Color,
        }, "system": system}));
    }
}
var MainTiles = react_redux_1.connect(mapStateToProps)(MainTilesClass);
exports.MainTiles = MainTiles;
