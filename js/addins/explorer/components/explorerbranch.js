'use strict';
const React = require('react');
var { Component } = React;
const DropDownMenu_1 = require('material-ui/DropDownMenu');
const MenuItem_1 = require('material-ui/MenuItem');
const FontIcon_1 = require('material-ui/FontIcon');
const IconButton_1 = require('material-ui/IconButton');
const Snackbar_1 = require('material-ui/Snackbar');
const onchartcomponentselection_1 = require('../modules/onchartcomponentselection');
const explorernode_1 = require('./explorernode');
const actions_1 = require('../actions');
class ExplorerBranch extends Component {
    constructor(...args) {
        super(...args);
        this.state = {
            branchNodes: [],
            viewpointData: null,
            snackbar: { open: false, message: 'empty' }
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
            if (!actions_1.branchTypes[lastAction]) {
                return false;
            }
            if (previousControlData && (currentControlData.generation == previousControlData.generation)) {
                return false;
            }
            let { budgetBranch } = this.props;
            switch (lastAction) {
                case actions_1.branchTypes.CHANGE_VIEWPOINT: {
                    this._processChangeViewpointStateChange(budgetBranch);
                    break;
                }
                case actions_1.branchTypes.CHANGE_FACET: {
                    this._processChangeFacetStateChange(budgetBranch);
                    break;
                }
                default:
                    returnvalue = false;
            }
            this._previousControlData = currentControlData;
            return returnvalue;
        };
        this._processChangeViewpointStateChange = (budgetBranch) => {
            budgetBranch.getViewpointData();
            setTimeout(() => {
                let budgetNodeParms = budgetBranch.getInitialBranchNodeParms();
                this._stateActions.addNodeDeclaration(budgetNodeParms);
            });
        };
        this._processChangeFacetStateChange = (budgetBranch) => {
            budgetBranch.getViewpointData();
            setTimeout(() => {
                let switchResults = budgetBranch.switchFacet();
                let { deeperdata, shallowerdata } = switchResults;
                if (deeperdata || shallowerdata) {
                    let message = null;
                    if (deeperdata) {
                        message = "More drilldown is available for current facet selection";
                    }
                    else {
                        message = "Less drilldown is available for current facet selection";
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
            let { budgetBranch } = this.props;
            let { nodes: branchNodes } = budgetBranch;
            let removed = branchNodes.splice(0);
            let removeditems = removed.map((item) => {
                return { uid: item.uid, cellList: item.cellList };
            });
            let globalStateActions = this._stateActions;
            globalStateActions.removeNodeDeclarations(removeditems);
            setTimeout(() => {
                globalStateActions.changeViewpoint(budgetBranch.uid, viewpointname);
            });
        };
        this.switchFacet = (facet) => {
            let { budgetBranch } = this.props;
            this.props.globalStateActions.changeFacet(budgetBranch.uid, facet);
        };
        this.getPortals = (budgetNodes) => {
            let { viewpointData } = this.state;
            if (!viewpointData)
                return [];
            let datasetConfig = viewpointData.datasetConfig;
            let portalSeriesName = datasetConfig.Name;
            if (datasetConfig.Units == 'DOLLAR') {
                portalSeriesName += ' (' + datasetConfig.UnitsAlias + ')';
            }
            let portals = budgetNodes.map((budgetNode, nodeindex) => {
                let portalName = null;
                if (budgetNode.parentData) {
                    portalName = budgetNode.parentData.Name;
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
                let { Configuration: viewpointConfig, datasetConfig: datasetConfig, } = viewpointdata;
                let viewpointConfigData = {
                    viewpointConfig: viewpointConfig,
                    datasetConfig: datasetConfig,
                };
                budgetNode.viewpointConfigData = viewpointConfigData;
                budgetNode.branchSettings = this.props.budgetBranch.settings;
                budgetNode.onChartComponentSelection = onchartcomponentselection_1.onChartComponentSelection(this.props.budgetBranch);
                return React.createElement(explorernode_1.ExporerNode, {key: nodeindex, callbackid: nodeindex, budgetNode: budgetNode, declarationData: this.props.declarationData, globalStateActions: this._stateActions, displayCallbacks: {}});
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
        budgetBranch.getViewpointData();
        if (declarationData.branchesById[budgetBranch.uid].nodeList.length == 0) {
            setTimeout(() => {
                let budgetNodeParms = budgetBranch.getInitialBranchNodeParms();
                this._stateActions.addNodeDeclaration(budgetNodeParms);
            });
        }
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
                throw Error('error harmonizing branch nodes');
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
        return React.createElement("div", null, React.createElement("div", null, React.createElement("span", {style: { fontStyle: "italic" }}, "Viewpoint: "), React.createElement(DropDownMenu_1.default, {value: this.props.budgetBranch.settings.viewpoint, style: {}, onChange: (e, index, value) => {
            branch.switchViewpoint(value);
        }}, React.createElement(MenuItem_1.default, {value: 'FUNCTIONAL', primaryText: "Budget (by function)"}), React.createElement(MenuItem_1.default, {value: 'STRUCTURAL', primaryText: "Budget (by structure)"})), React.createElement("span", {style: { margin: "0 10px 0 10px", fontStyle: "italic" }}, "Facets: "), React.createElement(IconButton_1.default, {tooltip: "Expenditures", tooltipPosition: "top-center", onTouchTap: e => {
            branch.switchFacet('Expenses');
        }, style: {
            backgroundColor: (this.props.budgetBranch.settings.facet == 'Expenses')
                ? "rgba(144,238,144,0.5)"
                : 'transparent',
            borderRadius: "50%"
        }}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "attach_money")), React.createElement(IconButton_1.default, {tooltip: "Revenues", tooltipPosition: "top-center", onTouchTap: e => {
            branch.switchFacet('Revenues');
        }, style: {
            backgroundColor: (this.props.budgetBranch.settings.facet == 'Revenues')
                ? "rgba(144,238,144,0.5)"
                : 'transparent',
            borderRadius: "50%"
        }}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "receipt")), React.createElement(IconButton_1.default, {tooltip: "Staffing", tooltipPosition: "top-center", onTouchTap: e => {
            branch.switchFacet('Staffing');
        }, style: {
            backgroundColor: (this.props.budgetBranch.settings.facet == 'Staffing')
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
