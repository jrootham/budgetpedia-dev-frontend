"use strict";
const constants_1 = require('../apps/constants');
class BudgetNode {
    constructor(parms) {
        this.cells = [];
        this.dataNode = null;
        this.parentData = null;
        let portalcharts = parms.portalCharts;
        let defaultChartCode = constants_1.ChartTypeCodes[parms.chartType];
        for (let type in portalcharts) {
            let cell = {
                googleChartType: parms.chartType,
                chartCode: defaultChartCode,
                nodeDataPropertyName: portalcharts[type].Type
            };
            this.cells.push(cell);
        }
        this.viewpointName = parms.viewpointName;
        this.facetName = parms.facetName;
        this.dataPath = parms.dataPath;
        this.matrixLocation = parms.matrixLocation;
        this.timeSpecs = parms.timeSpecs;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BudgetNode;
