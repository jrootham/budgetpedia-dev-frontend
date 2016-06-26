// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// onchartcomponentselection.tsx

var format = require('format-number')

import {
    ChartParms,
    ChartParmsObj,
    ChartSelectionContext,
    PortalChartLocation,
    SortedComponentItem,
    MatrixCellConfig,
    GetChartParmsProps,
    GetChartParmsCallbacks,
    OnChartComponentSelectionProps,
    OnChartComponentSelectionCallbacks,
    CreateChildNodeProps,
    CreateChildNodeCallbacks,
} from './interfaces'

import BudgetNode, {BudgetNodeParms} from '../../../local/budgetnode'
import { updateChartSelections } from './updatechartselections'
import { ChartTypeCodes } from '../../constants'
import getChartParms from './getchartparms'
import { getBudgetNode } from './getbudgetnode'
import { DatasetConfig } from '../../../local/databaseapi'

// ------------------------[ UPDATE CHART BY SELECTION ]-----------------

// response to user selection of a chart component (such as a column )
// called by chart callback
// TODO: the context object should include matrix location of 
// chartconfig, not the chartconfig itself
// on selection, makes a child with the same portalCharts offset
// TODO: create chile which appropriately sets up correct set of child charts
let onChartComponentSelection = (props: OnChartComponentSelectionProps,
    callbacks: OnChartComponentSelectionCallbacks) => {

    let context = props.context
    let userselections = props.userselections
    let budgetdata = props.budgetdata
    let chartmatrixrow = props.chartmatrixrow

    let refreshPresentation = callbacks.refreshPresentation
    let onPortalCreation = callbacks.onPortalCreation
    let workingStatus = callbacks.workingStatus

    let portalChartIndex = context.portalchartlocation.portalindex

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
    let selectmatrixlocation = context.portalchartlocation.matrixlocation

    // unpack location
    // let matrixrow = selectmatrixlocation.row,
    let matrixcolumn = selectmatrixlocation.column

    // acquire serieslist from matrix
    let serieslist = chartmatrixrow

    let nodeconfig: BudgetNode = chartmatrixrow[matrixcolumn]

    if (nodeconfig.cells[portalChartIndex].nodeDataPropertyName == 'Categories') {
        return
    }

    // get taxonomy references
    let viewpoint = nodeconfig.viewpointName,
        facet = nodeconfig.facetName

    // TODO: abandon here if the next one exists and is the same
    serieslist.splice(matrixcolumn + 1) // remove subsequent charts

    // trigger update to avoid google charts use of cached versions
    refreshPresentation(chartmatrixrow)

    if (!selection) { // deselected
        delete nodeconfig.cells[portalChartIndex].chartselection
        delete nodeconfig.cells[portalChartIndex].chart
        updateChartSelections(chartmatrixrow)
        return
    }
    let childprops: CreateChildNodeProps = {
        nodeconfig, 
        userselections, 
        budgetdata,
        chartmatrixrow, 
        selectionrow,
        matrixcolumn,
        portalChartIndex, 
        context, 
        chart,
    }
    let childcallbacks: CreateChildNodeCallbacks = {
        workingStatus, 
        refreshPresentation, 
        onPortalCreation,
    }
    createChildNode( childprops, childcallbacks )
}

let createChildNode = (props: CreateChildNodeProps, callbacks: CreateChildNodeCallbacks) => {

    let {
        nodeconfig,
        userselections,
        budgetdata,
        chartmatrixrow,
        selectionrow,
        matrixcolumn,
        portalChartIndex,
        context,
        chart,
    } = props

    let viewpoint = nodeconfig.viewpointName,
        facet = nodeconfig.facetName

    let {
        workingStatus,
        refreshPresentation,
        onPortalCreation,
    } = callbacks

    // ----------------------------------------------------
    // ----------------[ create child ]--------------------
    // copy path
    let childdatapath = nodeconfig.dataPath.slice()

    let node = nodeconfig.dataNode

    if (!node.Components) {
        updateChartSelections(chartmatrixrow)
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
        updateChartSelections(chartmatrixrow)
        return
    }

    let newnode = node.Components[code]
    if (!newnode.Components && !newnode.Categories) {
        updateChartSelections(chartmatrixrow)
        return
    }
    workingStatus(true)
    let newrange = Object.assign({}, nodeconfig.timeSpecs)
    let charttype = userselections.charttype
    let chartCode = ChartTypeCodes[charttype]
    let portalcharts = budgetdata.viewpointdata.PortalCharts[facet]

    let newdatanode = getBudgetNode(budgetdata.viewpointdata, childdatapath)
    let newnodeconfigparms: BudgetNodeParms = {
        portalCharts: portalcharts,
        defaultChartType:charttype,
        viewpointName:viewpoint,
        facetName:facet,
        dataPath: childdatapath,
        matrixLocation: {
            column: matrixcolumn + 1
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
            nodeConfig: newnodeconfig,
            chartIndex: newnodeindex,
            userselections,
            budgetdata,
            chartmatrixrow,
        }
        let callbacks: GetChartParmsCallbacks = {
            refreshPresentation,
            onPortalCreation,
            workingStatus,
        }
        chartParmsObj = getChartParms(props, callbacks)
        if (chartParmsObj.isError) {
            isError = true
            break
        }
        newnodeconfig.cells[newnodeindex].chartparms = chartParmsObj.chartParms
        newnodeconfig.cells[newnodeindex].chartCode =
            ChartTypeCodes[newnodeconfig.cells[newnodeindex].googleChartType]
    }

    if (isError) {
        updateChartSelections(chartmatrixrow)
        workingStatus(false)
        return
    }
    let newmatrixcolumn = matrixcolumn + 1
    chartmatrixrow[newmatrixcolumn] = newnodeconfig

    refreshPresentation(chartmatrixrow)

    nodeconfig.cells[portalChartIndex].chartselection = context.selection
    nodeconfig.cells[portalChartIndex].chart = chart
    nodeconfig.cells[portalChartIndex].ChartObject = context.ChartObject

    updateChartSelections(chartmatrixrow)
    onPortalCreation()
    workingStatus(false)
}

export { onChartComponentSelection, createChildNode }
