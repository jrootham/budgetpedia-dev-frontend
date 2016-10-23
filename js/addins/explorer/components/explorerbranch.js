'use strict';
const React = require('react');
var { Component } = React;
const DropDownMenu_1 = require('material-ui/DropDownMenu');
const MenuItem_1 = require('material-ui/MenuItem');
const FontIcon_1 = require('material-ui/FontIcon');
const IconButton_1 = require('material-ui/IconButton');
const Snackbar_1 = require('material-ui/Snackbar');
const Toggle_1 = require('material-ui/Toggle');
const RaisedButton_1 = require('material-ui/RaisedButton');
let jsonpack = require('jsonpack');
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
        this.addNodeDeclarations = branchUid => settingslist => this.props.globalStateActions.addNodeDeclarations(branchUid, settingslist);
        this.removeNodeDeclarations = branchUid => nodeItems => this.props.globalStateActions.removeNodeDeclarations(branchUid, nodeItems);
        this.urlparms = null;
        this.urlparmscleared = [];
        this.clearUrlParms = nodeIndex => {
            if (!this.urlparms) {
                console.error('call to remove expired urlparms', nodeIndex);
            }
            this.urlparmscleared.push(nodeIndex);
            if (this.urlparmscleared.length == this.urlparms.settingsdata.length) {
                this.urlparms = null;
                this.urlparmscleared = [];
            }
        };
        this._geturlsettingslist = (urlparms) => {
            let nodesettings = urlparms.settingsdata;
            let branch = urlparms.branchdata;
            let settingslist = [];
            for (let nodeindex in nodesettings) {
                let node = nodesettings[nodeindex];
                let settings = {
                    aspectName: branch.as,
                    cellIndex: node.ci,
                    cellList: null,
                    dataPath: branch.pa.slice(0, parseInt(nodeindex)),
                    nodeIndex: parseInt(nodeindex),
                    viewpointName: branch.vi,
                    yearSelections: {
                        leftYear: node.ys.ly,
                        rightYear: node.ys.ry,
                    },
                    yearsRange: {
                        firstYear: null,
                        lastYear: null,
                    },
                };
                settingslist.push({
                    settings: settings,
                });
            }
            return settingslist;
        };
        this._initialize = () => {
            let branch = this;
            let { budgetBranch, globalStateActions: actions, displayCallbacks, declarationData } = branch.props;
            branch._stateActions = Object.assign({}, actions);
            branch._stateActions.addNodeDeclaration = branch.addNodeDeclaration(budgetBranch.uid);
            branch._stateActions.addNodeDeclarations = branch.addNodeDeclarations(budgetBranch.uid);
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
                case actions_1.branchTypes.UPDATE_PRORATA: {
                    this._processUpdateProrataStateChange(budgetBranch);
                    break;
                }
                case actions_1.branchTypes.HARMONIZE_CELLS: {
                    budgetBranch.harmonizeCells();
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
                this._stateActions.incrementBranchDataVersion(budgetBranch.uid);
                let budgetNodeParms = budgetBranch.getInitialBranchNodeParms();
                this._stateActions.addNodeDeclaration(budgetNodeParms);
            }).catch(reason => {
                console.error('error in data fetch, changeviewpoint', reason);
            });
        };
        this._processChangeVersionStateChange = (budgetBranch) => {
            budgetBranch.getViewpointData().then(() => {
                this._stateActions.incrementBranchDataVersion(budgetBranch.uid);
                let budgetNodeParms = budgetBranch.getInitialBranchNodeParms();
                this._stateActions.addNodeDeclaration(budgetNodeParms);
            }).catch(reason => {
                console.error('error in data fetch, changeversion', reason);
            });
        };
        this._processToggleInflationAdjustedStateChange = (budgetBranch) => {
            budgetBranch.getViewpointData().then(() => {
                this._stateActions.incrementBranchDataVersion(budgetBranch.uid);
                budgetBranch.toggleInflationAdjusted();
            }).catch(reason => {
                console.error('error in data fetch, toggle inflation adjustment', reason);
            });
        };
        this._processUpdateProrataStateChange = (budgetBranch) => {
            budgetBranch.calculateProRata(this.state.viewpointData).then(() => {
                this._stateActions.incrementBranchDataVersion(budgetBranch.uid);
                budgetBranch.updateProrata();
            }).catch(reason => {
                console.error('error in data fetch, updata prorata', reason);
            });
        };
        this._processChangeAspectStateChange = (budgetBranch) => {
            budgetBranch.getViewpointData().then(() => {
                this._stateActions.incrementBranchDataVersion(budgetBranch.uid);
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
            let { budgetBranch } = this.props;
            this.props.globalStateActions.updateProrata(budgetBranch.uid, comparatorindex);
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
        this.harmonizeCells = (nodeUid, cellUid) => {
            let { budgetBranch } = this.props;
            let nodeList = [];
            let cellList = [];
            let nodeProperties = { cellIndex: null, yearSelections: null };
            let cellProperties = { yearScope: null, chartCode: null, nodeDataseriesName: null };
            let declarationData = this.props.declarationData;
            let refnode = declarationData.nodesById[nodeUid];
            let refcell = declarationData.cellsById[cellUid];
            nodeProperties.cellIndex = refnode.cellIndex;
            nodeProperties.yearSelections = Object.assign({}, refnode.yearSelections);
            cellProperties.yearScope = refcell.yearScope;
            cellProperties.chartCode = refcell.chartConfigs[refcell.yearScope].explorerChartCode;
            cellProperties.nodeDataseriesName = refcell.nodeDataseriesName;
            let nodeidlist = declarationData.branchesById[budgetBranch.uid].nodeList;
            for (let nodeid of nodeidlist) {
                nodeList.push(nodeid);
                let tempnode = declarationData.nodesById[nodeid];
                let cellidlist = tempnode.cellList;
                for (let cellid of cellidlist) {
                    if (cellid == cellUid)
                        continue;
                    cellList.push(cellid);
                }
            }
            if (nodeList.length > 0) {
                this._stateActions.harmonizeCells(budgetBranch.uid, nodeProperties, cellProperties, nodeList, cellList);
            }
        };
        this.getPortals = (budgetNodes) => {
            let branch = this;
            let { viewpointData } = branch.state;
            if (!viewpointData)
                return [];
            let datasetConfig = viewpointData.Meta.datasetConfig;
            let portalSeriesName = datasetConfig.DatasetName;
            if (datasetConfig.Units == 'DOLLAR') {
                portalSeriesName += ' (' + datasetConfig.UnitsAlias + ')';
            }
            let portals = budgetNodes.map((budgetNode, nodeindex) => {
                let branchDeclaration = branch.props.declarationData.branchesById[branch.props.budgetBranch.uid];
                let portalName = null;
                let treeNodeData = budgetNode.treeNodeData;
                if (treeNodeData.Name) {
                    portalName = budgetNode.treeNodeData.Name;
                    portalName += ' ' + portalSeriesName;
                }
                else {
                    portalName = datasetConfig.DatasetTitle;
                }
                let portalConfig = {
                    portalName: portalName,
                };
                budgetNode.portalConfig = portalConfig;
                let viewpointdata = branch.state.viewpointData;
                let { NamingConfigurations: viewpointNamingConfigs, isInflationAdjusted, } = viewpointdata.Meta;
                let viewpointConfigPack = {
                    viewpointNamingConfigs: viewpointNamingConfigs,
                    datasetConfig: datasetConfig,
                    isInflationAdjusted: isInflationAdjusted,
                    prorata: branchDeclaration.prorata,
                };
                budgetNode.viewpointConfigPack = viewpointConfigPack;
                budgetNode.branchSettings = branch.props.budgetBranch.branchDeclaration;
                budgetNode.onChartComponentSelection = onchartcomponentselection_1.onChartComponentSelection(branch.props.budgetBranch);
                let actions = Object.assign({}, branch._stateActions);
                actions.updateCellTimeScope = branch._stateActions.updateCellTimeScope(budgetNode.uid);
                actions.updateCellChartSelection = branch._stateActions.updateCellChartSelection(budgetNode.uid);
                actions.updateCellChartCode = branch._stateActions.updateCellChartCode(budgetNode.uid);
                actions.updateCellYearSelections = branch._stateActions.updateCellYearSelections(budgetNode.uid);
                return React.createElement(explorernode_1.ExplorerNode, {key: budgetNode.uid, callbackid: nodeindex, budgetNode: budgetNode, declarationData: branch.props.declarationData, globalStateActions: actions, showControls: branchDeclaration.showOptions, dataGenerationCounter: branchDeclaration.branchDataGeneration, callbacks: { harmonizeCells: branch.harmonizeCells }, urlparms: this.urlparms, clearUrlParms: this.clearUrlParms});
            });
            return portals;
        };
        this.shareBranch = () => {
            let branch = this;
            let branchDeclaration = branch.props.declarationData.branchesById[branch.props.budgetBranch.uid];
            let government = branchDeclaration.repository;
            let viewpoint = branchDeclaration.viewpoint;
            let version = branchDeclaration.version;
            let aspect = branchDeclaration.aspect;
            let prorata = branchDeclaration.prorata;
            let adjusted = branchDeclaration.inflationAdjusted;
            let path = this.state.branchNodes[this.state.branchNodes.length - 1].dataPath;
            let query = {
                g: government,
                vi: viewpoint,
                ve: version,
                as: aspect,
                pr: prorata,
                ad: adjusted,
                pa: path,
            };
            let nodeDeclarations = [];
            let node;
            for (node of this.state.branchNodes) {
                nodeDeclarations.push(node.nodeDeclaration);
            }
            let settings = [];
            for (let nodeDeclaration of nodeDeclarations) {
                let cellDeclarations = [];
                for (let celluid of nodeDeclaration.cellList) {
                    cellDeclarations.push(branch.props.declarationData.cellsById[celluid]);
                }
                let cellSettingsList = [];
                for (let cellDeclaration of cellDeclarations) {
                    let cellSettings = {
                        ys: cellDeclaration.yearScope,
                        ct: cellDeclaration.chartConfigs[cellDeclaration.yearScope].explorerChartCode
                    };
                    cellSettingsList.push(cellSettings);
                }
                let nodesettings = {
                    ci: nodeDeclaration.cellIndex,
                    ys: {
                        ly: nodeDeclaration.yearSelections.leftYear,
                        ry: nodeDeclaration.yearSelections.rightYear,
                    },
                    c: cellSettingsList[nodeDeclaration.cellIndex],
                };
                settings.push(nodesettings);
            }
            let branchstring = jsonpack.pack(query);
            let bsencoded = encodeURIComponent(branchstring);
            let settingsstring = jsonpack.pack(settings);
            let ssencoded = encodeURIComponent(settingsstring);
            console.log('query', query, branchstring, branchstring.length, bsencoded, bsencoded.length);
            console.log('settings', settings, settingsstring, settingsstring.length, ssencoded, ssencoded.length);
            let url = location.hostname + '/explorer?branch=' + bsencoded + '&settings=' + ssencoded;
            console.log('url', url, url.length);
        };
    }
    componentWillMount() {
        this._initialize();
        let { budgetBranch, declarationData } = this.props;
        budgetBranch.getViewpointData().then(() => {
            this._stateActions.incrementBranchDataVersion(budgetBranch.uid);
            if (declarationData.branchesById[budgetBranch.uid].nodeList.length == 0) {
                let { urlparms } = this.props;
                if (urlparms) {
                    this.urlparms = urlparms;
                    this.props.clearUrlParms();
                    let settingslist = this._geturlsettingslist(urlparms);
                    this._stateActions.addNodeDeclarations(settingslist);
                }
                else {
                    let budgetNodeParms = budgetBranch.getInitialBranchNodeParms();
                    this._stateActions.addNodeDeclaration(budgetNodeParms);
                }
            }
            else {
                setTimeout(() => {
                    this._stateActions.resetLastAction();
                });
            }
        }).catch(reason => {
            console.error('error in data fetch, componentWillMount (branch)', reason);
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
        }}, React.createElement(MenuItem_1.default, {value: 'FUNCTIONAL', primaryText: "Functional (budget)"}), React.createElement(MenuItem_1.default, {value: 'STRUCTURAL', primaryText: "Structural (budget)"}), React.createElement(MenuItem_1.default, {value: 'ACTUALEXPENSES', primaryText: "Expenses (actual)"}), React.createElement(MenuItem_1.default, {value: 'ACTUALREVENUES', primaryText: "Revenues (actual)"}), React.createElement(MenuItem_1.default, {value: 'EXPENDITURES', primaryText: "Expenses by Object (actual)"}))) : null;
        let governmentselection = (branchDeclaration.showOptions) ? React.createElement("div", {style: { display: 'inline-block', whiteSpace: "nowrap" }}, React.createElement("span", {style: { fontStyle: "italic" }}, "Government: "), React.createElement(DropDownMenu_1.default, {value: "Toronto", disabled: true}, React.createElement(MenuItem_1.default, {value: 'Toronto', primaryText: "Toronto, Ontario"}))) : null;
        const versionchoices = () => {
            switch (branchDeclaration.viewpoint) {
                case "FUNCTIONAL":
                case "STRUCTURAL":
                    return [React.createElement(MenuItem_1.default, {key: 1, value: 'SUMMARY', primaryText: "Summary"}),
                        React.createElement(MenuItem_1.default, {key: 2, value: 'PBFT', primaryText: "Detail (PBFT)"}),
                        React.createElement(MenuItem_1.default, {key: 3, disabled: true, value: 'VARIANCE', primaryText: "Variance Reports"})];
                case 'ACTUALEXPENSES':
                    return [React.createElement(MenuItem_1.default, {key: 4, value: 'ACTUALEXPENSES', primaryText: "Expense Summary"})];
                case 'ACTUALREVENUES':
                    return [React.createElement(MenuItem_1.default, {key: 4, value: 'ACTUALREVENUES', primaryText: "Revenue Summary"})];
                case 'EXPENDITURES':
                    return [React.createElement(MenuItem_1.default, {key: 4, value: 'EXPENDITURES', primaryText: "Expenses by Object"})];
            }
        };
        let versionselection = (branchDeclaration.showOptions) ? React.createElement("div", {style: { display: 'inline-block', whiteSpace: "nowrap" }}, React.createElement("span", {style: { fontStyle: "italic" }}, "Version: "), React.createElement(DropDownMenu_1.default, {value: branchDeclaration.version, onChange: (e, index, value) => {
            branch.switchVersion(value);
        }}, versionchoices())) : null;
        const aspectchoices = () => {
            switch (branchDeclaration.viewpoint) {
                case "FUNCTIONAL":
                case "STRUCTURAL":
                    return [React.createElement(MenuItem_1.default, {key: 1, value: 'Expenses', primaryText: "Expenses"}),
                        React.createElement(MenuItem_1.default, {key: 2, value: 'Revenues', primaryText: "Revenues"}),
                        React.createElement(MenuItem_1.default, {key: 3, value: 'Staffing', primaryText: "Staffing"})];
                case 'ACTUALEXPENSES':
                    return [React.createElement(MenuItem_1.default, {key: 4, value: 'Expenses', primaryText: "Expenses"})];
                case 'ACTUALREVENUES':
                    return [React.createElement(MenuItem_1.default, {key: 4, value: 'Revenues', primaryText: "Revenues"})];
                case 'EXPENDITURES':
                    return [React.createElement(MenuItem_1.default, {key: 4, value: 'Expenditure', primaryText: "Expenditure"})];
            }
        };
        let aspectselection = (branchDeclaration.showOptions)
            ?
                React.createElement("div", {style: { display: 'inline-block', whiteSpace: "nowrap" }}, React.createElement("span", {style: { fontStyle: "italic" }}, "Aspect: "), React.createElement(DropDownMenu_1.default, {value: branchDeclaration.aspect, onChange: (e, index, value) => {
                    branch.switchAspect(value);
                }}, aspectchoices()))
            :
                null;
        let byunitselection = (branchDeclaration.showOptions) ? React.createElement("div", {style: { display: 'inline-block', whiteSpace: "nowrap" }}, React.createElement("span", {style: { fontStyle: "italic" }}, "Prorated: "), React.createElement(DropDownMenu_1.default, {value: branchDeclaration.prorata, onChange: (e, index, value) => {
            this.switchComparator(value);
        }}, React.createElement(MenuItem_1.default, {value: 'OFF', primaryText: "Off"}), React.createElement(MenuItem_1.default, {value: 'PERPERSON', primaryText: "Per person"}), React.createElement(MenuItem_1.default, {value: 'PER100000PERSONS', primaryText: "Per 100,000 people"}), React.createElement(MenuItem_1.default, {value: 'PERHOUSEHOLD', primaryText: "Per household"}), React.createElement(MenuItem_1.default, {value: 'PER50000HOUSEHOLDS', primaryText: "Per 50,000 households"}))) : null;
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
        let technotes = (branchDeclaration.showOptions)
            ? React.createElement("div", {style: {
                display: 'inline-block',
                whiteSpace: "nowrap",
                verticalAlign: "bottom",
                position: "relative",
            }}, React.createElement(IconButton_1.default, {tooltip: "Source documents and technical notes", tooltipPosition: "top-center", disabled: true, style: { top: '3px' }}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "note")))
            : null;
        let showhelp = (branchDeclaration.showOptions)
            ? React.createElement("div", {style: {
                display: 'inline-block',
                whiteSpace: "nowrap",
                verticalAlign: "bottom",
                position: "relative",
            }}, React.createElement(IconButton_1.default, {tooltip: "Help", tooltipPosition: "top-center", style: { top: '3px' }, onTouchTap: this.props.handleDialogOpen}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "help_outline")))
            : null;
        let search = (branchDeclaration.showOptions)
            ? React.createElement("div", {style: {
                display: 'inline-block',
                whiteSpace: "nowrap",
                verticalAlign: "bottom",
                position: "relative",
            }}, React.createElement(IconButton_1.default, {disabled: true, tooltip: "Find an entry point", tooltipPosition: "top-center", style: { top: '3px' }, onTouchTap: this.handleSearch}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "search")))
            : null;
        let shareurl = (branchDeclaration.showOptions)
            ? React.createElement(RaisedButton_1.default, {type: "button", label: "Share", onTouchTap: this.shareBranch}) : null;
        return React.createElement("div", null, React.createElement("div", null, governmentselection, viewpointselection, versionselection, aspectselection, byunitselection, inflationadjustment, showcontrols, technotes, showhelp, search, shareurl), React.createElement("div", {style: { whiteSpace: "nowrap" }}, React.createElement("div", {ref: node => {
            branch.branchScrollBlock = node;
        }, style: { overflow: "scroll" }}, drilldownportals, React.createElement("div", {style: { display: "inline-block", width: "500px" }}))), React.createElement(Snackbar_1.default, {open: this.state.snackbar.open, message: this.state.snackbar.message, autoHideDuration: 4000, onRequestClose: this.handleSnackbarRequestClose}));
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ExplorerBranch;
