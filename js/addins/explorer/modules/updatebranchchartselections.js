"use strict";
let updateBranchChartSelections = (branchNodes) => {
    let node = null;
    for (node of branchNodes) {
        for (let chartindex in node.cells) {
            let budgetCell = node.cells[chartindex];
            let chartSelection = budgetCell.chartSelection;
            if (chartSelection) {
                if (budgetCell.chart) {
                    budgetCell.chart.setSelection(chartSelection);
                }
            }
        }
    }
};
exports.updateBranchChartSelections = updateBranchChartSelections;
