"use strict";
class BudgetCell {
    constructor(specs) {
        let { nodeDatasetName, chartCode, chartSelection, uid } = specs;
        this.nodeDatasetName = nodeDatasetName;
        this.chartCode = chartCode;
        this.chartSelection = chartSelection;
        this.uid = uid;
    }
    get chart() { return this.chartComponent.chart; }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BudgetCell;
