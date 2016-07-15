// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// updatechartselections.tsx

import BudgetNode from '../classes/budgetnode'

// update the visual cue for selection that led to user array of graphs
let updateBranchChartSelections = (branchNodes) => {
    // console.log('in updateBranchChartSelections', branchNodes)
    let node: BudgetNode = null
    for (node of branchNodes) {
        for (let chartindex in node.cells ) {
            let budgetCell = node.cells[chartindex]
            let chart = budgetCell.chart
            // console.log('processing node', node)
            if (chart) {
                // console.log('updating chart selections', node, chartindex)
                let selection = budgetCell.chartselection
                chart.setSelection(selection)
            }
        }
    }
}

export { updateBranchChartSelections }