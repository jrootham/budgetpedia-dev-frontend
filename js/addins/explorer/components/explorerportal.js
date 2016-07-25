'use strict';
const React = require('react');
var { Component } = React;
const Tabs_1 = require('material-ui/Tabs');
const explorerchart_1 = require('./explorerchart');
class ExplorerPortal extends Component {
    constructor(...args) {
        super(...args);
        this.state = {
            nodeCells: [],
        };
        this.getState = () => this.state;
        this.getProps = () => this.props;
        this.harmonizecount = null;
        this._harmomonizeCells = () => {
            let { budgetNode, declarationData } = this.props;
            let cells = budgetNode.allCells;
            let { cellList } = declarationData.nodesById[budgetNode.uid];
            if ((cells.length != cellList.length) && (this.harmonizecount == null)) {
                this.harmonizecount = cellList.length - cells.length;
                let cellParms = [];
                let { cellsById } = declarationData;
                for (let cellid of cellList) {
                    cellParms.push(cellsById[cellid]);
                }
                let newcells = budgetNode.setCells(cellParms);
                if (newcells.length == cellList.length) {
                    this.harmonizecount = null;
                }
                this.setState({
                    nodeCells: newcells
                });
            }
        };
        this.onChangeTab = () => {
            this.props.displayCallbacks.onChangePortalTab();
        };
        this._chartrefs = [];
        this.getChartTabs = () => {
            let { callbackid, budgetNode } = this.props;
            let budgetCells = budgetNode.cells;
            let portalSettings = budgetNode.portalConfig;
            let cellTabs = budgetCells.map((budgetCell, cellIndex) => {
                let expandable = ((budgetCells.length > 1) && (cellIndex == 0));
                budgetCell.expandable = expandable;
                let { cellCallbacks, cellTitle } = budgetCell;
                return React.createElement(Tabs_1.Tab, {style: { fontSize: "12px" }, label: cellTitle, value: cellIndex, key: cellIndex}, React.createElement(explorerchart_1.default, {budgetCell: budgetCell, callbackid: cellIndex}));
            });
            return cellTabs;
        };
        this.getTabObject = (chartTabs) => {
            if (chartTabs.length == 0) {
                return React.createElement("div", {style: {
                    height: "400px",
                    textAlign: "center",
                    verticalAlign: "middle",
                    lineHeight: "400px"
                }}, "No data...");
            }
            if (chartTabs.length == 1) {
                return (React.createElement(Tabs_1.Tabs, {value: 0, onChange: () => {
                    this.onChangeTab();
                }}, chartTabs));
            }
            else {
                return (React.createElement(Tabs_1.Tabs, {onChange: () => {
                    this.onChangeTab();
                }}, chartTabs));
            }
        };
    }
    componentWillMount() {
        let { budgetNode } = this.props;
        this._stateActions = this.props.globalStateActions;
        this._nodeDisplayCallbacks = this.props.displayCallbacks;
        budgetNode.getState = this.getState;
        budgetNode.getProps = this.getProps;
        budgetNode.setState = this.setState.bind(this);
        budgetNode.actions = this._stateActions;
        budgetNode.nodeCallbacks = this._nodeDisplayCallbacks;
    }
    componentDidMount() {
        let { budgetNode, declarationData } = this.props;
        let nodeDeclaration = declarationData.nodesById[budgetNode.uid];
        if (nodeDeclaration.cellList == null) {
            let cellDeclarationParms = budgetNode.getCellDeclarationParms();
            this._stateActions.addCellDeclarations(budgetNode.uid, cellDeclarationParms);
        }
        else {
            this._harmomonizeCells();
        }
    }
    componentWillReceiveProps(nextProps) {
        let { budgetNode, declarationData } = this.props;
        let cells = budgetNode.allCells;
        let { cellsById } = declarationData;
        let newCells = cells.filter(cell => {
            return !!cellsById[cell.uid];
        });
        if (newCells.length != cells.length) {
            this.setState({
                nodeCells: newCells
            });
        }
    }
    componentDidUpdate() {
        this._harmomonizeCells();
    }
    render() {
        let chartTabs = this.getChartTabs();
        let tabobject = this.getTabObject(chartTabs);
        let { portalConfig: portalSettings } = this.props.budgetNode;
        return React.createElement("div", {style: {
            position: "relative",
            display: "inline-block",
            padding: "10px",
            backgroundColor: "Beige",
            verticalAlign: "top",
            width: "400px",
        }}, React.createElement("div", {style: {
            position: "absolute",
            top: 0,
            left: "10px",
            padding: "3px 20px 3px 20px",
            borderRadius: "6px",
            border: "1px solid silver",
            fontSize: "12px",
            color: "lightgreen",
            fontWeight: "bold",
            display: "inline-block",
            backgroundColor: "#00bcd4",
        }}, portalSettings.portalName), tabobject);
    }
}
exports.ExplorerPortal = ExplorerPortal;
