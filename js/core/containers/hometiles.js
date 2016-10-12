'use strict';
const React = require('react');
const react_redux_1 = require('react-redux');
const Actions = require('../actions/actions');
const apptiles_1 = require("../components/apptiles");
const Card_1 = require('material-ui/Card');
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
        return (React.createElement("div", null, React.createElement(Card_1.Card, null, React.createElement(Card_1.CardTitle, null, "Welcome to Budgetpedia. We're all about government budgets."), React.createElement(Card_1.CardText, null, React.createElement("p", {style: { margin: 0, padding: 0 }}, "Explore the Toronto budget with our Budget Explorer." + ' ' + "See a sample of Toronto's annual budget decision process at our Budget Roadmap."), React.createElement("p", null, "We welcome you to join us (and contribute!) at any of our digital places:"), React.createElement("ul", null, React.createElement("li", null, "For discussions: our Facebook group (facebook.com/groups/budgetpedia)"), React.createElement("li", null, "For lists of resources: our Facebook page (facebook.com/bugetpedia)"), React.createElement("li", null, "For notifications: Twitter (twitter.com/budgetpedia)"), React.createElement("li", null, "For in-depth articles: Medium (medium.com/budgetpedia)"), React.createElement("li", null, "For technical discussions: our Google forum (groups.google.com/d/forum/budgetpedia)")), React.createElement("p", null, "Below are tiles leading to more information about the Budgetpedia Project."))), React.createElement(apptiles_1.AppTiles, {style: {
            margin: "16px",
            fontFamily: theme.fontFamily,
        }, tiles: hometiles, tilecols: homecols, padding: homepadding, tilecolors: {
            front: colors.blue50,
            back: colors.amber50,
            helpbutton: theme.palette.primary3Color,
        }, system: system, transitionTo: this.props.transitionTo, cellHeight: 180})));
    }
}
var HomeTiles = react_redux_1.connect(mapStateToProps, {
    transitionTo: Actions.transitionTo,
    setHomeTileCols: Actions.setHomeTileCols,
})(HomeTilesClass);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HomeTiles;
