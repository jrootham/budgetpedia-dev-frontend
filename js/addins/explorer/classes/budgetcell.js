"use strict";
const constants_1 = require('../../constants');
class BudgetCell {
    constructor(specs) {
        let { nodeDatasetName, chartCode, chartSelection, uid } = specs;
        this.nodeDatasetName = nodeDatasetName;
        this.chartCode = chartCode;
        this.chartSelection = chartSelection;
        this.uid = uid;
    }
    get googleChartType() {
        return constants_1.ChartCodeToGoogleChartType[this.chartCode];
    }
    get chart() {
        return this.chartComponent.chart;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BudgetCell;
