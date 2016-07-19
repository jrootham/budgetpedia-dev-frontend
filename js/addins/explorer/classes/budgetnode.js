"use strict";
const getchartparms_1 = require('./modules/getchartparms');
const budgetcell_1 = require('./budgetcell');
class BudgetNode {
    constructor(parms, uid, node, parentNode = null) {
        this.parentData = null;
        this.update = (dataNode, facet) => {
            this._dataNode = dataNode;
            this.facetName = facet;
        };
        this._cells = [];
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
    getChartParms(props, selectionCallbacks) {
        let sourceProps = {};
        let node = this;
        Object.assign(sourceProps, props, { budgetNode: node });
        return getchartparms_1.default(sourceProps, selectionCallbacks);
    }
    get dataNode() {
        return this._dataNode;
    }
    get cells() {
        return this.getAvailableCells();
    }
    setCells(cellSpecs) {
        this._cells = [];
        let cellSpec;
        for (let cellSpec of cellSpecs) {
            let { chartSelection, chartCode, nodeDatasetName, uid } = cellSpec;
            let cell = new budgetcell_1.default({
                nodeDatasetName: nodeDatasetName,
                chartCode: chartCode,
                chartSelection: chartSelection,
                uid: uid,
            });
            this._cells.push(cell);
        }
    }
    getAvailableCells() {
        let availablCells = [];
        if (!this.dataNode)
            return availablCells;
        for (let cell of this._cells) {
            if (cell.nodeDatasetName == 'Components' && !this.dataNode.Components) {
                continue;
            }
            if (cell.nodeDatasetName == 'Categories' && !this.dataNode.Categories) {
                continue;
            }
            availablCells.push(cell);
        }
        return availablCells;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BudgetNode;
