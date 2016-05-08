"use strict";
let updateChartSelections = (chartmatrix, matrixrow) => {
    let node = null;
    for (node of chartmatrix[matrixrow]) {
        let chart = node.charts[0].chart;
        let selection = node.charts[0].chartselection;
        if (chart) {
            chart.setSelection(selection);
        }
    }
};
exports.updateChartSelections = updateChartSelections;
