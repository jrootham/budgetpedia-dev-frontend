'use strict';
const React = require('react');
var { Component } = React;
const explorerportal_1 = require('./explorerportal');
const DropDownMenu_1 = require('material-ui/DropDownMenu');
const MenuItem_1 = require('material-ui/MenuItem');
const FontIcon_1 = require('material-ui/FontIcon');
const IconButton_1 = require('material-ui/IconButton');
const Snackbar_1 = require('material-ui/Snackbar');
const actions_1 = require('../actions');
class ExplorerBranch extends Component {
    constructor(props) {
        super(props);
        this.state = {
            branchNodes: [],
            viewpointData: null,
            snackbar: { open: false, message: 'empty' }
        };
        this.getState = () => this.state;
        this.getProps = () => this.props;
        this.addNode = uid => settings => {
            return this.props.actions.addNode(uid, settings);
        };
        this.onGlobalStateChange = () => {
            let previousControlData = this._previousControlData;
            let currentControlData = this.props.controlData;
            if (!actions_1.branchtypes[currentControlData.lastAction]) {
                return;
            }
            if (previousControlData && (currentControlData.generation == previousControlData.generation)) {
                return;
            }
            console.log('onChange', previousControlData, currentControlData);
            this._previousControlData = currentControlData;
        };
        this.refreshPresentation = () => {
            this.forceUpdate();
        };
        this.updateBranchNodes = branchNodes => {
            this.setState({
                branchNodes: branchNodes,
            });
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
                branch.props.displaycallbacks.updateChartSelections();
            });
        };
        this.branchScrollBlock = null;
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
                if (adjustment > 0) {
                    adjustment = Math.min(adjustment, scrollleft);
                }
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
            let { budgetBranch, callbackuid } = this.props;
            let { settings: branchsettings, nodes: branchNodes } = budgetBranch;
            let removed = branchNodes.splice(0);
            let removedids = removed.map((item) => {
                return item.uid;
            });
            this.props.actions.removeNode(callbackuid, removedids);
            setTimeout(() => {
                branchsettings.viewpoint = viewpointname;
                budgetBranch.getViewpointData();
                setTimeout(() => {
                    budgetBranch.initializeBranch();
                });
            });
        };
        this.switchFacet = (facet) => {
            let { budgetBranch } = this.props;
            let branchsettings = budgetBranch.settings;
            branchsettings.facet = facet;
            let switchResults = budgetBranch.switchFacet(this._nodeCallbacks, this.props.actions);
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
                branch.props.displaycallbacks.updateChartSelections();
            });
        };
        this.switchChartCode = (nodeIndex, cellIndex, chartCode) => {
            let { budgetBranch } = this.props;
            let props = {
                nodeIndex: nodeIndex,
                cellIndex: cellIndex,
                chartCode: chartCode,
            };
            let callbacks = this._nodeCallbacks;
            let switchResults = budgetBranch.switchChartCode(props, callbacks, this.props.actions);
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
                branch.props.displaycallbacks.updateChartSelections();
            });
        };
        this.onChangePortalTab = () => {
            let branch = this;
            setTimeout(() => {
                branch.props.displaycallbacks.updateChartSelections();
            });
        };
        this.getPortals = (budgetNodes) => {
            let { settings: branchsettings } = this.props.budgetBranch;
            let budgetdata = { viewpointdata: this.getState().viewpointData };
            if (!budgetdata.viewpointdata)
                return [];
            let viewpointdata = budgetdata.viewpointdata;
            let itemseriesdata = viewpointdata.itemseriesconfigdata;
            let portaltitles = itemseriesdata.Titles;
            let portalseriesname = itemseriesdata.Name;
            if (itemseriesdata.Units == 'DOLLAR') {
                portalseriesname += ' (' + itemseriesdata.UnitsAlias + ')';
            }
            let portals = budgetNodes.map((budgetNode, nodeindex) => {
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
                return React.createElement(explorerportal_1.ExplorerPortal, {key: nodeindex, callbackid: nodeindex, budgetNode: budgetNode, displaycallbacks: { onChangePortalTab: this.onChangePortalTab }, portalSettings: portalConfig});
            });
            return portals;
        };
    }
    componentWillMount() {
        let { budgetBranch, actions, displaycallbacks, callbackid } = this.props;
        budgetBranch.getState = this.getState;
        budgetBranch.getProps = this.getProps;
        budgetBranch.setState = this.setState.bind(this);
        this._actions = Object.assign({}, actions);
        this._actions.addNode = this.addNode(budgetBranch.uid);
        budgetBranch.actions = this._actions;
        let { refreshPresentation, onPortalCreation, updateBranchNodes } = this;
        displaycallbacks.updateChartSelections = displaycallbacks.updateChartSelections(callbackid);
        this._nodeCallbacks = {
            updateChartSelections: displaycallbacks.updateChartSelections,
            workingStatus: displaycallbacks.workingStatus,
            onPortalCreation: onPortalCreation,
            updateBranchNodes: updateBranchNodes,
            refreshPresentation: refreshPresentation,
        };
    }
    componentDidMount() {
        let { budgetBranch } = this.props;
        this._previousControlData = this.props.controlData;
        budgetBranch.getViewpointData();
        setTimeout(() => {
            budgetBranch.initializeBranch();
        });
    }
    componentWillReceiveProps(nextProps) {
        let { controlData } = nextProps;
        let branchData = controlData.branchesById[nextProps.callbackuid];
        let { nodesById } = controlData;
        let { nodeList } = branchData;
        let { budgetBranch } = this.props;
        let branchNodes = budgetBranch.nodes;
        let nodeIndex;
        branchNodes = branchNodes.filter((node) => {
            return !!nodesById[node.uid];
        });
        this.setState({
            branchNodes: branchNodes,
        });
    }
    componentDidUpdate() {
        let { budgetBranch } = this.props;
        let branchNodes = budgetBranch.nodes;
        let { controlData } = this.props;
        let branchData = controlData.branchesById[this.props.callbackuid];
        let { nodesById } = controlData;
        let { nodeList } = branchData;
        this.onGlobalStateChange();
        if (nodeList.length > branchNodes.length) {
            let nodeIndex = branchNodes.length;
            let budgetNodeId = nodeList[nodeIndex];
            budgetBranch.addNode(budgetNodeId, nodeIndex, nodesById[budgetNodeId], this._nodeCallbacks, this._actions);
        }
    }
    render() {
        let branch = this;
        let drilldownrow = branch.props.budgetBranch.nodes;
        let drilldownportals = branch.getPortals(drilldownrow);
        return React.createElement("div", null, React.createElement("div", null, React.createElement("span", {style: { fontStyle: "italic" }}, "Viewpoint: "), React.createElement(DropDownMenu_1.default, {value: this.props.budgetBranch.settings.viewpoint, style: {}, onChange: (e, index, value) => {
            branch.switchViewpoint(value);
        }}, React.createElement(MenuItem_1.default, {value: 'FUNCTIONAL', primaryText: "Functional"}), React.createElement(MenuItem_1.default, {value: 'STRUCTURAL', primaryText: "Structural"})), React.createElement("span", {style: { margin: "0 10px 0 10px", fontStyle: "italic" }}, "Facets: "), React.createElement(IconButton_1.default, {tooltip: "Expenditures", tooltipPosition: "top-center", onTouchTap: e => {
            branch.switchFacet('BudgetExpenses');
        }, style: {
            backgroundColor: (this.props.budgetBranch.settings.facet == 'BudgetExpenses')
                ? "rgba(144,238,144,0.5)"
                : 'transparent',
            borderRadius: "50%"
        }}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "attach_money")), React.createElement(IconButton_1.default, {tooltip: "Revenues", tooltipPosition: "top-center", onTouchTap: e => {
            branch.switchFacet('BudgetRevenues');
        }, style: {
            backgroundColor: (this.props.budgetBranch.settings.facet == 'BudgetRevenues')
                ? "rgba(144,238,144,0.5)"
                : 'transparent',
            borderRadius: "50%"
        }}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "receipt")), React.createElement(IconButton_1.default, {tooltip: "Staffing", tooltipPosition: "top-center", onTouchTap: e => {
            branch.switchFacet('BudgetStaffing');
        }, style: {
            backgroundColor: (this.props.budgetBranch.settings.facet == 'BudgetStaffing')
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
