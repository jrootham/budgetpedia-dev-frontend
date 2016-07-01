"use strict";
const constants_1 = require('../constants');
const getchartparms_1 = require('./modules/getchartparms');
class BudgetNode {
    constructor(parms) {
        this.getChartParms = (props, selectionCallbacks) => {
            let sourceProps = {};
            let node = this;
            Object.assign(sourceProps, props, { budgetNode: node });
            return getchartparms_1.default(sourceProps, selectionCallbacks);
        };
        this.setCells = (portalcharts, defaultChartType) => {
            this._cells = [];
            let defaultChartCode = constants_1.ChartTypeCodes[defaultChartType];
            for (let type in portalcharts) {
                let cell = {
                    googleChartType: defaultChartType,
                    chartCode: defaultChartCode,
                    nodeDataPropertyName: portalcharts[type].Type
                };
                this._cells.push(cell);
            }
        };
        this.getAvailableCells = () => {
            let availablCells = [];
            if (!this.dataNode)
                return availablCells;
            for (let cell of this._cells) {
                if (cell.nodeDataPropertyName == 'Components' && !this.dataNode.Components) {
                    continue;
                }
                if (cell.nodeDataPropertyName == 'Categories' && !this.dataNode.Categories) {
                    continue;
                }
                availablCells.push(cell);
            }
            return availablCells;
        };
        this.parentData = null;
        this.update = (dataNode, facet) => {
            this._dataNode = dataNode;
            this.facetName = facet;
        };
        let portalcharts = parms.portalCharts;
        this.setCells(portalcharts[parms.facetName], parms.defaultChartType);
        this.viewpointName = parms.viewpointName;
        this.facetName = parms.facetName;
        this.dataPath = parms.dataPath;
        this.matrixLocation = parms.matrixLocation;
        this.timeSpecs = parms.timeSpecs;
        this._dataNode = parms.dataNode;
        if (parms.parentData)
            this.parentData = parms.parentData;
    }
    get dataNode() {
        return this._dataNode;
    }
    get cells() {
        return this.getAvailableCells();
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BudgetNode;
