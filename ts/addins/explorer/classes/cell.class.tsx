// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// budgetcell.tsx
/*
TODO: BUG noSortedDataSeries when switching aspect with leaf expenditure cell showing
*/ 

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
    ChartCodeToGoogleChartType,
    AspectNameToDatasetName,
} from '../constants'

import BudgetNode from './node.class'
import {YearSpecs, DatasetConfig} from './databaseapi'
import { TimeScope } from '../constants'

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
    viewpointNamingConfigs: any,
    datasetConfig: DatasetConfig,
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
    uid: string,
    cellDeclaration: any,
}

export interface NodeData {
    treeNodeData: any,
    yearSpecs: YearSpecs,
    treeNodeMetaData: any,
}

class BudgetCell {

    constructor(specs:CellConstructorArgs) {
        let { nodeDataseriesName, explorerChartCode, chartSelection, uid, cellDeclaration } = specs
        this.explorerChartCode = explorerChartCode
        this.nodeDataseriesName = nodeDataseriesName
        this.chartSelection = chartSelection
        this.uid = uid
        this._cellDeclaration = cellDeclaration 
    }
    // public getState: Function

    private _cellDeclaration: any

    public getProps: Function

    // public setState: Function

    // =======================[ PROPERTIES ]============================

    // -------------[ primary control properties, set on creation ]---------------

    private explorerChartCode: string // application code for chart type selected; converted to google type
    nodeDataseriesName:string // the ref to the data to be presented, typically Components or CommonObjects
    chartSelection: ChartSelectionCell[] // returned by google chart; points to row selected by user
    uid: string // universal id; set by addCellDeclarations action

    // ------------[ derivative control properties ]-------------------

    // map from internal code to googleChartType
    get googleChartType() {
        return ChartCodeToGoogleChartType[this.explorerChartCode]
    }

    // TODO: untangle this sequencing mess!!
    get cellDeclaration() {
        if ( this.getProps ) { // only assigned after mounting, 
            // but setChartParms is called before that
            // ...perhaps delay setChartParms with dirty flag?? or new flag??
            return this.getProps().declarationData.cellsById[this.uid]
        } else {
            return this._cellDeclaration
        }
    }

    // the react Chart component, allows access to current google chart object
    // set by explorercell.tsx using ref callback
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

    aspectName: string
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
            viewpointNamingConfigs, 
            datasetConfig 
        } = budgetCell.viewpointConfigPack

        let { 
            treeNodeData, 
            yearSpecs, 
            treeNodeMetaData, 
        } = budgetCell.nodeDataPack

        // ---------------------[ get data node components ]------------------
        // collect chart node and its components as data sources for the graph

        if (!treeNodeData) {
            console.error('System Error: node not found in setChartParms', budgetCell)
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
            treeNodeData, 
            treeNodeMetaData, 
            viewpointNamingConfigs, 
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
        let { nodeDataseriesName } = budgetCell

        let nodeDataseries = treeNodeData[nodeDataseriesName]

        let sortedlistName = 'Sorted' + nodeDataseriesName

        let sortedDataseries = treeNodeData[sortedlistName]

        let rows
        if (sortedDataseries) {
            rows = budgetCell._chartParmsRows(treeNodeData, yearSpecs)
        } else {
            // fires on last chart
            console.error('System Error: no sortedDataSeries', sortedlistName, sortedDataseries, treeNodeData )
            return
        }

        // --------------------[ ASSEMBLE PARMS PACK ]----------------

        let chartParms: ChartParms = {

            chartType,
            options,
            events,
            columns,
            rows,

        }

        // save it
        this._chartParms = chartParms
    }

    // ------------------
    // 2. chart options:
    // ------------------
    private _chartParmsOptions = (
        treeNodeData, 
        treeNodeMetaData, 
        viewpointNamingConfigs, 
        datasetConfig:DatasetConfig, 
        yearSpecs:YearSpecs
    ) => {

        // ----------------------[ assemble support variables ]-------------------

        let budgetCell = this

        let { aspectName, nodeDataseriesName } = budgetCell

        let datasetName = AspectNameToDatasetName[aspectName]
        let units = datasetConfig.Units
        let unitRatio = datasetConfig.UnitRatio

        // --------------------[ assemble vertical label value ]--------------------

        let verticalLabel = datasetConfig.UnitsAlias || datasetConfig.Units
        verticalLabel = datasetConfig.DatasetName + ' (' + verticalLabel + ')'

        // -------------------[ assemble horizontal label value ]--------------------

        let horizontalLabel = null
        if ((treeNodeData.NamingConfigRef) && (nodeDataseriesName != 'CommonObjects')) {
            let titleref = viewpointNamingConfigs[treeNodeData.NamingConfigRef]
            horizontalLabel = titleref.Contents.Alias || titleref.Contents.Name
        } else {
            let portaltitles = datasetConfig.DataseriesTitles
            horizontalLabel = portaltitles.CommonObjects
        }

        // ----------------------[ assemble chart title ]----------------------

        // set basic title
        let nodename = null
        if (treeNodeMetaData) {
            nodename = treeNodeMetaData.Name
        } else {
            nodename = datasetConfig.DatasetTitle
        }
        let configindex = treeNodeData.NamingConfigRef
        let catname = null
        if (configindex) {
            let names = viewpointNamingConfigs[configindex]
            let instancenames = names.Instance
            catname = instancenames.Alias || instancenames.Name
        } else {
            if (treeNodeMetaData && treeNodeMetaData.parentBudgetNode && treeNodeMetaData.parentBudgetNode.treeNodeData) {
                let parentconfigindex = treeNodeMetaData.parentBudgetNode.treeNodeData.NamingConfigRef
                if (parentconfigindex) {
                    let names = viewpointNamingConfigs[parentconfigindex]
                    if (names && names.Contents && names.Contents.DefaultInstance) {
                        catname = names.Contents.DefaultInstance.Name
                    }
                }
            } 
            if (!catname) {
                catname = '(** Unknown Category **)'
            }
        }
        let title = catname + ': ' + nodename

        // add yearspan to title
        let cellDeclaration = this.cellDeclaration
        let { rightYear, leftYear} = cellDeclaration.yearSelections
        let { yearScope } = cellDeclaration

        let timeSuffix: string = null
        if ( yearScope == TimeScope[TimeScope.OneYear] ) {
            timeSuffix = rightYear.toString()
        } else {
            let separator
            if (yearScope == TimeScope[TimeScope.TwoYears]) {
                separator = ':'
            } else { // must be AllYears
                separator = ' - '
            }
            timeSuffix = leftYear + separator + rightYear
        }
        timeSuffix = ', ' + timeSuffix
        title += timeSuffix

        // add title amount
        let titleamount = null

        // utility functions for number formatting
        let dollarformat = format({ prefix: "$" })
        let rounded = format({ round: 0, integerSeparator: '' })
        let simpleroundedone = format({ round: 1, integerSeparator: ',' })

        if (treeNodeData.years) {
            titleamount = treeNodeData.years[rightYear]
            if (unitRatio == 1) {
                titleamount = simpleroundedone(titleamount)
            } else {
                titleamount = parseInt(rounded(titleamount / unitRatio))
                if (units == 'DOLLAR') {
                    titleamount = dollarformat(titleamount)
                } else {
                    titleamount = simpleroundedone(titleamount)
                }
            }
        
            title += ' (Total: ' + titleamount + ')'
        }

        // ------------------------------[ assemble options ]--------------------------------

        let options = {
            animation:{
                startup: true,
                duration: 500,
                easing: 'out',
            },
            title,
            vAxis: { 
                title: verticalLabel, 
                minValue: 0, 
                textStyle: { 
                    fontSize: 8 
                } 
            },
            hAxis: { 
                title: horizontalLabel, 
                textStyle: { 
                    fontSize: 10 
                } 
            },
            bar: { 
                groupWidth: "95%" 
            },
            // width: children.length * 120,// 120 per column
            height: "400px",
            width: "400px",
        }

        let options_extension = 
            budgetCell._chartParmsOptions_chartTypeOptions(budgetCell.googleChartType)

        options = Object.assign(options, options_extension)

        return options
        
    }

    private _chartParmsOptions_chartTypeOptions = (googleChartType) => {

        let options = {}

        switch (googleChartType) {

            case "ColumnChart":
                options = {
                    legend: 'none',
                    chartArea: {
                        height: '50%',
                        top: '15%',
                        left: '25%',
                        width: '70%',
                    }
                }
                break
            
            case "PieChart":
                options = {
                    legend: {
                        position:"top",
                        textStyle: {
                            fontSize: 9,
                        },
                        maxLines: 4,
                    },
                    chartArea: {
                        height: '55%',
                        top: '30%',
                        left: 'auto',
                        width: 'auto',
                    }
                }
                break
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
                callback: (Chart, err) => {
                    let chart = Chart.chart
                    let selection = chart.getSelection()
                    let chartSelectionData: ChartSelectionContext = { 
                        selection, 
                        err 
                    }

                    budgetCell.selectionCallback(chartSelectionData)
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

        let cellDeclaration = this.cellDeclaration
        let { rightYear, leftYear} = cellDeclaration.yearSelections

        let budgetCell = this
        let categorylabel = 'Component' // placeholder

        let columns:any[] = [
            // type is required, else throws silent error
            { type: 'string', label: categorylabel },
            { type: 'number', label: rightYear.toString() },
            {type:'string', role:'style'}
        ]

        return columns

    }

    private _columns_PieChart = (yearSpecs:YearSpecs) => {

        let cellDeclaration = this.cellDeclaration
        let { rightYear, leftYear} = cellDeclaration.yearSelections

        let budgetCell = this
        let categorylabel = 'Component' // placeholder

        let columns:any[] = [
            // type is required, else throws silent error
            { type: 'string', label: categorylabel },
            { type: 'number', label: rightYear.toString() },
        ]

        return columns

    }

    // ------------------
    // 5. chart rows:
    // ------------------
    private _chartParmsRows = (treeNodeData, yearSpecs:YearSpecs) => {

        let budgetCell = this

        let cellDeclaration = this.cellDeclaration
        let { rightYear, leftYear} = cellDeclaration.yearSelections

        let { nodeDataseriesName } = budgetCell

        let nodeDataseries = treeNodeData[nodeDataseriesName]

        let sortedlistName = 'Sorted' + nodeDataseriesName

        let sortedDataseries = treeNodeData[sortedlistName]

        if (!sortedDataseries) {
            console.error( { 
                errorMessage:'sorted list "' + sortedlistName + '" not available'
            })
            throw Error('sorted list "' + sortedlistName + '" not available')
        }

        let rows = sortedDataseries.map((sortedItem:SortedComponentItem) => {
            // TODO: get determination of amount processing from Unit value
            let componentItem = nodeDataseries[sortedItem.Code]
            if (!componentItem) {
                console.error('System Error: component not found for (node, sortedlistName, nodeDataseries, item, item.Code) ',
                    treeNodeData, sortedlistName, nodeDataseries, sortedItem.Code, sortedItem)
                throw Error('componentItem not found')
            }
            let amount
            if (componentItem.years) {
                amount = componentItem.years[rightYear]
            } else {
                amount = null
            }

            let row = [sortedItem.Name, amount]

            let { googleChartType } = budgetCell
            // enhance row
            switch (googleChartType) {

                case "ColumnChart":
                    row = budgetCell._rows_ColumnCharts_row(row, componentItem)
                    break;
                
            }

            return row
        })

        return rows

    }

    _rows_ColumnCharts_row = (row, componentItem) => {

        let style = ''

        if (componentItem.Baseline) { //  == 'BASELINE') {
            style = 'stroke-color: Gold; stroke-width: 3'
        }

        row.push(style)

        return row

    }

}

export default BudgetCell