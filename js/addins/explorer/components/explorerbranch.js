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
const Utilities = require('../modules/utilities');
class ExplorerBranch extends Component {
    constructor(...args) {
        super(...args);
        this.state = {
            branchNodes: [],
            viewpointData: null,
            snackbar: { open: false, message: 'empty' },
            comparatorselection: 'Off',
        };
        this.waitafteraction = 0;
        this.getState = () => this.state;
        this.getProps = () => this.props;
        this.addNodeDeclaration = branchUid => settings => this.props.globalStateActions.addNodeDeclaration(branchUid, settings);
        this.removeNodeDeclarations = branchUid => nodeItems => this.props.globalStateActions.removeNodeDeclarations(branchUid, nodeItems);
        this._initialize = () => {
            let branch = this;
            let { budgetBranch, globalStateActions: actions, displayCallbacks, declarationData } = branch.props;
            branch._stateActions = Object.assign({}, actions);
            branch._stateActions.addNodeDeclaration = branch.addNodeDeclaration(budgetBranch.uid);
            branch._stateActions.removeNodeDeclarations = branch.removeNodeDeclarations(budgetBranch.uid);
            let { onPortalCreation } = branch;
            let { workingStatus } = displayCallbacks;
            branch._nodeDisplayCallbacks = {
                workingStatus: workingStatus,
                onPortalCreation: onPortalCreation,
            };
            budgetBranch.getProps = branch.getProps;
            budgetBranch.getState = branch.getState;
            budgetBranch.setState = branch.setState.bind(branch);
            budgetBranch.actions = branch._stateActions;
            budgetBranch.nodeCallbacks = branch._nodeDisplayCallbacks;
            branch._previousControlData = declarationData;
        };
        this.lastactiongeneration = 0;
        this.harmonizecount = null;
        this.harmonizeNodesToState = (branchNodes, nodeList, nodesById, budgetBranch) => {
            if (this.harmonizecount === null) {
                this.harmonizecount = (nodeList.length - branchNodes.length);
            }
            if (this.harmonizecount > 0) {
                this.harmonizecount--;
                let nodeIndex = branchNodes.length;
                let budgetNodeId = nodeList[nodeIndex];
                budgetBranch.addNode(budgetNodeId, nodeIndex, nodesById[budgetNodeId]);
                return true;
            }
            else {
                this.harmonizecount = null;
                return false;
            }
        };
        this._respondToGlobalStateChange = () => {
            let { budgetBranch } = this.props;
            let previousControlData = this._previousControlData;
            let currentControlData = this.props.declarationData;
            let { lastTargetedAction } = currentControlData;
            let lastAction = lastTargetedAction[budgetBranch.uid] || {};
            let returnvalue = true;
            if (!actions_1.branchTypes[lastAction.type]) {
                return false;
            }
            if (previousControlData && (currentControlData.generation == previousControlData.generation)) {
                return false;
            }
            switch (lastAction.type) {
                case actions_1.branchTypes.CHANGE_VIEWPOINT: {
                    this._processChangeViewpointStateChange(budgetBranch);
                    break;
                }
                case actions_1.branchTypes.CHANGE_VERSION: {
                    this._processChangeVersionStateChange(budgetBranch);
                    break;
                }
                case actions_1.branchTypes.CHANGE_ASPECT: {
                    this._processChangeAspectStateChange(budgetBranch);
                    break;
                }
                case actions_1.branchTypes.TOGGLE_INFLATION_ADJUSTED: {
                    this._processToggleInflationAdjustedStateChange(budgetBranch);
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
                this._stateActions.changeBranchDataVersion(budgetBranch.uid);
                let budgetNodeParms = budgetBranch.getInitialBranchNodeParms();
                this._stateActions.addNodeDeclaration(budgetNodeParms);
            }).catch(reason => {
                console.error('error in data fetch, changeviewpoint', reason);
            });
        };
        this._processChangeVersionStateChange = (budgetBranch) => {
            budgetBranch.getViewpointData().then(() => {
                this._stateActions.changeBranchDataVersion(budgetBranch.uid);
                let budgetNodeParms = budgetBranch.getInitialBranchNodeParms();
                this._stateActions.addNodeDeclaration(budgetNodeParms);
            }).catch(reason => {
                console.error('error in data fetch, changeversion', reason);
            });
        };
        this._processToggleInflationAdjustedStateChange = (budgetBranch) => {
            budgetBranch.getViewpointData().then(() => {
                this._stateActions.changeBranchDataVersion(budgetBranch.uid);
                budgetBranch.toggleInflationAdjusted();
            }).catch(reason => {
                console.error('error in data fetch, changeaspect', reason);
            });
        };
        this._processChangeAspectStateChange = (budgetBranch) => {
            budgetBranch.getViewpointData().then(() => {
                this._stateActions.changeBranchDataVersion(budgetBranch.uid);
                let switchResults = budgetBranch.switchAspect();
                let { deeperdata, shallowerdata, mismatch } = switchResults;
                if (mismatch) {
                    let message = switchResults.message;
                    let { snackbar } = this.state;
                    snackbar = Object.assign({}, snackbar);
                    snackbar.message = message;
                    snackbar.open = true;
                    this.setState({
                        snackbar: snackbar,
                    });
                }
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
            }).catch(reason => {
                console.error('error in data fetch, changeaspect', reason);
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
            globalStateActions.changeViewpoint(budgetBranch.uid, viewpointname);
        };
        this.switchVersion = (versionName) => {
            let { budgetBranch } = this.props;
            let { nodes: branchNodes } = budgetBranch;
            let removed = branchNodes.splice(0);
            let removeditems = removed.map((item) => {
                return { nodeuid: item.uid, cellList: item.cellDeclarationList };
            });
            let globalStateActions = this._stateActions;
            globalStateActions.removeNodeDeclarations(removeditems);
            globalStateActions.changeVersion(budgetBranch.uid, versionName);
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
        this.switchComparator = comparatorindex => {
            this.setState({
                comparatorselection: comparatorindex
            });
        };
        this.toggleInflationAdjustment = value => {
            let { budgetBranch } = this.props;
            this.props.globalStateActions.toggleInflationAdjusted(budgetBranch.uid, value);
        };
        this.toggleShowOptions = value => {
            let { budgetBranch } = this.props;
            this.props.globalStateActions.toggleShowOptions(budgetBranch.uid, value);
        };
        this.handleSearch = () => {
        };
        this.getPortals = (budgetNodes) => {
            let { viewpointData } = this.state;
            if (!viewpointData)
                return [];
            let datasetConfig = viewpointData.Meta.datasetConfig;
            let portalSeriesName = datasetConfig.DatasetName;
            if (datasetConfig.Units == 'DOLLAR') {
                portalSeriesName += ' (' + datasetConfig.UnitsAlias + ')';
            }
            let portals = budgetNodes.map((budgetNode, nodeindex) => {
                let branchDeclaration = this.props.declarationData.branchesById[this.props.budgetBranch.uid];
                let portalName = null;
                if (budgetNode.treeNodeMetaDataFromParentSortedList) {
                    portalName = budgetNode.treeNodeMetaDataFromParentSortedList.Name;
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
                let { NamingConfigurations: viewpointNamingConfigs, datasetConfig: datasetConfig, isInflationAdjusted, } = viewpointdata.Meta;
                let viewpointConfigPack = {
                    viewpointNamingConfigs: viewpointNamingConfigs,
                    datasetConfig: datasetConfig,
                    isInflationAdjusted: isInflationAdjusted,
                };
                budgetNode.viewpointConfigPack = viewpointConfigPack;
                budgetNode.branchSettings = this.props.budgetBranch.settings;
                budgetNode.onChartComponentSelection = onchartcomponentselection_1.onChartComponentSelection(this.props.budgetBranch);
                let actions = Object.assign({}, this._stateActions);
                actions.updateCellChartSelection = this._stateActions.updateCellChartSelection(budgetNode.uid);
                actions.updateCellChartCode = this._stateActions.updateCellChartCode(budgetNode.uid);
                actions.updateCellYearSelections = this._stateActions.updateCellYearSelections(budgetNode.uid);
                return React.createElement(explorernode_1.ExplorerNode, {key: nodeindex, callbackid: nodeindex, budgetNode: budgetNode, declarationData: this.props.declarationData, globalStateActions: actions, showControls: branchDeclaration.showOptions, dataGenerationCounter: branchDeclaration.branchDataGeneration});
            });
            return portals;
        };
    }
    componentWillMount() {
        this._initialize();
        let { budgetBranch, declarationData } = this.props;
        budgetBranch.getViewpointData().then(() => {
            this._stateActions.changeBranchDataVersion(budgetBranch.uid);
            if (declarationData.branchesById[budgetBranch.uid].nodeList.length == 0) {
                let budgetNodeParms = budgetBranch.getInitialBranchNodeParms();
                this._stateActions.addNodeDeclaration(budgetNodeParms);
            }
            else {
                setTimeout(() => {
                    this._stateActions.resetLastAction();
                });
            }
        }).catch(reason => {
            console.error('error in data fetch, mount', reason);
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
        let show = false;
        if (nextState.snackbar.open != this.state.snackbar.open) {
            if (show)
                console.log('should update branch return true for snackbar');
            return true;
        }
        let branchComponent = this;
        return Utilities.filterActionsForUpdate(nextProps, branchComponent, show);
    }
    componentDidUpdate() {
        let { budgetBranch, declarationData } = this.props;
        let branchDeclarations = declarationData.branchesById[budgetBranch.uid];
        let { nodeList } = branchDeclarations;
        let { nodesById } = this.props.declarationData;
        let branchNodes = this.props.budgetBranch.nodes;
        if (!this.harmonizeNodesToState(branchNodes, nodeList, nodesById, budgetBranch)) {
            this._respondToGlobalStateChange();
        }
    }
    render() {
        let branch = this;
        let drilldownrow = branch.props.budgetBranch.nodes;
        let drilldownportals = branch.getPortals(drilldownrow);
        let branchDeclaration = this.props.declarationData.branchesById[this.props.budgetBranch.uid];
        let viewpointselection = (branchDeclaration.showOptions) ? React.createElement("div", {style: { display: 'inline-block', whiteSpace: "nowrap" }}, React.createElement("span", {style: { fontStyle: "italic" }}, "Viewpoint: "), React.createElement(DropDownMenu_1.default, {value: branchDeclaration.viewpoint, onChange: (e, index, value) => {
            branch.switchViewpoint(value);
        }}, React.createElement(MenuItem_1.default, {value: 'FUNCTIONAL', primaryText: "Budget (by function)"}), React.createElement(MenuItem_1.default, {value: 'STRUCTURAL', primaryText: "Budget (by structure)"}), React.createElement(MenuItem_1.default, {disabled: true, value: 'ACTUALREVENUE', primaryText: "Actual Revenue"}), React.createElement(MenuItem_1.default, {disabled: true, value: 'ACTUALEXPENSES', primaryText: "Actual Expenses"}), React.createElement(MenuItem_1.default, {disabled: true, value: 'EXPENDITURES', primaryText: "Actual Expenditures"}))) : null;
        let versionselection = (branchDeclaration.showOptions) ? React.createElement("div", {style: { display: 'inline-block', whiteSpace: "nowrap" }}, React.createElement("span", {style: { fontStyle: "italic" }}, "Version: "), React.createElement(DropDownMenu_1.default, {value: branchDeclaration.version, onChange: (e, index, value) => {
            branch.switchVersion(value);
        }}, React.createElement(MenuItem_1.default, {value: 'SUMMARY', primaryText: "Summary"}), React.createElement(MenuItem_1.default, {value: 'PBFT', primaryText: "Detail (PBFT)"}), React.createElement(MenuItem_1.default, {disabled: true, value: 'VARIANCE', primaryText: "Variance Reports"}))) : null;
        let aspectselection = (branchDeclaration.showOptions)
            ?
                React.createElement("div", {style: { display: 'inline-block', whiteSpace: "nowrap" }}, React.createElement("span", {style: { fontStyle: "italic" }}, "Aspect: "), React.createElement(DropDownMenu_1.default, {value: branchDeclaration.aspect, onChange: (e, index, value) => {
                    branch.switchAspect(value);
                }}, React.createElement(MenuItem_1.default, {value: 'Expenses', primaryText: "Expenses"}), React.createElement(MenuItem_1.default, {value: 'Revenues', primaryText: "Revenues"}), React.createElement(MenuItem_1.default, {disabled: true, value: 'Both', primaryText: "Both"}), React.createElement(MenuItem_1.default, {disabled: true, value: 'Net', primaryText: "Net"}), React.createElement(MenuItem_1.default, {value: 'Staffing', primaryText: "Staffing"})))
            :
                null;
        let byunitselection = (branchDeclaration.showOptions) ? React.createElement("div", {style: { display: 'inline-block', whiteSpace: "nowrap" }}, React.createElement("span", {style: { fontStyle: "italic", color: "rgba(0, 0, 0, 0.3)" }}, "Intensity: "), React.createElement(DropDownMenu_1.default, {disabled: true, value: this.state.comparatorselection, onChange: (e, index, value) => {
            this.switchComparator(value);
        }}, React.createElement(MenuItem_1.default, {value: 'Off', primaryText: "Off"}), React.createElement(MenuItem_1.default, {disabled: true, value: 'Staff', primaryText: "Per staffing position"}), React.createElement(MenuItem_1.default, {disabled: true, value: 'Population', primaryText: "Population: per person"}), React.createElement(MenuItem_1.default, {disabled: true, value: 'Population100000', primaryText: "Population: per 100,000 people"}), React.createElement(MenuItem_1.default, {disabled: true, value: 'Adult', primaryText: "Population: per adult (15 and over)"}), React.createElement(MenuItem_1.default, {disabled: true, value: 'Adult100000', primaryText: "Population: per 100,000 adults"}), React.createElement(MenuItem_1.default, {disabled: true, value: 'Child', primaryText: "Population: per child (14 and under)"}), React.createElement(MenuItem_1.default, {disabled: true, value: 'Child100000', primaryText: "Population: per 100,000 children"}), React.createElement(MenuItem_1.default, {disabled: true, value: 'Household', primaryText: "Per household"}))) : null;
        let inflationadjustment = (branchDeclaration.showOptions)
            ?
                React.createElement("div", {style: {
                    display: 'inline-block',
                    whiteSpace: "nowrap",
                    verticalAlign: "bottom",
                    marginRight: '16px',
                }}, React.createElement(Toggle_1.default, {label: 'Inflation adjusted:', style: {
                    height: '32px',
                    marginTop: '16px'
                }, onToggle: (e, value) => {
                    this.toggleInflationAdjustment(value);
                }, labelStyle: {
                    fontStyle: 'italic'
                }, defaultToggled: branchDeclaration.inflationAdjusted}))
            :
                null;
        let showcontrols = React.createElement("div", {style: {
            display: 'inline-block',
            whiteSpace: "nowrap",
            verticalAlign: "bottom"
        }}, React.createElement(Toggle_1.default, {label: 'Show options:', style: { height: '32px', marginTop: '16px' }, labelStyle: { fontStyle: 'italic' }, defaultToggled: branchDeclaration.showOptions, onToggle: (e, value) => {
            this.toggleShowOptions(value);
        }}));
        let showhelp = (branchDeclaration.showOptions)
            ? React.createElement(IconButton_1.default, {tooltip: "Help", tooltipPosition: "top-center", onTouchTap: this.props.handleDialogOpen}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "help_outline"))
            : null;
        let search = (branchDeclaration.showOptions)
            ? React.createElement(IconButton_1.default, {disabled: true, tooltip: "Search", tooltipPosition: "top-center", onTouchTap: this.handleSearch}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "search"))
            : null;
        return React.createElement("div", null, React.createElement("div", null, viewpointselection, versionselection, aspectselection, byunitselection, inflationadjustment, showcontrols, showhelp, search), React.createElement("div", {style: { whiteSpace: "nowrap" }}, React.createElement("div", {ref: node => {
            branch.branchScrollBlock = node;
        }, style: { overflow: "scroll" }}, drilldownportals, React.createElement("div", {style: { display: "inline-block", width: "500px" }}))), React.createElement(Snackbar_1.default, {open: this.state.snackbar.open, message: this.state.snackbar.message, autoHideDuration: 4000, onRequestClose: this.handleSnackbarRequestClose}));
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ExplorerBranch;
