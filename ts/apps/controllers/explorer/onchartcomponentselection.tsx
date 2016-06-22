// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// onchartcomponentselection.tsx

var format = require('format-number')

import {
    MatrixNodeConfig,
    ChartParms,
    ChartParmsObj,
    ChartSelectionContext,
    PortalChartLocation,
    SortedComponentItem,
    MatrixChartConfig,
    GetChartParmsProps,
    GetChartParmsCallbacks,
    OnChartComponentSelectionProps,
    OnChartComponentSelectionCallbacks,
    CreateChildNodeProps,
    CreateChildNodeCallbacks,
} from './interfaces'

import { updateChartSelections } from './updatechartselections'
import { ChartTypeCodes } from '../../constants'
import { getChartParms } from './getchartparms'
import { getBudgetNode } from './getbudgetnode'

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
    let viewpointdata = props.viewpointdata
    let itemseriesdata = props.itemseriesdata
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

    let nodeconfig: MatrixNodeConfig = chartmatrixrow[matrixcolumn]

    if (nodeconfig.charts[portalChartIndex].nodedatapropertyname == 'Categories') {
        return
    }

    // get taxonomy references
    let viewpoint = nodeconfig.viewpoint,
        facet = nodeconfig.facet

    // TODO: abandon here if the next one exists and is the same
    serieslist.splice(matrixcolumn + 1) // remove subsequent charts

    // trigger update to avoid google charts use of cached versions
    refreshPresentation(chartmatrixrow)

    if (!selection) { // deselected
        delete nodeconfig.charts[portalChartIndex].chartselection
        delete nodeconfig.charts[portalChartIndex].chart
        updateChartSelections(chartmatrixrow)
        return
    }
    let childprops: CreateChildNodeProps = {
        nodeconfig, 
        userselections, 
        viewpointdata,
        itemseriesdata,
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
        viewpointdata,
        itemseriesdata,
        chartmatrixrow,
        selectionrow,
        matrixcolumn,
        portalChartIndex,
        context,
        chart,
    } = props

    let viewpoint = nodeconfig.viewpoint,
        facet = nodeconfig.facet

    let {
        workingStatus,
        refreshPresentation,
        onPortalCreation,
    } = callbacks

    // ----------------------------------------------------
    // ----------------[ create child ]--------------------
    // copy path
    let childdatapath = nodeconfig.datapath.slice()

    let node = nodeconfig.datanode

    if (!node.Components) {
        updateChartSelections(chartmatrixrow)
        return
    }

    let components = node.Components

    let code = null
    let parentdata: SortedComponentItem = null
    if (node && node.SortedComponents && node.SortedComponents[selectionrow]) {
        parentdata = node.SortedComponents[selectionrow]
        parentdata.datanode = node
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
    // setTimeout(() => {

        let newrange = Object.assign({}, nodeconfig.yearscope)
        let charttype = userselections.charttype
        let chartCode = ChartTypeCodes[charttype]
        let portalcharts = viewpointdata.PortalCharts[facet]
        let charts = []
        for (let type of portalcharts) {
            if (type.Type == 'Components' && !newnode.Components) {
                continue
            }
            if (type.Type == 'Categories' && !newnode.Categories) {
                continue
            }
            // if ((newnode.Contents == 'BASELINE') && (type.Type == 'Categories')) {
            //     continue
            // }
            let chartconfig: MatrixChartConfig = {
                googlecharttype: charttype,
                chartCode,
            }
            chartconfig.nodedatapropertyname = type.Type
            charts.push(chartconfig)
        }

        let newnodeconfig: MatrixNodeConfig = {
            viewpoint,
            facet,
            datapath: childdatapath,
            matrixlocation: {
                // row: matrixrow,
                column: matrixcolumn + 1
            },
            parentdata: parentdata,
            yearscope: newrange,
            charts,
        }

        let newnodeindex: any = null
        let chartParmsObj: ChartParmsObj = null
        let isError = false
        for (newnodeindex in newnodeconfig.charts) {
            let props: GetChartParmsProps = {
                nodeConfig: newnodeconfig,
                chartIndex: newnodeindex,
                userselections,
                viewpointdata,
                itemseriesdata,
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
            newnodeconfig.charts[newnodeindex].chartparms = chartParmsObj.chartParms
            newnodeconfig.charts[newnodeindex].chartCode =
                ChartTypeCodes[newnodeconfig.charts[newnodeindex].googlecharttype]
        }

        if (isError) {
            updateChartSelections(chartmatrixrow)
            workingStatus(false)
            return
        }
        newnodeconfig.datanode = chartParmsObj.datanode
        let newmatrixcolumn = matrixcolumn + 1
        chartmatrixrow[newmatrixcolumn] = newnodeconfig

        refreshPresentation(chartmatrixrow)

        nodeconfig.charts[portalChartIndex].chartselection = context.selection
        nodeconfig.charts[portalChartIndex].chart = chart
        nodeconfig.charts[portalChartIndex].ChartObject = context.ChartObject

        updateChartSelections(chartmatrixrow)
        onPortalCreation()
        workingStatus(false)
    // })
}

export { onChartComponentSelection, createChildNode }
