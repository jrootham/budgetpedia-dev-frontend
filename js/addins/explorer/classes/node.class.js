"use strict";
const constants_1 = require('../constants');
const cell_class_1 = require('./cell.class');
class BudgetNode {
    constructor(parms, uid, node, parentBudgetNode = null) {
        this.new = true;
        this.updated = false;
        this.newCells = null;
        this.parentBudgetNode = null;
        this.updateAspect = (aspect, treeNodeData) => {
            this.aspectName = aspect;
            this.updateDataNode(treeNodeData);
        };
        this.updateDataNode = (treeNodeData) => {
            this._nodeData = treeNodeData;
            this.updated = true;
        };
        this.getCellDeclarationParms = () => {
            let parmsList = [];
            let datasetName = constants_1.AspectNameToDatasetName[this.aspectName];
            let chartSpecs = this.viewpointConfigPack.datasetConfig.Dataseries;
            let node = this.treeNodeData;
            for (let chartSpec of chartSpecs) {
                let cellDeclaration = Object.assign({}, this.props.declarationData.defaults.cell);
                if (node[chartSpec.Type]) {
                    cellDeclaration.nodeDataseriesName = chartSpec.Type;
                    parmsList.push(cellDeclaration);
                }
            }
            return parmsList;
        };
        this._updateCell = (cell, cellIndex) => {
            let budgetNode = this;
            let { viewpointConfigPack, treeNodeData, yearSpecs, yearSelections, parentBudgetNode, nodeIndex } = budgetNode;
            let nodeDataPack = {
                treeNodeData: treeNodeData,
                yearSpecs: yearSpecs,
                yearSelections: yearSelections,
                parentBudgetNode: parentBudgetNode,
                budgetNode: budgetNode,
            };
            cell.viewpointConfigPack = viewpointConfigPack;
            cell.nodeDataPack = nodeDataPack;
            cell.aspectName = budgetNode.branchSettings.aspect,
                budgetNode._setCellSelectionCallback(cell, cellIndex);
            budgetNode._setCellTitle(cell);
        };
        this._setCellTitle = (budgetCell) => {
            let portaltitles = budgetCell.viewpointConfigPack.datasetConfig.CellTitles;
            let chartblocktitle = null;
            if ((budgetCell.nodeDataseriesName == 'CommonDimension')) {
                chartblocktitle = portaltitles.CommonDimension;
            }
            else {
                chartblocktitle = portaltitles.Components;
            }
            budgetCell.cellTitle = chartblocktitle;
        };
        this._setCellSelectionCallback = (cell, cellIndex) => {
            let budgetNode = this;
            let selectfn = this.onChartComponentSelection;
            let fcurrent = selectfn(budgetNode.nodeIndex)(cellIndex);
            cell.selectionCallback = fcurrent;
        };
        this.viewpointName = parms.viewpointName;
        this.aspectName = parms.aspectName;
        this.dataPath = parms.dataPath;
        this.nodeIndex = parms.nodeIndex;
        this.yearSpecs = parms.yearSpecs;
        this.yearSelections = parms.yearSelections;
        this._nodeData = node;
        this.uid = uid;
        if (parentBudgetNode)
            this.parentBudgetNode = parentBudgetNode;
    }
    get treeNodeData() {
        return this._nodeData;
    }
    get state() {
        return this.getState();
    }
    get props() {
        return this.getProps();
    }
    get cells() {
        return [...this.state.nodeCells];
    }
    setCells(cellDeclarations) {
        let cells = [];
        for (let cellIndex in cellDeclarations) {
            let cellDeclaration = cellDeclarations[cellIndex];
            let { nodeDataseriesName, celluid } = cellDeclaration;
            let settings = cellDeclaration.chartConfigs[cellDeclaration.yearScope];
            let { explorerChartCode, chartSelection } = settings;
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
        let cells = budgetNode.cells;
        for (let cellIndex in cells) {
            let cell = cells[cellIndex];
            budgetNode._updateCell(cell, cellIndex);
            cell.setChartParms();
        }
        this.newCells = cells;
        this.updated = true;
    }
    switchYearSelections(yearSelections) {
        let budgetNode = this;
        this.yearSelections = yearSelections;
        let cells = budgetNode.cells;
        for (let cellIndex in cells) {
            let cell = cells[cellIndex];
            budgetNode._updateCell(cell, cellIndex);
            cell.setChartParms();
        }
        this.newCells = cells;
        this.updated = true;
    }
    get cellDeclarationList() {
        let list = this.getProps().declarationData.nodesById[this.uid].cellList;
        if (list == null)
            return list;
        else
            return [...list];
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BudgetNode;
