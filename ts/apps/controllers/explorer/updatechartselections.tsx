// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// updatechartselections.tsx

import {
    MatrixNodeConfig
} from './interfaces'

// update the visual cue for selection that led to user array of graphs
let updateChartSelections = (chartmatrix, matrixrow) => {
    let node: MatrixNodeConfig = null
    for (node of chartmatrix[matrixrow]) {
        for (let chartindex in node.charts ) {
            let chart = node.charts[chartindex].chart
            if (chart) {
                let selection = node.charts[chartindex].chartselection
                chart.setSelection(selection)
            }
        }
    }
}

export { updateChartSelections }