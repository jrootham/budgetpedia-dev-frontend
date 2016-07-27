'use strict';
const React = require('react');
var { Component } = React;
const Tabs_1 = require('material-ui/Tabs');
const explorercell_1 = require('./explorercell');
const actions_1 = require('../actions');
class ExporerNode extends Component {
    constructor(...args) {
        super(...args);
        this.state = {
            nodeCells: [],
        };
        this.getState = () => this.state;
        this.getProps = () => this.props;
        this._controlGlobalStateChange = () => {
            let previousControlData = this._previousControlData;
            let currentControlData = this.props.declarationData;
            let { lastAction } = currentControlData;
            let returnvalue = true;
            if (!actions_1.cellTypes[lastAction]) {
                return false;
            }
            if (previousControlData && (currentControlData.generation == previousControlData.generation)) {
                return false;
            }
            switch (lastAction) {
                case actions_1.cellTypes.UPDATE_CELL_SELECTION: {
                    this._processUpdateCellSelection();
                    break;
                }
                case actions_1.cellTypes.CHANGE_FACET: {
                    break;
                }
                default:
                    returnvalue = false;
            }
            this._previousControlData = currentControlData;
            return returnvalue;
        };
        this._processUpdateCellSelection = () => {
            let nodeCells = [...this.state.nodeCells];
            nodeCells.map((budgetCell) => {
                budgetCell.chartSelection = this.props.declarationData.cellsById[budgetCell.uid].chartSelection;
            });
            this.setState({
                nodeCells: nodeCells,
            });
        };
        this._processChangeFacet = () => {
            let { budgetNode } = this.props;
            console.log('processing node change facet');
        };
        this.harmonizecount = null;
        this._harmonizeCells = () => {
            let returnvalue = false;
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
                returnvalue = true;
                this.setState({
                    nodeCells: newcells
                });
            }
            return returnvalue;
        };
        this.onChangeTab = (tabref) => {
            this.props.globalStateActions.changeTab(this.props.budgetNode.uid, tabref);
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
                return React.createElement(Tabs_1.Tab, {style: { fontSize: "12px" }, label: cellTitle, value: cellIndex, key: cellIndex}, React.createElement(explorercell_1.default, {declarationData: this.props.declarationData, callbackid: cellIndex, budgetCell: budgetCell}));
            });
            return cellTabs;
        };
        this.getTabObject = (chartTabs) => {
            let tabSelection = this.props.declarationData.nodesById[this.props.budgetNode.uid].cellIndex;
            if (chartTabs.length == 0) {
                return React.createElement("div", {style: {
                    height: "400px",
                    textAlign: "center",
                    verticalAlign: "middle",
                    lineHeight: "400px"
                }}, "No data...");
            }
            return (React.createElement(Tabs_1.Tabs, {value: tabSelection, onChange: (tabref) => {
                this.onChangeTab(tabref);
            }}, chartTabs));
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
            this._harmonizeCells();
        }
    }
    componentWillReceiveProps(nextProps) {
        let { budgetNode, declarationData } = nextProps;
        if (budgetNode.updated) {
            this.setState({
                nodeCells: budgetNode.newCells
            });
            budgetNode.newCells = null;
            budgetNode.updated = false;
        }
        else {
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
    }
    shouldComponentUpdate(nextProps, nextState) {
        let { nodeuid, new: newval } = window.nodeUpdateControl;
        let noderetval = nodeuid ? (nodeuid == this.props.budgetNode.uid) : true;
        let newretval = newval ? (this.props.budgetNode.new == true) : true;
        let retval = noderetval || newretval;
        return retval;
    }
    componentDidUpdate() {
        if (!this._harmonizeCells()) {
            this._controlGlobalStateChange();
        }
        setTimeout(() => {
            this.props.budgetNode.new = false;
        });
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
exports.ExporerNode = ExporerNode;
