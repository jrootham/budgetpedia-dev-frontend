// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// budgetcell.tsx
/*
TODO: create DimensionNameLookups in aspect metadata for titles category names
    - currently using parent DimensionName directly
    - see 'add category' section of _setChartOptions
TODO: add inflation adjustment info in all chart titles

Title components:
- Node meta category
- Node cagegory
- YearsRange
- Total (for one year charts)
- Inflation adjustment

Vertical axis:
- Metric (qualifier)

Horizontal access:
- Dimension

Implement inheritance of YearScope, yearSelections, and ExplorerChartCode(s)

BUGS:

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
import { TimeScope, GoogleChartColors } from '../constants'
import {ColorBrightness} from '../modules/utilities'

var format = require('format-number')

// settings for individual portal chart
export interface CellSettings {
    graph_id: string,
    // expandable?: boolean,
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
    isInflationAdjusted: boolean,
}

export interface CellDeclaration {
    nodeDataseriesName:string, 
    // explorerChartCode:string, 
    chartConfigs:{
        ['OneYear']:{
            // chartSelection:ChartSelectionCell[],
            explorerChartCode: string,
        },
        ['TwoYears']:{
            // chartSelection:ChartSelectionCell[],
            explorerChartCode: string,
        },
        ['AllYears']:{
            // chartSelection:ChartSelectionCell[],
            explorerChartCode: string,
        },
    },
    chartSelection: number, // ChartSelectionCell[],
    yearScope: string,
    celluid?: string,
}

export interface CellConstructorArgs {
    nodeDataseriesName:string, 
    explorerChartCode:string, 
    chartSelection:number, // ChartSelectionCell[],
    uid: string,
}

export interface NodeData {
    treeNodeData: any,
    yearSpecs: YearSpecs,
    yearSelections: any,
    parentBudgetNode: any,
    budgetNode:any,
}

class BudgetCell {

    constructor(specs:CellConstructorArgs) {
        let { nodeDataseriesName, explorerChartCode, chartSelection, uid } = specs
        // this.explorerChartCode = explorerChartCode
        this.nodeDataseriesName = nodeDataseriesName
        // console.log('new BudgetCell', chartSelection)
        this.chartSelection = chartSelection
        this.uid = uid
    }
    public getState: Function

    get state() {
        return this.getState()
    }

    public getProps: Function

    public setState: Function

    // =======================[ PROPERTIES ]============================

    // -------------[ primary control properties, set on creation ]---------------

    get explorerChartCode() {
        let cellDeclaration:CellDeclaration = this.getProps().declarationData.cellsById[this.uid]
        let settings = cellDeclaration.chartConfigs[cellDeclaration.yearScope]
        return settings.explorerChartCode
    } 
    nodeDataseriesName:string // the ref to the data to be presented, typically Components or CommonDimension
    chartSelection: number = null// ChartSelectionCell[] // returned by google chart; points to row selected by user
    uid: string // universal id; set by addCellDeclarations action

    // ------------[ derivative control properties ]-------------------

    // map from internal code to googleChartType
    get googleChartType() {
        return ChartCodeToGoogleChartType[this.explorerChartCode]
    }

    // TODO: untangle this sequencing mess!!
    get cellDeclaration() {
        return this.getProps().declarationData.cellsById[this.uid]
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

    chartParmsObject: any
    // readonly; set by setChartParms()
    // the formal parameters required by Chart Component for google chart creation
    // private _chartParms: ChartParms
    get chartParms() : ChartParms {
        return this.getState().chartParms
    }

    // ----------------[ mutable control properties ]-----------------

    aspectName: string
    viewpointConfigPack: viewpointConfigPack
    nodeDataPack: NodeData
    // expandable: boolean

    // ------------------[ display chart properties ]-------------------

    cellTitle: string
    graph_id: string // prop for Chart component; required by google charts

    // ------------------[ callback functions ]------------------------

    // curried; inherited
    selectionCallback: Function

    // ========================[ METHODS ]==========================

    refreshSelection = () => {

        let budgetCell = this
        // console.log('inside refreshSelection', budgetCell.chartSelection, budgetCell.googleChartType)
        if (budgetCell.chartSelection !== null) {
            // it turns out that "PieChart" needs column set to null
            // for setSelection to work
            // if (budgetCell.chartSelection[0] && budgetCell.chart && budgetCell.chart.getSelection().length == 0) {
            let cs
            if (budgetCell.chart) cs = budgetCell.chart.getSelection()
            // console.log('budgetCell.chart.getSelection()', cs)
            if (budgetCell.chart && budgetCell.chart.getSelection().length == 0) {
                let selectionObj = {row:null, column:null}
                let chartSelection = [selectionObj]
                switch (budgetCell.googleChartType) {
                    case "PieChart":
                        selectionObj.row = budgetCell.chartSelection
                        break;
                    case "ColumnChart":
                        selectionObj.row = budgetCell.chartSelection
                        selectionObj.column = 1
                        break;
                    case "LineChart":
                    case "AreaChart":
                        selectionObj.column = budgetCell.chartSelection + 1
                        break
                    default:
                        console.log('ERROR: default invoked in refreshSelection')
                        // code...
                        break;
                }
                // console.log('setting selection with ', chartSelection)
                // if (budgetCell.googleChartType == "PieChart" ) {
                //     budgetCell.chartSelection[0].column = null
                // } else {
                //     // we set it back to original (presumed) for consistency
                //     budgetCell.chartSelection[0].column = 1
                // }
                budgetCell.chart.setSelection(chartSelection)
            }
        }        
    }

    // TODO: remove parameter, apparently not needed
    switchChartCode = chartCode => {

        this.setChartParms()

    }

    // TODO: remove parameter, apparently not needed
    switchYearCodes = yearCodes => {
        this.setChartParms()
    }

    // TODO: remove parameter, apparently not needed
    switchYearScope = () => {
        this.setChartParms()
    }

    // ----------------------[ setChartParms ]-------------------------

    // creates formal input parameters for google charts, through Chart Component
    // dataset is a data tree fetched from database
    // dataseries is a list of data rows attached to a node
    setChartParms = () => {

        // let err = new Error()
        let budgetCell: BudgetCell = this

        // --------------[ Unpack data bundles ]-------------

        let { 
            viewpointNamingConfigs, 
            datasetConfig,
            isInflationAdjusted, 
        } = budgetCell.viewpointConfigPack

        let { 
            treeNodeData, 
            yearSpecs, 
            // treeNodeMetaDataFromParentSortedList, 
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

        let columns = budgetCell._chartParmsColumns(yearSpecs, treeNodeData)

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

        this.chartParmsObject = chartParms

        // save it
        this.setState({
             chartParms,
        })
    }

    // ------------------
    // 2. chart options:
    // ------------------
    private _chartParmsOptions = (
        treeNodeData, 
        // treeNodeMetaDataFromParentSortedList, 
        viewpointNamingConfigs, 
        datasetConfig:DatasetConfig, 
        yearSpecs:YearSpecs
    ) => {

        // ----------------------[ assemble support variables ]-------------------

        let budgetCell = this

        let { aspectName, nodeDataseriesName } = budgetCell

        let datasetName = AspectNameToDatasetName[aspectName]
        let units = datasetConfig.Units
        // let unitRatio = datasetConfig.UnitRatio

        // --------------------[ assemble vertical label value ]--------------------

        let verticalLabel = datasetConfig.UnitsAlias || datasetConfig.Units
        verticalLabel = datasetConfig.DatasetName + ' (' + verticalLabel + ')'

        // -------------------[ assemble horizontal label value ]--------------------

        let horizontalLabel = null
        if ((treeNodeData.NamingConfigRef) && (nodeDataseriesName != 'CommonDimension')) {

            let titleref = viewpointNamingConfigs[treeNodeData.NamingConfigRef]
            horizontalLabel = titleref.Contents.Alias || titleref.Contents.Name

        } else {

            if (nodeDataseriesName == 'CommonDimension') {
                // let contentdimensionname = 
                //         treeNodeData.CommonDimensionName
                let contentdimensionname = datasetConfig.CommonDimension
                let names = datasetConfig.DimensionNames

                horizontalLabel = names[contentdimensionname].Collection
                // let portaltitles = datasetConfig.CellTitles
                // horizontalLabel = portaltitles[nodeDataseriesName]
            } else {
                let contentdimensionname = 
                        treeNodeData.ComponentsDimensionName

                let names = datasetConfig.DimensionNames
                horizontalLabel = names[contentdimensionname].Collection
            }

        }

        // ----------------------[ assemble chart title ]----------------------

        // set basic title
        let nodename = null
        if (treeNodeData.Name) { // MetaDataFromParentSortedList) {
            nodename = treeNodeData.Name// treeNodeMetaDataFromParentSortedList.Name
        } else {
            nodename = datasetConfig.DatasetTitle
        }
        // add category name
        let configindex = treeNodeData.NamingConfigRef
        let catname = null
        if (configindex) { // viewpoint node
            let names = viewpointNamingConfigs[configindex]
            let instancenames = names.Instance
            catname = instancenames.Alias || instancenames.Name
        } else { // sub-baseline dataset node
            let { nodeDataPack } = this
            if (nodeDataPack.parentBudgetNode && 
                nodeDataPack.parentBudgetNode.treeNodeData) {
                let {parentBudgetNode} = nodeDataPack
                let parentconfigindex = parentBudgetNode.treeNodeData.NamingConfigRef
                // first level below depends in parentconfigindex
                if (parentconfigindex) {
                    let names = viewpointNamingConfigs[parentconfigindex]
                    if (names && names.Contents && names.Contents.DefaultInstance) {
                        catname = names.Contents.DefaultInstance.Name
                    }
                // lower levels depend on dimension category names.
                // TODO: these should be looked up in datasetConfig
                } else {
                    let nameindex = nodeDataseriesName 
                    if (nameindex = 'Components') {
                        nameindex += 'DimensionName'
                    } else if (name = 'CommonDimension') {
                        nameindex += 'Name'
                    } else {
                        console.error('nodeDataseriesName not found for ', this)
                    }
                    let dimensionname = parentBudgetNode.treeNodeData[nameindex]                    
                    catname = datasetConfig.DimensionNames[dimensionname].Instance
                }
            } 
            if (!catname) {
                catname = '(** Unknown Category **)'
            }
        }
        let title = catname + ': ' + nodename

        // add yearspan to title
        let cellDeclaration = this.cellDeclaration
        let { rightYear, leftYear} = this.nodeDataPack.yearSelections
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
        if (yearScope == TimeScope[TimeScope.OneYear]) {
            let titleamount = null

            // utility functions for number formatting
            let dollarformat = format({ prefix: "$" })
            let rounded = format({ round: 0, integerSeparator: '' })
            let simpleroundedone = format({ round: 1, integerSeparator: ',' })

            if (treeNodeData.years) {
                titleamount = treeNodeData.years[rightYear]
                if (units == 'DOLLAR') {
                    titleamount = dollarformat(titleamount)
                } else {
                    titleamount = simpleroundedone(titleamount)
                }
                if (!titleamount) titleamount = 'nil'
                title += ' (Total: ' + titleamount + ')'
            }
        }

        // add inflation adjustment indicator if appropriate
        if (datasetConfig.InflationAdjustable) {
            if (!(yearScope == TimeScope[TimeScope.OneYear] && 
                datasetConfig.InflationReferenceYear <= rightYear)) {
                let isInflationAdjusted = this.viewpointConfigPack.isInflationAdjusted

                let fragment
                if (!isInflationAdjusted) {
                    fragment = ' -- nominal $'
                } else {
                    fragment = ` -- inflation adjusted to ${datasetConfig.InflationReferenceYear} $`
                }
                title += fragment
            }
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
            budgetCell._chartParmsOptions_chartTypeOptions(budgetCell.googleChartType, treeNodeData)

        options = Object.assign(options, options_extension)

        return options
        
    }

    private _chartParmsOptions_chartTypeOptions = (googleChartType, treeNodeData) => {

        let options

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
            
            case "PieChart": {
                options = this._pieChartOptions(treeNodeData)
                break
            }
            case "AreaChart": {
                options = {
                    isStacked:true,
                }
                if (this.explorerChartCode == "Proportional") {
                    options.isStacked = 'percent'
                }
            }
            case "LineChart": {
                if (!options) options = {}
                options.legend = {
                    position:"top",
                    textStyle: {
                        fontSize: 9,
                    },
                    maxLines: 4,
                }
                options.chartArea = {
                    height: '55%',
                    top: '30%',
                    left: 'auto',
                    width: 'auto',
                }
                break
            }
            default: {
                options = {}
            }

        }

        return options

    }

    private _pieChartOptions = (treeNodeData) => {
        // add a color differentiator for non-drilldown items
        // see utilities.ColorLuminance
        // for now silver and and offset value is set for slices which cannot expand
        // TODO: create a better visual cue for non-expanadable items
        let budgetCell = this

        let cellDeclaration = this.cellDeclaration
        let { rightYear, leftYear} = this.nodeDataPack.yearSelections

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

        let sliceslist = sortedDataseries.map((sortedItem:SortedComponentItem) => {
            let componentItem = nodeDataseries[sortedItem.Code]
            if (!componentItem) {
                console.error('System Error: component not found for (node, sortedlistName, nodeDataseries, item, item.Code) ',
                    treeNodeData, sortedlistName, nodeDataseries, sortedItem.Code, sortedItem)
                throw Error('componentItem not found')
            }
            let offset = (!(componentItem.Components || componentItem.CommonDimension))?0.2:0
            return offset
        })
        let slices = {}
        for (let index in sliceslist) {
            slices[index] = {offset:sliceslist[index]}
            if ((slices[index].offset) != 0) {
  
                slices[index].color = ColorBrightness(GoogleChartColors[index],120)
                slices[index].offset = 0 // I changed my mind about having an offset; now just a proxy for no drilldown

            }
        }
        let options = {
            slices,
            pieHole:0.4,
            // is3D: true,
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
                    if (selection.length == 0 && cell.chartSelection !== null) { 
                    // if (selection.length == 0 && cell.chartSelection && cell.chartSelection !== null) { 
                        if (cell.chart) {
                            cell.refreshSelection()
                            // cell.chart.setSelection(cell.chartSelection)
                        }
                    }
                })(budgetCell)
            }
        ]
    }

    // ------------------
    // 4. chart columns:
    // ------------------
    private _chartParmsColumns = (yearSpecs:YearSpecs, treeNodeData) => {
        let budgetCell = this

        let { googleChartType } = budgetCell

        switch (googleChartType) {
            case "ColumnChart":
                return this._columns_ColumnChart(yearSpecs)
            
            case "PieChart":
                return this._columns_PieChart(yearSpecs)

            case 'LineChart':
            case 'AreaChart':
                return this._columns_LineChart(treeNodeData)

            default:
                return null
        }
    }

    private _columns_LineChart = (treeNodeData) => {

        let cellDeclaration = this.cellDeclaration
        let { rightYear, leftYear} = this.nodeDataPack.yearSelections

        let budgetCell = this

        let columns:any[] = [
            // type is required, else throws silent error
            { type: 'string', label: 'Year' },
        ]

        let chartDimensionType = this.nodeDataseriesName

        let listName = 'Sorted' + chartDimensionType

        let list = treeNodeData[listName]

        for (let listindex in list) {
            columns.push({type:'number',label:list[listindex].Name})
        }

        return columns

    }

    private _columns_ColumnChart = (yearSpecs:YearSpecs) => {

        let cellDeclaration = this.cellDeclaration
        let { rightYear, leftYear} = this.nodeDataPack.yearSelections

        let budgetCell = this
        let categorylabel = 'Component' // placeholder

        let columns:any[] = [
            // type is required, else throws silent error
            { type: 'string', label: categorylabel },
            { type: 'number', label: rightYear.toString() },
            { type:'string', role:'style'}
        ]

        return columns

    }

    private _columns_PieChart = (yearSpecs:YearSpecs) => {

        let cellDeclaration = this.cellDeclaration
        let { rightYear, leftYear} = this.nodeDataPack.yearSelections

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
        let { rightYear, leftYear} = this.nodeDataPack.yearSelections

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

        switch (budgetCell.googleChartType) {
            case "PieChart":
            case "ColumnChart": {
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
            case "LineChart":
            case "AreaChart":
                return this._LineChartRows(treeNodeData, sortedDataseries, yearSpecs)

        }
    }

    private _LineChartRows = (treeNodeData, sortedDataSeries, yearSpecs) => {

        let rows = []

        let { rightYear, leftYear} = this.nodeDataPack.yearSelections
        for (let year = leftYear; year <= rightYear; year++) {
            let items = sortedDataSeries.map((sortedItem:SortedComponentItem) => {
                let amount = null
                let years = treeNodeData[this.nodeDataseriesName][sortedItem.Code].years
                if (years && years[year]!== undefined) {
                    amount = years[year]
                }
                return amount
            })
            let row = [year.toString(),...items]
            rows.push(row)
        }
        return rows
    }

    private _rows_ColumnCharts_row = (row, componentItem) => {

        let style = ''

        if (componentItem.Baseline) {
            style = 'stroke-color: Gold; stroke-width: 3;'
        }
        if (!(componentItem.Components || componentItem.CommonDimension)) {
            style += 'fill-opacity: 0.5'
        }

        row.push(style)

        return row

    }

}

export default BudgetCell