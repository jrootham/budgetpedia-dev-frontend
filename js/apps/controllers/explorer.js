'use strict';
const React = require('react');
var { Component } = React;
const react_redux_1 = require('react-redux');
const Card = require('material-ui/lib/card/card');
const CardTitle = require('material-ui/lib/card/card-title');
const CardText = require('material-ui/lib/card/card-text');
const FontIcon = require('material-ui/lib/font-icon');
const IconButton = require('material-ui/lib/icon-button');
const DropDownMenu = require('material-ui/lib/drop-down-menu');
const MenuItem = require('material-ui/lib/menus/menu-item');
const Dialog = require('material-ui/lib/dialog');
const explorerportal_1 = require('../components/explorerportal');
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
        this.onPortalCreation = (newPortalLocation) => {
            let matrixrow = newPortalLocation.row;
            let element = this.branchScrollBlocks[matrixrow];
            if (!element) {
                console.error('expected branch element not found in onPortalCreation', newPortalLocation);
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
        this.onChangeBudgetPortalChart = (portalLocation) => {
            setTimeout(() => {
                updatechartselections_1.updateChartSelections(this.state.chartmatrix, portalLocation.row);
            });
        };
        this.refreshPresentation = chartmatrix => {
            this.setState({
                chartmatrix: chartmatrix,
            });
        };
        this.getPortals = (matrixcolumn, matrixrow) => {
            let userselections = this.state.userselections;
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
                                explorer.switchChartCode(location, chartCode);
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
                    portalLocation: {
                        column: matrixcolumn,
                        row: matrixrow,
                    }
                };
                return React.createElement(explorerportal_1.ExplorerPortal, {key: index, budgetPortal: budgetPortal, onChangePortalChart: this.onChangeBudgetPortalChart});
            });
            return portals;
        };
    }
    render() {
        let explorer = this;
        let dialogbox = React.createElement(Dialog, {title: "Budget Explorer Help", modal: false, open: this.state.dialogopen, onRequestClose: this.handleDialogClose, autoScrollBodyContent: true}, React.createElement(IconButton, {style: {
            top: 0,
            right: 0,
            padding: 0,
            height: "36px",
            width: "36px",
            position: "absolute",
            zIndex: 2,
        }, onTouchTap: this.handleDialogClose}, React.createElement(FontIcon, {className: "material-icons", style: { cursor: "pointer" }}, "close")), React.createElement("p", null, "In the explorer charts, Viewpoints include: "), React.createElement("dl", null, React.createElement("dt", null, React.createElement("strong", null, "Functional")), React.createElement("dd", null, "combines City of Toronto Agencies and Divisions into groups according to the nature of the services delivered (this is the default ) "), React.createElement("dt", null, React.createElement("strong", null, "Structural")), React.createElement("dd", null, "more traditional: separates Agencies from Divisions; groupings are closer to those found" + ' ' + "in City annual Budget Summaries")), React.createElement("p", null, "The icons beside the selected viewpoint are the main datasets available: Expenditures, Revenues, and Staffing Positions (Full Time Equivalents) "), React.createElement("p", null, "This prototype uses data from the City Council Approved Operating Budget Summary 2015 from the City of Toronto's open data portal"), React.createElement("p", null, "Click or tap on any column in the \"By Programs\" charts to drill-down. Other charts do not" + ' ' + "currently support drill-down."));
        let drilldownbranch = explorer.state.chartmatrix[constants_1.ChartSeries.DrillDown];
        let drilldownportals = explorer.getPortals(drilldownbranch, constants_1.ChartSeries.DrillDown);
        let drilldownsegment = React.createElement(Card, {initiallyExpanded: true}, React.createElement(CardTitle, {actAsExpander: false, showExpandableButton: false}, "Budget Explorer"), React.createElement(CardText, {expandable: true}, React.createElement("p", {style: { marginTop: 0 }}, "If you're new here, ", React.createElement("a", {href: "javascript:void(0)", onTouchTap: this.handleDialogOpen}, "read the help text"), " first.", React.createElement(IconButton, {tooltip: "help", tooltipPosition: "top-center", onTouchTap: this.handleDialogOpen}, React.createElement(FontIcon, {className: "material-icons"}, "help_outline"))), React.createElement("div", {style: {
            padding: "3px" }}, React.createElement("span", {style: { fontStyle: "italic" }}, "Viewpoint: "), React.createElement(DropDownMenu, {value: this.state.userselections.viewpoint, style: {}, onChange: (e, index, value) => {
            this.switchViewpoint(value, constants_1.ChartSeries.DrillDown);
        }}, React.createElement(MenuItem, {value: 'FUNCTIONAL', primaryText: "Functional"}), React.createElement(MenuItem, {value: 'STRUCTURAL', primaryText: "Structural"})), React.createElement("span", {style: { margin: "0 10px 0 10px", fontStyle: "italic" }}, "Select: "), React.createElement(IconButton, {tooltip: "Expenditures", tooltipPosition: "top-center", onTouchTap: e => {
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
        }}, ">", React.createElement(FontIcon, {className: "material-icons"}, "people"))), React.createElement("div", {style: { whiteSpace: "nowrap" }}, React.createElement("div", {ref: node => {
            this.branchScrollBlocks[constants_1.ChartSeries.DrillDown] = node;
        }, style: { overflow: "scroll" }}, drilldownportals, React.createElement("div", {style: { display: "inline-block", width: "500px" }})))));
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
