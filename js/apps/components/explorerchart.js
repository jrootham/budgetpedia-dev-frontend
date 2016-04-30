'use strict';
const React = require('react');
var { Component } = React;
const ChartObject = require('react-google-charts');
let Chart = ChartObject['Chart'];
const IconButton = require('material-ui/lib/icon-button');
const FontIcon = require('material-ui/lib/font-icon');
class ExplorerChart extends Component {
    render() {
        return React.createElement("div", {style: { position: "relative", display: "inline-block", padding: "10px", backgroundColor: "Beige" }}, React.createElement("div", {style: { position: "absolute", top: 0, left: 0, zIndex: 1000, padding: "3px" }}, React.createElement(IconButton, {tooltip: "Column Chart", tooltipPosition: "bottom-center", style: { backgroundColor: "lightgreen" }}, React.createElement(FontIcon, {className: "material-icons"}, "insert_chart")), React.createElement(IconButton, {tooltip: "Donut Pie Chart", tooltipPosition: "bottom-center"}, React.createElement(FontIcon, {className: "material-icons"}, "donut_small")), React.createElement(IconButton, {tooltip: "Timeline", tooltipPosition: "bottom-center"}, React.createElement(FontIcon, {className: "material-icons"}, "timeline"))), React.createElement("div", {style: { position: "absolute", top: 0, right: 0, zIndex: 1000, padding: "3px" }}, React.createElement(IconButton, {disabled: true}, React.createElement(FontIcon, {className: "material-icons"}, "info_outline"))), React.createElement(Chart, {chartType: this.props.chartType, options: this.props.options, chartEvents: this.props.chartEvents, rows: this.props.rows, columns: this.props.columns, graph_id: this.props.graph_id}), React.createElement("div", {style: { position: "absolute", bottom: 0, left: 0, zIndex: 1000, padding: "3px" }}, React.createElement(IconButton, {disabled: true}, React.createElement(FontIcon, {className: "material-icons"}, "view_list"))));
    }
}
exports.ExplorerChart = ExplorerChart;
