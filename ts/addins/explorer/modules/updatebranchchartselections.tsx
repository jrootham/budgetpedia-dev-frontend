// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// updatechartselections.tsx

import BudgetNode from '../classes/budgetnode'
import BudgetCell from '../classes/budgetcell'

// update the visual cue for selection that led to user array of graphs
let updateBranchChartSelections = (branchNodes) => {
    // console.log('in updateBranchChartSelections', branchNodes)
    let node: BudgetNode = null
    for (node of branchNodes) {
        for (let chartindex in node.cells ) {
            let budgetCell:BudgetCell = node.cells[chartindex]
            let chartSelection = budgetCell.chartSelection
            // console.log('processing node', node)
            if (chartSelection) {
                // console.log('updating chart selections', node, chartindex)
                budgetCell.chart.setSelection(chartSelection)
            }
        }
    }
}

export { updateBranchChartSelections }