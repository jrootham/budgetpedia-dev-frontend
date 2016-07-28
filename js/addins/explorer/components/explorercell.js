'use strict';
const React = require('react');
var { Component } = React;
var { Chart } = require('../../../../forked/react-google-charts/Chart.js');
const IconButton_1 = require('material-ui/IconButton');
const FontIcon_1 = require('material-ui/FontIcon');
const SvgIcon_1 = require('material-ui/SvgIcon');
class ExplorerCell extends Component {
    constructor(...args) {
        super(...args);
        this.onChangeChartCode = (explorerChartCode) => {
            let { budgetCell } = this.props;
            budgetCell.switchChartCode(explorerChartCode);
            if (budgetCell.chartSelection) {
                if (budgetCell.googleChartType == "PieChart") {
                    budgetCell.chartSelection[0].column = null;
                }
                else {
                    budgetCell.chartSelection[0].column = 1;
                }
                budgetCell.chart.setSelection(budgetCell.chartSelection);
            }
            this.props.globalStateActions.updateCellChartCode(this.props.budgetCell.uid, explorerChartCode);
        };
    }
    render() {
        let { chartParms, explorerChartCode, expandable, graph_id } = this.props.budgetCell;
        if (!expandable) {
            chartParms.options['backgroundColor'] = '#E4E4E4';
        }
        let chart = React.createElement(Chart, {ref: node => { this.props.budgetCell.chartComponent = node; }, chartType: chartParms.chartType, options: chartParms.options, chartEvents: chartParms.events, rows: chartParms.rows, columns: chartParms.columns, graph_id: graph_id});
        return React.createElement("div", null, React.createElement("div", {style: { padding: "3px" }}, React.createElement(IconButton_1.default, {tooltip: "Column Chart", tooltipPosition: "top-center", style: {
            backgroundColor: (explorerChartCode == "ColumnChart")
                ? "rgba(144,238,144,0.5)"
                : "transparent",
            borderRadius: "50%"
        }, onTouchTap: e => {
            this.onChangeChartCode('ColumnChart');
        }}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "insert_chart")), React.createElement(IconButton_1.default, {tooltip: "Donut Pie Chart", tooltipPosition: "top-center", style: {
            backgroundColor: (explorerChartCode == "DonutChart")
                ? "rgba(144,238,144,0.5)"
                : "transparent",
            borderRadius: "50%"
        }, onTouchTap: e => {
            this.onChangeChartCode('DonutChart');
        }}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "donut_small")), React.createElement(IconButton_1.default, {tooltip: "Timeline", tooltipPosition: "top-center", style: {
            backgroundColor: (explorerChartCode == "TimeLine")
                ? "rgba(144,238,144,0.5)"
                : "transparent",
            borderRadius: "50%"
        }, disabled: true, onTouchTap: e => {
            this.onChangeChartCode('Timeline');
        }}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "timeline")), React.createElement(IconButton_1.default, {tooltip: "Stacked chart", tooltipPosition: "top-center", style: {
            backgroundColor: (explorerChartCode == "StackedArea")
                ? "rgba(144,238,144,0.5)"
                : "transparent",
            borderRadius: "50%"
        }, disabled: true, onTouchTap: e => {
            this.onChangeChartCode('StackedArea');
        }}, React.createElement(SvgIcon_1.default, {style: { height: "24px", width: "24px" }}, React.createElement("path", {d: "M20,6c0-0.587-0.257-1.167-0.75-1.562c-0.863-0.69-2.121-0.551-2.812,0.312l-2.789,3.486L11.2,6.4  c-0.864-0.648-2.087-0.493-2.762,0.351l-4,5C4.144,12.119,4,12.562,4,13v3h16V6z"}), React.createElement("path", {d: "M20,19H4c-0.552,0-1,0.447-1,1s0.448,1,1,1h16c0.552,0,1-0.447,1-1S20.552,19,20,19z"})))), React.createElement("div", {style: { position: "absolute", top: 0, right: "72px", zIndex: 1000, padding: "3px" }}, React.createElement(IconButton_1.default, {tooltip: "Information", tooltipPosition: "top-center", disabled: true}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "info_outline"))), React.createElement("div", {style: { position: "absolute", top: 0, right: "36px", zIndex: 1000, padding: "3px" }}, React.createElement(IconButton_1.default, {tooltip: "Shared stories", tooltipPosition: "top-center", disabled: true}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "share"))), React.createElement("div", {style: { position: "absolute", top: 0, right: 0, zIndex: 1000, padding: "3px" }}, React.createElement(IconButton_1.default, {tooltip: "Calls to action", tooltipPosition: "top-center", disabled: true}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "announcement"))), chart, React.createElement("div", {style: { position: "absolute", bottom: 0, left: 0, zIndex: 1000, padding: "3px" }}, React.createElement(IconButton_1.default, {disabled: true}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "view_list"))), React.createElement("div", {style: { position: "absolute", bottom: 0, right: 0, zIndex: 1000, padding: "3px" }}, React.createElement(IconButton_1.default, {disabled: true}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "note"))), React.createElement("div", {style: {
            position: "absolute",
            bottom: 0,
            left: "40px",
            fontSize: "9px",
            fontStyle: "italic",
        }}, expandable ? 'drill down' : 'no drill down'));
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ExplorerCell;
