// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// updatechartselections.tsx

import {
    BudgetNodeConfig
} from './interfaces'

// update the visual cue for selection that led to user array of graphs
let updateChartSelections = (chartmatrix, matrixrow) => {
    let node: BudgetNodeConfig = null
    for (node of chartmatrix[matrixrow]) {
        let chart = node.charts[0].chart
        let selection = node.charts[0].chartselection
        if (chart) {
            chart.setSelection(selection)
        }
    }
}

export { updateChartSelections }