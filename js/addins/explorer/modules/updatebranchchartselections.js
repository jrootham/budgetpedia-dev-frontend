"use strict";
let updateBranchChartSelections = (branchNodes) => {
    setTimeout(() => {
        console.log('setting selections');
        let node = null;
        for (node of branchNodes) {
            for (let chartindex in node.cells) {
                let budgetCell = node.cells[chartindex];
                let chartSelection = budgetCell.chartSelection;
                if (chartSelection) {
                    budgetCell.chart.setSelection(chartSelection);
                }
            }
        }
    }, 4000);
};
exports.updateBranchChartSelections = updateBranchChartSelections;
