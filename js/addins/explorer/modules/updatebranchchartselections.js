"use strict";
let updateBranchChartSelections = (branchNodes) => {
    let node = null;
    for (node of branchNodes) {
        for (let chartindex in node.cells) {
            let budgetCell = node.cells[chartindex];
            let chart = budgetCell.chart;
            if (chart) {
                let selection = budgetCell.chartselection;
                chart.setSelection(selection);
            }
        }
    }
};
exports.updateBranchChartSelections = updateBranchChartSelections;
