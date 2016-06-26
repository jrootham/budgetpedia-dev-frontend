"use strict";
const constants_1 = require('../apps/constants');
class BudgetNode {
    constructor(parms) {
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
        let portalcharts = parms.portalCharts;
        let defaultChartCode = constants_1.ChartTypeCodes[parms.chartType];
        for (let type in portalcharts) {
            let cell = {
                googleChartType: parms.chartType,
                chartCode: defaultChartCode,
                nodeDataPropertyName: portalcharts[type].Type
            };
            this._cells.push(cell);
        }
        this.viewpointName = parms.viewpointName;
        this.facetName = parms.facetName;
        this.dataPath = parms.dataPath;
        this.matrixLocation = parms.matrixLocation;
        this.timeSpecs = parms.timeSpecs;
        this.dataNode = parms.dataNode;
        if (parms.parentData)
            this.parentData = parms.parentData;
    }
    get cells() {
        return this.getAvailableCells();
    }
    set cells(value) {
        this._cells = value;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BudgetNode;
