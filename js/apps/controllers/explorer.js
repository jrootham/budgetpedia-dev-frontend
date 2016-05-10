'use strict';
const React = require('react');
var { Component } = React;
const react_redux_1 = require('react-redux');
const Card = require('material-ui/lib/card/card');
const CardTitle = require('material-ui/lib/card/card-title');
const CardText = require('material-ui/lib/card/card-text');
const RadioButton = require('material-ui/lib/radio-button');
const RadioButtonGroup = require('material-ui/lib/radio-button-group');
const FontIcon = require('material-ui/lib/font-icon');
const IconButton = require('material-ui/lib/icon-button');
const Divider = require('material-ui/lib/divider');
const Checkbox = require('material-ui/lib/checkbox');
const RaisedButton = require('material-ui/lib/raised-button');
const ReactSlider = require('react-slider');
const explorerchart_1 = require('../components/explorerchart');
const constants_1 = require('../constants');
const constants_2 = require('../constants');
const setviewpointamounts_1 = require('./explorer/setviewpointamounts');
const getchartparms_1 = require('./explorer/getchartparms');
const updatechartselections_1 = require('./explorer/updatechartselections');
class ExplorerClass extends Component {
    constructor(props) {
        super(props);
        this.state = {
            chartmatrix: [[], []],
            yearslider: { singlevalue: [2015], doublevalue: [2005, 2015] },
            yearscope: "one",
            userselections: {
                latestyear: 2015,
                viewpoint: "FUNCTIONAL",
                dataseries: "BudgetExpenses",
                charttype: "ColumnChart",
                inflationadjusted: true,
            }
        };
        this.componentDidMount = () => {
            this.initializeChartSeries();
        };
        this.initializeChartSeries = () => {
            let userselections = this.state.userselections, chartmatrix = this.state.chartmatrix;
            var matrixlocation, chartParmsObj;
            let viewpointname = userselections.viewpoint;
            let dataseriesname = userselections.dataseries;
            let budgetdata = this.props.budgetdata;
            setviewpointamounts_1.setViewpointAmounts(viewpointname, dataseriesname, budgetdata, userselections.inflationadjusted);
            let drilldownnodeconfig = this.initRootNodeConfig(constants_1.ChartSeries.DrillDown, userselections);
            let drilldownindex;
            for (drilldownindex in drilldownnodeconfig.charts) {
                chartParmsObj = getchartparms_1.getChartParms(drilldownnodeconfig, drilldownindex, userselections, budgetdata, this.setState.bind(this), chartmatrix);
                if (!chartParmsObj.isError) {
                    drilldownnodeconfig.charts[drilldownindex].chartparms = chartParmsObj.chartParms;
                    drilldownnodeconfig.charts[drilldownindex].chartCode =
                        constants_2.ChartTypeCodes[drilldownnodeconfig.charts[drilldownindex].chartparms.chartType];
                }
                else {
                    break;
                }
            }
            if (!chartParmsObj.isError) {
                drilldownnodeconfig.datanode = chartParmsObj.datanode;
                matrixlocation = drilldownnodeconfig.matrixlocation;
                chartmatrix[matrixlocation.row][matrixlocation.column] = drilldownnodeconfig;
            }
            this.setState({
                chartmatrix: chartmatrix,
            });
        };
        this.initRootNodeConfig = (matrixrow, userselections) => {
            let charttype = userselections.charttype;
            let chartCode = constants_2.ChartTypeCodes[charttype];
            let budgetdata = this.props.budgetdata;
            let viewpoint = userselections.viewpoint;
            let dataseries = userselections.dataseries;
            let portalcharts = budgetdata.Viewpoints[viewpoint].PortalCharts[dataseries];
            let charts = [];
            for (let type of portalcharts) {
                let chartconfig = {
                    charttype: charttype,
                    chartCode: chartCode,
                };
                chartconfig.portalcharttype = type.Type;
                charts.push(chartconfig);
            }
            return {
                viewpoint: viewpoint,
                dataseries: dataseries,
                datapath: [],
                matrixlocation: {
                    row: matrixrow,
                    column: 0
                },
                yearscope: {
                    latestyear: userselections.latestyear,
                    earliestyear: null,
                    fullrange: false,
                },
                charts: charts
            };
        };
        this.switchViewpoint = (viewpointname, seriesref) => {
            let userselections = this.state.userselections;
            let chartmatrix = this.state.chartmatrix;
            let chartseries = chartmatrix[seriesref];
            chartseries.splice(0);
            userselections.viewpoint = viewpointname;
            this.setState({
                userselections: userselections,
                chartmatrix: chartmatrix,
            });
            this.initializeChartSeries();
        };
        this.switchDataSeries = (seriesname, seriesref) => {
            let userselections = this.state.userselections;
            userselections.dataseries = seriesname;
            let chartmatrix = this.state.chartmatrix;
            this.setState({
                userselections: userselections,
            });
            let viewpointname = this.state.userselections.viewpoint;
            let dataseriesname = this.state.userselections.dataseries;
            let budgetdata = this.props.budgetdata;
            setviewpointamounts_1.setViewpointAmounts(viewpointname, dataseriesname, budgetdata, this.state.userselections.inflationadjusted);
            let matrixseries = chartmatrix[seriesref];
            let nodeconfig;
            let cellptr;
            let isError = false;
            let chartParmsObj = null;
            for (cellptr in matrixseries) {
                nodeconfig = matrixseries[cellptr];
                let nodechartindex = null;
                for (nodechartindex in nodeconfig.charts) {
                    chartParmsObj = getchartparms_1.getChartParms(nodeconfig, nodechartindex, userselections, budgetdata, this.setState, chartmatrix);
                    if (chartParmsObj.isError) {
                        matrixseries.splice(cellptr);
                        if (cellptr > 0) {
                            let parentconfig = matrixseries[cellptr - 1];
                            parentconfig.charts[nodechartindex].chartselection = null;
                            parentconfig.charts[nodechartindex].chart = null;
                        }
                        isError = true;
                        break;
                    }
                    else {
                        nodeconfig.charts[nodechartindex].chartparms = chartParmsObj.chartParms;
                        nodeconfig.charts[nodechartindex].chartCode =
                            constants_2.ChartTypeCodes[nodeconfig.charts[nodechartindex].chartparms.chartType];
                    }
                }
            }
            if (!isError) {
                nodeconfig.dataseries = seriesname;
                nodeconfig.datanode = chartParmsObj.datanode;
            }
            this.setState({
                chartmatrix: chartmatrix,
            });
            setTimeout(() => {
                updatechartselections_1.updateChartSelections(chartmatrix, seriesref);
            });
        };
        this.switchChartCode = (location, chartCode) => {
            let chartType = constants_2.ChartCodeTypes[chartCode];
            let portalIndex = location.portalindex;
            let chartmatrix = this.state.chartmatrix;
            let nodeConfig = chartmatrix[location.matrixlocation.row][location.matrixlocation.column];
            let oldChartType = nodeConfig.charts[portalIndex].charttype;
            nodeConfig.charts[portalIndex].charttype = chartType;
            let chartParmsObj = getchartparms_1.getChartParms(nodeConfig, portalIndex, this.state.userselections, this.props.budgetdata, this.setState.bind(this), chartmatrix);
            if (!chartParmsObj.isError) {
                nodeConfig.charts[portalIndex].chartparms = chartParmsObj.chartParms;
                nodeConfig.charts[portalIndex].chartCode =
                    constants_2.ChartTypeCodes[nodeConfig.charts[portalIndex].chartparms.chartType];
                nodeConfig.datanode = chartParmsObj.datanode;
            }
            else {
                nodeConfig.charts[portalIndex].charttype = oldChartType;
            }
            this.setState({
                chartmatrix: chartmatrix,
            });
            setTimeout(() => {
                if (nodeConfig.charts[portalIndex].chart) {
                    nodeConfig.charts[portalIndex].chart = nodeConfig.charts[portalIndex].Chart.chart;
                    if (nodeConfig.charts[portalIndex].charttype == "PieChart") {
                        nodeConfig.charts[portalIndex].chartselection[0].column = null;
                    }
                    else {
                        nodeConfig.charts[portalIndex].chartselection[0].column = 1;
                    }
                }
                updatechartselections_1.updateChartSelections(chartmatrix, location.matrixlocation.row);
            });
        };
        this.onChangeBudgetPortalChart = (portalLocation) => {
            setTimeout(() => {
                updatechartselections_1.updateChartSelections(this.state.chartmatrix, portalLocation.row);
            });
        };
        this.getCharts = (matrixcolumn, matrixrow) => {
            let userselections = this.state.userselections;
            let budgetdata = this.props.budgetdata;
            let portaltitles = budgetdata.DataSeries[userselections.dataseries].Titles;
            let charts = matrixcolumn.map((nodeconfig, index) => {
                let portalcharts = [];
                for (let chartindex in nodeconfig.charts) {
                    let chartblocktitle = null;
                    if ((nodeconfig.datanode.Contents == 'BASELINE')
                        || (nodeconfig.charts[chartindex].portalcharttype == 'Categories')) {
                        chartblocktitle = portaltitles.Components;
                    }
                    else {
                        chartblocktitle = portaltitles.Baseline;
                    }
                    let portalchartparms = nodeconfig.charts[chartindex].chartparms;
                    let portalchartsettings = {
                        onSwitchChartCode: this.switchChartCode,
                        chartCode: nodeconfig.charts[chartindex].chartCode,
                        graph_id: "ChartID" + matrixrow + '-' + index + '-' + chartindex,
                        chartblocktitle: "By " + chartblocktitle,
                    };
                    let portalchart = {
                        portalchartparms: portalchartparms,
                        portalchartsettings: portalchartsettings,
                        portalchartlocation: {
                            matrixlocation: nodeconfig.matrixlocation,
                            portalindex: null
                        }
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
                let budgetPortal = {
                    portalCharts: portalcharts,
                    portalName: portalname,
                    onChangeBudgetPortal: this.onChangeBudgetPortalChart,
                    portalLocation: {
                        column: matrixcolumn,
                        row: matrixrow,
                    }
                };
                return React.createElement(explorerchart_1.ExplorerChart, {key: index, budgetPortal: budgetPortal, onChangePortalChart: this.onChangeBudgetPortalChart});
            });
            return charts;
        };
    }
    render() {
        let explorer = this;
        let singleslider = (explorer.state.yearscope == 'one') ?
            React.createElement(ReactSlider, {className: "horizontal-slider", defaultValue: explorer.state.yearslider.singlevalue, min: 2003, max: 2016, onChange: (value) => {
                explorer.setState({
                    yearslider: Object.assign(explorer.state.yearslider, {
                        singlevalue: [value]
                    })
                });
            }}, React.createElement("div", null, explorer.state.yearslider.singlevalue[0])) : '';
        let doubleslider = (explorer.state.yearscope != 'one') ?
            React.createElement(ReactSlider, {className: "horizontal-slider", defaultValue: explorer.state.yearslider.doublevalue, min: 2003, max: 2016, withBars: (explorer.state.yearscope == 'all') ? true : false, onChange: (value) => {
                explorer.setState({
                    yearslider: Object.assign(explorer.state.yearslider, {
                        doublevalue: value
                    })
                });
            }}, React.createElement("div", null, explorer.state.yearslider.doublevalue[0]), React.createElement("div", null, explorer.state.yearslider.doublevalue[1])) : '';
        let dashboardsegment = React.createElement(Card, {initiallyExpanded: false}, React.createElement(CardTitle, {actAsExpander: true, showExpandableButton: true}, "Dashboard"), React.createElement(CardText, {expandable: true}, React.createElement("div", {style: { fontStyle: 'italic' }}, " These dashboard controls are not yet functional "), React.createElement(Divider, null), React.createElement(Checkbox, {label: "Inflation adjusted", defaultChecked: true}), React.createElement(Divider, null), React.createElement("div", {style: { display: 'inline-block', verticalAlign: "bottom", height: "24px", marginRight: "24px" }}, "Years:"), React.createElement(RadioButtonGroup, {style: { display: 'inline-block' }, name: "yearscope", defaultSelected: explorer.state.yearscope, onChange: (ev, selection) => {
            explorer.setState({ yearscope: selection });
        }}, React.createElement(RadioButton, {value: "one", label: "One", iconStyle: { marginRight: "4px" }, labelStyle: { width: "auto", marginRight: "24px" }, style: { display: 'inline-block', width: 'auto' }}), React.createElement(RadioButton, {value: "two", label: "Two (side-by-side)", iconStyle: { marginRight: "4px" }, labelStyle: { width: "auto", marginRight: "24px" }, style: { display: 'inline-block', width: 'auto' }}), React.createElement(RadioButton, {value: "all", label: "All (timelines)", iconStyle: { marginRight: "4px" }, labelStyle: { width: "auto", marginRight: "24px" }, style: { display: 'inline-block', width: 'auto' }})), singleslider, doubleslider, React.createElement("div", {style: { display: (explorer.state.yearscope == 'all') ? 'inline' : 'none' }}, React.createElement(Checkbox, {label: "Year-over-year change, rather than actuals", defaultChecked: false})), React.createElement(Divider, null), React.createElement(RaisedButton, {style: { marginRight: "24px" }, type: "button", label: "Download"}), React.createElement(RaisedButton, {type: "button", label: "Reset"})));
        let drilldownlist = explorer.state.chartmatrix[constants_1.ChartSeries.DrillDown];
        let drilldowncharts = explorer.getCharts(drilldownlist, constants_1.ChartSeries.DrillDown);
        let drilldownsegment = React.createElement(Card, {initiallyExpanded: true}, React.createElement(CardTitle, {actAsExpander: true, showExpandableButton: true}, "Drill Down"), React.createElement(CardText, {expandable: true}, React.createElement("p", null, "Click or tap on any column to drill down.", React.createElement(IconButton, {tooltip: "help", tooltipPosition: "top-center"}, React.createElement(FontIcon, {className: "material-icons"}, "help_outline"))), React.createElement("div", {style: {
            padding: "3px" }}, React.createElement("span", null, "Viewpoints: "), React.createElement(IconButton, {tooltip: "Functional", tooltipPosition: "top-center", onTouchTap: e => {
            this.switchViewpoint('FUNCTIONAL', constants_1.ChartSeries.DrillDown);
        }, style: { backgroundColor: (this.state.userselections.viewpoint == 'FUNCTIONAL')
                ? "rgba(144,238,144,0.5)"
                : 'transparent',
            borderRadius: "50%" }}, React.createElement(FontIcon, {className: "material-icons"}, "directions_walk")), React.createElement(IconButton, {tooltip: "Structural", tooltipPosition: "top-center", onTouchTap: e => {
            this.switchViewpoint('STRUCTURAL', constants_1.ChartSeries.DrillDown);
        }, style: {
            backgroundColor: (this.state.userselections.viewpoint == 'STRUCTURAL')
                ? "rgba(144,238,144,0.5)"
                : 'transparent',
            borderRadius: "50%"
        }}, ">", React.createElement(FontIcon, {className: "material-icons"}, "layers")), React.createElement("span", {style: { marginLeft: "10px" }}, "Facets: "), React.createElement(IconButton, {tooltip: "Expenses", tooltipPosition: "top-center", onTouchTap: e => {
            this.switchDataSeries('BudgetExpenses', constants_1.ChartSeries.DrillDown);
        }, style: {
            backgroundColor: (this.state.userselections.dataseries == 'BudgetExpenses')
                ? "rgba(144,238,144,0.5)"
                : 'transparent',
            borderRadius: "50%"
        }}, React.createElement(FontIcon, {className: "material-icons"}, "attach_money")), React.createElement(IconButton, {tooltip: "Revenues", tooltipPosition: "top-center", onTouchTap: e => {
            this.switchDataSeries('BudgetRevenues', constants_1.ChartSeries.DrillDown);
        }, style: {
            backgroundColor: (this.state.userselections.dataseries == 'BudgetRevenues')
                ? "rgba(144,238,144,0.5)"
                : 'transparent',
            borderRadius: "50%"
        }}, React.createElement(FontIcon, {className: "material-icons"}, "receipt")), React.createElement(IconButton, {tooltip: "Staffing", tooltipPosition: "top-center", onTouchTap: e => {
            this.switchDataSeries('BudgetStaffing', constants_1.ChartSeries.DrillDown);
        }, style: {
            backgroundColor: (this.state.userselections.dataseries == 'BudgetStaffing')
                ? "rgba(144,238,144,0.5)"
                : 'transparent',
            borderRadius: "50%"
        }}, ">", React.createElement(FontIcon, {className: "material-icons"}, "people"))), React.createElement("div", {style: { whiteSpace: "nowrap" }}, React.createElement("div", {style: { overflow: "scroll" }}, drilldowncharts, React.createElement("div", {style: { display: "inline-block", width: "500px" }})))));
        let comparelist = explorer.state.chartmatrix[constants_1.ChartSeries.Compare];
        let comparecharts = explorer.getCharts(comparelist, constants_1.ChartSeries.Compare);
        let comparesegment = React.createElement(Card, {initiallyExpanded: false}, React.createElement(CardTitle, {actAsExpander: true, showExpandableButton: true}, "Compare"), React.createElement(CardText, {expandable: true}, React.createElement("p", null, "Click or tap on any column to drill down"), React.createElement("div", {style: { whiteSpace: "nowrap" }}, React.createElement("div", {style: { overflow: "scroll" }}, comparecharts, React.createElement("div", {style: { display: "inline-block", width: "500px" }})))));
        let differencessegment = React.createElement(Card, null, React.createElement(CardTitle, null, "Show differences"));
        let contextsegment = React.createElement(Card, null, React.createElement(CardTitle, null, "Context"));
        let buildsegment = React.createElement(Card, null, React.createElement(CardTitle, null, "Build"));
        return React.createElement("div", null, dashboardsegment, drilldownsegment, comparesegment, differencessegment, contextsegment, buildsegment);
    }
}
let mapStateToProps = (state) => {
    let { budgetdata } = state;
    return {
        budgetdata: budgetdata,
    };
};
let Explorer = react_redux_1.connect(mapStateToProps)(ExplorerClass);
exports.Explorer = Explorer;
