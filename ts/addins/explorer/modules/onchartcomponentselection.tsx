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
    nodeIndex?:number,
    cellIndex?: number,
    ChartObject: any,
    selection: ChartSelectionCell[],
    err: any,
}

export interface CreateChildNodeProps {
    parentNode: BudgetNode,
    branchsettings: BranchSettings,
    viewpointData:any,
    branchNodes: any,
    selectionrow: any,
    nodeIndex: number,
    cellIndex: number,
    context: any,
    chart: any
}
export interface CreateChildNodeCallbacks {
    updateChartSelections: Function,
    workingStatus: Function,
    refreshPresentation: Function,
    onPortalCreation: Function,
    updateBranchNodesState: Function,
}

export interface OnChartComponentSelectionProps {
    context: ChartSelectionContext,
    selectionCallbackVersions: any,
}
export interface OnChartComponentSelectionCallbacks {
    updateBranchNodesState: Function,
    updateChartSelections: Function,
    refreshPresentation: Function,
    onPortalCreation: Function,
    workingStatus: Function,
}

// ------------------------[ UPDATE CHART BY SELECTION ]-----------------

// response to user selection of a chart component (such as a column )
// called by chart callback
// TODO: the context object should include matrix location of 
// chartconfig, not the chartconfig itself
// on selection, makes a child with the same portalCharts offset
// TODO: create chile which appropriately sets up correct set of child charts
let applyChartComponentSelection = (budgetBranch, props: OnChartComponentSelectionProps,
    callbacks: OnChartComponentSelectionCallbacks, actions: any) => {

    let { context, selectionCallbackVersions } = props

    let { nodes:branchNodes, settings:branchsettings, uid:branchuid } = budgetBranch

    let viewpointData = budgetBranch.getState().viewpointData

    let { refreshPresentation, onPortalCreation, workingStatus, updateChartSelections } = callbacks

    let { addNode } = actions

    // unpack context
    let selection = context.selection[0]

    let selectionrow
    if (selection) {
        selectionrow = selection.row
    } else {
        selectionrow = null
    }

    let chart = context.ChartObject.chart

    // unpack chartconfig
    let nodeIndex = context.nodeIndex

    let budgetNode: BudgetNode = branchNodes[nodeIndex]

    // console.log('nodeIndex, selection and budgetNode of selected chart', nodeIndex, selection, budgetNode)

    let cellIndex = context.cellIndex
    let budgetCell = budgetNode.cells[cellIndex]
    if (budgetCell.nodeDataPropertyName == 'Categories') {
        return
    }

    // get taxonomy references
    let facet = budgetNode.facetName

    // TODO: abandon here if the next one exists and is the same
    let removed = branchNodes.splice(nodeIndex + 1) // remove subsequent charts
    let removedids = removed.map((item) => {
        return item.uid
    })
    // console.log('removed', removed, removedids)
    if (removedids.length > 0) {
        actions.removeNode(branchuid, removedids)
    }

    // trigger update to avoid google charts use of cached versions
    // refreshPresentation()
    setTimeout(()=>{
        branchNodes = budgetBranch.nodes
        // console.log('revised branchNodes', [...branchNodes])
        if (!selection) { // deselected
            delete budgetCell.chartselection
            delete budgetCell.chart
            updateChartSelections()
            return
        }
        let childprops: CreateChildNodeProps = {
            parentNode:budgetNode, 
            branchsettings, 
            viewpointData,
            branchNodes, 
            selectionrow,
            nodeIndex,
            cellIndex, 
            context, 
            chart,
        }
        let childcallbacks: CreateChildNodeCallbacks = callbacks
        createChildNode( budgetBranch, childprops, childcallbacks, selectionCallbackVersions, actions)
    })

}

export let createChildNode = (
    budgetBranch: any,
    props: CreateChildNodeProps, 
    callbacks: CreateChildNodeCallbacks,
    selectionCallbacks: SelectionCallbackProps,
    actions
    ) => {

    let {
        parentNode: budgetNode,
        branchsettings,
        viewpointData,
        branchNodes,
        selectionrow,
        nodeIndex,
        cellIndex,
        context,
        chart,
    } = props

    let viewpointName = budgetNode.viewpointName,
        facet = budgetNode.facetName

    let {
        workingStatus,
        refreshPresentation,
        onPortalCreation,
        updateChartSelections,
        updateBranchNodesState,
    } = callbacks

    // ----------------------------------------------------
    // ----------------[ create child ]--------------------
    // copy path
    let childdatapath = budgetNode.dataPath.slice()

    let node = budgetNode.dataNode

    if (!node.Components) {
        updateChartSelections()
        return
    }

    let components = node.Components

    let code = null
    let parentdata: SortedComponentItem = null
    let parentNode: any = null
    if (node && node.SortedComponents && node.SortedComponents[selectionrow]) {
        parentdata = node.SortedComponents[selectionrow]
        parentNode = node
        code = parentdata.Code
    }
    if (code)
        childdatapath.push(code)
    else {
        updateChartSelections()
        return
    }

    let newnode = node.Components[code]
    if (!newnode.Components && !newnode.Categories) {
        updateChartSelections()
        return
    }
    workingStatus(true)
    let newrange = Object.assign({}, budgetNode.timeSpecs)
    let charttype = branchsettings.chartType
    let chartCode = ChartTypeCodes[charttype]
    let portalcharts = viewpointData.PortalCharts

    let newdatanode = getBudgetNode(viewpointData, childdatapath)
    let newnodeconfigparms: BudgetNodeParms = {
        portalCharts: portalcharts,
        defaultChartType:charttype,
        viewpointName:viewpointName,
        facetName:facet,
        dataPath: childdatapath,
        nodeIndex: nodeIndex + 1,
        parentData: parentdata,
        timeSpecs: newrange,
    }

    // console.log('before add child node', newnodeconfigparms)

    actions.addNode(newnodeconfigparms)

    setTimeout(() => {
        let newBudgetNode = budgetBranch.nodes[nodeIndex + 1]
        // console.log('newBudgetNode',newBudgetNode,nodeIndex + 1)
        let newcellindex: any = null
        let chartParmsObj: ChartParmsObj = null
        let isError = false
        let configData = {
            viewpointConfig:viewpointData.Configuration,
            itemseriesConfig:viewpointData.itemseriesconfigdata,
        }

        let budgetCell = budgetNode.cells[cellIndex]

        budgetCell.chartselection = context.selection
        budgetCell.chart = chart
        budgetCell.ChartObject = context.ChartObject

        workingStatus(false)
        setTimeout(()=>{
            updateChartSelections()
            onPortalCreation()
        })
    })
}

export const onChartComponentSelection = 
    budgetBranch => callbacks => actions => nodeIndex => cellIndex => props => {
    props.context.nodeIndex = nodeIndex
    props.context.cellIndex = cellIndex
    applyChartComponentSelection(budgetBranch,props, callbacks, actions)
}

