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
    Chart: any,
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

    // unpack chartSelectionData
    let selection = chartSelectionData.selection[0]

    let selectionrow
    if (selection) {
        // TODO: understand this: setting column to null avoids bugs
        // when chart animation is present
        // selection.column = null
        selectionrow = selection.row
    } else {
        selectionrow = null
        // return
    }

    let budgetNode: BudgetNode = branchNodes[nodeIndex]
    // console.log('budgetNode, cellIndex in applyChartComponentSelection',budgetNode, cellIndex)
    let budgetCell:BudgetCell = budgetNode.cells[cellIndex]

    // console.log('on selection',budgetCell)

    // let { chart } = budgetCell.chartComponent
    // console.log('CHART ts, wz, Im, Ok',selection, chart.ts, chart.wz, chart.Im, chart.Ok )
    // budgetCell.chartSelection = selection? [selection]: null

    // 1. stop if chart is not not drillable
    // TODO: replace with reference to budgetCell.expandable
    if (budgetCell.nodeDataseriesName == 'Categories') {
        return
    }
    budgetCell.chartSelection = selection? chartSelectionData.selection: null
    // console.log('setting chart selection', selection, budgetCell)

    // 2. remove any nodes to be replaced or abandoned

    let removed = branchNodes.splice(nodeIndex + 1) // remove subsequent charts
    let removeditems = removed.map((item) => {
        return {nodeuid:item.uid, cellList:item.cellList}
    })

    if (removeditems.length > 0) {

        let { removeNodeDeclarations } = budgetBranch.actions

        removeNodeDeclarations(removeditems)

    }
    // window.nodeUpdateControl.nodeuid = budgetNode.uid
    // window.nodeUpdateControl.new = true
    let { updateCellChartSelection } = budgetNode.actions
    updateCellChartSelection(budgetCell.uid,chartSelectionData.selection)

    setTimeout(()=>{

        // refresh nodes after removenode operation above
        // branchNodes = budgetBranch.nodes

        // let { updateChartSelections } = budgetBranch.nodeCallbacks

        // 3. if deselected, update parms and quit
        if (!selection) { // deselected
            // window.nodeUpdateControl.nodeuid = null
            // window.nodeUpdateControl.new = null
            budgetCell.chartSelection = null
            // updateChartSelections()
            return
        }

        // 4. otherwise create new child node
        budgetCell.chartSelection = chartSelectionData.selection
        let childprops: CreateChildNodeProps = {
            selectionrow,
            nodeIndex,
            cellIndex, 
            // chartSelectionData, 
        }

        budgetBranch.createChildNode( childprops )
        // setTimeout(()=>{
        //     window.nodeUpdateControl.nodeuid = null
        //     window.nodeUpdateControl.new = null            
        // })

    })

}

export const onChartComponentSelection = 
    budgetBranch => nodeIndex => cellIndex => chartSelectionData => {
    applyChartComponentSelection(budgetBranch,nodeIndex, cellIndex, chartSelectionData)
}

