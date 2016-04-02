'use strict';
const React = require('react');
const react_redux_1 = require('react-redux');
const redux_1 = require('redux');
const Actions = require('../actions/actions');
const apptiles_1 = require("../components/apptiles");
function mapStateToProps(state) {
    let { hometiles, homecols, homepadding, theme, colors, system } = state;
    return {
        hometiles: hometiles,
        homecols: homecols,
        homepadding: homepadding,
        theme: theme,
        colors: colors,
        system: system,
    };
}
class HomeTilesClass extends React.Component {
    constructor(...args) {
        super(...args);
        this.handleHomeResize = () => {
            this.props.dispatch(Actions.setHomeTileCols());
        };
        this.componentWillMount = () => {
            this.props.dispatch(Actions.setHomeTileCols());
        };
        this.componentDidMount = () => {
            window.addEventListener('resize', this.handleHomeResize);
        };
        this.componentWillUnmount = () => {
            window.removeEventListener('resize', this.handleHomeResize);
        };
    }
    render() {
        let { hometiles, homecols, homepadding, theme, colors, system } = this.props;
        return (React.createElement(apptiles_1.AppTiles, {style: { margin: 0, fontFamily: theme.fontFamily }, tiles: hometiles, tilecols: homecols, padding: homepadding, tilecolors: {
            front: colors.blue50,
            back: colors.amber50,
            helpbutton: theme.palette.primary3Color,
        }, system: system, transitionTo: redux_1.compose(this.props.dispatch, Actions.transitionTo), cellHeight: 200}));
    }
}
var HomeTiles = react_redux_1.connect(mapStateToProps)(HomeTilesClass);
exports.HomeTiles = HomeTiles;
