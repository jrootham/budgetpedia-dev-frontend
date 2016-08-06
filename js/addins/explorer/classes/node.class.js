"use strict";
const constants_1 = require('../../constants');
const cell_class_1 = require('./cell.class');
class BudgetNode {
    constructor(parms, uid, node, parentNode = null) {
        this.new = true;
        this.updated = false;
        this.newCells = null;
        this.parentData = null;
        this.update = (facet, nodeData, parentDataNode = null) => {
            this._nodeData = nodeData;
            this.facetName = facet;
            if (this.parentData && parentDataNode) {
                this.parentData.nodeData = parentDataNode;
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
        this._updateCell = (cell, cellIndex) => {
            let budgetNode = this;
            let { viewpointConfigPack, nodeData, timeSpecs, parentData, nodeIndex } = budgetNode;
            let nodeDataPack = {
                nodeData: nodeData,
                timeSpecs: timeSpecs,
                parentData: parentData,
            };
            cell.viewpointConfigPack = viewpointConfigPack;
            cell.nodeDataPack = nodeDataPack;
            cell.facetName = budgetNode.branchSettings.facet,
                budgetNode._setCellChartParms(cell, cellIndex);
            budgetNode._setCellTitle(cell);
        };
        this._setCellTitle = (budgetCell) => {
            let portaltitles = budgetCell.viewpointConfigPack.datasetConfig.Titles;
            let chartblocktitle = null;
            if ((budgetCell.nodeDataseriesName == 'Categories')) {
                chartblocktitle = portaltitles.Categories;
            }
            else {
                chartblocktitle = portaltitles.Baseline;
            }
            budgetCell.cellTitle = "By " + chartblocktitle;
        };
        this._setCellChartParms = (cell, cellIndex) => {
            let budgetNode = this;
            let selectfn = this.onChartComponentSelection;
            let fcurrent = selectfn(budgetNode.nodeIndex)(cellIndex);
            cell.selectionCallback = fcurrent;
            cell.setChartParms();
        };
        let portalcharts = parms.datasetSpecs;
        this.viewpointName = parms.viewpointName;
        this.facetName = parms.facetName;
        this.dataPath = parms.dataPath;
        this.nodeIndex = parms.nodeIndex;
        this.timeSpecs = parms.timeSpecs;
        this._nodeData = node;
        this.uid = uid;
        this.datasetSpecs = parms.datasetSpecs;
        if (parms.parentData)
            this.parentData = parms.parentData;
        if (parentNode)
            this.parentData.nodeData = parentNode;
    }
    get nodeData() {
        return this._nodeData;
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
            this._updateCell(cell, cellIndex);
            cells.push(cell);
        }
        return cells;
    }
    resetCells() {
        let budgetNode = this;
        let datasetName = constants_1.FacetNameToDatasetName[budgetNode.facetName];
        let chartSpecs = budgetNode.datasetSpecs[datasetName];
        let cells = budgetNode.allCells;
        for (let cellIndex in cells) {
            let cell = cells[cellIndex];
            cell.nodeDataseriesName = chartSpecs[cellIndex].Type;
            budgetNode._updateCell(cell, cellIndex);
        }
        return cells;
    }
    get cellList() {
        return [...this.getProps().declarationData.nodesById[this.uid].cellList];
    }
    getAvailableCells() {
        let cells = [...this.state.nodeCells];
        let availablCells = [];
        if (!this.nodeData)
            return availablCells;
        for (let cell of cells) {
            let budgetNode = this;
            if (!this.nodeData[cell.nodeDataseriesName]) {
                continue;
            }
            availablCells.push(cell);
        }
        return availablCells;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BudgetNode;
