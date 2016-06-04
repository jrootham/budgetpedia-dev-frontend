'use strict';
const React = require('react');
var { Component } = React;
const react_redux_1 = require('react-redux');
const Card_1 = require('material-ui/Card');
const FontIcon_1 = require('material-ui/FontIcon');
const IconButton_1 = require('material-ui/IconButton');
const Dialog_1 = require('material-ui/Dialog');
const explorerbranch_1 = require('../components/explorerbranch');
const constants_1 = require('../constants');
const constants_2 = require('../constants');
const setviewpointdata_1 = require('./explorer/setviewpointdata');
const getchartparms_1 = require('./explorer/getchartparms');
const updatechartselections_1 = require('./explorer/updatechartselections');
const Actions = require('../../actions/actions');
class ExplorerClass extends Component {
    constructor(props) {
        super(props);
        this.state = {
            chartmatrix: [[], []],
            yearslider: { singlevalue: [2015], doublevalue: [2005, 2015] },
            yearscope: "one",
            dialogopen: false,
            userselections: {
                latestyear: 2015,
                viewpoint: "FUNCTIONAL",
                dataseries: "BudgetExpenses",
                charttype: "ColumnChart",
                inflationadjusted: true,
            }
        };
        this.branchScrollBlocks = [];
        this.componentDidMount = () => {
            this.initializeChartSeries();
        };
        this.initializeChartSeries = () => {
            let userselections = this.state.userselections, chartmatrix = this.state.chartmatrix;
            var matrixlocation, chartParmsObj;
            let viewpointname = userselections.viewpoint;
            let dataseriesname = userselections.dataseries;
            let budgetdata = this.props.budgetdata;
            setviewpointdata_1.setViewpointData(viewpointname, dataseriesname, budgetdata, userselections.inflationadjusted);
            let drilldownnodeconfig = this.initRootNodeConfig(constants_1.ChartSeries.DrillDown, userselections);
            let drilldownindex;
            for (drilldownindex in drilldownnodeconfig.charts) {
                let props = {
                    nodeConfig: drilldownnodeconfig,
                    chartIndex: drilldownindex,
                    userselections: userselections,
                    budgetdata: budgetdata,
                    chartmatrix: chartmatrix,
                };
                let callbacks = {
                    refreshPresentation: this.refreshPresentation,
                    onPortalCreation: this.onPortalCreation,
                    workingStatus: this.workingStatus,
                };
                chartParmsObj = getchartparms_1.getChartParms(props, callbacks);
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
        this.handleDialogOpen = () => {
            this.setState({
                dialogopen: true
            });
        };
        this.handleDialogClose = () => {
            this.setState({
                dialogopen: false
            });
        };
        this.onPortalCreation = (newMatrixLocation) => {
            let matrixrow = newMatrixLocation.row;
            let element = this.branchScrollBlocks[matrixrow];
            if (!element) {
                console.error('expected branch element not found in onPortalCreation', newMatrixLocation);
                return;
            }
            setTimeout(() => {
                let scrollwidth = element.scrollWidth;
                let scrollleft = element.scrollLeft;
                let clientwidth = element.clientWidth;
                let scrollright = scrollleft + clientwidth;
                let targetright = scrollwidth - 500;
                let adjustment = scrollright - targetright;
                if (adjustment < 0) {
                    let frames = 60;
                    let t = 1 / frames;
                    let timeinterval = 1000 / frames;
                    let counter = 0;
                    let tick = () => {
                        counter++;
                        let factor = this.easeOutCubic(counter * t);
                        let scrollinterval = adjustment * factor;
                        element.scrollLeft = scrollleft - scrollinterval;
                        if (counter < frames) {
                            requestAnimationFrame(tick);
                        }
                    };
                    requestAnimationFrame(tick);
                }
            });
        };
        this.easeOutCubic = t => {
            const t1 = t - 1;
            return t1 * t1 * t1 + 1;
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
            setviewpointdata_1.setViewpointData(viewpointname, dataseriesname, budgetdata, this.state.userselections.inflationadjusted);
            let matrixseries = chartmatrix[seriesref];
            let nodeconfig;
            let cellptr;
            let isError = false;
            let chartParmsObj = null;
            for (cellptr in matrixseries) {
                nodeconfig = matrixseries[cellptr];
                let nodechartindex = null;
                for (nodechartindex in nodeconfig.charts) {
                    let props = {
                        nodeConfig: nodeconfig,
                        chartIndex: nodechartindex,
                        userselections: userselections,
                        budgetdata: budgetdata,
                        chartmatrix: chartmatrix,
                    };
                    let callbacks = {
                        refreshPresentation: this.refreshPresentation,
                        onPortalCreation: this.onPortalCreation,
                        workingStatus: this.workingStatus,
                    };
                    chartParmsObj = getchartparms_1.getChartParms(props, callbacks);
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
        this.workingStatus = status => {
            if (status) {
                this.props.dispatch(Actions.showWaitingMessage());
            }
            else {
                setTimeout(() => {
                    this.props.dispatch(Actions.hideWaitingMessage());
                }, 250);
            }
        };
        this.onChangeBudgetPortalChart = (matrixLocation) => {
            setTimeout(() => {
                updatechartselections_1.updateChartSelections(this.state.chartmatrix, matrixLocation.row);
            });
        };
        this.refreshPresentation = chartmatrix => {
            this.setState({
                chartmatrix: chartmatrix,
            });
        };
        this.switchChartCode = (location, chartCode) => {
            let chartType = constants_2.ChartCodeTypes[chartCode];
            let portalIndex = location.portalindex;
            let chartmatrix = this.state.chartmatrix;
            let nodeConfig = chartmatrix[location.matrixlocation.row][location.matrixlocation.column];
            let oldChartType = nodeConfig.charts[portalIndex].charttype;
            nodeConfig.charts[portalIndex].charttype = chartType;
            let props = {
                nodeConfig: nodeConfig,
                chartIndex: portalIndex,
                userselections: this.state.userselections,
                budgetdata: this.props.budgetdata,
                chartmatrix: chartmatrix,
            };
            let callbacks = {
                refreshPresentation: this.refreshPresentation,
                onPortalCreation: this.onPortalCreation,
                workingStatus: this.workingStatus,
            };
            let chartParmsObj = getchartparms_1.getChartParms(props, callbacks);
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
    }
    render() {
        let explorer = this;
        let dialogbox = React.createElement(Dialog_1.default, {title: "Budget Explorer Help", modal: false, open: this.state.dialogopen, onRequestClose: this.handleDialogClose, autoScrollBodyContent: true}, React.createElement(IconButton_1.default, {style: {
            top: 0,
            right: 0,
            padding: 0,
            height: "36px",
            width: "36px",
            position: "absolute",
            zIndex: 2,
        }, onTouchTap: this.handleDialogClose}, React.createElement(FontIcon_1.default, {className: "material-icons", style: { cursor: "pointer" }}, "close")), React.createElement("p", null, "In the explorer charts, Viewpoints include: "), React.createElement("dl", null, React.createElement("dt", null, React.createElement("strong", null, "Functional")), React.createElement("dd", null, "combines City of Toronto Agencies and Divisions into groups according to the nature of the services delivered (this is the default ) "), React.createElement("dt", null, React.createElement("strong", null, "Structural")), React.createElement("dd", null, "more traditional: separates Agencies from Divisions; groupings are closer to those found" + ' ' + "in City annual Budget Summaries")), React.createElement("p", null, "Facets are the main datasets available: Expenditures, Revenues, and Staffing Positions (Full Time Equivalents) "), React.createElement("p", null, "This prototype uses data from the City Council Approved Operating Budget Summary 2015 from the City of Toronto's open data portal"), React.createElement("p", null, "Click or tap on any column in the \"By Programs\" charts to drill-down. Other charts do not" + ' ' + "currently support drill-down."));
        let drilldownsegment = React.createElement(Card_1.Card, {initiallyExpanded: true}, React.createElement(Card_1.CardTitle, {actAsExpander: false, showExpandableButton: false}, "Budget Explorer"), React.createElement(Card_1.CardText, {expandable: true}, "If you're new here, ", React.createElement("a", {href: "javascript:void(0)", onTouchTap: this.handleDialogOpen}, "read the help text"), " first.", React.createElement(IconButton_1.default, {tooltip: "help", tooltipPosition: "top-center", onTouchTap: this.handleDialogOpen}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "help_outline"))), React.createElement(Card_1.CardText, null, React.createElement(explorerbranch_1.ExplorerBranch, {budgetdata: explorer.props.budgetdata, chartmatrix: explorer.state.chartmatrix, userselections: explorer.state.userselections, callbacks: {
            switchChartCode: explorer.switchChartCode,
            onChangeBudgetPortalChart: explorer.onChangeBudgetPortalChart,
            switchViewpoint: explorer.switchViewpoint,
            switchDataSeries: explorer.switchDataSeries,
        }, branchScrollBlocks: explorer.branchScrollBlocks})));
        return React.createElement("div", null, dialogbox, drilldownsegment);
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
