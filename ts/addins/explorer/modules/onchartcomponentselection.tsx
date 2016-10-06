// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// onchartcomponentselection.tsx

// TODO: should be moved to branch.class

import BudgetNode from '../classes/node.class'
import BudgetBranch from '../classes/branch.class'
import BudgetCell from '../classes/cell.class'

export interface ChartSelectionCell {
    row:number,
    column:number
}

// returned when user clicks on a chart component 
// for drill-down or other action
export interface ChartSelectionContext {
    // Chart: any,
    selection: ChartSelectionCell[],
    err: any,
}

export interface CreateChildNodeProps {
    selectionrow: any,
    nodeIndex: number,
    cellIndex: number,
    // chartSelectionData: any,
}

// ------------------------[ UPDATE CHART BY SELECTION ]-----------------

// response to user selection of a chart component (such as a column )
// called by chart callback
// on selection, makes a child with the same datasetSpecs offset
let applyChartComponentSelection = (budgetBranch: BudgetBranch, nodeIndex, cellIndex, chartSelectionData:ChartSelectionContext) => {

    let { nodes:branchNodes, uid:branchuid } = budgetBranch

    let budgetNode: BudgetNode = branchNodes[nodeIndex]
    // budgetnode is undefined on final expendigure chart
    let budgetCell:BudgetCell = budgetNode.cells[cellIndex]

    if (!budgetCell) {
        console.error('System Error: budgetNode, faulty cellIndex in applyChartComponentSelection',budgetNode, cellIndex)
        throw Error('faulty cellIndex in applyChartComponentSelection')
    }
    // unpack chartSelectionData
    let selection = chartSelectionData.selection[0]


    console.log('budgetCell googlecharttype',budgetCell.googleChartType, cellIndex)

    let selectionrow
    if (selection) {
        // TODO: understand this: setting column to null avoids bugs
        // when chart animation is present
        // selection.column = null
        switch (budgetCell.googleChartType) {
            case "AreaChart":
            case "LineChart":
                selectionrow = selection.column - 1
                chartSelectionData.selection[0].row = null
                break;
            // case "PieChart": 
            //     chartSelectionData.selection[0].column = null
            default:
                selectionrow = selection.row
                break;
        }
    } else {
        selectionrow = null
        // return
    }

    // 1. stop if chart is not not drillable
    if (budgetCell.nodeDataseriesName == 'CommonDimension') {
        return
    }
    budgetCell.chartSelection = selection? chartSelectionData.selection: null

    // 2. remove any nodes to be replaced or abandoned

    let removed = branchNodes.splice(nodeIndex + 1) // remove subsequent charts
    let removeditems = removed.map((item:BudgetNode) => {
        return {nodeuid:item.uid, cellList:item.cellDeclarationList}
    })

    if (removeditems.length > 0) {

        let { removeNodeDeclarations } = budgetBranch.actions

        removeNodeDeclarations(removeditems)

    }

    let { updateCellChartSelection } = budgetNode.actions
    updateCellChartSelection(budgetCell.uid,chartSelectionData.selection)

    if (!selection) { // deselected

        budgetCell.chartSelection = null

        return
    }

    // 3. otherwise create new child node
    budgetCell.chartSelection = chartSelectionData.selection
    let childprops: CreateChildNodeProps = {
        selectionrow,
        nodeIndex,
        cellIndex:parseInt(cellIndex), 
    }

    budgetBranch.createChildNodeDeclaration( childprops )

}

export const onChartComponentSelection = 
    budgetBranch => nodeIndex => cellIndex => chartSelectionData => {
        console.log('chart selection data',chartSelectionData)
    applyChartComponentSelection(budgetBranch,nodeIndex, cellIndex, chartSelectionData)
}

