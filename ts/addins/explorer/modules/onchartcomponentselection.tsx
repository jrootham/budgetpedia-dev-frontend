// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// onchartcomponentselection.tsx

var format = require('format-number')

import {
    ChartParms,
    ChartParmsObj,
    PortalChartLocation,
    SortedComponentItem,
    MatrixCellConfig,
    GetCellChartProps,
    BranchSettings,
} from './interfaces'

import BudgetNode, {BudgetNodeParms} from '../classes/budgetnode'
import BudgetBranch from '../classes/budgetbranch'
import { ChartTypeCodes } from '../../constants'
import {SelectionCallbackProps} from '../classes/modules/getchartparms'
import getBudgetNode from './getbudgetnode'
import { DatasetConfig } from '../classes/databaseapi'

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

// export interface OnChartComponentSelectionProps {
//     chartSelectionData: ChartSelectionContext,
// }

export interface CreateChildNodeProps {
    selectionrow: any,
    nodeIndex: number,
    cellIndex: number,
    chartSelectionData: any,
}

// ------------------------[ UPDATE CHART BY SELECTION ]-----------------

// response to user selection of a chart component (such as a column )
// called by chart callback
// TODO: the chartSelectionData object should include matrix location of 
// chartconfig, not the chartconfig itself
// on selection, makes a child with the same portalCharts offset
// TODO: create chile which appropriately sets up correct set of child charts
let applyChartComponentSelection = (budgetBranch: BudgetBranch, nodeIndex, cellIndex, chartSelectionData:ChartSelectionContext) => {

    let { nodes:branchNodes, settings:branchsettings, uid:branchuid } = budgetBranch

    let viewpointData = budgetBranch.state.viewpointData

    let { refreshPresentation, onPortalCreation, workingStatus, updateChartSelections } = budgetBranch.nodeCallbacks

    let { addNode, removeNode } = budgetBranch.actions

    // unpack chartSelectionData
    let selection = chartSelectionData.selection[0]

    let selectionrow
    if (selection) {
        selectionrow = selection.row
    } else {
        selectionrow = null
    }

    // unpack chartconfig
    let budgetNode: BudgetNode = branchNodes[nodeIndex]

    let budgetCell = budgetNode.cells[cellIndex]
    if (budgetCell.nodeDataPropertyName == 'Categories') {
        return
    }

    // TODO: abandon here if the next one exists and is the same
    let removed = branchNodes.splice(nodeIndex + 1) // remove subsequent charts
    let removedids = removed.map((item) => {
        return item.uid
    })

    if (removedids.length > 0) {
        removeNode(branchuid, removedids)
    }

    setTimeout(()=>{
        branchNodes = budgetBranch.nodes

        if (!selection) { // deselected
            delete budgetCell.chartselection
            delete budgetCell.chart
            updateChartSelections()
            return
        }
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

