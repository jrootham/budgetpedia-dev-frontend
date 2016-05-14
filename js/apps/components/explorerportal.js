'use strict';
const React = require('react');
var { Component } = React;
var Chart = require('../../../forked/react-google-charts/Chart.js');
const Tabs = require('material-ui/lib/tabs/tabs');
const Tab = require('material-ui/lib/tabs/tab');
const explorerchart_1 = require('./explorerchart');
class ExplorerPortal extends Component {
    constructor(...args) {
        super(...args);
        this.onChangeTab = () => {
            this.props.onChangePortalChart(this.props.budgetPortal.portalLocation);
        };
        this.componentWillMount = () => {
        };
        this.getTabs = () => {
            let chartTabs = this.props.budgetPortal.portalCharts.map((chartTab, chartindex) => {
                chartTab.portalchartlocation.portalindex = chartindex;
                let chartparms = chartTab.portalchartparms;
                let chartsettings = chartTab.portalchartsettings;
                let chartlocation = chartTab.portalchartlocation;
                return React.createElement(Tab, {style: { fontSize: "12px" }, label: chartTab.chartblocktitle, value: "programs", key: chartindex}, React.createElement(explorerchart_1.ExplorerChart, {chartlocation: chartlocation, chartsettings: chartsettings, chartparms: chartparms}));
            });
            return chartTabs;
        };
    }
    render() {
        let chartTabs = this.getTabs();
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
        }}, this.props.budgetPortal.portalName), React.createElement(Tabs, {onChange: e => {
            this.onChangeTab();
        }}, chartTabs));
    }
}
exports.ExplorerPortal = ExplorerPortal;
