'use strict';
const React = require('react');
var { Component } = React;
var Chart = require('../../../forked/react-google-charts/Chart.js');
const IconButton = require('material-ui/lib/icon-button');
const FontIcon = require('material-ui/lib/font-icon');
class ExplorerChart extends Component {
    constructor(...args) {
        super(...args);
        this.onChangeChartCode = (chartCode, location) => {
            this.props.chartsettings.onSwitchChartCode(location, chartCode);
        };
    }
    render() {
        let chartparms = this.props.chartparms;
        let chartsettings = this.props.chartsettings;
        let chartlocation = this.props.chartlocation;
        return React.createElement("div", null, React.createElement("div", {style: { padding: "3px" }}, React.createElement(IconButton, {tooltip: "Column Chart", tooltipPosition: "top-center", style: {
            backgroundColor: (chartsettings.chartCode == "ColumnChart")
                ? "rgba(144,238,144,0.5)"
                : "transparent",
            borderRadius: "50%"
        }, onTouchTap: e => {
            this.onChangeChartCode('ColumnChart', chartlocation);
        }}, React.createElement(FontIcon, {className: "material-icons"}, "insert_chart")), React.createElement(IconButton, {tooltip: "Donut Pie Chart", tooltipPosition: "top-center", style: {
            backgroundColor: (chartsettings.chartCode == "DonutChart")
                ? "rgba(144,238,144,0.5)"
                : "transparent",
            borderRadius: "50%"
        }, onTouchTap: e => {
            this.onChangeChartCode('DonutChart', chartlocation);
        }}, React.createElement(FontIcon, {className: "material-icons"}, "donut_small")), React.createElement(IconButton, {tooltip: "Timeline", tooltipPosition: "top-center", style: {
            backgroundColor: (this.props.chartsettings.chartCode == "TimeLine")
                ? "rgba(144,238,144,0.5)"
                : "transparent",
            borderRadius: "50%"
        }, disabled: true, onTouchTap: e => {
            this.onChangeChartCode('Timeline', chartlocation);
        }}, React.createElement(FontIcon, {className: "material-icons"}, "timeline"))), React.createElement("div", {style: { position: "absolute", top: 0, right: 0, zIndex: 1000, padding: "3px" }}, React.createElement(IconButton, {disabled: true}, React.createElement(FontIcon, {className: "material-icons"}, "info_outline"))), React.createElement(Chart, {chartType: chartparms.chartType, options: chartparms.options, chartEvents: chartparms.events, rows: chartparms.rows, columns: chartparms.columns, graph_id: chartsettings.graph_id}), React.createElement("div", {style: { position: "absolute", bottom: 0, left: 0, zIndex: 1000, padding: "3px" }}, React.createElement(IconButton, {disabled: true}, React.createElement(FontIcon, {className: "material-icons"}, "view_list"))));
    }
}
exports.ExplorerChart = ExplorerChart;
