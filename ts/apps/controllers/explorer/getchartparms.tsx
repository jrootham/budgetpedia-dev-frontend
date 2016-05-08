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
    ChartConfig,
    ChartParms,
    ChartSelectionContext,
    PortalChartLocation
} from './interfaces'

import { updateChartSelections } from './updatechartselections'
import { ChartTypeCodes } from '../../constants'

let getChartParms = (
    chartConfig: ChartConfig, 
    userselections, budgetdata, setState, chartmatrix) => {

    // -------------------[ INIT VARS ]---------------------

    // unpack chartConfig & derivatives
    let viewpointindex = chartConfig.viewpoint,
        path = chartConfig.datapath,
        yearscope = chartConfig.yearscope,
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
            vertlabel += ' (Expenses)'
        else
            vertlabel += ' (Revenues)'
    }

    // provide basis for error handling
    let isError = false

    // utility functions for number formatting
    let thousandsformat = format({ prefix: "$", suffix: "T" })
    let rounded = format({ round: 0, integerSeparator: '' })
    let singlerounded = format({ round: 1, integerSeparator: '' })
    let staffrounded = format({ round: 1, integerSeparator: ',' })

    // -----------------------[ GET CHART NODE AND COMPONENTS ]-----------------------

    // collect chart node and its components as data sources for the graph
    let { node, components } = getNodeDatasets(viewpointindex, path, budgetdata)

    // ---------------------[ COLLECT CHART PARMS ]---------------------
    // 1. chart type:
    let chartType = chartConfig.charttype

    // 2. chart options:
    // get axis title
    let titleref = viewpointdata.Configuration[node.Contents]
    let axistitle = titleref.Alias || titleref.Name

    // assemble chart title
    let title
    if (chartConfig.parentdata) {
        let parentnode = chartConfig.parentdata.node
        let configindex = node.Config || parentnode.Contents
        let category = viewpointdata.Configuration[configindex].Instance
        let catname = category.Alias || category.Name
        title = catname + ': ' + chartConfig.parentdata.Name
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
    switch (chartType) {
        case "ColumnChart":
            legendvalue = "none"
            chartheight ='auto'
            charttop = 'auto'
            break;
        
        case "PieChart":
            legendvalue = {
                position:"top",
                textStyle: {
                    fontSize:9
                },
                maxLines:4
            }
            chartheight = '70%'
            charttop = '30%'
            break;
        default:
            // code...
            break;
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
        hAxis: { title: axistitle, textStyle: { fontSize: 9 } },
        bar: { groupWidth: "95%" },
        // width: children.length * 120,// 120 per column
        height: 400,
        width: 400,
        legend: legendvalue,
        annotations: { alwaysOutside: true },
        pieHole: 0.4,
        chartArea:{
            height:chartheight,
            top:charttop
        }
    }

    // TODO: watch for memory leaks when the chart is destroyed
    // TODO: replace chartconfig with matrix co-ordinates to avoid
    //     need to update chart by destroying chart (thus closure) before replacing it
    // 3. chart events:
    let matrixlocation = Object.assign({}, chartConfig.matrixlocation)
    let configlocation: PortalChartLocation = {
        matrixlocation,
        portalindex:null
    }

    let events = [
        {
            eventName: 'select',
            callback: ((configLocation:PortalChartLocation) => {

                return (Chart, err) => {
                    let chart = Chart.chart
                    let selection = chart.getSelection()
                    let context: ChartSelectionContext = { configlocation: configLocation, Chart, selection, err }

                    onChartComponentSelection(context, userselections, budgetdata, setState, chartmatrix)
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
    if (!node.SortedComponents) {
        return { isError: true, chartParms: {} }
    }
    let rows = node.SortedComponents.map(item => {
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

    let chartParmsObj = {
        isError,
        chartParms,
    }

    return chartParmsObj

}

// ------------------------[ UPDATE CHART BY SELECTION ]-----------------

// response to user selection of a chart component (such as a column )
// called by chart callback
// TODO: the context object should include matrix location of 
// chartconfig, not the chartconfig itself
let onChartComponentSelection = (
        context: ChartSelectionContext, userselections, budgetdata, setState, chartmatrix) => {

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
    let selectmatrixlocation = context.configlocation.matrixlocation

    // unpack location
    let matrixrow = selectmatrixlocation.row,
        matrixcolumn = selectmatrixlocation.column

    // acquire serieslist from matrix
    let serieslist = chartmatrix[matrixrow]

    let chartconfig = chartmatrix[matrixrow][matrixcolumn]

    // get taxonomy references
    let viewpoint = chartconfig.viewpoint,
        dataseries = chartconfig.dataseries

    // TODO: abandon here if the next one exists and is the same
    serieslist.splice(matrixcolumn + 1) // remove subsequent charts

    // trigger update to avoid google charts use of cached versions
    setState({
        chartmatrix,
    });

    if (!selection) { // deselected
        delete chartconfig.chartselection
        delete chartconfig.chart
        updateChartSelections(chartmatrix, matrixrow)
        return
    }
    // let chartconfig:ChartConfig = context.chartconfig // chartmatrix[matrixrow][matrixcolumn]
    // copy path
    let childdataroot = chartconfig.datapath.slice()

    let { node, components } = getNodeDatasets(
        userselections.viewpoint, childdataroot, budgetdata)

    if (!node.Components) {
        updateChartSelections(chartmatrix, matrixrow)
        return
    }

    let code = null
    let parentdata = null
    if (node && node.SortedComponents && node.SortedComponents[selectionrow]) {
        parentdata = node.SortedComponents[selectionrow]
        parentdata.node = node
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

    let newrange = Object.assign({}, chartconfig.yearscope)

    let newchartconfig: ChartConfig = {
        viewpoint,
        dataseries,
        datapath: childdataroot,
        matrixlocation: {
            row: matrixrow,
            column: matrixcolumn + 1
        },
        parentdata: parentdata,
        yearscope: newrange,
        charttype: userselections.charttype,
    }

    let chartParmsObj = getChartParms(newchartconfig, userselections, budgetdata, setState, chartmatrix)

    if (chartParmsObj.isError) {
        updateChartSelections(chartmatrix, matrixrow)
        return
    }

    newchartconfig.chartparms = chartParmsObj.chartParms

    let newmatrixcolumn = matrixcolumn + 1
    chartmatrix[matrixrow][newmatrixcolumn] = newchartconfig

    setState({
        chartmatrix,
    })

    chartconfig.chartselection = context.selection
    chartconfig.chart = chart
    chartconfig.Chart = context.Chart

    updateChartSelections(chartmatrix, matrixrow)

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

