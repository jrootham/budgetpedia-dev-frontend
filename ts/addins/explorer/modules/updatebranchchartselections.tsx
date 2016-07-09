// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// updatechartselections.tsx

import BudgetNode from '../classes/budgetnode'

// update the visual cue for selection that led to user array of graphs
let updateBranchChartSelections = (branchNodes) => {
    let node: BudgetNode = null
    for (node of branchNodes) {
        for (let chartindex in node.cells ) {
            let budgetCell = node.cells[chartindex]
            let chart = budgetCell.chart
            if (chart) {
                let selection = budgetCell.chartselection
                chart.setSelection(selection)
            }
        }
    }
}

export { updateBranchChartSelections }