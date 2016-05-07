"use strict";
let updateChartSelections = (chartmatrix, matrixrow) => {
    for (let config of chartmatrix[matrixrow]) {
        let chart = config.chart;
        let selection = config.chartselection;
        if (chart) {
            chart.setSelection(selection);
        }
    }
};
exports.updateChartSelections = updateChartSelections;
