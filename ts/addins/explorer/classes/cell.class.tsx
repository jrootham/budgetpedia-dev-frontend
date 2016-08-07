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
import {YearSpecs} from './databaseapi'

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

interface viewpointConfigPack {
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

export interface NodeData {
    nodeData: any,
    yearSpecs: YearSpecs,
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

    // =======================[ PROPERTIES ]============================

    // -------------[ primary control properties, set on creation ]---------------

    private explorerChartCode: string
    nodeDataseriesName:string // the ref to the data to be presented
    chartSelection: ChartSelectionCell[] // returned by google chart; points to row selected by user
    uid: string // universal id; set by addCellDeclarations action

    // ------------[ derivative control properties ]-------------------

    // map from internal code to googleChartType
    get googleChartType() {
        return ChartCodeToGoogleChartType[this.explorerChartCode]
    }

    // the react Chart component, allows access to current google chart object
    // set by explorercell
    chartComponent
    // current chart (can change) taken from chartComponent...
    get chart() {
        if (this.chartComponent)
            return this.chartComponent.chart // up to date version
        else 
            return null
    }

    // readonly; set by setChartParms()
    // the formal parameters required by Chart Component for google chart creation
    private _chartParms: ChartParms
    get chartParms() : ChartParms {
        return this._chartParms
    }

    // ----------------[ mutable control properties ]-----------------

    facetName: string
    viewpointConfigPack: viewpointConfigPack
    nodeDataPack: NodeData
    expandable: boolean

    // ------------------[ display chart properties ]-------------------

    cellTitle: string
    graph_id: string // prop for Chart component; required by google charts

    // ------------------[ callback functions ]------------------------

    // curried; inherited
    selectionCallback: Function

    // ========================[ METHODS ]==========================

    refreshSelection = () => {
            // console.log('will update with setSelection', budgetCell, budgetCell.chart.getSelection())
        let budgetCell = this
        if (budgetCell.chartSelection) {
            // it turns out that "PieChart" needs column set to null
            // for setSelection to work
            if (budgetCell.chartSelection[0] && budgetCell.chart && budgetCell.chart.getSelection().length == 0) {
                if (budgetCell.googleChartType == "PieChart" ) {
                    budgetCell.chartSelection[0].column = null
                } else {
                    // we set it back to original (presumed) for consistency
                    budgetCell.chartSelection[0].column = 1
                }
                budgetCell.chart.setSelection(budgetCell.chartSelection)
                // console.log('have invoked setSelection from componentDidUpdate', budgetCell)
            }
        }        
    }

    switchChartCode = chartCode => {

        this.explorerChartCode = chartCode

        this.setChartParms()

    }

    // ----------------------[ setChartParms ]-------------------------

    // creates formal input parameters for google charts, through Chart Component
    // dataset is a data tree fetched from database
    // dataseries is a list of data rows attached to a node
    setChartParms = () => {

        let budgetCell: BudgetCell = this

        // --------------[ Unpack data bundles ]-------------

        let { 
            viewpointConfig, 
            datasetConfig 
        } = budgetCell.viewpointConfigPack

        let { 
            nodeData, 
            yearSpecs:yearSpecs, 
            parentData, 
        } = budgetCell.nodeDataPack

        // ---------------------[ get data node components ]------------------
        // collect chart node and its components as data sources for the graph

        if (!nodeData) {
            console.error('node not found',
            {
                isError: true,
                errorMessage: 'node not found',
                chartParms: {}
            })
            throw Error('node not found')
        }

        // ====================[ COLLECT CHART PARMS ]======================

        // ------------------
        // 1. chart type:
        // ------------------

        let chartType = budgetCell.googleChartType

        // ------------------
        // 2. chart options:
        // ------------------

        let options = budgetCell._chartParmsOptions(
            nodeData, 
            parentData, 
            viewpointConfig, 
            datasetConfig, 
            yearSpecs
        )

        // ------------------
        // 3. chart events:
        // ------------------

        let events = budgetCell._chartParmsEvents()

        // ------------------
        // 4. chart columns:
        // ------------------

        let columns = budgetCell._chartParmsColumns(yearSpecs)

        // ------------------
        // 5. chart rows:
        // ------------------

        let rows = budgetCell._chartParmsRows(nodeData, yearSpecs)

        // --------------------[ ASSEMBLE PARMS PACK ]----------------

        let chartParms: ChartParms = {

            chartType,
            options,
            events,
            columns,
            rows,

        }

        // save it
        budgetCell._chartParms = chartParms

    }

    // ------------------
    // 2. chart options:
    // ------------------
    private _chartParmsOptions = (
        nodeData, 
        parentData, 
        viewpointConfig, 
        datasetConfig, 
        yearSpecs
    ) => {
        // set vertical label value

        let budgetCell = this

        let { facetName, nodeDataseriesName } = budgetCell

        let datasetName = FacetNameToDatasetName[facetName]
        let units = datasetConfig.Units

        let vertlabel
        vertlabel = datasetConfig.UnitsAlias
        if (units != 'FTE') {
            if (datasetName == 'BudgetExpenses')
                vertlabel = 'Expenditures' + ' (' + vertlabel + ')'
            else
                vertlabel = 'Revenues' + ' (' + vertlabel + ')'
        }

        // get axis title
        let axistitle = null
        if ((nodeData.Contents) && (nodeDataseriesName == 'Components')) {
            let titleref = viewpointConfig[nodeData.Contents]
            axistitle = titleref.Alias || titleref.Name
        } else {
            let portaltitles = datasetConfig.Titles
            axistitle = portaltitles.Categories
        }

        // assemble chart title
        let title
        if (parentData) {
            let parentdataNode = parentData.nodeData
            let configindex = nodeData.Config || parentdataNode.Contents
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

        // set title amount

        let { rightYear:year } = yearSpecs
        let titleamount = null
        // utility functions for number formatting
        let thousandsformat = format({ prefix: "$" })
        let rounded = format({ round: 0, integerSeparator: '' })
        // let singlerounded = format({ round: 1, integerSeparator: '' })
        let staffrounded = format({ round: 1, integerSeparator: ',' })


        if (nodeData.years) {
            titleamount = nodeData.years[year]
        }
        if (units == 'DOLLAR') {
            titleamount = parseInt(rounded(titleamount / 1000))
            titleamount = thousandsformat(titleamount)
        } else {
            titleamount = staffrounded(titleamount)
        }
        title += ' (Total: ' + titleamount + ')'

        // assemble chart properties
        let legendvalue
        let chartheight
        let charttop
        let chartleft
        let chartwidth
        switch (budgetCell.googleChartType) {
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
                // TODO: error condition
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
        return options
    }

    // ------------------
    // 3. chart events:
    // ------------------
    private _chartParmsEvents = () => {
        let budgetCell:BudgetCell = this
        return [
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

                        this.selectionCallback(chartSelectionData)
                    }
            },
            {
                eventName:'animationfinish',
                callback: ((cell:BudgetCell) => Chart => {
                    let selection = Chart.chart.getSelection()
                    if (selection.length == 0 && cell.chartSelection && cell.chartSelection.length > 0) {
                        if (cell.chart) {
                            cell.chart.setSelection(cell.chartSelection)
                        }
                    }
                })(budgetCell)
            }
        ]
    }

    // ------------------
    // 4. chart columns:
    // ------------------
    private _chartParmsColumns = (yearSpecs:YearSpecs) => {
        let budgetCell = this

        let { googleChartType } = budgetCell

        switch (googleChartType) {
            case "ColumnChart":
                return this._columns_ColumnChart(yearSpecs)
            
            case "PieChart":
                return this._columns_PieChart(yearSpecs)

            default:
                return null
        }
    }

    private _columns_ColumnChart = (yearSpecs:YearSpecs) => {

        let budgetCell = this
        let categorylabel = 'Component' // placeholder

        let columns:any[] = [
            // type is required, else throws silent error
            { type: 'string', label: categorylabel },
            { type: 'number', label: yearSpecs.rightYear.toString() },
            {type:'string', role:'style'}
        ]

        return columns

    }

    private _columns_PieChart = (yearSpecs:YearSpecs) => {

        let budgetCell = this
        let categorylabel = 'Component' // placeholder

        let columns:any[] = [
            // type is required, else throws silent error
            { type: 'string', label: categorylabel },
            { type: 'number', label: yearSpecs.rightYear.toString() },
        ]

        return columns

    }

    // ------------------
    // 5. chart rows:
    // ------------------
    private _chartParmsRows = (nodeData, yearSpecs:YearSpecs) => {

        let budgetCell = this

        let { nodeDataseriesName } = budgetCell

        let nodeDataseries = nodeData[nodeDataseriesName]

        let sortedlistName = 'Sorted' + nodeDataseriesName

        let sortedDataseries = nodeData[sortedlistName]

        if (!sortedDataseries) {
            console.error( { 
                errorMessage:'sorted list "' + sortedlistName + '" not available',
                chartParms: {} 
            })
            throw Error('sorted list "' + sortedlistName + '" not available')
        }

        let rows = sortedDataseries.map((sortedItem:SortedComponentItem) => {
            // TODO: get determination of amount processing from Unit value
            let componentItem = nodeDataseries[sortedItem.Code]
            if (!componentItem) {
                console.error('component not found for (node, sortedlistName, nodeDataseries, item, item.Code) ',
                    nodeData, sortedlistName, nodeDataseries, sortedItem.Code, sortedItem)
                throw Error('componentItem not found')
            }
            let amount
            if (componentItem.years) {
                amount = componentItem.years[yearSpecs.rightYear]
            } else {
                amount = null
            }

            let row = [sortedItem.Name, amount]

            let { googleChartType } = budgetCell

            switch (googleChartType) {
                case "ColumnChart":
                    row = budgetCell._rows_ColumnCharts_row(row, componentItem)
                    break;
                
                default:
                    // do nothing
                    break;
            }

            return row
        })

        return rows

    }

    _rows_ColumnCharts_row = (row, componentItem) => {

        let style = ''

        if (componentItem.Contents == 'BASELINE') {
            style = 'stroke-color: Gold; stroke-width: 3'
        }
        
        row.push(style)

        return row

    }

}

export default BudgetCell