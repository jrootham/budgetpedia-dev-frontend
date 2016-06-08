'use strict';
const React = require('react');
var { Component } = React;
var { Chart } = require('../../../forked/react-google-charts/Chart.js');
const IconButton_1 = require('material-ui/IconButton');
const FontIcon_1 = require('material-ui/FontIcon');
class ExplorerChart extends Component {
    constructor(...args) {
        super(...args);
        this.onChangeChartCode = (chartCode) => {
            this.props.chartsettings.onSwitchChartCode(chartCode);
        };
    }
    render() {
        let chartparms = this.props.chartparms;
        if (!this.props.expandable) {
            chartparms.options['backgroundColor'] = '#E4E4E4';
        }
        let chartsettings = this.props.chartsettings;
        return React.createElement("div", null, React.createElement("div", {style: { padding: "3px" }}, React.createElement(IconButton_1.default, {tooltip: "Column Chart", tooltipPosition: "top-center", style: {
            backgroundColor: (chartsettings.chartCode == "ColumnChart")
                ? "rgba(144,238,144,0.5)"
                : "transparent",
            borderRadius: "50%"
        }, onTouchTap: e => {
            this.onChangeChartCode('ColumnChart');
        }}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "insert_chart")), React.createElement(IconButton_1.default, {tooltip: "Donut Pie Chart", tooltipPosition: "top-center", style: {
            backgroundColor: (chartsettings.chartCode == "DonutChart")
                ? "rgba(144,238,144,0.5)"
                : "transparent",
            borderRadius: "50%"
        }, onTouchTap: e => {
            this.onChangeChartCode('DonutChart');
        }}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "donut_small")), React.createElement(IconButton_1.default, {tooltip: "Timeline", tooltipPosition: "top-center", style: {
            backgroundColor: (this.props.chartsettings.chartCode == "TimeLine")
                ? "rgba(144,238,144,0.5)"
                : "transparent",
            borderRadius: "50%"
        }, disabled: true, onTouchTap: e => {
            this.onChangeChartCode('Timeline');
        }}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "timeline"))), React.createElement("div", {style: { position: "absolute", top: 0, right: "72px", zIndex: 1000, padding: "3px" }}, React.createElement(IconButton_1.default, {tooltip: "Information", tooltipPosition: "top-center", disabled: true}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "info_outline"))), React.createElement("div", {style: { position: "absolute", top: 0, right: "36px", zIndex: 1000, padding: "3px" }}, React.createElement(IconButton_1.default, {tooltip: "Share", tooltipPosition: "top-center", disabled: true}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "share"))), React.createElement("div", {style: { position: "absolute", top: 0, right: 0, zIndex: 1000, padding: "3px" }}, React.createElement(IconButton_1.default, {tooltip: "Announcements", tooltipPosition: "top-center", disabled: true}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "announcement"))), React.createElement(Chart, {chartType: chartparms.chartType, options: chartparms.options, chartEvents: chartparms.events, rows: chartparms.rows, columns: chartparms.columns, graph_id: chartsettings.graph_id}), React.createElement("div", {style: { position: "absolute", bottom: 0, left: 0, zIndex: 1000, padding: "3px" }}, React.createElement(IconButton_1.default, {disabled: true}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "view_list"))), React.createElement("div", {style: { position: "absolute", bottom: 0, right: 0, zIndex: 1000, padding: "3px" }}, React.createElement(IconButton_1.default, {disabled: true}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "note"))), React.createElement("div", {style: {
            position: "absolute",
            bottom: 0,
            left: "40px",
            fontSize: "9px",
            fontStyle: "italic",
        }}, this.props.expandable ? 'drill down' : 'no drill down'));
    }
}
exports.ExplorerChart = ExplorerChart;
