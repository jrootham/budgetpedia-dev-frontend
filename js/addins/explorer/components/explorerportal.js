'use strict';
const React = require('react');
var { Component } = React;
const Tabs_1 = require('material-ui/Tabs');
const explorerchart_1 = require('./explorerchart');
class ExplorerPortal extends Component {
    constructor(...args) {
        super(...args);
        this.onChangeTab = () => {
            this.props.displaycallbacks.onChangePortalTab();
        };
        this._chartrefs = [];
        this.getChartTabs = () => {
            let { callbackid, budgetNode } = this.props;
            let budgetCells = budgetNode.cells;
            let portalSettings = budgetNode.portalConfig;
            let cellTabs = budgetCells.map((budgetCell, cellIndex) => {
                let expandable = ((budgetCells.length > 1) && (cellIndex == 0));
                let cellConfig = budgetCell.chartConfig;
                cellConfig.cellSettings.expandable = expandable;
                let { chartParms, cellCallbacks, cellSettings, cellTitle } = cellConfig;
                cellCallbacks.onSwitchChartCode = cellCallbacks.onSwitchChartCode(callbackid);
                return React.createElement(Tabs_1.Tab, {style: { fontSize: "12px" }, label: cellTitle, value: cellIndex, key: cellIndex}, React.createElement(explorerchart_1.default, {budgetCell: budgetCell, callbackid: cellIndex}));
            });
            return cellTabs;
        };
        this.getTabObject = (chartTabs) => {
            if (chartTabs.length == 1) {
                return (React.createElement(Tabs_1.Tabs, {value: 0, onChange: () => {
                    this.onChangeTab();
                }}, chartTabs));
            }
            else {
                return (React.createElement(Tabs_1.Tabs, {onChange: () => {
                    this.onChangeTab();
                }}, chartTabs));
            }
        };
    }
    componentDidMount() {
    }
    render() {
        let chartTabs = this.getChartTabs();
        let tabobject = this.getTabObject(chartTabs);
        let { portalConfig: portalSettings } = this.props.budgetNode;
        return React.createElement("div", {style: {
            position: "relative",
            display: "inline-block",
            padding: "10px",
            backgroundColor: "Beige",
            verticalAlign: "top",
            width: "400px",
        }}, React.createElement("div", {style: {
            position: "absolute",
            top: 0,
            left: "10px",
            padding: "3px 20px 3px 20px",
            borderRadius: "6px",
            border: "1px solid silver",
            fontSize: "12px",
            color: "lightgreen",
            fontWeight: "bold",
            display: "inline-block",
            backgroundColor: "#00bcd4",
        }}, portalSettings.portalName), tabobject);
    }
}
exports.ExplorerPortal = ExplorerPortal;
