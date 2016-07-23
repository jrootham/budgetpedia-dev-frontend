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
        let cellDeclaration;
        console.log('cellDeclarations');
        for (cellDeclaration of cellDeclarations) {
            let { chartSelection, chartCode, nodeDatasetName, uid } = cellDeclaration;
            let cell = new budgetcell_1.default({
                nodeDatasetName: nodeDatasetName,
                chartCode: chartCode,
                chartSelection: chartSelection,
                uid: uid,
            });
            console.log('cellDelcaration', cellDeclaration, cell);
            cells.push(cell);
        }
        console.log('cells for setState', cells);
        this.setState({
            nodeCells: cells
        });
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
