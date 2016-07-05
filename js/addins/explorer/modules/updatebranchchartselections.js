"use strict";
let updateBranchChartSelections = (chartmatrixrow) => {
    let node = null;
    for (node of chartmatrixrow) {
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
