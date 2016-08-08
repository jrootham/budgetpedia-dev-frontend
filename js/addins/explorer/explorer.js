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
const explorerbranch_1 = require('./components/explorerbranch');
const Actions = require('../../core/actions/actions');
const ExplorerActions = require('./actions');
const branch_class_1 = require('./classes/branch.class');
const reducers_1 = require('./reducers');
let Explorer = class extends Component {
    constructor(...args) {
        super(...args);
        this.state = {
            budgetBranches: [],
            dialogOpen: false,
            popover: {
                open: false
            }
        };
        this.freshstart = false;
        this.popoverClose = () => {
            this.setState({
                popover: {
                    open: false
                }
            });
        };
        this.addBranch = refbranchuid => {
            let defaultSettings = JSON.parse(JSON.stringify(this.props.declarationData.defaults.branch));
            this.props.addBranchDeclaration(refbranchuid, defaultSettings);
        };
        this.removeBranch = branchuid => {
            this.props.removeBranchDeclaration(branchuid);
        };
        this.harmonizeBranches = (budgetBranches, branchList, branchesById) => {
            let newBranches = budgetBranches.filter((branch) => {
                return !!branchesById[branch.uid];
            });
            let length = newBranches.length;
            for (let i = 0; i < branchList.length; i++) {
                let uid = branchList[i];
                let foundbranch = newBranches.filter(branch => {
                    if (branch.uid == uid)
                        return branch;
                });
                if (foundbranch.length == 0) {
                    let settings = branchesById[uid];
                    let budgetBranch = new branch_class_1.default({ settings: settings, uid: uid });
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
            return sortedBranches;
        };
        this.handleDialogOpen = () => {
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
                setTimeout(() => {
                    this.props.hideWaitingMessage();
                });
            }
        };
        this.changeTab = branchuid => (nodeuid, tabvalue) => this.props.changeTab(branchuid, nodeuid, tabvalue);
        this.addCellDeclarations = branchuid => (nodeuid, settingslist) => this.props.addCellDeclarations(branchuid, nodeuid, settingslist);
        this.updateCellChartSelection = branchuid => nodeuid => (celluid, selection) => (this.props.updateCellChartSelection(branchuid, nodeuid, celluid, selection));
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
    }
    componentWillMount() {
        let { branchList, branchesById } = this.props.declarationData;
        if (branchList.length == 0) {
            this.freshstart = true;
            let defaultSettings = JSON.parse(JSON.stringify(this.props.declarationData.defaults.branch));
            this.props.addBranchDeclaration(null, defaultSettings);
        }
        else {
            let budgetBranches = [...this.state.budgetBranches];
            budgetBranches = this.harmonizeBranches(budgetBranches, branchList, branchesById);
            this.setState({
                budgetBranches: budgetBranches,
            });
        }
    }
    componentWillReceiveProps(nextProps) {
        let { branchList, branchesById } = nextProps.declarationData;
        let budgetBranches = [...this.state.budgetBranches];
        budgetBranches = this.harmonizeBranches(budgetBranches, branchList, branchesById);
        for (let i = 0; i < branchList.length; i++) {
            if (branchList[i] != budgetBranches[i].uid) {
                throw Error('mismatched order between declarationData list and branch list');
            }
            budgetBranches[i].settings = branchesById[branchList[i]];
        }
        this.setState({
            budgetBranches: budgetBranches,
        });
    }
    componentDidMount() {
        if (this.freshstart) {
            this.setState({
                popover: {
                    open: true
                }
            });
        }
    }
    componentWillUnmount() {
        this.props.resetLastAction();
    }
    render() {
        let explorer = this;
        let dialogbox = React.createElement(Dialog_1.default, {title: "Budget Explorer Help", modal: false, open: explorer.state.dialogOpen, onRequestClose: explorer.handleDialogClose, autoScrollBodyContent: true}, React.createElement(IconButton_1.default, {style: {
            top: 0,
            right: 0,
            padding: 0,
            height: "36px",
            width: "36px",
            position: "absolute",
            zIndex: 2,
        }, onTouchTap: explorer.handleDialogClose}, React.createElement(FontIcon_1.default, {className: "material-icons", style: { cursor: "pointer" }}, "close")), React.createElement("p", null, "In the explorer charts, Viewpoints include: "), React.createElement("dl", null, React.createElement("dt", null, React.createElement("strong", null, "Functional")), React.createElement("dd", null, "combines City of Toronto Agencies and Divisions into groups according to the nature of the services delivered (this is the default ) "), React.createElement("dt", null, React.createElement("strong", null, "Structural")), React.createElement("dd", null, "more traditional: separates Agencies from Divisions; groupings are closer to those found" + ' ' + "in City annual Budget Summaries")), React.createElement("p", null, "Facets are the main datasets available: Expenditures, Revenues, and Staffing Positions (Full Time Equivalents) "), React.createElement("p", null, "This prototype uses data from the City Council Approved Operating Budget Summary 2015 from the City of Toronto's open data portal"), React.createElement("p", null, "Click or tap on any column in the \"By Programs\" charts to drill-down. Other charts do not" + ' ' + "currently support drill-down."));
        let popover = React.createElement(Popover_1.default, {style: { borderRadius: "15px" }, open: this.state.popover.open, onRequestClose: this.popoverClose, anchorEl: this.popover_ref}, React.createElement(Card_1.Card, {style: { border: "4px solid orange", borderRadius: "15px" }}, React.createElement(Card_1.CardText, null, React.createElement("div", null, React.createElement(IconButton_1.default, {style: {
            padding: 0,
            float: "right",
            height: "36px",
            width: "36px",
        }, onTouchTap: explorer.popoverClose}, React.createElement(FontIcon_1.default, {className: "material-icons", style: { cursor: "pointer" }}, "close"))), React.createElement("p", null, "Click or tap on any chart column to drill down."))));
        let drilldownSegments = () => {
            let budgetBranches = explorer.state.budgetBranches;
            let segments = budgetBranches.map((budgetBranch, branchIndex) => {
                let actionFunctions = {
                    addCellDeclarations: this.addCellDeclarations(budgetBranch.uid),
                    updateCellChartSelection: this.updateCellChartSelection(budgetBranch.uid),
                    changeTab: this.changeTab(budgetBranch.uid),
                    updateCellChartCode: this.updateCellChartCode(budgetBranch.uid),
                    addNodeDeclaration: this.props.addNodeDeclaration,
                    removeNodeDeclarations: this.props.removeNodeDeclarations,
                    changeViewpoint: this.props.changeViewpoint,
                    changeFacet: this.props.changeFacet,
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
                })(budgetBranch.uid), tooltip: "Move up"}, React.createElement(FontIcon_1.default, {className: "material-icons", style: { cursor: "pointer" }}, "arrow_upward"))), React.createElement(Card_1.CardText, {expandable: true}, React.createElement(explorerbranch_1.default, {budgetBranch: budgetBranch, declarationData: explorer.props.declarationData, globalStateActions: actionFunctions, displayCallbacks: displayCallbackFunctions})), React.createElement(Card_1.CardActions, {expandable: true}, React.createElement(FloatingActionButton_1.default, {onTouchTap: (uid => () => {
                    this.addBranch(uid);
                })(budgetBranch.uid)}, React.createElement(add_1.default, null)), (budgetBranches.length > 1) ? React.createElement(FloatingActionButton_1.default, {onTouchTap: (uid => () => {
                    this.removeBranch(uid);
                })(budgetBranch.uid), secondary: true}, React.createElement(remove_1.default, null)) : null));
            });
            return segments;
        };
        let branches = drilldownSegments();
        return React.createElement("div", null, React.createElement(Card_1.Card, {initiallyExpanded: false}, React.createElement(Card_1.CardTitle, {actAsExpander: true, showExpandableButton: true, ref: node => { this.popover_ref = react_dom_1.findDOMNode(node); }}, "Budget Explorer"), React.createElement(Card_1.CardText, {expandable: true}, "If you're new here, ", React.createElement("a", {href: "javascript:void(0)", onTouchTap: explorer.handleDialogOpen}, "read the help text"), " first.", React.createElement(IconButton_1.default, {tooltip: "help", tooltipPosition: "top-center", onTouchTap: explorer.handleDialogOpen}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "help_outline")))), dialogbox, popover, branches);
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
    removeBranchDeclaration: ExplorerActions.removeBranchDeclaration,
    addNodeDeclaration: ExplorerActions.addNodeDeclaration,
    removeNodeDeclarations: ExplorerActions.removeNodeDeclarations,
    addCellDeclarations: ExplorerActions.addCellDeclarations,
    changeViewpoint: ExplorerActions.changeViewpoint,
    changeFacet: ExplorerActions.changeFacet,
    resetLastAction: ExplorerActions.resetLastAction,
    branchMoveUp: ExplorerActions.branchMoveUp,
    branchMoveDown: ExplorerActions.branchMoveDown,
    changeTab: ExplorerActions.changeTab,
    updateCellChartSelection: ExplorerActions.updateCellChartSelection,
    updateCellsDataseriesName: ExplorerActions.updateCellsDataseriesName,
    updateCellChartCode: ExplorerActions.updateCellChartCode,
})(Explorer);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Explorer;
