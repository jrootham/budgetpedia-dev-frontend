// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// updatechartselections.tsx

// update the visual cue for selection that led to user array of graphs
let updateChartSelections = (chartmatrix, matrixrow) => {
    for (let config of chartmatrix[matrixrow]) {
        let chart = config.chart
        let selection = config.chartselection
        if (chart) {
            chart.setSelection(selection)
        }
    }
}

export { updateChartSelections }