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
let uuid = require('node-uuid');
let Explorer = class extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dialogopen: false,
        };
        this.budgetBranches = [];
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
                }, 250);
            }
        };
        this.updateIndexChartSelections = branchIndex => {
            let budgetBranch = this.budgetBranches[branchIndex];
            updatebranchchartselections_1.updateBranchChartSelections(budgetBranch.nodes);
        };
        this.updateChartSelections = branchIndex => () => this.updateIndexChartSelections(branchIndex);
    }
    render() {
        let explorer = this;
        let dialogbox = React.createElement(Dialog_1.default, {title: "Budget Explorer Help", modal: false, open: this.state.dialogopen, onRequestClose: this.handleDialogClose, autoScrollBodyContent: true}, React.createElement(IconButton_1.default, {style: {
            top: 0,
            right: 0,
            padding: 0,
            height: "36px",
            width: "36px",
            position: "absolute",
            zIndex: 2,
        }, onTouchTap: this.handleDialogClose}, React.createElement(FontIcon_1.default, {className: "material-icons", style: { cursor: "pointer" }}, "close")), React.createElement("p", null, "In the explorer charts, Viewpoints include: "), React.createElement("dl", null, React.createElement("dt", null, React.createElement("strong", null, "Functional")), React.createElement("dd", null, "combines City of Toronto Agencies and Divisions into groups according to the nature of the services delivered (this is the default ) "), React.createElement("dt", null, React.createElement("strong", null, "Structural")), React.createElement("dd", null, "more traditional: separates Agencies from Divisions; groupings are closer to those found" + ' ' + "in City annual Budget Summaries")), React.createElement("p", null, "Facets are the main datasets available: Expenditures, Revenues, and Staffing Positions (Full Time Equivalents) "), React.createElement("p", null, "This prototype uses data from the City Council Approved Operating Budget Summary 2015 from the City of Toronto's open data portal"), React.createElement("p", null, "Click or tap on any column in the \"By Programs\" charts to drill-down. Other charts do not" + ' ' + "currently support drill-down."));
        let drilldownsegments = () => {
            let budgetbranches = explorer.budgetBranches;
            let segments = budgetbranches.map((budgetBranch, branchIndex) => {
                return React.createElement(Card_1.Card, {initiallyExpanded: true, key: branchIndex}, React.createElement(Card_1.CardTitle, {actAsExpander: true, showExpandableButton: true}, "Explorer Branch"), React.createElement(Card_1.CardText, {expandable: true}, React.createElement(explorerbranch_1.default, {callbackid: branchIndex, budgetBranch: budgetBranch, displaycallbacks: {
                    workingStatus: explorer.workingStatus,
                    updateChartSelections: explorer.updateChartSelections,
                }})));
            });
            return segments;
        };
        let segments = drilldownsegments();
        return React.createElement("div", null, React.createElement(Card_1.Card, {initiallyExpanded: true}, React.createElement(Card_1.CardTitle, {actAsExpander: true, showExpandableButton: true}, "Budget Explorer"), React.createElement(Card_1.CardText, {expandable: true}, "If you're new here, ", React.createElement("a", {href: "javascript:void(0)", onTouchTap: this.handleDialogOpen}, "read the help text"), " first.", React.createElement(IconButton_1.default, {tooltip: "help", tooltipPosition: "top-center", onTouchTap: this.handleDialogOpen}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "help_outline")))), dialogbox, segments);
    }
}
;
let mapStateToProps = state => {
    return {
        settings: state.explorer,
    };
};
Explorer = react_redux_1.connect(mapStateToProps, {
    showWaitingMessage: Actions.showWaitingMessage,
    hideWaitingMessage: Actions.hideWaitingMessage,
})(Explorer);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Explorer;
