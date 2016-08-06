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
    dataNode: any,
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

    // -------------[ primary control properties, set on creation ]---------------

    private explorerChartCode: string
    nodeDataseriesName:string // the ref to the data to be presented
    chartSelection: ChartSelectionCell[] // returned by google chart; points to row selected by user
    uid: string // universal id; set by addCellDeclarations action

    // ------------[ derivative properties ]-------------------

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

    facetName: string
    cellTitle: string
    expandable: boolean
    graph_id: string // prop for Chart component; required by google charts

    viewpointConfigPack: viewpointConfigPack
    nodeDataPack: NodeData

    selectionCallback: Function

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

    // dataset is a data tree fetched from database
    // dataseries is a list of data rows attached to a node
    setChartParms = () => {

        let budgetCell: BudgetCell = this

        // --------------[ Unpack data bundles ]-------------

        let { 
            facetName:facet, 
            nodeDataseriesName,
            selectionCallback,
        } = budgetCell

        let { 
            viewpointConfig, 
            datasetConfig 
        } = budgetCell.viewpointConfigPack

        let { 
            dataNode, 
            timeSpecs:yearscope, 
            parentData, 
        } = budgetCell.nodeDataPack

        // ---------------------[ get data node components ]------------------
        // collect chart node and its components as data sources for the graph

        if (!dataNode) {
            console.error('node not found',
            {
                isError: true,
                errorMessage: 'node not found',
                chartParms: {}
            })
            throw Error('node not found')
        }

        let components = dataNode[nodeDataseriesName]

        // ====================[ COLLECT CHART PARMS ]======================
        // 1. chart type:
        let chartType = budgetCell.googleChartType

        // 2. chart options:


        // set vertical label value

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

        // ----------------- set title amount -------------

        let { rightYear:year } = yearscope
        let titleamount = null
        // utility functions for number formatting
        let thousandsformat = format({ prefix: "$" })
        let rounded = format({ round: 0, integerSeparator: '' })
        // let singlerounded = format({ round: 1, integerSeparator: '' })
        let staffrounded = format({ round: 1, integerSeparator: ',' })


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

        // TODO: watch for memory leaks when the chart is destroyed
        // 3. chart events:
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
                    if (selection.length == 0 && cell.chartSelection && cell.chartSelection.length > 0) {
                        if (cell.chart) {
                            cell.chart.setSelection(cell.chartSelection)
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
        ]

        let setStyle = false
        if (chartType == 'ColumnChart') {
            columns.push(
                {type:'string', role:'style'}
            )
            setStyle = true
        }

        // 5. chart rows:
        let sortedlist = 'Sorted' + nodeDataseriesName

        if (!dataNode[sortedlist]) {
            console.error( { 
                isError: true, 
                errorMessage:'sorted list "' + sortedlist + '" not available',
                chartParms: {} 
            })
            throw Error('sorted list "' + sortedlist + '" not available')
        }
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

            chartType,
            options,
            events,
            columns,
            rows,

        }

        // save it
        this._chartParms = chartParms

    }


}

export default BudgetCell