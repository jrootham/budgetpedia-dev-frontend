'use strict';
const React = require('react');
var { Component } = React;
const react_redux_1 = require('react-redux');
const Card_1 = require('material-ui/Card');
const FontIcon_1 = require('material-ui/FontIcon');
const IconButton_1 = require('material-ui/IconButton');
const Dialog_1 = require('material-ui/Dialog');
const explorerbranch_1 = require('./components/explorerbranch');
const updatebranchchartselections_1 = require('./modules/updatebranchchartselections');
const Actions = require('../../core/actions/actions');
const ExplorerActions = require('./actions');
const budgetbranch_1 = require('./classes/budgetbranch');
const reducers_1 = require('./reducers');
let Explorer = class extends Component {
    constructor(props) {
        super(props);
        this.state = {
            budgetBranches: [],
            dialogopen: false,
        };
        this.harmonizeBudgetBranches = (budgetBranches, branchList, branchesById) => {
            if (budgetBranches.length < branchList.length) {
                let length = budgetBranches.length;
                for (let i = length; i < branchList.length; i++) {
                    let uid = branchList[i];
                    let settings = branchesById[uid];
                    let budgetBranch = new budgetbranch_1.default({ settings: settings, uid: uid });
                    budgetBranches.push(budgetBranch);
                }
            }
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
        this.updateIndexChartSelections = branchIndex => {
            let budgetBranch = this.state.budgetBranches[branchIndex];
            updatebranchchartselections_1.updateBranchChartSelections(budgetBranch.nodes);
        };
        this.updateChartSelections = branchIndex => () => {
            return this.updateIndexChartSelections(branchIndex);
        };
    }
    componentWillMount() {
        let { branchList, branchesById } = this.props.controlData;
        if (branchList.length == 0) {
            let defaultSettings = this.props.controlData.defaults.branch;
            this.props.addBranchDeclaration(defaultSettings);
        }
        else {
            let budgetBranches = this.state.budgetBranches;
            this.harmonizeBudgetBranches(budgetBranches, branchList, branchesById);
            this.setState({
                budgetBranches: budgetBranches,
            });
        }
    }
    componentWillReceiveProps(nextProps) {
        let { branchList, branchesById } = nextProps.controlData;
        let budgetBranches = this.state.budgetBranches;
        budgetBranches = budgetBranches.filter(budgetBranch => {
            return !!branchesById[budgetBranch.uid];
        });
        this.harmonizeBudgetBranches(budgetBranches, branchList, branchesById);
        for (let i = 0; i < branchList.length; i++) {
            if (branchList[i] != budgetBranches[i].uid) {
                throw Error('mismatched order between controlData list and branch list');
            }
            budgetBranches[i].settings = branchesById[branchList[i]];
        }
        this.setState({
            budgetBranches: budgetBranches,
        });
    }
    render() {
        let explorer = this;
        console.log('controlData', explorer.props.controlData);
        let dialogbox = React.createElement(Dialog_1.default, {title: "Budget Explorer Help", modal: false, open: explorer.state.dialogopen, onRequestClose: explorer.handleDialogClose, autoScrollBodyContent: true}, React.createElement(IconButton_1.default, {style: {
            top: 0,
            right: 0,
            padding: 0,
            height: "36px",
            width: "36px",
            position: "absolute",
            zIndex: 2,
        }, onTouchTap: explorer.handleDialogClose}, React.createElement(FontIcon_1.default, {className: "material-icons", style: { cursor: "pointer" }}, "close")), React.createElement("p", null, "In the explorer charts, Viewpoints include: "), React.createElement("dl", null, React.createElement("dt", null, React.createElement("strong", null, "Functional")), React.createElement("dd", null, "combines City of Toronto Agencies and Divisions into groups according to the nature of the services delivered (this is the default ) "), React.createElement("dt", null, React.createElement("strong", null, "Structural")), React.createElement("dd", null, "more traditional: separates Agencies from Divisions; groupings are closer to those found" + ' ' + "in City annual Budget Summaries")), React.createElement("p", null, "Facets are the main datasets available: Expenditures, Revenues, and Staffing Positions (Full Time Equivalents) "), React.createElement("p", null, "This prototype uses data from the City Council Approved Operating Budget Summary 2015 from the City of Toronto's open data portal"), React.createElement("p", null, "Click or tap on any column in the \"By Programs\" charts to drill-down. Other charts do not" + ' ' + "currently support drill-down."));
        let drilldownsegments = () => {
            let budgetbranches = explorer.state.budgetBranches;
            let segments = budgetbranches.map((budgetBranch, branchIndex) => {
                let actionprops = {
                    addNodeDeclaration: this.props.addNodeDeclaration,
                    removeNodeDeclaration: this.props.removeNodeDeclaration,
                    changeViewpoint: this.props.changeViewpoint,
                    changeFacet: this.props.changeFacet,
                };
                return React.createElement(Card_1.Card, {initiallyExpanded: true, key: branchIndex}, React.createElement(Card_1.CardTitle, {actAsExpander: true, showExpandableButton: true}, "Explorer Branch"), React.createElement(Card_1.CardText, {expandable: true}, React.createElement(explorerbranch_1.default, {budgetBranch: budgetBranch, displaycallbacks: {
                    workingStatus: explorer.workingStatus,
                    updateChartSelections: explorer.updateChartSelections(branchIndex),
                }, actions: actionprops, controlData: explorer.props.controlData})));
            });
            return segments;
        };
        let branches = drilldownsegments();
        return React.createElement("div", null, React.createElement(Card_1.Card, {initiallyExpanded: false}, React.createElement(Card_1.CardTitle, {actAsExpander: true, showExpandableButton: true}, "Budget Explorer"), React.createElement(Card_1.CardText, {expandable: true}, "If you're new here, ", React.createElement("a", {href: "javascript:void(0)", onTouchTap: explorer.handleDialogOpen}, "read the help text"), " first.", React.createElement(IconButton_1.default, {tooltip: "help", tooltipPosition: "top-center", onTouchTap: explorer.handleDialogOpen}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "help_outline")))), dialogbox, branches);
    }
}
;
let mapStateToProps = state => ({
    controlData: reducers_1.getExplorerControlData(state),
});
Explorer = react_redux_1.connect(mapStateToProps, {
    showWaitingMessage: Actions.showWaitingMessage,
    hideWaitingMessage: Actions.hideWaitingMessage,
    addBranchDeclaration: ExplorerActions.addBranchDeclaration,
    removeBranchDeclaration: ExplorerActions.removeBranchDeclaration,
    addNodeDeclaration: ExplorerActions.addNodeDeclaration,
    removeNodeDeclaration: ExplorerActions.removeNodeDeclaration,
    changeViewpoint: ExplorerActions.changeViewpoint,
    changeFacet: ExplorerActions.changeFacet,
})(Explorer);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Explorer;
