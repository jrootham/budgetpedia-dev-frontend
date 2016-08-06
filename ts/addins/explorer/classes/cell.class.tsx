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
    celluid?: string,
}

export interface CellConstructorArgs {
    nodeDataseriesName:string, 
    explorerChartCode:string, 
    chartSelection:ChartSelectionCell[],
    uid?: string,
}

interface NodeData {
    dataNode:any,
    timeSpecs: any,
    parentData: any,
}

class BudgetCell {

    constructor(specs:CellConstructorArgs) {
        let { nodeDataseriesName, explorerChartCode, chartSelection, uid } = specs
        this.explorerChartCode = explorerChartCode
        this.nodeDataseriesName = nodeDataseriesName
        this.chartSelection = chartSelection
        this.uid = uid
    }

    // primary properties
    private explorerChartCode: string

    nodeDataseriesName:string
    chartSelection: ChartSelectionCell[]
    uid: string

    // derivative properties
    chartComponent // the react Chart component, allows access to google chart objects
    get googleChartType() {
        return ChartCodeToGoogleChartType[this.explorerChartCode]
    }
    private _chartParms: ChartParms
    get chartParms() : ChartParms {
        return this._chartParms
    }
    get chart() {
        if (this.chartComponent)
            return this.chartComponent.chart // up to date version
        else 
            return null
    }
    expandable: boolean
    graph_id: string
    cellTitle: string
    viewpointConfigData: viewpointConfigData
    nodeData: NodeData
    facetName
    selectionCallback: Function

    switchChartCode = chartCode => {

        this.explorerChartCode = chartCode

        this.setChartParms()

    }

    // dataset is a data tree fetched from database
    // dataseries is a list of data rows attached to a node
    setChartParms = ():ChartParmsObj => {

        let budgetCell: BudgetCell = this

        let { 
            facetName:facet, 
            nodeDataseriesName,
            selectionCallback,
        } = budgetCell

        let sortedlist = 'Sorted' + nodeDataseriesName

        let { 
            viewpointConfig, 
            datasetConfig 
        } = budgetCell.viewpointConfigData

        // -------------------[ INIT VARS ]---------------------

        let { 
            dataNode, 
            timeSpecs:yearscope, 
            parentData, 
            // nodeIndex 
        } = budgetCell.nodeData

        let { rightYear:year } = yearscope

        let datasetName = FacetNameToDatasetName[facet]

        let units = datasetConfig.Units


        let vertlabel
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

        // ====================[ COLLECT CHART PARMS ]======================
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

        let options = {
            animation:{
                startup: true,
                duration: 500,
                easing: 'out',
            },
            title: title,
            vAxis: { title: vertlabel, minValue: 0, textStyle: { fontSize: 8 } },
            hAxis: { title: axistitle, textStyle: { fontSize: 10 } },
            bar: { groupWidth: "95%" },
            // width: children.length * 120,// 120 per column
            height: "400px",
            width: "400px",
            legend: legendvalue,
            // annotations: { alwaysOutside: true },
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
        // let configlocation: PortalChartLocation = {
        //     nodeIndex,
        //     cellIndex: chartIndex
        // }

        let events = [
            {
                eventName: 'select',
                callback: 
                    (Chart, err) => {
                        let chart = Chart.chart
                        let selection = chart.getSelection()
                        // console.log('selection', selection)
                        let chartSelectionData: ChartSelectionContext = { 
                            // Chart,
                            selection, 
                            err 
                        }

                        selectionCallback(chartSelectionData)
                    }
            },
            {
                eventName:'animationfinish',
                callback: ((cell:BudgetCell) => Chart => {
                    let selection = Chart.chart.getSelection()
                    // console.log('finished animation', selection , cell)
                    if (selection.length == 0 && cell.chartSelection && cell.chartSelection.length > 0) {
                        if (cell.chart) {
                            cell.chart.setSelection(cell.chartSelection)
                            // console.log('have invoked setSelection from animationfinish', budgetCell)
                        }
                    }
                })(budgetCell)
            }
        ]

        // 4. chart columns:
        let categorylabel = 'Component' // TODO: rationalize this!

        let columns:any[] = [
            // type is required, else throws silent error
            { type: 'string', label: categorylabel },
            { type: 'number', label: year.toString() },
            // { type: 'string', role: 'style' }
        ]

        let setStyle = false
        if (chartType == 'ColumnChart') {
            columns.push(
                {type:'string', role:'style'}
            )
            setStyle = true
        }

        // 5. chart rows:
        if (!dataNode[sortedlist]) {
            return { 
                isError: true, 
                errorMessage:'sorted list "' + sortedlist + '" not available',
                chartParms: {} 
            }
        }
        // console.log('datanode in getchartparms', dataNode)
        let rows = dataNode[sortedlist].map((item:SortedComponentItem) => {
            // TODO: get determination of amount processing from Unit value
            let component = components[item.Code]
            if (!component) {
                console.error('component not found for (node, sortedlist components, item, item.Code) ',
                    dataNode, sortedlist, components, item.Code, item)
            }
            let amount
            if (component.years) {
                amount = components[item.Code].years[year]
            } else {
                amount = null
            }

            let retval = [item.Name, amount]
            let style = ''
            if (component.Contents == 'BASELINE') {
                style = 'stroke-color: Gold; stroke-width: 3'
            }
            if (setStyle) retval.push(style)
            return retval
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

        if (!chartParmsObj.isError) {

            this._chartParms = chartParmsObj.chartParms

        }

        // return chartParmsObj

    }


}

export default BudgetCell