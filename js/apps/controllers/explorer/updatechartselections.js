"use strict";
let updateChartSelections = (chartmatrixrow) => {
    let node = null;
    for (node of chartmatrixrow) {
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
