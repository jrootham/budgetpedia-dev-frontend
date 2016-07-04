'use strict';
const React = require('react');
const react_redux_1 = require('react-redux');
const Actions = require('../actions/actions');
const apptiles_1 = require("../components/apptiles");
const mapStateToProps = ({ homegrid, resources }) => ({
    hometiles: homegrid.hometiles,
    homecols: homegrid.homecols,
    homepadding: homegrid.homepadding,
    theme: resources.theme,
    colors: resources.colors,
    system: resources.system,
});
class HomeTilesClass extends React.Component {
    constructor(...args) {
        super(...args);
        this.handleHomeResize = () => {
            this.props.setHomeTileCols();
        };
        this.componentWillMount = () => {
            this.props.setHomeTileCols();
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
        return (React.createElement(apptiles_1.AppTiles, {style: { margin: "16px", fontFamily: theme.fontFamily }, tiles: hometiles, tilecols: homecols, padding: homepadding, tilecolors: {
            front: colors.blue50,
            back: colors.amber50,
            helpbutton: theme.palette.primary3Color,
        }, system: system, transitionTo: this.props.transitionTo, cellHeight: 180}));
    }
}
var HomeTiles = react_redux_1.connect(mapStateToProps, {
    transitionTo: Actions.transitionTo,
    setHomeTileCols: Actions.setHomeTileCols,
})(HomeTilesClass);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HomeTiles;
