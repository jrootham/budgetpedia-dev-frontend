// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// onchartcomponentselection.tsx

var format = require('format-number')

import {
    ChartParms,
    ChartParmsObj,
    PortalChartLocation,
    SortedComponentItem,
    MatrixCellConfig,
    GetChartParmsProps,
    // GetChartParmsCallbacks,
} from './interfaces'

import BudgetNode, {BudgetNodeParms} from '../../../local/budgetnode'
import { ChartTypeCodes } from '../../constants'
import getChartParms from './getchartparms'
import { getBudgetNode } from './getbudgetnode'
import { DatasetConfig } from '../../../local/databaseapi'

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
    budgetNode: BudgetNode,
    userselections: any,
    budgetdata:any,
    chartmatrixrow: any,
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
}

export interface OnChartComponentSelectionProps {
    context: ChartSelectionContext,
    userselections?: any,
    budgetdata?:any,
    chartmatrixrow?: any,
}
export interface OnChartComponentSelectionCallbacks {
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
let applyChartComponentSelection = (props: OnChartComponentSelectionProps,
    callbacks: OnChartComponentSelectionCallbacks) => {

    let context = props.context
    let userselections = props.userselections
    let budgetdata = props.budgetdata
    let chartmatrixrow = props.chartmatrixrow

    let refreshPresentation = callbacks.refreshPresentation
    let onPortalCreation = callbacks.onPortalCreation
    let workingStatus = callbacks.workingStatus
    let updateChartSelections = callbacks.updateChartSelections

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

    let budgetNode: BudgetNode = chartmatrixrow[nodeIndex]

    let cellIndex = context.cellIndex
    let budgetCell = budgetNode.cells[cellIndex]
    if (budgetCell.nodeDataPropertyName == 'Categories') {
        return
    }

    // get taxonomy references
    let viewpoint = budgetNode.viewpointName,
        facet = budgetNode.facetName

    // TODO: abandon here if the next one exists and is the same
    chartmatrixrow.splice(nodeIndex + 1) // remove subsequent charts

    // trigger update to avoid google charts use of cached versions
    refreshPresentation()

    if (!selection) { // deselected
        delete budgetCell.chartselection
        delete budgetCell.chart
        updateChartSelections()
        return
    }
    let childprops: CreateChildNodeProps = {
        budgetNode, 
        userselections, 
        budgetdata,
        chartmatrixrow, 
        selectionrow,
        nodeIndex,
        cellIndex, 
        context, 
        chart,
    }
    let childcallbacks: CreateChildNodeCallbacks = callbacks
    // {
    //     updateChartSelections,
    //     workingStatus, 
    //     refreshPresentation, 
    //     onPortalCreation,
    // }
    createChildNode( childprops, childcallbacks,{} )
}

export let createChildNode = (
    props: CreateChildNodeProps, 
    callbacks: CreateChildNodeCallbacks,
    selectionCallbacks
    ) => {

    let {
        budgetNode,
        userselections,
        budgetdata,
        chartmatrixrow,
        selectionrow,
        nodeIndex,
        cellIndex,
        context,
        chart,
    } = props

    let viewpoint = budgetNode.viewpointName,
        facet = budgetNode.facetName

    let {
        workingStatus,
        refreshPresentation,
        onPortalCreation,
        updateChartSelections,
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
    if (node && node.SortedComponents && node.SortedComponents[selectionrow]) {
        parentdata = node.SortedComponents[selectionrow]
        parentdata.dataNode = node
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
    let charttype = userselections.charttype
    let chartCode = ChartTypeCodes[charttype]
    let portalcharts = budgetdata.viewpointdata.PortalCharts

    let newdatanode = getBudgetNode(budgetdata.viewpointdata, childdatapath)
    let newnodeconfigparms: BudgetNodeParms = {
        portalCharts: portalcharts,
        defaultChartType:charttype,
        viewpointName:viewpoint,
        facetName:facet,
        dataPath: childdatapath,
        matrixLocation: {
            column: nodeIndex + 1
        },
        parentData: parentdata,
        timeSpecs: newrange,
        dataNode:newdatanode,
    }

    let newnodeconfig = new BudgetNode(newnodeconfigparms)

    let newnodeindex: any = null
    let chartParmsObj: ChartParmsObj = null
    let isError = false
    for (newnodeindex in newnodeconfig.cells) {
        let props: GetChartParmsProps = {
            budgetNode: newnodeconfig,
            chartIndex: newnodeindex,
            userselections,
            budgetdata,
            chartmatrixrow,
        }
        let ccallbacks = 
        {
            updateChartSelections,
            refreshPresentation,
            onPortalCreation,
            workingStatus,
        }
        chartParmsObj = getChartParms(props, {})
        if (chartParmsObj.isError) {
            isError = true
            break
        }
        let budgetCell = newnodeconfig.cells[newnodeindex]
        budgetCell.chartparms = chartParmsObj.chartParms
        budgetCell.chartCode =
            ChartTypeCodes[budgetCell.googleChartType]
    }

    if (isError) {
        updateChartSelections()
        workingStatus(false)
        return
    }
    let newmatrixcolumn = nodeIndex + 1
    chartmatrixrow[newmatrixcolumn] = newnodeconfig

    refreshPresentation()

    let budgetCell = budgetNode.cells[cellIndex]

    budgetCell.chartselection = context.selection
    budgetCell.chart = chart
    budgetCell.ChartObject = context.ChartObject

    updateChartSelections()
    onPortalCreation()
    workingStatus(false)
}

export const onChartComponentSelection = (userselections) => (budgetdata) => (chartmatrixrow) => 
    (callbacks) => (nodeIndex) => (cellIndex) => (props) => {
    props.context.nodeIndex = nodeIndex
    props.context.cellIndex = cellIndex
    props.userselections = userselections
    props.budgetdata = budgetdata
    props.chartmatrixrow = chartmatrixrow
    console.log('onChartComponentSelection',props)
    applyChartComponentSelection(props, callbacks)
}

