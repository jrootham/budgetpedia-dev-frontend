"use strict";
let updateChartSelections = (chartmatrix, matrixrow) => {
    let node = null;
    for (node of chartmatrix[matrixrow]) {
        for (let chartindex in node.charts) {
            let chart = node.charts[chartindex].chart;
            if (chart) {
                let selection = node.charts[chartindex].chartselection;
                chart.setSelection(selection);
            }
        }
    }
};
exports.updateChartSelections = updateChartSelections;
