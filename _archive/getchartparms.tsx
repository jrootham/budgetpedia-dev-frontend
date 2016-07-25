// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// getchartparms.tsx

// return chartType, columns, rows, options, and events
// these are the actual parameters passed to the react google charts components
// see notes 1 .. 5 below

// returns chartParmsObj.isError = true if fails
// returns inputs required for a chart, based on Chart Configuration

// TODO: handle yearscope, including multiple years
// getChartParms shouldn't know about matrix

var format = require('format-number')

import {
    ChartParms,
    ChartParmsObj,
    PortalChartLocation,
    SortedComponentItem,
    // MatrixCellConfig,
    GetChartParmsProps,
    BranchSettings,
} from '../../modules/interfaces'

import BudgetCell from '../budgetcell'

import getBudgetNode from '../../modules/getbudgetnode'
import { GoogleChartTypeToChartCode } from '../../../constants'
import { 
    // applyChartComponentSelection,
    // onChartComponentSelection,
    ChartSelectionContext,
    // OnChartComponentSelectionProps,
} from '../../modules/onchartcomponentselection'
import { DatasetConfig } from '../../classes/databaseapi'
import BudgetNode from '../../classes/budgetnode'

export interface SelectionCallbackProps {
    current: Function,
    next: Function,
}

interface ConfigData {
    viewpointConfig: any,
    itemseriesConfig: any,
}

let getChartParms = (
        props:GetChartParmsProps, selectionCallbacks: SelectionCallbackProps
    ):ChartParmsObj => {

    let { 
        budgetNode, 
        chartIndex, 
        branchsettings, 
        configData 
    } : { 
        budgetNode: BudgetNode, 
        chartIndex?: number, 
        branchsettings: BranchSettings, 
        configData?: ConfigData
    } = props

    let { viewpointConfig, itemseriesConfig }  = configData

    let budgetCell: BudgetCell = budgetNode.cells[chartIndex] || props.budgetCell

    let { nodeDatasetName } = budgetCell

    let sortedlist = 'Sorted' + nodeDatasetName
    // if (nodeDatasetName == 'Categories') {
    //     sortedlist = 'SortedCategories'
    // } else {
    //     sortedlist = 'SortedComponents'
    // }

    // -------------------[ INIT VARS ]---------------------

    let { viewpointName:viewpointindex, dataNode, timeSpecs:yearscope } = budgetNode

    let { rightYear:year } = yearscope
    // unpack branchsettings
    let { facet:dataseriesname } = branchsettings

    let units = itemseriesConfig.Units,
        vertlabel
    vertlabel = itemseriesConfig.UnitsAlias
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

    if (!dataNode) {
        return {
            isError: true,
            errorMessage: 'node not found',
            chartParms: {}
        }
    }

    let components

    if (nodeDatasetName == 'Categories') {
        components = dataNode.Categories
    } else {
        components = dataNode.Components
    }

    // ---------------------[ COLLECT CHART PARMS ]---------------------
    // 1. chart type:
    let chartType = budgetCell.googleChartType

    // 2. chart options:
    // get axis title
    let axistitle = null
    if ((dataNode.Contents) && (nodeDatasetName == 'Components')) {
        let titleref = viewpointConfig[dataNode.Contents]
        axistitle = titleref.Alias || titleref.Name
    } else {
        let portaltitles = itemseriesConfig.Titles
        axistitle = portaltitles.Categories
    }

    // assemble chart title
    let title
    if (budgetNode.parentData) {
        let parentdataNode = budgetNode.parentData.dataNode
        let configindex = dataNode.Config || parentdataNode.Contents
        let catname = null
        if (configindex) {
            let category = viewpointConfig[configindex].Instance
            catname = category.Alias || category.Name
        } else {
            catname = 'Service/Activity'
        }
        title = catname + ': ' + budgetNode.parentData.Name
    }
    else {
        title = itemseriesConfig.Title
    }
    let titleamount = null
    if (dataNode.years) {
        titleamount = dataNode.years[year]
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

    // TODO: animation breaks drawing; probably conflict with react render
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
        height: "400px",
        width: "400px",
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
    // 3. chart events:
    let nodeIndex = budgetNode.nodeIndex
    let configlocation: PortalChartLocation = {
        nodeIndex,
        cellIndex: chartIndex
    }

    let events = [
        {
            eventName: 'select',
            callback: 
                (Chart, err) => {
                    let chart = Chart.chart
                    let selection = chart.getSelection()
                    let chartSelectionData: ChartSelectionContext = { 
                        selection, 
                        err 
                    }

                    selectionCallbacks.current(chartSelectionData)
                }
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
    if (!dataNode[sortedlist]) {
        return { 
            isError: true, 
            errorMessage:'sorted list "' + sortedlist + '" not available',
            chartParms: {} 
        }
    }
    let rows = dataNode[sortedlist].map((item:SortedComponentItem) => {
        // TODO: get determination of amount processing from Unit value
        let component = components[item.Code]
        if (!component) {
            console.error('component not found for (node, sortedlist components, item, item.Code) ',
                dataNode, sortedlist, components, item.Code, item)
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
    }

    return chartParmsObj

}

export default getChartParms

