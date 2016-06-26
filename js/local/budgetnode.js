"use strict";
const constants_1 = require('../apps/constants');
class BudgetNode {
    constructor(parms) {
        this.cells = [];
        let portalcharts = parms.portalCharts;
        console.log('portalcharts', portalcharts);
        let defaultChartCode = constants_1.ChartTypeCodes[parms.chartType];
        for (let type in portalcharts) {
            console.log('type', type);
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
