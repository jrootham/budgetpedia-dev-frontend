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
    budgetdata:any,
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
    branchsettings?: BranchSettings,
    budgetdata?:any,
    branchNodes?: any,
    branchuid?:string,
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

    let { context, branchsettings, budgetdata, branchNodes, selectionCallbackVersions, branchuid } = props

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
    // actions.removeNode(branchuid, removedids)

    // trigger update to avoid google charts use of cached versions
    refreshPresentation()

    if (!selection) { // deselected
        delete budgetCell.chartselection
        delete budgetCell.chart
        updateChartSelections()
        return
    }
    let childprops: CreateChildNodeProps = {
        parentNode:budgetNode, 
        branchsettings, 
        budgetdata,
        branchNodes, 
        selectionrow,
        nodeIndex,
        cellIndex, 
        context, 
        chart,
    }
    let childcallbacks: CreateChildNodeCallbacks = callbacks
    createChildNode( budgetBranch, childprops, childcallbacks, selectionCallbackVersions, actions)
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
        budgetdata,
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
    let portalcharts = budgetdata.viewpointdata.PortalCharts

    let newdatanode = getBudgetNode(budgetdata.viewpointdata, childdatapath)
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

    actions.addNode(newnodeconfigparms)

    // let newBudgetNode = new BudgetNode(newnodeconfigparms, 'x', newdatanode, parentNode)
    setTimeout(()=>{
        let newBudgetNode = budgetBranch.nodes[nodeIndex + 1]
        let newcellindex: any = null
        let chartParmsObj: ChartParmsObj = null
        let isError = false
        let configData = {
            viewpointConfig:budgetdata.viewpointdata.Configuration,
            itemseriesConfig:budgetdata.viewpointdata.itemseriesconfigdata,
        }
        // for (newcellindex in newBudgetNode.cells) {
        //     let props: GetCellChartProps = {
        //         chartIndex: newcellindex,
        //         branchsettings,
        //         configData,
        //     }
        //     let ccallbacks = 
        //     {
        //         updateChartSelections,
        //         refreshPresentation,
        //         onPortalCreation,
        //         workingStatus,
        //     }
        //     let childSelectionCallbacks: SelectionCallbackProps = {
        //         current: selectionCallbacks.next(nodeIndex + 1)(newcellindex),
        //         next: selectionCallbacks.next,
        //     }
        //     chartParmsObj = newBudgetNode.getChartParms(props, childSelectionCallbacks)
        //     if (chartParmsObj.isError) {
        //         isError = true
        //         break
        //     }
        //     let budgetCell = newBudgetNode.cells[newcellindex]
        //     budgetCell.chartparms = chartParmsObj.chartParms
        //     budgetCell.chartCode =
        //         ChartTypeCodes[budgetCell.googleChartType]
        // }

        // if (isError) {
        //     updateChartSelections()
        //     workingStatus(false)
        //     return
        // }
        // let newmatrixcolumn = nodeIndex + 1
        // branchNodes[newmatrixcolumn] = newBudgetNode

        let budgetCell = budgetNode.cells[cellIndex]

        budgetCell.chartselection = context.selection
        budgetCell.chart = chart
        budgetCell.ChartObject = context.ChartObject

        // updateBranchNodesState(branchNodes)
        // refreshPresentation()
        updateChartSelections()
        onPortalCreation()
    })
    workingStatus(false)
}

export const onChartComponentSelection = 
    budgetBranch => branchsettings => branchuid => budgetdata => branchNodes => 
        callbacks => actions => nodeIndex => cellIndex => props => {
    props.context.nodeIndex = nodeIndex
    props.context.cellIndex = cellIndex
    props.branchsettings = branchsettings
    props.budgetdata = budgetdata
    props.branchNodes = branchNodes
    props.branchuid = branchuid
    applyChartComponentSelection(budgetBranch,props, callbacks, actions)
}

