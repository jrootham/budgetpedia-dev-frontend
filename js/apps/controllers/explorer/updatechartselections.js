"use strict";
let updateChartSelections = (chartmatrixrow) => {
    let node = null;
    for (node of chartmatrixrow) {
        for (let chartindex in node.cells) {
            let chart = node.cells[chartindex].chart;
            if (chart) {
                let selection = node.cells[chartindex].chartselection;
                chart.setSelection(selection);
            }
        }
    }
};
exports.updateChartSelections = updateChartSelections;
