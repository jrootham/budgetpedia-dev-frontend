'use strict';
const React = require('react');
var { Component } = React;
const DropDownMenu_1 = require('material-ui/DropDownMenu');
const MenuItem_1 = require('material-ui/MenuItem');
const FontIcon_1 = require('material-ui/FontIcon');
const IconButton_1 = require('material-ui/IconButton');
const Snackbar_1 = require('material-ui/Snackbar');
const Toggle_1 = require('material-ui/Toggle');
const onchartcomponentselection_1 = require('../modules/onchartcomponentselection');
const explorernode_1 = require('./explorernode');
const actions_1 = require('../actions');
class ExplorerBranch extends Component {
    constructor(...args) {
        super(...args);
        this.state = {
            branchNodes: [],
            viewpointData: null,
            snackbar: { open: false, message: 'empty' },
            aspect: this.props.budgetBranch.settings.viewpoint,
            byunitselection: 'off',
            showcontrols: false,
        };
        this.getState = () => this.state;
        this.getProps = () => this.props;
        this.addNodeDeclaration = branchUid => settings => this.props.globalStateActions.addNodeDeclaration(branchUid, settings);
        this.removeNodeDeclarations = branchUid => nodeItems => this.props.globalStateActions.removeNodeDeclarations(branchUid, nodeItems);
        this.harmonizecount = null;
        this._controlGlobalStateChange = () => {
            let previousControlData = this._previousControlData;
            let currentControlData = this.props.declarationData;
            let { lastAction } = currentControlData;
            let returnvalue = true;
            if (!actions_1.branchTypes[lastAction.type]) {
                return false;
            }
            if (previousControlData && (currentControlData.generation == previousControlData.generation)) {
                return false;
            }
            let { budgetBranch } = this.props;
            switch (lastAction.type) {
                case actions_1.branchTypes.CHANGE_VIEWPOINT: {
                    this._processChangeViewpointStateChange(budgetBranch);
                    break;
                }
                case actions_1.branchTypes.CHANGE_ASPECT: {
                    this._processChangeAspectStateChange(budgetBranch);
                    break;
                }
                default:
                    returnvalue = false;
            }
            this._previousControlData = currentControlData;
            return returnvalue;
        };
        this._processChangeViewpointStateChange = (budgetBranch) => {
            budgetBranch.getViewpointData().then(() => {
                setTimeout(() => {
                    let budgetNodeParms = budgetBranch.getInitialBranchNodeParms();
                    this._stateActions.addNodeDeclaration(budgetNodeParms);
                });
            });
        };
        this._processChangeAspectStateChange = (budgetBranch) => {
            budgetBranch.getViewpointData().then(() => {
                setTimeout(() => {
                    let switchResults = budgetBranch.switchAspect();
                    let { deeperdata, shallowerdata } = switchResults;
                    if (deeperdata || shallowerdata) {
                        let message = null;
                        if (deeperdata) {
                            message = "More drilldown is available for current aspect selection";
                        }
                        else {
                            message = "Less drilldown is available for current aspect selection";
                        }
                        let { snackbar } = this.state;
                        snackbar = Object.assign({}, snackbar);
                        snackbar.message = message;
                        snackbar.open = true;
                        this.setState({
                            snackbar: snackbar,
                        });
                    }
                });
            });
        };
        this.refreshPresentation = () => {
            this.forceUpdate();
        };
        this.updateBranchNodesState = branchNodes => {
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
        };
        this.branchScrollBlock = null;
        this.onPortalCreation = () => {
            let element = this.branchScrollBlock;
            if (!element) {
                console.error('System Error: expected branch element not found in onPortalCreation');
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
            let { budgetBranch } = this.props;
            let { nodes: branchNodes } = budgetBranch;
            let removed = branchNodes.splice(0);
            let removeditems = removed.map((item) => {
                return { nodeuid: item.uid, cellList: item.cellDeclarationList };
            });
            let globalStateActions = this._stateActions;
            globalStateActions.removeNodeDeclarations(removeditems);
            setTimeout(() => {
                globalStateActions.changeViewpoint(budgetBranch.uid, viewpointname);
            });
        };
        this.switchAspect = (aspect) => {
            switch (aspect) {
                case "Expenses":
                case "Revenues":
                case "Staffing":
                    break;
                default:
                    return;
            }
            let { budgetBranch } = this.props;
            budgetBranch.saveAspectState();
            this.props.globalStateActions.changeAspect(budgetBranch.uid, aspect);
        };
        this.switchUnit = unitindex => {
            this.props.globalStateActions.resetLastAction();
            this.setState({
                byunitselection: unitindex
            });
        };
        this.getPortals = (budgetNodes) => {
            let { viewpointData } = this.state;
            if (!viewpointData)
                return [];
            let datasetConfig = viewpointData.datasetConfig;
            let portalSeriesName = datasetConfig.DatasetName;
            if (datasetConfig.Units == 'DOLLAR') {
                portalSeriesName += ' (' + datasetConfig.UnitsAlias + ')';
            }
            let portals = budgetNodes.map((budgetNode, nodeindex) => {
                let portalName = null;
                if (budgetNode.metaData) {
                    portalName = budgetNode.metaData.Name;
                }
                else {
                    portalName = 'City Budget';
                }
                portalName += ' ' + portalSeriesName;
                let portalConfig = {
                    portalName: portalName,
                };
                budgetNode.portalConfig = portalConfig;
                let viewpointdata = this.state.viewpointData;
                let { Configurations: viewpointConfigs, datasetConfig: datasetConfig, } = viewpointdata;
                let viewpointConfigPack = {
                    viewpointConfigs: viewpointConfigs,
                    datasetConfig: datasetConfig,
                };
                budgetNode.viewpointConfigPack = viewpointConfigPack;
                budgetNode.branchSettings = this.props.budgetBranch.settings;
                budgetNode.onChartComponentSelection = onchartcomponentselection_1.onChartComponentSelection(this.props.budgetBranch);
                let actions = Object.assign({}, this._stateActions);
                actions.updateCellChartSelection = this._stateActions.updateCellChartSelection(budgetNode.uid);
                actions.updateCellChartCode = this._stateActions.updateCellChartCode(budgetNode.uid);
                return React.createElement(explorernode_1.ExporerNode, {key: nodeindex, callbackid: nodeindex, budgetNode: budgetNode, declarationData: this.props.declarationData, globalStateActions: actions, displayCallbacks: {}, showControls: this.state.showcontrols});
            });
            return portals;
        };
    }
    componentWillMount() {
        let { budgetBranch, globalStateActions: actions, displayCallbacks } = this.props;
        this._stateActions = Object.assign({}, actions);
        this._stateActions.addNodeDeclaration = this.addNodeDeclaration(budgetBranch.uid);
        this._stateActions.removeNodeDeclarations = this.removeNodeDeclarations(budgetBranch.uid);
        let { refreshPresentation, onPortalCreation, updateBranchNodesState } = this;
        let { workingStatus } = displayCallbacks;
        this._nodeDisplayCallbacks = {
            workingStatus: workingStatus,
            onPortalCreation: onPortalCreation,
            updateBranchNodesState: updateBranchNodesState,
            refreshPresentation: refreshPresentation,
        };
        budgetBranch.getState = this.getState;
        budgetBranch.getProps = this.getProps;
        budgetBranch.setState = this.setState.bind(this);
        budgetBranch.actions = this._stateActions;
        budgetBranch.nodeCallbacks = this._nodeDisplayCallbacks;
    }
    componentDidMount() {
        let { budgetBranch, declarationData } = this.props;
        this._previousControlData = declarationData;
        budgetBranch.getViewpointData().then(() => {
            if (declarationData.branchesById[budgetBranch.uid].nodeList.length == 0) {
                setTimeout(() => {
                    let budgetNodeParms = budgetBranch.getInitialBranchNodeParms();
                    this._stateActions.addNodeDeclaration(budgetNodeParms);
                });
            }
        });
    }
    componentWillReceiveProps(nextProps) {
        let { nodesById } = nextProps.declarationData;
        let branchNodes = this.props.budgetBranch.nodes;
        let newBranchNodes = branchNodes.filter((node) => {
            return !!nodesById[node.uid];
        });
        if (newBranchNodes.length != branchNodes.length) {
            this.setState({
                branchNodes: newBranchNodes,
            });
        }
    }
    shouldComponentUpdate(nextProps, nextState) {
        let { lastAction, generation } = nextProps.declarationData;
        if (nextState.snackbar.open != this.state.snackbar.open)
            return true;
        if (!lastAction.explorer)
            return false;
        let { branchuid } = lastAction;
        if (branchuid) {
            let retval = (nextProps.budgetBranch.uid == branchuid) ? true : false;
            return retval;
        }
        return true;
    }
    componentDidUpdate() {
        let { budgetBranch, declarationData } = this.props;
        let { nodes: branchNodes } = budgetBranch;
        let { nodesById } = declarationData;
        let branchDeclarations = declarationData.branchesById[budgetBranch.uid];
        let { nodeList } = branchDeclarations;
        if (this.harmonizecount === null) {
            this.harmonizecount = (nodeList.length - branchNodes.length);
        }
        if (nodeList.length > branchNodes.length) {
            if (this.harmonizecount <= 0) {
                console.log('harmonize error', nodeList, branchNodes);
            }
            this.harmonizecount--;
            let nodeIndex = branchNodes.length;
            let budgetNodeId = nodeList[nodeIndex];
            budgetBranch.addNode(budgetNodeId, nodeIndex, nodesById[budgetNodeId]);
        }
        else {
            this.harmonizecount = null;
            this._controlGlobalStateChange();
        }
    }
    render() {
        let branch = this;
        let drilldownrow = branch.props.budgetBranch.nodes;
        let drilldownportals = branch.getPortals(drilldownrow);
        let viewpointselection = (this.state.showcontrols) ? React.createElement("div", {style: { display: 'inline-block', whiteSpace: "nowrap" }}, React.createElement("span", {style: { fontStyle: "italic" }}, "Viewpoint: "), React.createElement(DropDownMenu_1.default, {value: this.props.budgetBranch.settings.viewpoint, style: {}, onChange: (e, index, value) => {
            branch.switchViewpoint(value);
        }}, React.createElement(MenuItem_1.default, {value: 'FUNCTIONAL', primaryText: "Budget (by function)"}), React.createElement(MenuItem_1.default, {value: 'STRUCTURAL', primaryText: "Budget (by structure)"}), React.createElement(MenuItem_1.default, {disabled: true, value: 'STATEMENTS', primaryText: "Consolidated Statements"}), React.createElement(MenuItem_1.default, {disabled: true, value: 'EXPENSESBYOBJECT', primaryText: "Expenses by Object"}))) : null;
        let versionselection = (this.state.showcontrols) ? React.createElement("div", {style: { display: 'inline-block', whiteSpace: "nowrap" }}, React.createElement("span", {style: { fontStyle: "italic" }}, "Version: "), React.createElement(DropDownMenu_1.default, {value: 'DETAIL'}, React.createElement(MenuItem_1.default, {disabled: true, value: 'SUMMARY', primaryText: "Summary"}), React.createElement(MenuItem_1.default, {value: 'DETAIL', primaryText: "Detail (PBF)"}), React.createElement(MenuItem_1.default, {disabled: true, value: 'VARIANCE', primaryText: "Variance Reports"}))) : null;
        let aspectselection = (this.state.showcontrols) ? React.createElement("div", {style: { display: 'inline-block', whiteSpace: "nowrap" }}, React.createElement("span", {style: { fontStyle: "italic" }}, "Aspect: "), React.createElement(DropDownMenu_1.default, {value: this.props.declarationData.branchesById[this.props.budgetBranch.uid].aspect, onChange: (e, index, value) => {
            branch.switchAspect(value);
        }}, React.createElement(MenuItem_1.default, {value: 'Expenses', primaryText: "Expenses"}), React.createElement(MenuItem_1.default, {value: 'Revenues', primaryText: "Revenues"}), React.createElement(MenuItem_1.default, {disabled: true, value: 'Both', primaryText: "Both"}), React.createElement(MenuItem_1.default, {disabled: true, value: 'Net', primaryText: "Net"}), React.createElement(MenuItem_1.default, {value: 'Staffing', primaryText: "Staffing"}))) : null;
        let byunitselection = (this.state.showcontrols) ? React.createElement("div", {style: { display: 'inline-block', whiteSpace: "nowrap" }}, React.createElement("span", {style: { fontStyle: "italic" }}, "By Unit: "), React.createElement(DropDownMenu_1.default, {value: this.state.byunitselection, onChange: (e, index, value) => {
            this.switchUnit(value);
        }}, React.createElement(MenuItem_1.default, {value: 'Off', primaryText: "Off"}), React.createElement(MenuItem_1.default, {value: 'Staff', primaryText: "Per staffing position"}), React.createElement(MenuItem_1.default, {value: 'Population', primaryText: "Population: per person"}), React.createElement(MenuItem_1.default, {value: 'Population100000', primaryText: "Population: per 100,000 people"}), React.createElement(MenuItem_1.default, {value: 'Household', primaryText: "Per household"}))) : null;
        let inflationadjustment = (this.state.showcontrols) ? React.createElement("div", {style: { display: 'inline-block', whiteSpace: "nowrap", verticalAlign: "bottom", marginRight: '16px' }}, React.createElement(Toggle_1.default, {label: 'Inflation adjusted:', style: { height: '32px', marginTop: '16px' }, labelStyle: { fontStyle: 'italic' }, defaultToggled: true})) : null;
        let showcontrols = React.createElement("div", {style: { display: 'inline-block', whiteSpace: "nowrap", verticalAlign: "bottom" }}, React.createElement(Toggle_1.default, {label: 'Show options:', style: { height: '32px', marginTop: '16px' }, labelStyle: { fontStyle: 'italic' }, defaultToggled: false, onToggle: (e, value) => {
            this.props.globalStateActions.resetLastAction();
            this.setState({
                showcontrols: value
            });
        }}));
        let showhelp = (this.state.showcontrols)
            ? React.createElement(IconButton_1.default, {tooltip: "Help", tooltipPosition: "top-center", onTouchTap: this.props.handleDialogOpen}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "help_outline"))
            : null;
        return React.createElement("div", null, React.createElement("div", null, viewpointselection, versionselection, aspectselection, byunitselection, inflationadjustment, showcontrols, showhelp), React.createElement("div", {style: { whiteSpace: "nowrap" }}, React.createElement("div", {ref: node => {
            branch.branchScrollBlock = node;
        }, style: { overflow: "scroll" }}, drilldownportals, React.createElement("div", {style: { display: "inline-block", width: "500px" }}))), React.createElement(Snackbar_1.default, {open: this.state.snackbar.open, message: this.state.snackbar.message, autoHideDuration: 4000, onRequestClose: this.handleSnackbarRequestClose}));
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ExplorerBranch;
