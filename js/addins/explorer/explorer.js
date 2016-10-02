'use strict';
const React = require('react');
const react_dom_1 = require('react-dom');
var { Component } = React;
const react_redux_1 = require('react-redux');
const Card_1 = require('material-ui/Card');
const FontIcon_1 = require('material-ui/FontIcon');
const IconButton_1 = require('material-ui/IconButton');
const Dialog_1 = require('material-ui/Dialog');
const FloatingActionButton_1 = require('material-ui/FloatingActionButton');
const add_1 = require('material-ui/svg-icons/content/add');
const remove_1 = require('material-ui/svg-icons/content/remove');
const Popover_1 = require('material-ui/Popover');
const Toggle_1 = require('material-ui/Toggle');
let uuid = require('node-uuid');
const explorerbranch_1 = require('./components/explorerbranch');
const Actions = require('../../core/actions/actions');
const ExplorerActions = require('./actions');
const branch_class_1 = require('./classes/branch.class');
const reducers_1 = require('./reducers');
const helpcontent_1 = require('./content/helpcontent');
let Explorer = class extends Component {
    constructor(...args) {
        super(...args);
        this.state = {
            budgetBranches: [],
            dialogOpen: false,
            popover: {
                open: false
            },
            showdashboard: false
        };
        this.popoverClose = () => {
            this.setState({
                popover: {
                    open: false
                }
            });
        };
        this.harmonizeBranchesToState = (budgetBranches, branchList, branchesById) => {
            let change = false;
            let newBranches = budgetBranches.filter((branch) => {
                return !!branchesById[branch.uid];
            });
            if (newBranches.length != budgetBranches.length) {
                change = true;
            }
            for (let i = 0; i < branchList.length; i++) {
                let uid = branchList[i];
                let foundbranch = newBranches.filter(branch => {
                    if (branch.uid == uid)
                        return branch;
                });
                if (foundbranch.length == 0) {
                    if (!change)
                        change = true;
                    let budgetBranch = new branch_class_1.default({ uid: uid });
                    newBranches.push(budgetBranch);
                }
            }
            let sortedBranches = [];
            for (let i = 0; i < branchList.length; i++) {
                let uid = branchList[i];
                let foundbranch = newBranches.filter(branch => {
                    if (branch.uid == uid)
                        return branch;
                });
                if (!(foundbranch.length == 1)) {
                    console.error('System error -- unexpected mismatch between state branch list and explorer branch list', branchList, newBranches);
                    throw Error('System error -- unexpected mismatch between state branch list and explorer branch list');
                }
                sortedBranches.push(foundbranch[0]);
            }
            if (!change) {
                for (let i = 0; i < budgetBranches.length; i++) {
                    if (budgetBranches[i].uid != sortedBranches[i].uid) {
                        change = true;
                        break;
                    }
                }
            }
            if (change) {
                this.setState({
                    budgetBranches: sortedBranches,
                });
            }
        };
        this.handleDialogOpen = (e) => {
            e.stopPropagation();
            e.preventDefault();
            this.setState({
                dialogOpen: true
            });
        };
        this.handleDialogClose = () => {
            this.setState({
                dialogOpen: false
            });
        };
        this.workingStatus = status => {
            if (status) {
                this.props.showWaitingMessage();
            }
            else {
                this.props.hideWaitingMessage();
            }
        };
        this.updateNode = branchuid => nodeuid => this.props.updateNode(branchuid, nodeuid);
        this.changeTab = branchuid => (nodeuid, tabvalue) => this.props.changeTab(branchuid, nodeuid, tabvalue);
        this.addCellDeclarations = branchuid => (nodeuid, settingslist) => this.props.addCellDeclarations(branchuid, nodeuid, settingslist);
        this.normalizeCellYearDependencies = branchuid => (nodeuid, cellList, yearsRange) => this.props.normalizeCellYearDependencies(branchuid, nodeuid, cellList, yearsRange);
        this.updateCellChartSelection = branchuid => nodeuid => (celluid, selection) => this.props.updateCellChartSelection(branchuid, nodeuid, celluid, selection);
        this.updateCellYearSelections = branchuid => nodeuid => (leftyear, rightyear) => this.props.updateCellYearSelections(branchuid, nodeuid, leftyear, rightyear);
        this.updateCellChartCode = branchuid => nodeuid => (celluid, explorerChartCode) => this.props.updateCellChartCode(branchuid, nodeuid, celluid, explorerChartCode);
        this.onExpandChange = (expanded) => {
            this.props.resetLastAction();
        };
        this.branchMoveUp = branchuid => {
            this.props.branchMoveUp(branchuid);
        };
        this.branchMoveDown = branchuid => {
            this.props.branchMoveDown(branchuid);
        };
        this._getBranchCloneSettings = refbranchid => {
            let declarationData = this.props.declarationData;
            let clones = {
                branch: {},
                nodes: {},
                cells: {},
            };
            let uidmap = {};
            uidmap[refbranchid] = uuid.v4();
            clones.branch[refbranchid] = this._getClone(declarationData.branchesById[refbranchid]);
            for (let nodeid of clones.branch[refbranchid]['nodeList']) {
                let nodeobject = declarationData.nodesById[nodeid];
                clones.nodes[nodeid] = this._getClone(nodeobject);
                uidmap[nodeid] = uuid.v4();
            }
            for (let nodeid in clones.nodes) {
                for (let cellid of clones.nodes[nodeid].cellList) {
                    clones.cells[cellid] = this._getClone(declarationData.cellsById[cellid]);
                    uidmap[cellid] = uuid.v4();
                }
            }
            let newclones = {
                newbranchid: uidmap[refbranchid],
                branch: {},
                nodes: {},
                cells: {},
            };
            let newrefbranchid = uidmap[refbranchid];
            newclones.branch[newrefbranchid] = clones.branch[refbranchid];
            let oldlist = newclones.branch[newrefbranchid]['nodeList'];
            let newlist = [];
            for (let id of oldlist) {
                newlist.push(uidmap[id]);
            }
            newclones.branch[newrefbranchid]['nodeList'] = newlist;
            for (let id in clones.nodes) {
                let newid = uidmap[id];
                let nodeclone = newclones.nodes[newid] = clones.nodes[id];
                let oldlist = nodeclone['cellList'];
                let newlist = [];
                for (let id of oldlist) {
                    newlist.push(uidmap[id]);
                }
                nodeclone['cellList'] = newlist;
            }
            for (let id in clones.cells) {
                newclones.cells[uidmap[id]] = clones.cells[id];
            }
            return newclones;
        };
        this._getClone = object => {
            return JSON.parse(JSON.stringify(object));
        };
        this.addBranch = refbranchuid => {
            let cloneSettings = this._getBranchCloneSettings(refbranchuid);
            this.props.cloneBranchDeclaration(refbranchuid, cloneSettings);
        };
        this.removeBranch = branchuid => {
            this.props.removeBranchDeclaration(branchuid);
        };
    }
    componentWillMount() {
        let { branchList, branchesById } = this.props.declarationData;
        if (branchList.length == 0) {
            let defaultSettings = JSON.parse(JSON.stringify(this.props.declarationData.defaults.branch));
            this.props.addBranchDeclaration(null, defaultSettings);
        }
        else {
            let { branchList, branchesById } = this.props.declarationData;
            let budgetBranches = [...this.state.budgetBranches];
            this.harmonizeBranchesToState(budgetBranches, branchList, branchesById);
        }
    }
    componentDidMount() {
        this.setState({
            popover: {
                open: true
            }
        });
    }
    componentWillUnmount() {
        this.props.resetLastAction();
    }
    componentDidUpdate() {
        let { branchList, branchesById } = this.props.declarationData;
        let budgetBranches = [...this.state.budgetBranches];
        this.harmonizeBranchesToState(budgetBranches, branchList, branchesById);
    }
    render() {
        let explorer = this;
        let dialogbox = React.createElement(Dialog_1.default, {title: "Budget Explorer Options", modal: false, open: explorer.state.dialogOpen, onRequestClose: explorer.handleDialogClose, bodyStyle: { padding: '12px' }, autoScrollBodyContent: true, contentStyle: { width: '95%', maxWidth: '600px' }}, React.createElement(IconButton_1.default, {style: {
            top: 0,
            right: 0,
            padding: 0,
            height: "36px",
            width: "36px",
            position: "absolute",
            zIndex: 2,
        }, onTouchTap: explorer.handleDialogClose}, React.createElement(FontIcon_1.default, {className: "material-icons", style: { cursor: "pointer" }}, "close")), helpcontent_1.default);
        let popover = React.createElement(Popover_1.default, {style: { borderRadius: "15px", maxWidth: "400px" }, open: this.state.popover.open, onRequestClose: this.popoverClose, anchorEl: this.popover_ref}, React.createElement(Card_1.Card, {style: { border: "4px solid orange", borderRadius: "15px" }}, React.createElement(Card_1.CardText, null, React.createElement("div", null, React.createElement(IconButton_1.default, {style: {
            padding: 0,
            float: "right",
            height: "36px",
            width: "36px",
        }, onTouchTap: explorer.popoverClose}, React.createElement(FontIcon_1.default, {className: "material-icons", style: { cursor: "pointer" }}, "close"))), React.createElement("p", null, "Click or tap on any chart column to drill down (except faded columns, which are as deep as you can go)."))));
        let branchSegments = () => {
            let budgetBranches = explorer.state.budgetBranches;
            let segments = budgetBranches.map((budgetBranch, branchIndex) => {
                let actionFunctions = {
                    addCellDeclarations: this.addCellDeclarations(budgetBranch.uid),
                    normalizeCellYearDependencies: this.normalizeCellYearDependencies(budgetBranch.uid),
                    updateCellChartSelection: this.updateCellChartSelection(budgetBranch.uid),
                    updateCellYearSelections: this.updateCellYearSelections(budgetBranch.uid),
                    changeTab: this.changeTab(budgetBranch.uid),
                    updateCellChartCode: this.updateCellChartCode(budgetBranch.uid),
                    updateNode: this.updateNode(budgetBranch.uid),
                    addNodeDeclaration: this.props.addNodeDeclaration,
                    removeNodeDeclarations: this.props.removeNodeDeclarations,
                    changeViewpoint: this.props.changeViewpoint,
                    changeVersion: this.props.changeVersion,
                    toggleInflationAdjusted: this.props.toggleInflationAdjusted,
                    changeAspect: this.props.changeAspect,
                    changeBranchDataVersion: this.props.changeBranchDataVersion,
                    toggleShowOptions: this.props.toggleShowOptions,
                    updateCellsDataseriesName: this.props.updateCellsDataseriesName,
                    resetLastAction: this.props.resetLastAction,
                };
                let displayCallbackFunctions = {
                    workingStatus: explorer.workingStatus,
                };
                return React.createElement(Card_1.Card, {initiallyExpanded: true, key: budgetBranch.uid, onExpandChange: (expanded) => {
                    this.onExpandChange(expanded);
                }}, React.createElement(Card_1.CardTitle, {actAsExpander: true, showExpandableButton: true}, "Exhibit " + (branchIndex + 1) + " ", React.createElement("input", {type: "text", onTouchTap: (ev) => { ev.stopPropagation(); }}), React.createElement(IconButton_1.default, {style: {
                    float: "right",
                    marginRight: "30px"
                }, disabled: (branchIndex == (budgetBranches.length - 1)), onTouchTap: (uid => ev => {
                    ev.stopPropagation();
                    this.branchMoveDown(uid);
                })(budgetBranch.uid), tooltip: "Move down"}, React.createElement(FontIcon_1.default, {className: "material-icons", style: { cursor: "pointer" }}, "arrow_downward")), React.createElement(IconButton_1.default, {style: {
                    float: "right"
                }, disabled: (branchIndex == 0), onTouchTap: (uid => ev => {
                    ev.stopPropagation();
                    this.branchMoveUp(uid);
                })(budgetBranch.uid), tooltip: "Move up"}, React.createElement(FontIcon_1.default, {className: "material-icons", style: { cursor: "pointer" }}, "arrow_upward"))), React.createElement(Card_1.CardText, {expandable: true}, React.createElement(explorerbranch_1.default, {budgetBranch: budgetBranch, declarationData: explorer.props.declarationData, globalStateActions: actionFunctions, displayCallbacks: displayCallbackFunctions, handleDialogOpen: this.handleDialogOpen})), React.createElement(Card_1.CardActions, {expandable: true}, React.createElement(FloatingActionButton_1.default, {onTouchTap: (uid => () => {
                    this.addBranch(uid);
                })(budgetBranch.uid)}, React.createElement(add_1.default, null)), (budgetBranches.length > 1) ? React.createElement(FloatingActionButton_1.default, {onTouchTap: (uid => () => {
                    this.removeBranch(uid);
                })(budgetBranch.uid), secondary: true}, React.createElement(remove_1.default, null)) : null));
            });
            return segments;
        };
        let branches = branchSegments();
        return React.createElement("div", null, React.createElement(Card_1.Card, {expanded: this.state.showdashboard}, React.createElement(Card_1.CardTitle, {ref: node => { this.popover_ref = react_dom_1.findDOMNode(node); }}, React.createElement(Toggle_1.default, {label: 'Show dashboard:', toggled: this.state.showdashboard, style: {
            height: '32px', float: "right",
            display: "inline-block",
            width: 'auto',
        }, labelStyle: { fontStyle: 'italic' }, onToggle: (e, value) => {
            e.stopPropagation();
            this.setState({
                showdashboard: value
            });
        }}), "Budget Explorer"), React.createElement(Card_1.CardText, {expandable: true}, React.createElement("span", {style: { fontStyle: 'italic' }}, "[content to be determined]"))), dialogbox, popover, branches);
    }
}
;
let mapStateToProps = state => ({
    declarationData: reducers_1.getExplorerDeclarationData(state),
});
Explorer = react_redux_1.connect(mapStateToProps, {
    showWaitingMessage: Actions.showWaitingMessage,
    hideWaitingMessage: Actions.hideWaitingMessage,
    addBranchDeclaration: ExplorerActions.addBranchDeclaration,
    cloneBranchDeclaration: ExplorerActions.cloneBranchDeclaration,
    removeBranchDeclaration: ExplorerActions.removeBranchDeclaration,
    addNodeDeclaration: ExplorerActions.addNodeDeclaration,
    removeNodeDeclarations: ExplorerActions.removeNodeDeclarations,
    addCellDeclarations: ExplorerActions.addCellDeclarations,
    normalizeCellYearDependencies: ExplorerActions.normalizeCellYearDependencies,
    changeViewpoint: ExplorerActions.changeViewpoint,
    changeVersion: ExplorerActions.changeVersion,
    changeAspect: ExplorerActions.changeAspect,
    toggleInflationAdjusted: ExplorerActions.toggleInflationAdjusted,
    changeBranchDataVersion: ExplorerActions.changeBranchDataVersion,
    toggleShowOptions: ExplorerActions.toggleShowOptions,
    resetLastAction: ExplorerActions.resetLastAction,
    branchMoveUp: ExplorerActions.branchMoveUp,
    branchMoveDown: ExplorerActions.branchMoveDown,
    changeTab: ExplorerActions.changeTab,
    updateCellChartSelection: ExplorerActions.updateCellChartSelection,
    updateCellYearSelections: ExplorerActions.updateCellYearSelections,
    updateCellChartCode: ExplorerActions.updateCellChartCode,
    updateNode: ExplorerActions.updateNode,
})(Explorer);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Explorer;
