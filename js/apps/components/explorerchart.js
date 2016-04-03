'use strict';
const React = require('react');
var { Component } = React;
const ChartObject = require('react-google-charts');
let Chart = ChartObject['Chart'];
class ExplorerChart extends Component {
    render() {
        return React.createElement("div", {style: { display: "inline-block" }}, React.createElement(Chart, {chartType: this.props.chartType, options: this.props.options, chartEvents: this.props.chartEvents, rows: this.props.rows, columns: this.props.columns, graph_id: this.props.graph_id}));
    }
}
exports.ExplorerChart = ExplorerChart;
