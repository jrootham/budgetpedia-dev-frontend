"use strict";
const constants_1 = require('../apps/constants');
class BudgetNode {
    constructor(parms) {
        this.getAvailableCells = () => {
            let availablCells = [];
            if (!this.dataNode)
                return availablCells;
            for (let cell of this.cells) {
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
        this.cells = [];
        this.parentData = null;
        let portalcharts = parms.portalCharts;
        let defaultChartCode = constants_1.ChartTypeCodes[parms.chartType];
        if (parms.cells) {
            this.cells = parms.cells;
        }
        else {
            for (let type in portalcharts) {
                let cell = {
                    googleChartType: parms.chartType,
                    chartCode: defaultChartCode,
                    nodeDataPropertyName: portalcharts[type].Type
                };
                this.cells.push(cell);
            }
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
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BudgetNode;
