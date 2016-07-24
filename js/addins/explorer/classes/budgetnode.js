"use strict";
const constants_1 = require('../../constants');
const budgetcell_1 = require('./budgetcell');
const onchartcomponentselection_1 = require('../modules/onchartcomponentselection');
class BudgetNode {
    constructor(parms, uid, node, parentNode = null) {
        this.parentData = null;
        this.update = (dataNode, facet) => {
            this._dataNode = dataNode;
            this.facetName = facet;
        };
        this.getCellDeclarationParms = () => {
            let parmsList = [];
            let chartSpecs = this.portalCharts[this.facetName];
            for (let chartSpec of chartSpecs) {
                let cellDeclaration = Object.assign({}, this.props.declarationData.defaults.cell);
                cellDeclaration.nodeDatasetName = chartSpec.Type;
                parmsList.push(cellDeclaration);
            }
            return parmsList;
        };
        this._assignCellChartParms = cell => {
            let budgetNode = this;
            let chartParmsObj = {};
            let cellindex;
            let branchuid = this.uid;
            let selectfn = onchartcomponentselection_1.onChartComponentSelection(this);
            let budgetCell = cell;
            let props = {
                branchsettings: this.getProps().branchSettings,
            };
            let fcurrent = selectfn(this.nodeIndex)(cellindex);
            chartParmsObj = cell.getChartParms({ current: fcurrent, next: selectfn });
            console.log('chartParmsObj', chartParmsObj);
            if (!chartParmsObj.isError) {
                budgetCell.chartParms = chartParmsObj.chartParms;
                budgetCell.chartCode =
                    constants_1.GoogleChartTypeToChartCode[budgetCell.chartParms.chartType];
            }
        };
        let portalcharts = parms.portalCharts;
        this.viewpointName = parms.viewpointName;
        this.facetName = parms.facetName;
        this.dataPath = parms.dataPath;
        this.nodeIndex = parms.nodeIndex;
        this.timeSpecs = parms.timeSpecs;
        this._dataNode = node;
        this.uid = uid;
        this.portalCharts = parms.portalCharts;
        if (parms.parentData)
            this.parentData = parms.parentData;
        if (parentNode)
            this.parentData.dataNode = parentNode;
    }
    getChartParms(props, selectionCallbacks, cell) {
        console.log('calling cell version of getChartParms');
        return cell.getChartParms(selectionCallbacks);
    }
    get dataNode() {
        return this._dataNode;
    }
    get state() {
        return this.getState();
    }
    get props() {
        return this.getProps();
    }
    get cells() {
        return this.getAvailableCells();
    }
    get allCells() {
        return [...this.state.nodeCells];
    }
    setCells(cellDeclarations) {
        let cells = [];
        for (let cellIndex in cellDeclarations) {
            let cellDeclaration = cellDeclarations[cellIndex];
            let { chartSelection, chartCode, nodeDatasetName, uid } = cellDeclaration;
            let cell = new budgetcell_1.default({
                nodeDatasetName: nodeDatasetName,
                chartCode: chartCode,
                chartSelection: chartSelection,
                uid: uid,
            });
            cell.cellIndex = parseInt(cellIndex);
            let configData = this.getProps().configData;
            cell.configData = configData;
            let { dataNode, timeSpecs, parentData, nodeIndex } = this;
            let nodeData = {
                dataNode: dataNode,
                timeSpecs: timeSpecs,
                parentData: parentData,
                nodeIndex: nodeIndex,
            };
            cell.nodeData = nodeData;
            cell.branchSettings = this.getProps().branchSettings,
                this._assignCellChartParms(cell);
            cells.push(cell);
        }
        return cells;
    }
    get cellList() {
        return [...this.getProps().declarationData.nodesById[this.uid].cellList];
    }
    getAvailableCells() {
        let cells = [...this.state.nodeCells];
        let availablCells = [];
        if (!this.dataNode)
            return availablCells;
        for (let cell of cells) {
            if (!this.dataNode[cell.nodeDatasetName]) {
                continue;
            }
            availablCells.push(cell);
        }
        return availablCells;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BudgetNode;
