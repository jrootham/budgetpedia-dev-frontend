'use strict';
const React = require('react');
var { Component } = React;
const Tabs_1 = require('material-ui/Tabs');
const explorerchart_1 = require('./explorerchart');
class ExplorerPortal extends Component {
    constructor(...args) {
        super(...args);
        this.onChangeTab = () => {
            this.props.onChangePortalChart();
        };
        this.componentWillMount = () => {
        };
        this.getChartTabs = () => {
            let portalcharts = this.props.portalNode.budgetCells;
            let chartTabs = portalcharts.map((tabChart, cellindex) => {
                let expandable = ((portalcharts.length > 1) && (cellindex == 0));
                let chartparms = tabChart.chartparms;
                let chartsettings = tabChart.chartsettings;
                return React.createElement(Tabs_1.Tab, {style: { fontSize: "12px" }, label: tabChart.chartblocktitle, value: cellindex, key: cellindex}, React.createElement(explorerchart_1.ExplorerChart, {callbackid: cellindex, chartsettings: chartsettings, chartparms: chartparms, expandable: expandable}));
            });
            return chartTabs;
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
    render() {
        let chartTabs = this.getChartTabs();
        let tabobject = this.getTabObject(chartTabs);
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
        }}, this.props.portalNode.portalName), tabobject);
    }
}
exports.ExplorerPortal = ExplorerPortal;
