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
const onchartcomponentselection_1 = require('../controllers/explorer/onchartcomponentselection');
const budgetnode_1 = require('../../local/budgetnode');
class ExplorerBranch extends Component {
    constructor(props) {
        super(props);
        this.state = {
            chartmatrixrow: this.props.budgetBranch.nodes,
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
            let branch = this;
            setTimeout(() => {
                branch.props.callbacks.updateChartSelections();
            });
        };
        this.branchScrollBlock = null;
        this.componentDidMount = () => {
            let { callbacks, callbackid } = this.props;
            callbacks.updateChartSelections = callbacks.updateChartSelections(callbackid);
            this.initializeChartSeries();
        };
        this.initializeChartSeries = () => {
            let { userselections, chartmatrixrow } = this.state;
            let budgetdata = this.props.budgetBranch.data;
            let matrixlocation, chartParmsObj;
            let { viewpoint: viewpointname, facet: dataseriesname, inflationadjusted: wantsInflationAdjusted } = userselections;
            let viewpointdata = databaseapi_1.default.getViewpointData({
                viewpointname: viewpointname,
                dataseriesname: dataseriesname,
                wantsInflationAdjusted: wantsInflationAdjusted,
                timeSpecs: {
                    leftYear: null,
                    rightYear: null,
                    spanYears: false,
                }
            });
            budgetdata.viewpointdata = viewpointdata;
            let datapath = [];
            let node = getbudgetnode_1.getBudgetNode(viewpointdata, datapath);
            let { charttype: defaultChartType, viewpoint: viewpointName, facet: facetName, latestyear: rightYear, } = userselections;
            let budgetNodeParms = {
                defaultChartType: defaultChartType,
                viewpointName: viewpointName,
                facetName: facetName,
                portalCharts: viewpointdata.PortalCharts,
                timeSpecs: {
                    leftYear: null,
                    rightYear: rightYear,
                    spanYears: false,
                },
                dataPath: [],
                matrixLocation: { column: 0 },
                dataNode: node,
            };
            let budgetNode = new budgetnode_1.default(budgetNodeParms);
            let cellindex;
            let { updateChartSelections, workingStatus } = this.props.callbacks;
            let callbacks = {
                updateChartSelections: updateChartSelections,
                refreshPresentation: this.refreshPresentation,
                onPortalCreation: this.onPortalCreation,
                workingStatus: workingStatus,
            };
            let selectfn = onchartcomponentselection_1.onChartComponentSelection(userselections)(budgetdata)(chartmatrixrow)(callbacks);
            let { Configuration: viewpointConfig, itemseriesconfigdata: itemseriesConfig, } = budgetdata.viewpointdata;
            let configData = {
                viewpointConfig: viewpointConfig,
                itemseriesConfig: itemseriesConfig,
            };
            for (cellindex in budgetNode.cells) {
                let budgetCell = budgetNode.cells[cellindex];
                let props = {
                    chartIndex: cellindex,
                    configData: configData,
                    userselections: userselections,
                };
                let fcurrent = selectfn(0)(cellindex);
                chartParmsObj = budgetNode.getChartParms(props, { current: fcurrent, next: selectfn });
                if (!chartParmsObj.isError) {
                    budgetCell.chartparms = chartParmsObj.chartParms;
                    budgetCell.chartCode =
                        constants_1.ChartTypeCodes[budgetCell.chartparms.chartType];
                }
                else {
                    break;
                }
            }
            if (!chartParmsObj.isError) {
                matrixlocation = budgetNode.matrixLocation;
                chartmatrixrow[matrixlocation.column] = budgetNode;
            }
            this.refreshPresentation();
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
            chartmatrixrow.splice(0);
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
            let budgetdata = this.props.budgetBranch.data;
            budgetdata.viewpointdata = viewpointdata;
            let chartmatrixrow = this.state.chartmatrixrow;
            let oldchartmatrixrow = [...chartmatrixrow];
            let budgetNode = null;
            let parentBudgetNode;
            let cellptr;
            let isError = false;
            let chartParmsObj = null;
            let childcallbacks = {
                updateChartSelections: this.props.callbacks.updateChartSelections,
                refreshPresentation: this.refreshPresentation,
                onPortalCreation: this.onPortalCreation,
                workingStatus: this.props.callbacks.workingStatus,
            };
            let fn = onchartcomponentselection_1.onChartComponentSelection(userselections)(budgetdata)(chartmatrixrow)(childcallbacks);
            for (cellptr in chartmatrixrow) {
                parentBudgetNode = budgetNode;
                budgetNode = chartmatrixrow[cellptr];
                let nextdataNode = getbudgetnode_1.getBudgetNode(viewpointdata, budgetNode.dataPath);
                if (nextdataNode) {
                    let deeperdata = (!!nextdataNode.Components && (budgetNode.cells.length == 1));
                    let shallowerdata = (!nextdataNode.Components && (budgetNode.cells.length == 2));
                    budgetNode.update(nextdataNode, userselections.facet);
                    if (deeperdata || shallowerdata) {
                        isError = true;
                        let prevBudgetNode = chartmatrixrow[cellptr - 1];
                        chartmatrixrow.splice(cellptr);
                        let prevBudgetCell = prevBudgetNode.cells[0];
                        let context = {
                            selection: prevBudgetCell.chartselection,
                            ChartObject: prevBudgetCell.ChartObject,
                        };
                        let childprops = {
                            budgetNode: prevBudgetNode,
                            userselections: userselections,
                            budgetdata: budgetdata,
                            chartmatrixrow: chartmatrixrow,
                            selectionrow: prevBudgetCell.chartselection[0].row,
                            nodeIndex: prevBudgetNode.matrixLocation.column,
                            cellIndex: 0,
                            context: context,
                            chart: prevBudgetCell.chart,
                        };
                        let fcurrent = fn(cellptr)(0);
                        onchartcomponentselection_1.createChildNode(childprops, childcallbacks, { current: fcurrent, next: fn });
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
                let nodecellindex = null;
                if (!budgetNode)
                    break;
                let configData = {
                    viewpointConfig: budgetdata.viewpointdata.Configuration,
                    itemseriesConfig: budgetdata.viewpointdata.itemseriesconfigdata,
                };
                for (nodecellindex in budgetNode.cells) {
                    let props = {
                        chartIndex: nodecellindex,
                        userselections: userselections,
                        configData: configData,
                    };
                    let fcurrent = fn(cellptr)(nodecellindex), chartParmsObj = budgetNode.getChartParms(props, { current: fcurrent, next: fn });
                    if (chartParmsObj.isError) {
                        chartmatrixrow.splice(cellptr);
                        if (cellptr > 0) {
                            let parentBudgetNode = chartmatrixrow[cellptr - 1];
                            let parentBudgetCell = parentBudgetNode.cells[nodecellindex];
                            parentBudgetCell.chartselection = null;
                            parentBudgetCell.chart = null;
                        }
                        isError = true;
                        break;
                    }
                    else {
                        let budgetCell = budgetNode.cells[nodecellindex];
                        budgetCell.chartparms = chartParmsObj.chartParms;
                        budgetCell.chartCode =
                            constants_1.ChartTypeCodes[budgetCell.chartparms.chartType];
                        if (parentBudgetNode) {
                            budgetNode.parentData.dataNode = parentBudgetNode.dataNode;
                        }
                    }
                }
            }
            this.refreshPresentation();
            let branch = this;
            setTimeout(() => {
                branch.props.callbacks.updateChartSelections();
            });
        };
        this.onChangePortalTab = () => {
            let branch = this;
            setTimeout(() => {
                branch.props.callbacks.updateChartSelections();
            });
        };
        this.refreshPresentation = () => {
            this.setState({
                chartmatrixrow: this.state.chartmatrixrow,
            });
        };
        this.switchChartCode = (nodeIndex, cellIndex, chartCode) => {
            let chartType = constants_1.ChartCodeTypes[chartCode];
            let chartmatrixrow = this.state.chartmatrixrow;
            let budgetNode = chartmatrixrow[nodeIndex];
            let budgetCell = budgetNode.cells[cellIndex];
            let oldChartType = budgetCell.googleChartType;
            budgetCell.googleChartType = chartType;
            let budgetdata = this.props.budgetBranch.data;
            let configData = {
                viewpointConfig: budgetdata.viewpointdata.Configuration,
                itemseriesConfig: budgetdata.viewpointdata.itemseriesconfigdata,
            };
            let props = {
                chartIndex: cellIndex,
                userselections: this.state.userselections,
                configData: configData,
            };
            let callbacks = {
                updateChartSelections: this.props.callbacks.updateChartSelections,
                refreshPresentation: this.refreshPresentation,
                onPortalCreation: this.onPortalCreation,
                workingStatus: this.props.callbacks.workingStatus,
            };
            let fn = onchartcomponentselection_1.onChartComponentSelection(this.state.userselections)(budgetdata)(chartmatrixrow)(callbacks);
            let fncurrent = fn(nodeIndex)(cellIndex);
            let chartParmsObj = budgetNode.getChartParms(props, { current: fncurrent, next: fn });
            if (!chartParmsObj.isError) {
                budgetCell.chartparms = chartParmsObj.chartParms;
                budgetCell.chartCode =
                    constants_1.ChartTypeCodes[budgetCell.chartparms.chartType];
            }
            else {
                budgetCell.googleChartType = oldChartType;
            }
            this.refreshPresentation();
            let branch = this;
            setTimeout(() => {
                if (budgetCell.chart) {
                    budgetCell.chart = budgetCell.ChartObject.chart;
                    if (budgetCell.googleChartType == "PieChart") {
                        budgetCell.chartselection[0].column = null;
                    }
                    else {
                        budgetCell.chartselection[0].column = 1;
                    }
                }
                branch.props.callbacks.updateChartSelections();
            });
        };
        this.getPortals = (matrixrow) => {
            let userselections = this.state.userselections;
            let budgetdata = this.props.budgetBranch.data;
            if (!budgetdata.viewpointdata)
                return [];
            let viewpointdata = budgetdata.viewpointdata;
            let itemseriesdata = viewpointdata.itemseriesconfigdata;
            let portaltitles = itemseriesdata.Titles;
            let portalseriesname = itemseriesdata.Name;
            if (itemseriesdata.Units == 'DOLLAR') {
                portalseriesname += ' (' + itemseriesdata.UnitsAlias + ')';
            }
            let portals = matrixrow.map((budgetNode, nodeindex) => {
                let budgetCells = [];
                for (let cellindex in budgetNode.cells) {
                    let budgetCell = budgetNode.cells[cellindex];
                    let chartblocktitle = null;
                    if ((budgetCell.nodeDataPropertyName == 'Categories')) {
                        chartblocktitle = portaltitles.Categories;
                    }
                    else {
                        chartblocktitle = portaltitles.Baseline;
                    }
                    let chartParms = budgetCell.chartparms;
                    let explorer = this;
                    let cellCallbacks = {
                        onSwitchChartCode: (nodeIndex) => (cellIndex, chartCode) => {
                            explorer.switchChartCode(nodeIndex, cellIndex, chartCode);
                        },
                    };
                    let cellSettings = {
                        chartCode: budgetCell.chartCode,
                        graph_id: "ChartID" + this.props.callbackid + '-' + nodeindex + '-' + cellindex,
                    };
                    let portalchart = {
                        chartParms: chartParms,
                        cellCallbacks: cellCallbacks,
                        cellSettings: cellSettings,
                        cellTitle: "By " + chartblocktitle,
                    };
                    budgetCells.push(portalchart);
                }
                let portalName = null;
                if (budgetNode.parentData) {
                    portalName = budgetNode.parentData.Name;
                }
                else {
                    portalName = 'City Budget';
                }
                portalName += ' ' + portalseriesname;
                let portalNode = {
                    budgetCells: budgetCells,
                    portalName: portalName,
                };
                return React.createElement(explorerportal_1.ExplorerPortal, {callbackid: nodeindex, key: nodeindex, portalNode: portalNode, onChangePortalTab: this.onChangePortalTab});
            });
            return portals;
        };
    }
    render() {
        let branch = this;
        let drilldownrow = branch.state.chartmatrixrow;
        let drilldownportals = branch.getPortals(drilldownrow);
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
