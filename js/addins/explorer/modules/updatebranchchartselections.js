"use strict";
let updateBranchChartSelections = (branchNodes) => {
    let node = null;
    for (node of branchNodes) {
        for (let chartindex in node.cells) {
            let budgetCell = node.cells[chartindex];
            let chartselection = budgetCell.chartselection;
            if (chartselection) {
                budgetCell.chart.setSelection(chartselection);
            }
        }
    }
};
exports.updateBranchChartSelections = updateBranchChartSelections;
