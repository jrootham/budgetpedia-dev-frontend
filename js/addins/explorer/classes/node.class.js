"use strict";
const constants_1 = require('../../constants');
const cell_class_1 = require('./cell.class');
class BudgetNode {
    constructor(parms, uid, node, parentNode = null) {
        this.new = true;
        this.updated = false;
        this.newCells = null;
        this.parentData = null;
        this.update = (facet, dataNode, parentDataNode = null) => {
            this._dataNode = dataNode;
            this.facetName = facet;
            if (this.parentData && parentDataNode) {
                this.parentData.dataNode = parentDataNode;
            }
            this.updated = true;
        };
        this.getCellDeclarationParms = () => {
            let parmsList = [];
            let datasetName = constants_1.FacetNameToDatasetName[this.facetName];
            let chartSpecs = this.datasetSpecs[datasetName];
            for (let chartSpec of chartSpecs) {
                let cellDeclaration = Object.assign({}, this.props.declarationData.defaults.cell);
                cellDeclaration.nodeDataseriesName = chartSpec.Type;
                parmsList.push(cellDeclaration);
            }
            return parmsList;
        };
        this._updateCell = (cell) => {
            let viewpointConfigData = this.viewpointConfigData;
            let { dataNode, timeSpecs, parentData, nodeIndex } = this;
            let nodeData = {
                dataNode: dataNode,
                timeSpecs: timeSpecs,
                parentData: parentData,
                nodeIndex: nodeIndex,
            };
            cell.viewpointConfigData = viewpointConfigData;
            cell.nodeData = nodeData;
            cell.branchSettings = this.branchSettings,
                this._assignCellChartParms(cell);
            this._setCellTitle(cell);
        };
        this._setCellTitle = (budgetCell) => {
            let portaltitles = budgetCell.viewpointConfigData.datasetConfig.Titles;
            let chartblocktitle = null;
            if ((budgetCell.nodeDataseriesName == 'Categories')) {
                chartblocktitle = portaltitles.Categories;
            }
            else {
                chartblocktitle = portaltitles.Baseline;
            }
            budgetCell.cellTitle = "By " + chartblocktitle;
        };
        this._assignCellChartParms = (cell) => {
            let budgetNode = this;
            let selectfn = this.onChartComponentSelection;
            let fcurrent = selectfn(budgetNode.nodeIndex)(cell.cellIndex);
            cell.chartCallbacks = { selectionCallback: fcurrent };
            let chartParmsObj = cell.getChartParms();
            if (!chartParmsObj.isError) {
                cell.chartParms = chartParmsObj.chartParms;
            }
        };
        let portalcharts = parms.datasetSpecs;
        this.viewpointName = parms.viewpointName;
        this.facetName = parms.facetName;
        this.dataPath = parms.dataPath;
        this.nodeIndex = parms.nodeIndex;
        this.timeSpecs = parms.timeSpecs;
        this._dataNode = node;
        this.uid = uid;
        this.datasetSpecs = parms.datasetSpecs;
        if (parms.parentData)
            this.parentData = parms.parentData;
        if (parentNode)
            this.parentData.dataNode = parentNode;
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
            let { chartSelection, explorerChartCode, nodeDataseriesName, celluid } = cellDeclaration;
            let cell = new cell_class_1.default({
                nodeDataseriesName: nodeDataseriesName,
                explorerChartCode: explorerChartCode,
                chartSelection: chartSelection,
                uid: celluid,
            });
            cell.cellIndex = parseInt(cellIndex);
            this._updateCell(cell);
            cells.push(cell);
        }
        return cells;
    }
    resetCells() {
        let datasetName = constants_1.FacetNameToDatasetName[this.facetName];
        let chartSpecs = this.datasetSpecs[datasetName];
        let cells = this.allCells;
        for (let cellIndex in cells) {
            let cell = cells[cellIndex];
            cell.nodeDataseriesName = chartSpecs[cellIndex].Type;
            this._updateCell(cell);
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
            let budgetNode = this;
            if (!this.dataNode[cell.nodeDataseriesName]) {
                continue;
            }
            availablCells.push(cell);
        }
        return availablCells;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BudgetNode;
