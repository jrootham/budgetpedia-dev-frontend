// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// getchartparms.tsx

// return chartType, columns, rows, options, and events
// these are the actual parameters passed to the react google charts components
// see notes 1 .. 5 below

// returns chartParmsObj.isError = true if fails
// returns inputs required for a chart, based on Chart Configuration

// TODO: handle yearscope, including multiple years

var format = require('format-number')

import {
    BudgetNodeConfig,
    ChartParms,
    ChartParmsObj,
    ChartSelectionContext,
    PortalChartLocation,
    SortedComponentItem,
    NodeChartConfig
} from './interfaces'

import { updateChartSelections } from './updatechartselections'
import { ChartTypeCodes } from '../../constants'

let getChartParms = (
    nodeConfig: BudgetNodeConfig, chartIndex:number,
    userselections, budgetdata, setState, chartmatrix, onPortalCreation:Function):ChartParmsObj => {

    let chartConfig: NodeChartConfig = nodeConfig.charts[chartIndex]

    let sortedlist = 'SortedComponents'

    let portalcharttype = chartConfig.portalcharttype

    if (portalcharttype == 'Categories') {
        sortedlist = 'SortedCategories'
    }

    // -------------------[ INIT VARS ]---------------------

    // unpack chartConfig & derivatives
    let viewpointindex = nodeConfig.viewpoint,
        path = nodeConfig.datapath,
        yearscope = nodeConfig.yearscope,
        year = yearscope.latestyear

    // unpack userselections
    let dataseriesname = userselections.dataseries

    // unpack budgetdata
    let viewpointdata = budgetdata.Viewpoints[viewpointindex],
        itemseries = budgetdata.DataSeries[dataseriesname],
        units = itemseries.Units,
        vertlabel
    vertlabel = itemseries.UnitsAlias
    if (units != 'FTE') {
        if (dataseriesname == 'BudgetExpenses')
            vertlabel = 'Expenditures' + ' (' + vertlabel + ')'
        else
            vertlabel = 'Revenues' + ' (' + vertlabel + ')'
    }

    // provide basis for error handling
    let isError = false

    // utility functions for number formatting
    let thousandsformat = format({ prefix: "$" })
    let rounded = format({ round: 0, integerSeparator: '' })
    let singlerounded = format({ round: 1, integerSeparator: '' })
    let staffrounded = format({ round: 1, integerSeparator: ',' })

    // -----------------------[ GET CHART NODE AND COMPONENTS ]-----------------------

    // collect chart node and its components as data sources for the graph
    let { node, components } = getNodeDatasets(viewpointindex, path, budgetdata)

    // !Hack!
    if (portalcharttype == 'Categories') {
        components = node.Categories
    }

    // ---------------------[ COLLECT CHART PARMS ]---------------------
    // 1. chart type:
    let chartType = chartConfig.charttype

    // 2. chart options:
    // get axis title
    let axistitle = null
    if ((node.Contents != 'BASELINE') && (portalcharttype == 'Components')) {
        let titleref = viewpointdata.Configuration[node.Contents]
        axistitle = titleref.Alias || titleref.Name
    } else {
        let portaltitles = budgetdata.DataSeries[dataseriesname].Titles
        axistitle = portaltitles.Components
    }

    // assemble chart title
    let title
    if (nodeConfig.parentdata) {
        let parentdatanode = nodeConfig.parentdata.datanode
        let configindex = node.Config || parentdatanode.Contents
        let category = viewpointdata.Configuration[configindex].Instance
        let catname = category.Alias || category.Name
        title = catname + ': ' + nodeConfig.parentdata.Name
    }
    else {
        title = itemseries.Title
    }
    let titleamount = null
    if (node.years) {
        titleamount = node.years[year]
    }
    if (units == 'DOLLAR') {
        titleamount = parseInt(rounded(titleamount / 1000))
        titleamount = thousandsformat(titleamount)
    } else {
        titleamount = staffrounded(titleamount)
    }
    title += ' (Total: ' + titleamount + ')'

    let legendvalue
    let chartheight
    let charttop
    let chartleft
    let chartwidth
    switch (chartType) {
        case "ColumnChart":
            legendvalue = 'none'
            chartheight ='50%'
            charttop = '15%'
            chartleft = '25%'
            chartwidth = '70%'
            break
        
        case "PieChart":
            legendvalue = {
                position:"top",
                textStyle: {
                    fontSize:9
                },
                maxLines:4
            }
            chartheight = '55%'
            charttop = '30%'
            chartleft = 'auto'
            chartwidth = 'auto'
            break;
        default:
            // code...
            break
    }

    // TODO: animation breaks draswing; probably conflict with react render
    //    needs to be investigated
    let options = {
        // animation:{
        //     startup: true,
        //     duration: 1000,
        //     easing: 'out',
        // },
        title: title,
        vAxis: { title: vertlabel, minValue: 0, textStyle: { fontSize: 8 } },
        hAxis: { title: axistitle, textStyle: { fontSize: 10 } },
        bar: { groupWidth: "95%" },
        // width: children.length * 120,// 120 per column
        height: 400,
        width: 400,
        legend: legendvalue,
        annotations: { alwaysOutside: true },
        pieHole: 0.4,
        chartArea:{
            height:chartheight,
            top:charttop,
            left:chartleft,
            width:chartwidth,
        }
    }

    // TODO: watch for memory leaks when the chart is destroyed
    // TODO: replace chartconfig with matrix co-ordinates to avoid
    //     need to update chart by destroying chart (thus closure) before replacing it
    // 3. chart events:
    let matrixlocation = Object.assign({}, nodeConfig.matrixlocation)
    let configlocation: PortalChartLocation = {
        matrixlocation,
        portalindex: chartIndex
    }

    let events = [
        {
            eventName: 'select',
            callback: ((configLocation:PortalChartLocation) => {

                return (Chart, err) => {
                    let chart = Chart.chart
                    let selection = chart.getSelection()
                    let context: ChartSelectionContext = { portalchartlocation: configLocation, Chart, selection, err }

                    onChartComponentSelection(context, userselections, budgetdata, setState, chartmatrix, onPortalCreation)
                }
            })(configlocation)
        }
    ]

    // 4. chart columns:
    let categorylabel = 'Component' // TODO: rationalize this!

    let columns = [
        // type is required, else throws silent error
        { type: 'string', label: categorylabel },
        { type: 'number', label: year.toString() },
        { type: 'string', role: 'annotation' }
    ]

    // 5. chart rows:
    if (!node[sortedlist]) {
        return { isError: true, chartParms: {} }
    }
    let rows = node[sortedlist].map((item:SortedComponentItem) => {
        // TODO: get determination of amount processing from Unit value
        let component = components[item.Code]
        if (!component) {
            console.error('component not found for (components, item, item.Code) ', components, item.Code, item)
        }
        let amount
        if (component.years)
            amount = components[item.Code].years[year]
        else
            amount = null
        let annotation
        if (units == 'DOLLAR') {
            amount = parseInt(rounded(amount / 1000))
            annotation = thousandsformat(amount)
        } else if (units == 'FTE') {
            annotation = staffrounded(amount)
            amount = parseInt(singlerounded(amount))
        } else {
            if (components[item.Code] && components[item.Code].years)
                amount = components[item.Code].years[year]
            else 
                amount = null
            annotation = amount
        }
        // TODO: add % of total to the annotation
        return [item.Name, amount, annotation]
    })

    // --------------------[ ASSEMBLE PARMS PACK ]----------------

    let chartParms: ChartParms = {

        columns,
        rows,
        options,
        events,
        chartType,
    }
    // ------------------[ ASSEMBLE RETURN PACK ]-------------------
    /* 
        provides for error flag 
    */

    let chartParmsObj:ChartParmsObj = {
        isError,
        chartParms,
        datanode:node,
    }

    return chartParmsObj

}

// ------------------------[ UPDATE CHART BY SELECTION ]-----------------

// response to user selection of a chart component (such as a column )
// called by chart callback
// TODO: the context object should include matrix location of 
// chartconfig, not the chartconfig itself
// on selection, makes a child with the same portalCharts offset
// TODO: create chile which appropriately sets up correct set of child charts
let onChartComponentSelection = (
        context: ChartSelectionContext, userselections, budgetdata, setState, chartmatrix, onPortalCreation:Function) => {

    let portalChartIndex = context.portalchartlocation.portalindex

    // unpack context
    let selection = context.selection[0]

    let selectionrow
    if (selection) {
        selectionrow = selection.row
    } else {
        selectionrow = null
    }

    let chart = context.Chart.chart

    // unpack chartconfig
    let selectmatrixlocation = context.portalchartlocation.matrixlocation

    // unpack location
    let matrixrow = selectmatrixlocation.row,
        matrixcolumn = selectmatrixlocation.column

    // acquire serieslist from matrix
    let serieslist = chartmatrix[matrixrow]

    let nodeconfig:BudgetNodeConfig = chartmatrix[matrixrow][matrixcolumn]

    if (nodeconfig.charts[portalChartIndex].portalcharttype == 'Categories')
        return

    // get taxonomy references
    let viewpoint = nodeconfig.viewpoint,
        dataseries = nodeconfig.dataseries

    // TODO: abandon here if the next one exists and is the same
    serieslist.splice(matrixcolumn + 1) // remove subsequent charts

    // trigger update to avoid google charts use of cached versions
    setState({
        chartmatrix,
    });

    if (!selection) { // deselected
        delete nodeconfig.charts[portalChartIndex].chartselection
        delete nodeconfig.charts[portalChartIndex].chart
        updateChartSelections(chartmatrix, matrixrow)
        return
    }
    // let chartconfig:ChartConfig = context.chartconfig // chartmatrix[matrixrow][matrixcolumn]
    // copy path
    let childdataroot = nodeconfig.datapath.slice()

    let { node, components } = getNodeDatasets(
        userselections.viewpoint, childdataroot, budgetdata)

    if (!node.Components) {
        updateChartSelections(chartmatrix, matrixrow)
        return
    }

    let code = null
    let parentdata:SortedComponentItem = null
    if (node && node.SortedComponents && node.SortedComponents[selectionrow]) {
        parentdata = node.SortedComponents[selectionrow]
        parentdata.datanode = node
        code = parentdata.Code
    }
    if (code)
        childdataroot.push(code)
    else {
        updateChartSelections(chartmatrix, matrixrow)
        return
    }

    let newnode = node.Components[code]
    if (!newnode.Components) {
        updateChartSelections(chartmatrix, matrixrow)
        return
    }

    let newrange = Object.assign({}, nodeconfig.yearscope)
    let charttype = userselections.charttype
    let chartCode = ChartTypeCodes[charttype]
    let portalcharts = budgetdata.Viewpoints[viewpoint].PortalCharts[dataseries]
    let charts = []
    for (let type of portalcharts) {
        if ((newnode.Contents == 'BASELINE') && (type.Type == 'Categories')) {
            continue
        }
        let chartconfig: NodeChartConfig = {
            charttype,
            chartCode,
        }
        chartconfig.portalcharttype = type.Type
        charts.push(chartconfig)
    }

    let newnodeconfig: BudgetNodeConfig = {
        viewpoint,
        dataseries,
        datapath: childdataroot,
        matrixlocation: {
            row: matrixrow,
            column: matrixcolumn + 1
        },
        parentdata: parentdata,
        yearscope: newrange,
        charts,
    }

    let newnodeindex:any = null
    let chartParmsObj: ChartParmsObj = null
    let isError = false
    for (newnodeindex in newnodeconfig.charts) {
         chartParmsObj = getChartParms(
             newnodeconfig, newnodeindex,userselections, budgetdata, setState, chartmatrix, onPortalCreation)
        if (chartParmsObj.isError) {
            isError = true
            break
        }
        newnodeconfig.charts[newnodeindex].chartparms = chartParmsObj.chartParms
        newnodeconfig.charts[newnodeindex].chartCode = 
            ChartTypeCodes[newnodeconfig.charts[newnodeindex].charttype]
    }

    if (isError) {
        updateChartSelections(chartmatrix, matrixrow)
        return
    }
    newnodeconfig.datanode = chartParmsObj.datanode
    let newmatrixcolumn = matrixcolumn + 1
    chartmatrix[matrixrow][newmatrixcolumn] = newnodeconfig

    setState({
        chartmatrix,
    })

    nodeconfig.charts[portalChartIndex].chartselection = context.selection
    nodeconfig.charts[portalChartIndex].chart = chart
    nodeconfig.charts[portalChartIndex].Chart = context.Chart

    updateChartSelections(chartmatrix, matrixrow)
    onPortalCreation(newnodeconfig.matrixlocation)

}

let getNodeDatasets = (viewpointindex, path, budgetdata) => {

    let node = budgetdata.Viewpoints[viewpointindex]

    let components = node.Components

    for (let index of path) {

        node = components[index]

        if (!node) console.error('component node not found', components, viewpointindex, path)

        components = node.Components
    }

    return { node, components }
}

export { getChartParms }

