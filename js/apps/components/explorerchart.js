'use strict';
const React = require('react');
var { Component } = React;
var Chart = require('../../../forked/react-google-charts/Chart.js');
const IconButton = require('material-ui/lib/icon-button');
const FontIcon = require('material-ui/lib/font-icon');
const Tabs = require('material-ui/lib/tabs/tabs');
const Tab = require('material-ui/lib/tabs/tab');
class ExplorerChart extends Component {
    constructor(...args) {
        super(...args);
        this.onChangeChartCode = (chartCode, location) => {
            this.props.budgetPortal.budgetCharts[location.index].settings.onChartCode(location, chartCode);
        };
        this.componentWillMount = () => {
        };
        this.getTabs = () => {
            let chartTabs = this.props.budgetPortal.budgetCharts.map((chartTab, chartindex) => {
                chartTab.location = chartTab.settings.location;
                chartTab.location.index = chartindex;
                let chartparms = chartTab.chartparms;
                return React.createElement(Tab, {label: chartTab.settings.title, value: "programs"}, React.createElement("div", {style: { padding: "3px" }}, React.createElement(IconButton, {tooltip: "Column Chart", tooltipPosition: "top-center", style: {
                    backgroundColor: (chartTab.settings.chartCode == "ColumnChart")
                        ? "rgba(144,238,144,0.5)"
                        : "transparent"
                }, onTouchTap: e => {
                    this.onChangeChartCode('ColumnChart', chartTab.location);
                }}, React.createElement(FontIcon, {className: "material-icons"}, "insert_chart")), React.createElement(IconButton, {tooltip: "Donut Pie Chart", tooltipPosition: "top-center", style: {
                    backgroundColor: (chartTab.settings.chartCode == "DonutChart")
                        ? "rgba(144,238,144,0.5)"
                        : "transparent"
                }, onTouchTap: e => {
                    this.onChangeChartCode('DonutChart', chartTab.location);
                }}, React.createElement(FontIcon, {className: "material-icons"}, "donut_small")), React.createElement(IconButton, {tooltip: "Timeline", tooltipPosition: "top-center", style: {
                    backgroundColor: (chartTab.settings.chartCode == "TimeLine")
                        ? "rgba(144,238,144,0.5)"
                        : "transparent"
                }, disabled: true, onTouchTap: e => {
                    this.onChangeChartCode('Timeline', chartTab.location);
                }}, React.createElement(FontIcon, {className: "material-icons"}, "timeline"))), React.createElement("div", {style: { position: "absolute", top: 0, right: 0, zIndex: 1000, padding: "3px" }}, React.createElement(IconButton, {disabled: true}, React.createElement(FontIcon, {className: "material-icons"}, "info_outline"))), React.createElement(Chart, {chartType: chartparms.chartType, options: chartparms.options, chartEvents: chartparms.events, rows: chartparms.rows, columns: chartparms.columns, graph_id: chartTab.settings.graph_id}), React.createElement("div", {style: { position: "absolute", bottom: 0, left: 0, zIndex: 1000, padding: "3px" }}, React.createElement(IconButton, {disabled: true}, React.createElement(FontIcon, {className: "material-icons"}, "view_list"))));
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
            padding: "3px 20px 0px 20px",
            borderRadius: "6px 6px 0 0",
            fontSize: "10px",
            color: "lightgreen",
            fontWeight: "bold",
            display: "inline-block",
            backgroundColor: "#00bcd4",
        }}, this.props.budgetPortal.portalName), React.createElement(Tabs, null, chartTabs));
    }
}
exports.ExplorerChart = ExplorerChart;
