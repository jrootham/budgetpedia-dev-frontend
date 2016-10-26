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
        this.transitionTo = (e, target) => {
            e.stopPropagation();
            e.preventDefault();
            var _this = this;
            _this.props.transitionTo(target);
        };
    }
    render() {
        let { hometiles, homecols, homepadding, theme, colors, system } = this.props;
        return (React.createElement("div", null, React.createElement(Card_1.Card, {style: { backgroundImage: "url(./public/icons/budgetpedia-pale.jpg",
            backgroundSize: "cover" }}, React.createElement("div", {style: { float: "left", margin: "9px 3px 3px 3px" }}, React.createElement("img", {style: { width: "100px" }, src: "./public/icons/budgetpedia-logo.png"})), React.createElement(Card_1.CardTitle, null, "Welcome to Budgetpedia. We're all about government budgets."), React.createElement(Card_1.CardText, null, React.createElement("p", {style: { margin: 0, padding: 0 }}, "Explore the Toronto budget with our ", React.createElement("a", {href: "javascript:void(0);", onTouchTap: e => { this.transitionTo(e, 'explorer'); }}, "Budget Explorer"), "." + ' ' + "See a sample of Toronto's annual budget decision process at our Budget Roadmap ", React.createElement("em", null, "[link pending]"), "."), React.createElement("p", null, "We welcome you to join us (and contribute!) on any of our digital platforms:"), React.createElement("ul", null, React.createElement("li", null, React.createElement("a", {href: "http://facebook.com/groups/budgetpedia", target: "_blank"}, React.createElement("img", {style: { height: "16px", verticalAlign: "middle" }, src: "./public/icons/facebook.png"})), " For" + ' ' + "discussions: our Facebook group (", React.createElement("a", {href: "http://facebook.com/groups/budgetpedia", target: "_blank"}, "facebook.com/groups/budgetpedia"), ")"), React.createElement("li", null, React.createElement("a", {href: "http://facebook.com/budgetpedia", target: "_blank"}, React.createElement("img", {style: { height: "16px", verticalAlign: "middle" }, src: "./public/icons/facebook.png"})), " For" + ' ' + "lists of resources: our Facebook page (", React.createElement("a", {href: "http://facebook.com/budgetpedia", target: "_blank"}, "facebook.com/budgetpedia"), ")"), React.createElement("li", null, React.createElement("a", {href: "http://twitter.com/budgetpedia", target: "_blank"}, React.createElement("img", {style: { height: "16px", verticalAlign: "middle" }, src: "./public/icons/twitter.png"})), " For" + ' ' + "notifications: Twitter (", React.createElement("a", {href: "http://twitter.com/budgetpedia", target: "_blank"}, "twitter.com/budgetpedia"), ")"), React.createElement("li", null, React.createElement("a", {href: "http://medium.com/budgetpedia", target: "_blank"}, React.createElement("img", {style: { height: "16px", verticalAlign: "middle" }, src: "./public/icons/medium.png"})), " For" + ' ' + "in-depth articles: Medium (", React.createElement("a", {href: "http://medium.com/budgetpedia", target: "_blank"}, "medium.com/budgetpedia"), ")"), React.createElement("li", null, React.createElement("a", {href: "http://groups.google.com/d/forum/budgetpedia", target: "_blank"}, React.createElement("img", {style: { height: "16px", verticalAlign: "middle" }, src: "./public/icons/g-logo.png"})), " For" + ' ' + "technical discussions: our Google forum (", React.createElement("a", {href: "http://groups.google.com/d/forum/budgetpedia", target: "_blank"}, "groups.google.com/d/forum/budgetpedia"), ")")), React.createElement("p", null, "Below are tiles leading to more information about the Budgetpedia Project."))), React.createElement(apptiles_1.AppTiles, {style: {
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
