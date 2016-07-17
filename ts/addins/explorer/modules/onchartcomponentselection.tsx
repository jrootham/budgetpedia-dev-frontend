// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// onchartcomponentselection.tsx

import BudgetNode from '../classes/budgetnode'
import BudgetBranch from '../classes/budgetbranch'

export interface ChartSelectionCell {
    row:number,
    column:number
}

// returned when user clicks on a chart component 
// for drill-down or other action
export interface ChartSelectionContext {
    ChartObject: any,
    selection: ChartSelectionCell[],
    err: any,
}

export interface CreateChildNodeProps {
    selectionrow: any,
    nodeIndex: number,
    cellIndex: number,
    chartSelectionData: any,
}

// ------------------------[ UPDATE CHART BY SELECTION ]-----------------

// response to user selection of a chart component (such as a column )
// called by chart callback
// on selection, makes a child with the same portalCharts offset
let applyChartComponentSelection = (budgetBranch: BudgetBranch, nodeIndex, cellIndex, chartSelectionData:ChartSelectionContext) => {

    let { nodes:branchNodes, uid:branchuid } = budgetBranch

    // unpack chartSelectionData
    let selection = chartSelectionData.selection[0]

    let selectionrow
    if (selection) {
        selectionrow = selection.row
    } else {
        selectionrow = null
    }

    let budgetNode: BudgetNode = branchNodes[nodeIndex]

    let budgetCell = budgetNode.cells[cellIndex]

    // 1. stop if chart is not not drillable
    if (budgetCell.nodeDataPropertyName == 'Categories') {
        return
    }

    // 2. remove any nodes to be replaced or abandoned

    let removed = branchNodes.splice(nodeIndex + 1) // remove subsequent charts
    let removedids = removed.map((item) => {
        return item.uid
    })

    if (removedids.length > 0) {

        let { removeNode } = budgetBranch.actions

        removeNode(branchuid, removedids)

    }

    setTimeout(()=>{

        // refresh nodes after removenode operation above
        branchNodes = budgetBranch.nodes

        let { updateChartSelections } = budgetBranch.nodeCallbacks

        // 3. if deselected, update parms and quit
        if (!selection) { // deselected
            delete budgetCell.chartselection
            delete budgetCell.chart
            updateChartSelections()
            return
        }

        // 4. otherwise create new child node
        let childprops: CreateChildNodeProps = {
            selectionrow,
            nodeIndex,
            cellIndex, 
            chartSelectionData, 
        }

        budgetBranch.createChildNode( childprops )

    })

}

export const onChartComponentSelection = 
    budgetBranch => nodeIndex => cellIndex => chartSelectionData => {
    applyChartComponentSelection(budgetBranch,nodeIndex, cellIndex, chartSelectionData)
}

