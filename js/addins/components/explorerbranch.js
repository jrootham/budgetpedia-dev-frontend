'use strict';
const React = require('react');
var { Component } = React;
const explorerportal_1 = require('./explorerportal');
const DropDownMenu_1 = require('material-ui/DropDownMenu');
const MenuItem_1 = require('material-ui/MenuItem');
const FontIcon_1 = require('material-ui/FontIcon');
const IconButton_1 = require('material-ui/IconButton');
const Snackbar_1 = require('material-ui/Snackbar');
const databaseapi_1 = require('../classes/databaseapi');
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
            let { callbacks, callbackid, budgetBranch } = this.props;
            let { refreshPresentation, onPortalCreation } = this;
            callbacks.updateChartSelections = callbacks.updateChartSelections(callbackid);
            this._nodeCallbacks = {
                updateChartSelections: callbacks.updateChartSelections,
                refreshPresentation: refreshPresentation,
                onPortalCreation: onPortalCreation,
                workingStatus: callbacks.workingStatus,
            };
            this.initializeChartSeries();
        };
        this._getViewpointData = () => {
            let userselections = this.state.userselections;
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
            return viewpointdata;
        };
        this.initializeChartSeries = () => {
            let viewpointdata = this._getViewpointData();
            let userselections = this.state.userselections;
            let { budgetBranch } = this.props;
            budgetBranch.initializeChartSeries({ userselections: userselections, viewpointdata: viewpointdata }, this._nodeCallbacks);
            this._nodeCallbacks.refreshPresentation();
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
            let viewpointdata = this._getViewpointData();
            let { budgetBranch } = this.props;
            let switchResults = budgetBranch.switchFacet({ userselections: userselections, viewpointdata: viewpointdata }, this._nodeCallbacks);
            let { deeperdata, shallowerdata } = switchResults;
            if (deeperdata || shallowerdata) {
                let message = null;
                if (deeperdata) {
                    message = "More drilldown is available for current facet selection";
                }
                else {
                    message = "Less drilldown is available for current facet selection";
                }
                this.state.snackbar.message = message;
                this.state.snackbar.open = true;
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
            let { userselections } = this.state;
            let { budgetBranch } = this.props;
            let props = {
                userselections: userselections,
                nodeIndex: nodeIndex,
                cellIndex: cellIndex,
                chartCode: chartCode,
            };
            let callbacks = this._nodeCallbacks;
            let switchResults = budgetBranch.switchChartCode(props, callbacks);
            let { budgetCell } = switchResults;
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
                let chartConfigs = [];
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
                    let chartConfig = {
                        chartParms: chartParms,
                        cellCallbacks: cellCallbacks,
                        cellSettings: cellSettings,
                        cellTitle: "By " + chartblocktitle,
                    };
                    chartConfigs.push(chartConfig);
                }
                let portalName = null;
                if (budgetNode.parentData) {
                    portalName = budgetNode.parentData.Name;
                }
                else {
                    portalName = 'City Budget';
                }
                portalName += ' ' + portalseriesname;
                let portalConfig = {
                    chartConfigs: chartConfigs,
                    portalName: portalName,
                };
                return React.createElement(explorerportal_1.ExplorerPortal, {callbackid: nodeindex, budgetNode: budgetNode, key: nodeindex, portalConfig: portalConfig, portalCallbacks: { onChangePortalTab: this.onChangePortalTab }});
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
