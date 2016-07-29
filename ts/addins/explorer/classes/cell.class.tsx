// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// budgetcell.tsx

import {
    ChartParms,
    ChartParmsObj,
    PortalChartLocation,
    SortedComponentItem,
    GetChartParmsProps,
    BranchSettings,
} from '../modules/interfaces'

import {
    ChartSelectionCell,
    ChartSelectionContext,
} from '../modules/onchartcomponentselection'
import { 
    GoogleChartTypeToChartCode, 
    ChartCodeToGoogleChartType,
    FacetNameToDatasetName,
} from '../../constants'

import BudgetNode from './node.class'

var format = require('format-number')

// settings for individual portal chart
export interface CellSettings {
    graph_id: string,
    expandable?: boolean,
}

export interface CellCallbacks {
    onSwitchChartCode: Function,
}

export interface ChartCallbacks {
    selectionCallback: Function,
    // next: Function,
}

interface viewpointConfigData {
    viewpointConfig: any,
    datasetConfig: any,
}

export interface CellDeclaration {
    nodeDataseriesName:string, 
    explorerChartCode:string, 
    chartSelection:ChartSelectionCell[],
    uid?: string,
}

interface NodeData {
    dataNode:any,
    timeSpecs: any,
    parentData: any,
    nodeIndex: number,
}

class BudgetCell {

    constructor(specs:CellDeclaration) {
        let { nodeDataseriesName, explorerChartCode, chartSelection, uid } = specs
        this.nodeDataseriesName = nodeDataseriesName
        this.explorerChartCode = explorerChartCode
        this.chartSelection = chartSelection
        this.uid = uid
    }

    // primary properties
    nodeDataseriesName:string
    chartSelection: ChartSelectionCell[]
    explorerChartCode: string
    uid: string

    // derivative properties
    chartComponent: any // the react Chart component, allows access to google chart objects
    get googleChartType() {
        return ChartCodeToGoogleChartType[this.explorerChartCode]
    }
    chartParms: ChartParms
    get chart() {
        return this.chartComponent.chart
    }
    cellCallbacks: CellCallbacks
    expandable: boolean
    graph_id: string
    cellTitle: string
    cellIndex: number
    viewpointConfigData: viewpointConfigData
    nodeData: NodeData
    branchSettings: BranchSettings
    chartCallbacks: ChartCallbacks

    switchChartCode = chartCode => {

        this.explorerChartCode = chartCode

        let chartParmsObj:ChartParmsObj = this.getChartParms()

        if (!chartParmsObj.isError) {

            this.chartParms = chartParmsObj.chartParms

        }
    }

    getChartParms = ():ChartParmsObj => {

        let selectionCallbacks = this.chartCallbacks

        let budgetCell: BudgetCell = this

        let { cellIndex:chartIndex, nodeDataseriesName } = budgetCell

        let sortedlist = 'Sorted' + nodeDataseriesName

        let { branchSettings } = this 

        let { viewpointConfig, datasetConfig }  = this.viewpointConfigData

        // -------------------[ INIT VARS ]---------------------

        let { dataNode, timeSpecs:yearscope, parentData, nodeIndex } = this.nodeData

        let { rightYear:year } = yearscope
        // unpack branchsettings
        let { facet } = branchSettings

        let datasetName = FacetNameToDatasetName[facet]

        let units = datasetConfig.Units,
            vertlabel
        vertlabel = datasetConfig.UnitsAlias
        if (units != 'FTE') {
            if (datasetName == 'BudgetExpenses')
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

        if (nodeDataseriesName == 'Categories') {
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
        if ((dataNode.Contents) && (nodeDataseriesName == 'Components')) {
            let titleref = viewpointConfig[dataNode.Contents]
            axistitle = titleref.Alias || titleref.Name
        } else {
            let portaltitles = datasetConfig.Titles
            axistitle = portaltitles.Categories
        }

        // assemble chart title
        let title
        if (parentData) {
            let parentdataNode = parentData.dataNode
            let configindex = dataNode.Config || parentdataNode.Contents
            let catname = null
            if (configindex) {
                let category = viewpointConfig[configindex].Instance
                catname = category.Alias || category.Name
            } else {
                catname = 'Service/Activity'
            }
            title = catname + ': ' + parentData.Name
        }
        else {
            title = datasetConfig.Title
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
            //     duration: 500,
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
        let configlocation: PortalChartLocation = {
            nodeIndex,
            cellIndex: chartIndex
        }

        let events = [
            {
                eventName: 'select',
                callback: 
                    (Chart, err) => {
                        // console.log('Chart, chart', Chart, Chart.chart)
                        let chart = Chart.chart
                        let selection = chart.getSelection()
                        let chartSelectionData: ChartSelectionContext = { 
                            Chart,
                            selection, 
                            err 
                        }

                        selectionCallbacks.selectionCallback(chartSelectionData)
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


}

export default BudgetCell