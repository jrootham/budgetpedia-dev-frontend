'use strict';
const React = require('react');
const react_redux_1 = require('react-redux');
const Actions = require('../actions/actions');
const navtiles_1 = require("../components/navtiles");
function mapStateToProps(state) {
    let { maintiles, maincols, mainpadding, theme, colors, system } = state;
    return {
        maintiles: maintiles,
        maincols: maincols,
        mainpadding: mainpadding,
        theme: theme,
        colors: colors,
        system: system,
    };
}
class MainTilesClass extends React.Component {
    constructor(...args) {
        super(...args);
        this.handleResize = () => {
            this.props.setTileCols();
        };
        this.componentWillMount = () => {
            this.props.setTileCols();
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
        return (React.createElement(navtiles_1.NavTiles, {style: { margin: 0, fontFamily: theme.fontFamily }, tiles: maintiles, tilecols: maincols, padding: mainpadding, tilecolors: {
            front: colors.blue50,
            back: colors.amber50,
            helpbutton: theme.palette.primary3Color,
        }, system: system, transitionTo: this.props.transitionTo, cellHeight: 200}));
    }
}
var MainTiles = react_redux_1.connect(mapStateToProps, {
    transitionTo: Actions.transitionTo,
    setTileCols: Actions.setHomeTileCols,
})(MainTilesClass);
exports.MainTiles = MainTiles;
