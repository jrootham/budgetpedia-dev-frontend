// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// updatechartselections.tsx

import BudgetNode from '../classes/node.class'
import BudgetCell from '../classes/cell.class'

// update the visual cue for selection that led to user array of graphs
let updateBranchChartSelections = (branchNodes) => {
    // console.log('in updateBranchChartSelections', branchNodes)
    setTimeout(()=>{
        console.log('setting selections')
        let node: BudgetNode = null
        for (node of branchNodes) {
            for (let chartindex in node.cells ) {
                let budgetCell:BudgetCell = node.cells[chartindex]
                let chartSelection = budgetCell.chartSelection
                if (chartSelection) {
                    budgetCell.chart.setSelection(chartSelection)
                }
            }
        }
    }, 4000) // give time for animation (500ms) to complete
}

export { updateBranchChartSelections }