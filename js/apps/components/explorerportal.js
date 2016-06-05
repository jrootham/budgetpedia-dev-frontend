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
            let chartTabs = this.props.budgetPortal.portalCharts.map((tabChart, chartindex) => {
                let chartparms = tabChart.chartparms;
                let chartsettings = tabChart.chartsettings;
                return React.createElement(Tabs_1.Tab, {style: { fontSize: "12px" }, label: tabChart.chartblocktitle, value: "programs", key: chartindex}, React.createElement(explorerchart_1.ExplorerChart, {chartsettings: chartsettings, chartparms: chartparms}));
            });
            return chartTabs;
        };
    }
    render() {
        let chartTabs = this.getChartTabs();
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
        }}, this.props.budgetPortal.portalName), React.createElement(Tabs_1.Tabs, {onChange: e => {
            this.onChangeTab();
        }}, chartTabs));
    }
}
exports.ExplorerPortal = ExplorerPortal;
