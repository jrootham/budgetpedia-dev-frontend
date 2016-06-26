"use strict";
const constants_1 = require('../apps/constants');
class BudgetNode {
    constructor(parms) {
        this.setCells = (portalcharts, defaultChartType) => {
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
        this._cells = [];
        this.parentData = null;
        this.reset = (dataNode, portalCharts, defaultChartType, facet) => {
            this._dataNode = dataNode;
            this.facetName = facet;
            this.setCells(portalCharts, defaultChartType);
        };
        let portalcharts = parms.portalCharts;
        this.setCells(portalcharts, parms.defaultChartType);
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
