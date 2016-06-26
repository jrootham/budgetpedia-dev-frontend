'use strict';
const React = require('react');
var { Component } = React;
const explorerportal_1 = require('./explorerportal');
const getbudgetnode_1 = require('../controllers/explorer/getbudgetnode');
const DropDownMenu_1 = require('material-ui/DropDownMenu');
const MenuItem_1 = require('material-ui/MenuItem');
const FontIcon_1 = require('material-ui/FontIcon');
const IconButton_1 = require('material-ui/IconButton');
const Snackbar_1 = require('material-ui/Snackbar');
const constants_1 = require('../constants');
const databaseapi_1 = require('../../local/databaseapi');
const getchartparms_1 = require('../controllers/explorer/getchartparms');
const updatechartselections_1 = require('../controllers/explorer/updatechartselections');
const onchartcomponentselection_1 = require('../controllers/explorer/onchartcomponentselection');
const budgetnode_1 = require('../../local/budgetnode');
class ExplorerBranch extends Component {
    constructor(props) {
        super(props);
        this.state = {
            chartmatrixrow: this.props.branchdata.nodes,
            yearslider: this.props.yearslider,
            yearscope: this.props.yearscope,
            userselections: this.props.userselections,
            snackbar: { open: false, message: 'empty' }
        };
        this.handleSnackbarRequestClose = () => {
            this.setState({
                snackbar: {
                    open: false,
                    message: 'empty',
                }
            });
            setTimeout(() => {
                updatechartselections_1.updateChartSelections(this.state.chartmatrixrow);
            });
        };
        this.branchScrollBlock = null;
        this.componentDidMount = () => {
            this.initializeChartSeries();
        };
        this.initializeChartSeries = () => {
            let userselections = this.state.userselections, chartmatrixrow = this.state.chartmatrixrow;
            let budgetdata = this.props.branchdata.data;
            var matrixlocation, chartParmsObj;
            let viewpointname = userselections.viewpoint;
            let facet = userselections.facet;
            let viewpointdata = databaseapi_1.default.getViewpointData({
                viewpointname: viewpointname,
                dataseriesname: facet,
                wantsInflationAdjusted: userselections.inflationadjusted,
                timeSpecs: {
                    leftYear: null,
                    rightYear: null,
                    spanYears: false,
                }
            });
            budgetdata.viewpointdata = viewpointdata;
            let datapath = [];
            let node = getbudgetnode_1.getBudgetNode(viewpointdata, datapath);
            let budgetNodeParms = {
                defaultChartType: userselections.charttype,
                viewpointName: userselections.viewpoint,
                facetName: userselections.facet,
                portalCharts: viewpointdata.PortalCharts,
                timeSpecs: {
                    leftYear: null,
                    rightYear: userselections.latestyear,
                    spanYears: false,
                },
                dataPath: [],
                matrixLocation: { column: 0 },
                dataNode: node,
            };
            let budgetnode = new budgetnode_1.default(budgetNodeParms);
            let drilldownnodeconfig = budgetnode;
            let drilldownindex;
            for (drilldownindex in drilldownnodeconfig.cells) {
                let props = {
                    nodeConfig: drilldownnodeconfig,
                    chartIndex: drilldownindex,
                    budgetdata: budgetdata,
                    userselections: userselections,
                    chartmatrixrow: chartmatrixrow,
                };
                let callbacks = {
                    refreshPresentation: this.refreshPresentation,
                    onPortalCreation: this.onPortalCreation,
                    workingStatus: this.props.callbacks.workingStatus,
                };
                chartParmsObj = getchartparms_1.default(props, callbacks);
                if (!chartParmsObj.isError) {
                    drilldownnodeconfig.cells[drilldownindex].chartparms = chartParmsObj.chartParms;
                    drilldownnodeconfig.cells[drilldownindex].chartCode =
                        constants_1.ChartTypeCodes[drilldownnodeconfig.cells[drilldownindex].chartparms.chartType];
                }
                else {
                    break;
                }
            }
            if (!chartParmsObj.isError) {
                matrixlocation = drilldownnodeconfig.matrixLocation;
                chartmatrixrow[matrixlocation.column] = drilldownnodeconfig;
            }
            this.refreshPresentation(chartmatrixrow);
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
        this.onPortalCreation = () => {
            let element = this.branchScrollBlock;
            if (!element) {
                console.error('expected branch element not found in onPortalCreation');
                return;
            }
            setTimeout(() => {
                let scrollwidth = element.scrollWidth;
                let scrollleft = element.scrollLeft;
                let clientwidth = element.clientWidth;
                let scrollright = scrollleft + clientwidth;
                let targetright = scrollwidth - 500;
                let adjustment = scrollright - targetright;
                if (adjustment > 0)
                    adjustment = Math.min(adjustment, scrollleft);
                let frames = 60;
                let t = 1 / frames;
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
            });
        };
        this.easeOutCubic = t => {
            const t1 = t - 1;
            return t1 * t1 * t1 + 1;
        };
        this.switchViewpoint = (viewpointname) => {
            let userselections = this.state.userselections;
            let chartmatrixrow = this.state.chartmatrixrow;
            let chartseries = chartmatrixrow;
            chartseries.splice(0);
            userselections.viewpoint = viewpointname;
            this.setState({
                userselections: userselections,
                chartmatrixrow: chartmatrixrow,
            });
            this.initializeChartSeries();
        };
        this.switchFacet = (facet) => {
            let userselections = this.state.userselections;
            userselections.facet = facet;
            let viewpointname = this.state.userselections.viewpoint;
            let viewpointdata = databaseapi_1.default.getViewpointData({
                viewpointname: viewpointname,
                dataseriesname: facet,
                wantsInflationAdjusted: userselections.inflationadjusted,
                timeSpecs: {
                    leftYear: null,
                    rightYear: null,
                    spanYears: false,
                }
            });
            let budgetdata = this.props.branchdata.data;
            budgetdata.viewpointdata = viewpointdata;
            let chartmatrixrow = this.state.chartmatrixrow;
            let oldchartmatrixrow = [...chartmatrixrow];
            let budgetNode = null;
            let parentnodeconfig;
            let cellptr;
            let isError = false;
            let chartParmsObj = null;
            for (cellptr in chartmatrixrow) {
                parentnodeconfig = budgetNode;
                budgetNode = chartmatrixrow[cellptr];
                let nextdataNode = getbudgetnode_1.getBudgetNode(viewpointdata, budgetNode.dataPath);
                if (nextdataNode) {
                    let deeperdata = (!!nextdataNode.Components && (budgetNode.cells.length == 1));
                    let shallowerdata = (!nextdataNode.Components && (budgetNode.cells.length == 2));
                    budgetNode.reset(nextdataNode, viewpointdata.PortalCharts, userselections.charttype);
                    if (deeperdata || shallowerdata) {
                        chartmatrixrow.splice(cellptr);
                        isError = true;
                        let prevconfig = chartmatrixrow[cellptr - 1];
                        let context = {
                            selection: prevconfig.cells[0].chartselection,
                            ChartObject: prevconfig.cells[0].ChartObject,
                        };
                        let childprops = {
                            budgetNode: prevconfig,
                            userselections: userselections,
                            budgetdata: budgetdata,
                            chartmatrixrow: chartmatrixrow,
                            selectionrow: prevconfig.cells[0].chartselection[0].row,
                            matrixcolumn: prevconfig.matrixLocation.column,
                            portalChartIndex: 0,
                            context: context,
                            chart: prevconfig.cells[0].chart,
                        };
                        let childcallbacks = {
                            refreshPresentation: this.refreshPresentation,
                            onPortalCreation: this.onPortalCreation,
                            workingStatus: this.props.callbacks.workingStatus,
                        };
                        onchartcomponentselection_1.createChildNode(childprops, childcallbacks);
                        let message = null;
                        if (deeperdata) {
                            message = "More drilldown is available for current facet selection";
                        }
                        else {
                            message = "Less drilldown is available for current facet selection";
                        }
                        this.state.snackbar.message = message;
                        this.state.snackbar.open = true;
                        budgetNode = null;
                    }
                }
                else {
                    console.error('no data node');
                }
                let nodechartindex = null;
                if (!budgetNode)
                    break;
                for (nodechartindex in budgetNode.cells) {
                    let props = {
                        nodeConfig: budgetNode,
                        chartIndex: nodechartindex,
                        userselections: userselections,
                        budgetdata: budgetdata,
                        chartmatrixrow: chartmatrixrow,
                    };
                    let callbacks = {
                        refreshPresentation: this.refreshPresentation,
                        onPortalCreation: this.onPortalCreation,
                        workingStatus: this.props.callbacks.workingStatus,
                    };
                    chartParmsObj = getchartparms_1.default(props, callbacks);
                    if (chartParmsObj.isError) {
                        chartmatrixrow.splice(cellptr);
                        if (cellptr > 0) {
                            let parentconfig = chartmatrixrow[cellptr - 1];
                            parentconfig.cells[nodechartindex].chartselection = null;
                            parentconfig.cells[nodechartindex].chart = null;
                        }
                        isError = true;
                        break;
                    }
                    else {
                        budgetNode.facetName = facet;
                        budgetNode.cells[nodechartindex].chartparms = chartParmsObj.chartParms;
                        budgetNode.cells[nodechartindex].chartCode =
                            constants_1.ChartTypeCodes[budgetNode.cells[nodechartindex].chartparms.chartType];
                        if (parentnodeconfig) {
                            budgetNode.parentData.dataNode = parentnodeconfig.dataNode;
                        }
                    }
                }
            }
            this.refreshPresentation(chartmatrixrow);
            setTimeout(() => {
                updatechartselections_1.updateChartSelections(chartmatrixrow);
            });
        };
        this.onChangeBudgetPortalChart = () => {
            setTimeout(() => {
                updatechartselections_1.updateChartSelections(this.state.chartmatrixrow);
            });
        };
        this.refreshPresentation = chartmatrixrow => {
            this.setState({
                chartmatrixrow: chartmatrixrow,
            });
        };
        this.switchChartCode = (location, chartCode) => {
            let chartType = constants_1.ChartCodeTypes[chartCode];
            let portalIndex = location.portalindex;
            let chartmatrixrow = this.state.chartmatrixrow;
            let nodeConfig = chartmatrixrow[location.matrixlocation.column];
            let oldChartType = nodeConfig.cells[portalIndex].googleChartType;
            nodeConfig.cells[portalIndex].googleChartType = chartType;
            let budgetdata = this.props.branchdata.data;
            let props = {
                nodeConfig: nodeConfig,
                chartIndex: portalIndex,
                userselections: this.state.userselections,
                budgetdata: budgetdata,
                chartmatrixrow: chartmatrixrow,
            };
            let callbacks = {
                refreshPresentation: this.refreshPresentation,
                onPortalCreation: this.onPortalCreation,
                workingStatus: this.props.callbacks.workingStatus,
            };
            let chartParmsObj = getchartparms_1.default(props, callbacks);
            if (!chartParmsObj.isError) {
                nodeConfig.cells[portalIndex].chartparms = chartParmsObj.chartParms;
                nodeConfig.cells[portalIndex].chartCode =
                    constants_1.ChartTypeCodes[nodeConfig.cells[portalIndex].chartparms.chartType];
            }
            else {
                nodeConfig.cells[portalIndex].googleChartType = oldChartType;
            }
            this.refreshPresentation(chartmatrixrow);
            setTimeout(() => {
                if (nodeConfig.cells[portalIndex].chart) {
                    nodeConfig.cells[portalIndex].chart = nodeConfig.cells[portalIndex].ChartObject.chart;
                    if (nodeConfig.cells[portalIndex].googleChartType == "PieChart") {
                        nodeConfig.cells[portalIndex].chartselection[0].column = null;
                    }
                    else {
                        nodeConfig.cells[portalIndex].chartselection[0].column = 1;
                    }
                }
                updatechartselections_1.updateChartSelections(chartmatrixrow);
            });
        };
        this.getPortals = (matrixrow) => {
            let userselections = this.state.userselections;
            let budgetdata = this.props.branchdata.data;
            if (!budgetdata.viewpointdata)
                return [];
            let viewpointdata = budgetdata.viewpointdata;
            let itemseriesdata = viewpointdata.itemseriesconfigdata;
            let portaltitles = itemseriesdata.Titles;
            let portalseriesname = itemseriesdata.Name;
            if (itemseriesdata.Units == 'DOLLAR') {
                portalseriesname += ' (' + itemseriesdata.UnitsAlias + ')';
            }
            let portals = matrixrow.map((budgetNode, index) => {
                let portalcharts = [];
                for (let chartindex in budgetNode.cells) {
                    let chartblocktitle = null;
                    if ((budgetNode.cells[chartindex].nodeDataPropertyName == 'Categories')) {
                        chartblocktitle = portaltitles.Categories;
                    }
                    else {
                        chartblocktitle = portaltitles.Baseline;
                    }
                    let chartparms = budgetNode.cells[chartindex].chartparms;
                    let location = {
                        matrixlocation: budgetNode.matrixLocation,
                        portalindex: Number(chartindex)
                    };
                    let explorer = this;
                    let chartsettings = {
                        onSwitchChartCode: ((location) => {
                            return (chartCode) => {
                                this.switchChartCode(location, chartCode);
                            };
                        })(location),
                        chartCode: budgetNode.cells[chartindex].chartCode,
                        graph_id: "ChartID" + this.props.branchkey + '-' + index + '-' + chartindex,
                    };
                    let portalchart = {
                        chartparms: chartparms,
                        chartsettings: chartsettings,
                        chartblocktitle: "By " + chartblocktitle,
                    };
                    portalcharts.push(portalchart);
                }
                let portalname = null;
                if (budgetNode.parentData) {
                    portalname = budgetNode.parentData.Name;
                }
                else {
                    portalname = 'City Budget';
                }
                portalname += ' ' + portalseriesname;
                let budgetPortal = {
                    portalCharts: portalcharts,
                    portalName: portalname,
                };
                return React.createElement(explorerportal_1.ExplorerPortal, {key: index, budgetPortal: budgetPortal, onChangePortalChart: this.onChangeBudgetPortalChart});
            });
            return portals;
        };
    }
    render() {
        let branch = this;
        let drilldownbranch = branch.state.chartmatrixrow;
        let drilldownportals = branch.getPortals(drilldownbranch);
        return React.createElement("div", null, React.createElement("div", null, React.createElement("span", {style: { fontStyle: "italic" }}, "Viewpoint: "), React.createElement(DropDownMenu_1.default, {value: this.state.userselections.viewpoint, style: {}, onChange: (e, index, value) => {
            branch.switchViewpoint(value);
        }}, React.createElement(MenuItem_1.default, {value: 'FUNCTIONAL', primaryText: "Functional"}), React.createElement(MenuItem_1.default, {value: 'STRUCTURAL', primaryText: "Structural"})), React.createElement("span", {style: { margin: "0 10px 0 10px", fontStyle: "italic" }}, "Facets: "), React.createElement(IconButton_1.default, {tooltip: "Expenditures", tooltipPosition: "top-center", onTouchTap: e => {
            branch.switchFacet('BudgetExpenses');
        }, style: {
            backgroundColor: (this.state.userselections.facet == 'BudgetExpenses')
                ? "rgba(144,238,144,0.5)"
                : 'transparent',
            borderRadius: "50%"
        }}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "attach_money")), React.createElement(IconButton_1.default, {tooltip: "Revenues", tooltipPosition: "top-center", onTouchTap: e => {
            branch.switchFacet('BudgetRevenues');
        }, style: {
            backgroundColor: (this.state.userselections.facet == 'BudgetRevenues')
                ? "rgba(144,238,144,0.5)"
                : 'transparent',
            borderRadius: "50%"
        }}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "receipt")), React.createElement(IconButton_1.default, {tooltip: "Staffing", tooltipPosition: "top-center", onTouchTap: e => {
            branch.switchFacet('BudgetStaffing');
        }, style: {
            backgroundColor: (this.state.userselections.facet == 'BudgetStaffing')
                ? "rgba(144,238,144,0.5)"
                : 'transparent',
            borderRadius: "50%"
        }}, ">", React.createElement(FontIcon_1.default, {className: "material-icons"}, "people"))), React.createElement("div", {style: { whiteSpace: "nowrap" }}, React.createElement("div", {ref: node => {
            branch.branchScrollBlock = node;
        }, style: { overflow: "scroll" }}, drilldownportals, React.createElement("div", {style: { display: "inline-block", width: "500px" }}))), React.createElement(Snackbar_1.default, {open: this.state.snackbar.open, message: this.state.snackbar.message, autoHideDuration: 4000, onRequestClose: this.handleSnackbarRequestClose}));
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ExplorerBranch;
