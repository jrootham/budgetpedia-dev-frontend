'use strict';
const React = require('react');
var { Component } = React;
const explorerportal_1 = require('./explorerportal');
const DropDownMenu_1 = require('material-ui/DropDownMenu');
const constants_1 = require('../constants');
const IconButton_1 = require('material-ui/IconButton');
const MenuItem_1 = require('material-ui/MenuItem');
const FontIcon_1 = require('material-ui/FontIcon');
class ExplorerBranch extends Component {
    constructor(...args) {
        super(...args);
        this.callbacks = this.props.callbacks;
        this.getPortals = (matrixcolumn, matrixrow) => {
            let userselections = this.props.userselections;
            let budgetdata = this.props.budgetdata;
            let portaltitles = budgetdata.DataSeries[userselections.dataseries].Titles;
            let dataseries = budgetdata.DataSeries[userselections.dataseries];
            let portalseriesname = dataseries.Name;
            if (dataseries.Units == 'DOLLAR') {
                portalseriesname += ' (' + dataseries.UnitsAlias + ')';
            }
            let portals = matrixcolumn.map((nodeconfig, index) => {
                let portalcharts = [];
                for (let chartindex in nodeconfig.charts) {
                    let chartblocktitle = null;
                    if ((nodeconfig.charts[chartindex].portalcharttype == 'Categories')) {
                        chartblocktitle = portaltitles.Categories;
                    }
                    else {
                        chartblocktitle = portaltitles.Baseline;
                    }
                    let portalchartparms = nodeconfig.charts[chartindex].chartparms;
                    let location = {
                        matrixlocation: nodeconfig.matrixlocation,
                        portalindex: Number(chartindex)
                    };
                    let explorer = this;
                    let portalchartsettings = {
                        onSwitchChartCode: ((location) => {
                            return (chartCode) => {
                                this.callbacks.switchChartCode(location, chartCode);
                            };
                        })(location),
                        chartCode: nodeconfig.charts[chartindex].chartCode,
                        graph_id: "ChartID" + matrixrow + '-' + index + '-' + chartindex,
                    };
                    let portalchart = {
                        portalchartparms: portalchartparms,
                        portalchartsettings: portalchartsettings,
                        chartblocktitle: "By " + chartblocktitle,
                    };
                    portalcharts.push(portalchart);
                }
                let portalname = null;
                if (nodeconfig.parentdata) {
                    portalname = nodeconfig.parentdata.Name;
                }
                else {
                    portalname = 'City Budget';
                }
                portalname += ' ' + portalseriesname;
                let budgetPortal = {
                    portalCharts: portalcharts,
                    portalName: portalname,
                    matrixLocation: {
                        column: matrixcolumn,
                        row: matrixrow,
                    }
                };
                return React.createElement(explorerportal_1.ExplorerPortal, {key: index, budgetPortal: budgetPortal, onChangePortalChart: this.callbacks.onChangeBudgetPortalChart});
            });
            return portals;
        };
    }
    render() {
        let branch = this;
        let drilldownbranch = branch.props.chartmatrix[constants_1.ChartSeries.DrillDown];
        let drilldownportals = branch.getPortals(drilldownbranch, constants_1.ChartSeries.DrillDown);
        return React.createElement("div", null, React.createElement("div", null, React.createElement("span", {style: { fontStyle: "italic" }}, "Viewpoint: "), React.createElement(DropDownMenu_1.default, {value: this.props.userselections.viewpoint, style: {}, onChange: (e, index, value) => {
            branch.callbacks.switchViewpoint(value, constants_1.ChartSeries.DrillDown);
        }}, React.createElement(MenuItem_1.default, {value: 'FUNCTIONAL', primaryText: "Functional"}), React.createElement(MenuItem_1.default, {value: 'STRUCTURAL', primaryText: "Structural"})), React.createElement("span", {style: { margin: "0 10px 0 10px", fontStyle: "italic" }}, "Facets: "), React.createElement(IconButton_1.default, {tooltip: "Expenditures", tooltipPosition: "top-center", onTouchTap: e => {
            branch.callbacks.switchDataSeries('BudgetExpenses', constants_1.ChartSeries.DrillDown);
        }, style: {
            backgroundColor: (this.props.userselections.dataseries == 'BudgetExpenses')
                ? "rgba(144,238,144,0.5)"
                : 'transparent',
            borderRadius: "50%"
        }}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "attach_money")), React.createElement(IconButton_1.default, {tooltip: "Revenues", tooltipPosition: "top-center", onTouchTap: e => {
            branch.callbacks.switchDataSeries('BudgetRevenues', constants_1.ChartSeries.DrillDown);
        }, style: {
            backgroundColor: (this.props.userselections.dataseries == 'BudgetRevenues')
                ? "rgba(144,238,144,0.5)"
                : 'transparent',
            borderRadius: "50%"
        }}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "receipt")), React.createElement(IconButton_1.default, {tooltip: "Staffing", tooltipPosition: "top-center", onTouchTap: e => {
            branch.callbacks.switchDataSeries('BudgetStaffing', constants_1.ChartSeries.DrillDown);
        }, style: {
            backgroundColor: (this.props.userselections.dataseries == 'BudgetStaffing')
                ? "rgba(144,238,144,0.5)"
                : 'transparent',
            borderRadius: "50%"
        }}, ">", React.createElement(FontIcon_1.default, {className: "material-icons"}, "people"))), React.createElement("div", {style: { whiteSpace: "nowrap" }}, React.createElement("div", {ref: node => {
            branch.props.branchScrollBlocks[constants_1.ChartSeries.DrillDown] = node;
        }, style: { overflow: "scroll" }}, drilldownportals, React.createElement("div", {style: { display: "inline-block", width: "500px" }}))));
    }
}
exports.ExplorerBranch = ExplorerBranch;
