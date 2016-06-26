// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// updatechartselections.tsx

import BudgetNode from '../../../local/budgetnode'

// update the visual cue for selection that led to user array of graphs
let updateChartSelections = (chartmatrixrow) => {
    let node: BudgetNode = null
    for (node of chartmatrixrow) {
        for (let chartindex in node.cells ) {
            let chart = node.cells[chartindex].chart
            if (chart) {
                let selection = node.cells[chartindex].chartselection
                chart.setSelection(selection)
            }
        }
    }
}

export { updateChartSelections }