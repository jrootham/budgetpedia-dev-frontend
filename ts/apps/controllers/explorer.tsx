// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// explorer.tsx
/// <reference path="../../../typings-custom/react-google-charts.d.ts" />
/// <reference path="../../../typings-custom/react-slider.d.ts" />

'use strict'
import * as React from 'react'
var { Component } = React
// doesn't require .d.ts...! (reference available in index.tsx)
var format = require('format-number')
import { connect as injectStore} from 'react-redux'
import Card = require('material-ui/lib/card/card')
import CardTitle = require('material-ui/lib/card/card-title')
import CardText = require('material-ui/lib/card/card-text')
import RadioButton = require('material-ui/lib/radio-button')
import RadioButtonGroup = require('material-ui/lib/radio-button-group')
import FontIcon = require('material-ui/lib/font-icon')
import IconButton = require('material-ui/lib/icon-button')
import Divider = require('material-ui/lib/divider')
import Checkbox = require('material-ui/lib/checkbox')
import RaisedButton = require('material-ui/lib/raised-button')
import ReactSlider = require('react-slider')

import { ExplorerChart } from '../components/explorerchart'
import { ChartSeries } from '../constants'

// import { categoryaliases } from '../constants'

interface ChartConfig {
    name?: string,
    viewpoint:string,
    dataseries:string,
    matrixlocation: {
        row: number,
        column: number,
    },
    chartselection?: any[],
    chart?:any,
    datapath: string[],
    parentdata?:any,
    yearscope: {
        latestyear: number,
        earliestyear: number,
        fullrange: boolean,
    },
    charttype?:string,
    chartparms?:{
        chartType?: string,
        options?:{
            [ index: string ]: any,
        },
        events?:{
            [ index: string ]: any,
        }[]
        rows?: any[],
        columns?: any[],
    },
    isError?: boolean
}

interface ChartParms {
    chartType?: string,
    options?: {
        [indes:string]:any
    },
    rows?: any[],
    columns?: any[],
    events?: any[],
}

interface ChartParmsObj {
    isError: Boolean,
    chartParms?:ChartParms,
}

interface ComponentSummaries {
    years?: any,
    Aggregates?: any,
}

interface ChartSelectionContext {
    chartconfig:ChartConfig, 
    chart:any, 
    selection:any[], 
    err:any,
}

class ExplorerClass extends Component< any, any > {

    // ---------------------[ INITIALIZE ]--------------------------------

    constructor(props) {
        super(props);
    }

    // TODO: these values should be in global state to allow for re-creation after return visit
    // TODO: Take state initialization from external source
    // charts exist in a matrix (row/column) which contain a chartconfig object
    state = {
        chartmatrix: [ [], [] ], // DrillDown, Compare (Later: Differences, Context, Build)
        datafacet:"expenses",
        yearslider: {singlevalue:[2015],doublevalue:[2005,2015]},
        yearscope:"one",
        userselections:{
            latestyear:2015,
            viewpoint:"FUNCTIONAL",
            dataseries:"BudgetExpenses",
            charttype: "ColumnChart",
            inflationadjusted:true,
        }
    }
    
    // initialize once - create root drilldown and compare series
    componentDidMount = () => {

        this.initializeChartSeries()

    }

    initializeChartSeries = () => {
        let userselections = this.state.userselections,
            chartmatrix = this.state.chartmatrix

        var matrixlocation,
            chartParmsObj

        // ------------------------[ POPULATE VIEWPOINT WITH VALUES ]-----------------------

        this.setViewpointAmounts()

        // -----------------[ THE DRILLDOWN ROOT ]-----------------

        // assemble parms to get initial dataset
        let drilldownchartconfig: ChartConfig =
            this.initRootChartConfig(ChartSeries.DrillDown, userselections)

        chartParmsObj = this.getChartParms(drilldownchartconfig)

        if (!chartParmsObj.error) {

            drilldownchartconfig.chartparms = chartParmsObj.chartParms

            matrixlocation = drilldownchartconfig.matrixlocation
            chartmatrix[matrixlocation.row][matrixlocation.column] = drilldownchartconfig

        }

        // -----------------[ THE COMPARE ROOT ]-------------------
        /*
                // assemble parms to get initial dataset
                let comparechartconfig: ChartConfig = this.initRootChartConfig( ChartSeries.Compare, userselections )
        
                chartParmsObj = this.getChartParms( comparechartconfig )
        
                if (!chartParmsObj.error) {
        
                    comparechartconfig.chartparms = chartParmsObj.chartParms
        
                    matrixlocation = comparechartconfig.matrixlocation
                    chartmatrix[ matrixlocation.row ][ matrixlocation.column ] = comparechartconfig
        
                }
        */
        // -------------[ SAVE INITIALIZATION ]----------------

        // make initial dataset available to chart
        this.setState({
            chartmatrix,
        });

    }

    // =====================================================================================
    // -----------------------[ CHART CREATION UTILITIES ]----------------------------------

    // -------------------[ SET VIEWPOINT HIERARCHY NODE AMOUNTS ]-----------

    // starts with hash of components, 
    // recursively descends to BASELINE items, then leaves 
    // summaries by year, and Aggregates by year on ascent
    setViewpointAmounts = () => {
        let viewpointname = this.state.userselections.viewpoint
        let dataseriesname = this.state.userselections.dataseries
        let budgetdata = this.props.budgetdata
        let viewpoint = budgetdata.Viewpoints[viewpointname]

        // already done if currentdataseries matches request
        if (viewpoint.currentdataseries == dataseriesname)
            return

        let itemseries = budgetdata.DataSeries[dataseriesname]

        let baselinecat = itemseries.Baseline // use for system lookups
        let baselinelookups = budgetdata.Lookups[baselinecat]
        let componentcat = itemseries.Components
        let componentlookups = budgetdata.Lookups[componentcat]
        let categorylookups = viewpoint.Lookups.Categories

        let lookups = {
            baselinelookups,
            componentlookups,
            categorylookups,
        }

        let items = itemseries.Items

        let isInflationAdjusted = !!itemseries.InflationAdjusted

        let rootcomponent = {"ROOT":viewpoint}

        // set years, and Aggregates by years
        // initiates recursion
        this.setComponentSummaries(rootcomponent, items, isInflationAdjusted,
            lookups)

        // create sentinel to prevent unnucessary processing
        viewpoint.currentdataseries = dataseriesname

        // let text = JSON.stringify(viewpoint, null, 4) + '\n'

    }

    // this is recursive, with "BASELINE" component at the leaf,
    // or with absence of Components property at leaf
    setComponentSummaries = (components, items, isInflationAdjusted,
        lookups):ComponentSummaries => {
        // cumulate summaries for this level
        let cumulatingSummaries:ComponentSummaries = {
            years:{},
            Aggregates:{},
        }

        // for every component at this level
        for ( let componentname in components ) {

            // isolate the component...
            let component = components[componentname]

            let componentSummaries = null

            // remove any previous aggregations...
            if (component.years) delete component.years
            if (component.Aggregates) delete component.Aggregates

            // for non-baseline items, recurse to collect aggregations
            if (component.Contents != "BASELINE") {

                // if no components found, loop
                if (component.Components) {

                    // if (!component.SortedComponents) {
                        let sorted = this.getIndexSortedComponents(
                            component.Components,lookups)
    
                        component.SortedComponents = sorted
                    // }

                    // get child component summaries recursively
                    componentSummaries = this.setComponentSummaries(
                        component.Components, items, isInflationAdjusted,
                        lookups)

                    // capture data for chart-making
                    if (componentSummaries.years)
                        component.years = componentSummaries.years
                    if (componentSummaries.Aggregates) {
                        component.Aggregates = componentSummaries.Aggregates
                        if (component.Aggregates) {// && !component.SortedAggregates) {
                            let sorted = this.getNameSortedComponents(
                                component.Aggregates, lookups)

                            component.SortedAggregates = sorted
                        }

                    }

                }

            // for baseline items, fetch the baseline amounts from the dataseries itemlist
            } else {

                // fetch the data from the dataseries itemlist
                let item = items[componentname]
                if (!item) console.error('failed to find item for ',componentname)
                // first set componentSummaries as usual
                if (isInflationAdjusted) {
                    if (this.state.userselections.inflationadjusted) {
                        if (item.Adjusted){
                            componentSummaries = {
                                years: item.Adjusted.years,
                                Aggregates: item.Adjusted.Components,
                            }
                        }
                    } else {
                        if (item.Nominal) {
                            componentSummaries = {
                                years: item.Nominal.years,
                                Aggregates: item.Nominal.Components,
                            }
                        }
                    }

                } else {
                    componentSummaries = { 
                        years: item.years, 
                        Aggregates: item.Components, 
                    }
                }
                // capture data for chart-making
                if (componentSummaries) {
                    if (componentSummaries.years) {
                        component.years = componentSummaries.years
                    }
                    if (componentSummaries.Aggregates) {
                        component.Components = componentSummaries.Aggregates
                    }
                }
                if (component.Components) { // && !component.SortedComponents) {
                    let sorted = this.getNameSortedComponents(
                        component.Components, lookups)

                    component.SortedComponents = sorted
                }

            }

            // aggregate the collected summaries for the caller
            if (componentSummaries) {
                this.aggregateComponentSummaries(cumulatingSummaries, componentSummaries)
            }
        }

        return cumulatingSummaries
    }

    // -----------------------[ RETURN SORTED COMPONENT LIST ]------------------------

    getIndexSortedComponents = (components, lookups) => {
        let sorted = []
        let catlookups = lookups.categorylookups
        for (let componentname in components) {
            let component = components[componentname]
            let config = component.Contents
            let name = (config == 'BASELINE')
                ? lookups.baselinelookups[componentname]
                : catlookups[componentname]
            let item = {
                Code: componentname,
                Index: component.Index,
                Name: name || 'unknown name'
            }
            sorted.push(item)
        }
        sorted.sort( (a,b) => {
            let value
            if (a.Index < b.Index )
                value = -1
            else if (a.Index > b.Index)
                value = 1
            else 
                value = 0
            return value
        })

        return sorted

    }

    getNameSortedComponents = (components, lookups) => {
        let sorted = []
        let complookups = lookups.componentlookups
        for (let componentname in components) {
            let component = components[componentname]
            let config = component.Contents
            let name = complookups[componentname]
            let item = {
                Code: componentname,
                Name: name || 'unknown name'
            }
            sorted.push(item)
        }
        sorted.sort((a, b) => {
            let value
            if (a.Name < b.Name)
                value = -1
            else if (a.Name > b.Name)
                value = 1
            else
                value = 0
            return value
        })

        return sorted

    }

    // -----------------------[ SUMMARIZE COMPONENT DATA ]-----------------------

    // summarize the componentSummaries into the cumumlatingSummaries

    aggregateComponentSummaries = (
        cumulatingSummaries:ComponentSummaries, 
        componentSummaries:ComponentSummaries) => {

        // if years have been collected, add them to the total
        if (componentSummaries.years) {

            let years = componentSummaries.years

            // for each year...
            for (let yearname in years) {

                let yearvalue = years[yearname]

                // accumulate the value...
                if (cumulatingSummaries.years[yearname])
                    cumulatingSummaries.years[yearname] += yearvalue
                else
                    cumulatingSummaries.years[yearname] = yearvalue
            }
        }

        // if Aggregates have been collected, add them to the totals
        if (componentSummaries.Aggregates) {

            let Aggregates = componentSummaries.Aggregates

            // for each aggreate...
            for (let aggregatename in Aggregates) {

                let Aggregate = Aggregates[aggregatename]

                // for each aggregate year...
                // collect year values for the Aggregates if they exist
                if (Aggregate.years) {

                    let years = Aggregate.years

                    for (let yearname in years) {

                        // accumulate the year value...
                        let yearvalue = years[yearname]
                        let cumulatingAggregate = 
                            cumulatingSummaries.Aggregates[aggregatename] || {years:{}}

                        if (cumulatingAggregate.years[yearname])
                            cumulatingAggregate.years[yearname] += yearvalue
                        else
                            cumulatingAggregate.years[yearname] = yearvalue

                        // re-assemble
                        cumulatingSummaries.Aggregates[aggregatename] = cumulatingAggregate
                    }

                }
            }
        }
    }

    // -------------------[ INITIALIZE ROOT CHART CONFIG ]--------------------

    initRootChartConfig = ( matrixrow, userselections ): ChartConfig => {
        return {
            viewpoint:userselections.viewpoint,
            dataseries:userselections.dataseries,
            datapath: [], // get data from root viewpoint object
            matrixlocation: {
                row:matrixrow,
                column: 0
            },
            yearscope: {
                latestyear: userselections.latestyear,
                earliestyear: null,
                fullrange: false,
            },
            charttype: userselections.charttype
        }

    }

    // ------------------[ GET CHART PARMS ]--------------------------
    // return chartType, columns, rows, options, and events

    // returns chartParmsObj.isError = true if fails
    // returns inputs required for a chart, based on Chart Configuration

    // TODO: handle yearscope, including multiple years

    getChartParms = (chartConfig: ChartConfig) => {

        // -------------------[ INIT VARS ]---------------------

        // unpack chartConfig & derivatives
        let viewpointindex = chartConfig.viewpoint,
            path = chartConfig.datapath,
            yearscope = chartConfig.yearscope,
            year = yearscope.latestyear

        // unpack userselections
        let userselections = this.state.userselections,
            dataseriesname = userselections.dataseries

        // unpack budgetdata
        let budgetdata = this.props.budgetdata,
            viewpointdata = budgetdata.Viewpoints[viewpointindex],
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
        let singlerounded = format({round :1, integerSeparator:'' })
        let staffrounded = format({ round: 1, integerSeparator: ',' })

        // -----------------------[ GET CHART NODE AND COMPONENTS ]-----------------------

        // collect chart node and its components as data sources for the graph
        let { node, components } = this.getNodeDatasets(viewpointindex, path )

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

        let titleamount = node.years[year]
        if (units == 'DOLLAR') {
            titleamount = parseInt(rounded(titleamount / 1000))
            titleamount = thousandsformat(titleamount)
        } else {
            titleamount = staffrounded(titleamount)
        }
        title += ' (Total: ' + titleamount + ')'

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
            legend:'none',
            annotations: { alwaysOutside: true }
        }

        // TODO: watch for memory leaks when the chart is destroyed
        // TODO: replace chartconfig with matrix co-ordinates to avoid
        //     need to update chart by destroying chart (thus closure) before replacing it
        // 3. chart events:
        let events = [
            {
                eventName: 'select',
                callback: ((chartconfig: ChartConfig) => {

                    let self = this
                    return (Chart, err) => {
                        let chart = Chart.chart
                        let selection = chart.getSelection()
                        let context: ChartSelectionContext = { chartconfig, chart, selection, err }

                        self.onChartsSelection(context)
                    }
                })(chartConfig)
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
            return { isError: true, chartParms:{} }
        }
        let rows = node.SortedComponents.map(item => {
            // TODO: get determination of amount processing from Unit value
            let amount = components[item.Code].years[year]
            let annotation
            if (units == 'DOLLAR') {
                amount = parseInt(rounded(amount/1000))
                annotation = thousandsformat(amount)
            } else if (units == 'FTE') {
                annotation = staffrounded(amount)
                amount = parseInt(singlerounded(amount))
            } else {
                amount = components[item.Code].years[year]
                annotation = amount
            }
            // TODO: add % of total to the annotation
            return [item.Name, amount, annotation]            
        })

        // --------------------[ ASSEMBLE PARMS PACK ]----------------

        let chartParms:ChartParms = {

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

    // --------------------[ GET CHART DATA NODES ]----------------------------

    getNodeDatasets = ( viewpointindex, path ) => {

        let budgetdata = this.props.budgetdata

        let node = budgetdata.Viewpoints[viewpointindex]

        let components = node.Components

        for (let index of path) {

            node = components[index]

            if (!node) console.error('component node not found',components,viewpointindex,path)

            components = node.Components
        }

        return { node, components }
    }

    // ------------------------[ UPDATE CHART BY SELECTION ]-----------------

    // response to user selection of a chart component (such as a column )
    // called by chart callback
    // TODO: the context object should include matrix location of 
    // chartconfig, not the chartconfig itself
    onChartsSelection = (context:ChartSelectionContext) => {

        // user selections
        let userselections = this.state.userselections

        // unpack context
        let selection = context.selection[0]

        let selectionrow
        if (selection) {
            selectionrow = selection.row
        } else {
            selectionrow = null
        }

        let chart = context.chart

        // unpack chartconfig
        let chartconfig = context.chartconfig,
            selectmatrixlocation = chartconfig.matrixlocation


        // unpack location
        let matrixrow = selectmatrixlocation.row,
            matrixcolumn = selectmatrixlocation.column

        // acquire serieslist from matrix
        let chartmatrix = this.state.chartmatrix,
            serieslist = chartmatrix[matrixrow]

        // get taxonomy references
        let viewpoint = chartconfig.viewpoint,
            dataseries = chartconfig.dataseries

        // TODO: abandon here if the next one exists and is the same
        serieslist.splice(matrixcolumn + 1) // remove subsequent charts

        // trigger update to avoid google charts use of cached versions for new charts
        // cached versions keep obsolete chart titles, and closures,
        // even if new title fed in through new options
        this.setState({
            chartmatrix,
        });

        if (!selection) { // deselected
            delete chartconfig.chartselection
            delete chartconfig.chart
            this.updateSelections(chartmatrix, matrixrow)
            return
        }
        // let chartconfig:ChartConfig = context.chartconfig // chartmatrix[matrixrow][matrixcolumn]
        // copy path
        let childdataroot = chartconfig.datapath.slice()

        let { node, components } = this.getNodeDatasets(
            userselections.viewpoint, childdataroot)

        if (!node.Components) {
            this.updateSelections(chartmatrix, matrixrow)
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
            this.updateSelections(chartmatrix, matrixrow)
            return
        }

        let newnode = node.Components[code]
        if (!newnode.Components) {
            this.updateSelections(chartmatrix, matrixrow)
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
            charttype:userselections.charttype,
        }

        let chartParmsObj = this.getChartParms(newchartconfig)

        if (chartParmsObj.isError) {
            this.updateSelections(chartmatrix, matrixrow)
            return
        }

        newchartconfig.chartparms = chartParmsObj.chartParms

        let newmatrixcolumn = matrixcolumn + 1
        chartmatrix[matrixrow][newmatrixcolumn] = newchartconfig

        this.setState({
            chartmatrix,
        })

        chartconfig.chartselection = context.selection,
        chartconfig.chart = chart

        this.updateSelections(chartmatrix,matrixrow)

    }

    // update the visual cue for selection that led to user array of graphs
    updateSelections = (chartmatrix,matrixrow) => {
        for (let config of chartmatrix[matrixrow]) {
            let chart = config.chart
            let selection = config.chartselection
            if (chart)
                chart.setSelection(selection)
        }
    }

    // ---------------------[ CONTROL ACTIONS ]------------------

    switchViewpoint = viewpointname => {

        let userselections = this.state.userselections
        userselections.viewpoint = viewpointname
        let chartmatrix = [[], []]
        this.setState({
            userselections,
            chartmatrix,
        })
        let self = this
        // defer initialization until after update 
        // triggered by setState, to make sure previous
        // chart is destroyed; otherwise previous viewpoint 
        // settings are retuained in error
        setTimeout(() => {
            self.initializeChartSeries()
        })

    }

    switchDataSeries = seriesname => {

        let userselections = this.state.userselections
        userselections.dataseries = seriesname
        let chartmatrix = this.state.chartmatrix
        this.setState({
            userselections,
            // chartmatrix:[[],[]]
        })
        this.setViewpointAmounts()
        for (let matrixseries of chartmatrix) {
            let cellconfig:ChartConfig
            for ( cellconfig of matrixseries ) {
                let chartParmsObj = this.getChartParms(cellconfig)
                cellconfig.chartparms = chartParmsObj.chartParms
                cellconfig.dataseries = seriesname
            }
        }
        setTimeout(() => {
            this.setState({
                chartmatrix,
            })
            for (let row = 0; row < chartmatrix.length; row++) {
                this.updateSelections(chartmatrix, row)
            }
        })
    }

    // -------------------[ RENDER METHODS ]---------------------

    // get React components to render
    getCharts = (matrixcolumn, matrixrow) => {

        let charts = matrixcolumn.map((chartconfig, index) => {

            let chartparms = chartconfig.chartparms

            return <ExplorerChart
                key = {index}
                chartType = {chartparms.chartType}
                options = { chartparms.options }
                chartEvents = {chartparms.events}
                rows = {chartparms.rows}
                columns = {chartparms.columns}
                // used to create html element id attribute
                graph_id = {"ChartID" + matrixrow + '' + index}
                />
        })

        return charts

    }

    // ===================================================================
    // ---------------------------[ RENDER ]------------------------------ 

    render() {

        let explorer = this

        // -----------[ DASHBOARD SEGMENT]-------------

        let singleslider = (explorer.state.yearscope == 'one')?
            <ReactSlider 
                className="horizontal-slider" 
                defaultValue={explorer.state.yearslider.singlevalue} 
                min={ 2003 } 
                max={ 2016 } 
                onChange = {(value) => {
                    explorer.setState({
                        yearslider: Object.assign(explorer.state.yearslider, { 
                            singlevalue: [value] 
                        })
                    })
                }}>
                <div >{explorer.state.yearslider.singlevalue[0]}</div>
            </ReactSlider > :''

        let doubleslider = (explorer.state.yearscope != 'one') ?
            <ReactSlider
                className="horizontal-slider"
                defaultValue={explorer.state.yearslider.doublevalue}
                min={ 2003 }
                max={ 2016 }
                withBars={(explorer.state.yearscope == 'all') ? true : false}
                onChange = {(value) => {
                    explorer.setState({
                        yearslider: Object.assign(explorer.state.yearslider,{ 
                            doublevalue: value 
                        })
                    })
                } }>
                <div >{explorer.state.yearslider.doublevalue[0]}</div>
                <div >{explorer.state.yearslider.doublevalue[1]}</div>
            </ReactSlider>:''

        let dashboardsegment = <Card initiallyExpanded={false}>

            <CardTitle
                actAsExpander
                showExpandableButton >
                Dashboard
            </CardTitle>
            <CardText expandable >
                <div style={{fontStyle:'italic'}} > These dashboard controls are not yet functional </div>
            <Divider />
            <Checkbox 
                label="Inflation adjusted"
                defaultChecked
             />
            <Divider />
            <div style={{ display: 'inline-block', verticalAlign: "bottom", height:"24px", marginRight:"24px" }} > 
                Years: 
            </div>
            <RadioButtonGroup
                style={{ display: 'inline-block' }}
                name="yearscope"
                defaultSelected={explorer.state.yearscope}
                onChange={(ev, selection) => {
                    explorer.setState({yearscope:selection})
                } }>
                <RadioButton
                    value="one"
                    label="One"
                    iconStyle={{ marginRight: "4px" }}
                    labelStyle={{ width: "auto", marginRight: "24px" }}
                    style={{ display: 'inline-block', width: 'auto' }} />
                <RadioButton
                    value="two"
                    label="Two (side-by-side)"
                    iconStyle={{ marginRight: "4px" }}
                    labelStyle={{ width: "auto", marginRight: "24px" }}
                    style={{ display: 'inline-block', width: 'auto' }} />
                <RadioButton
                    value="all"
                    label="All (timelines)"
                    iconStyle={{ marginRight: "4px" }}
                    labelStyle={{ width: "auto", marginRight: "24px" }}
                    style={{ display: 'inline-block', width: 'auto' }} />
            </RadioButtonGroup>

            { singleslider }

            { doubleslider }

            <div style={{ display: (explorer.state.yearscope == 'all') ? 'inline' : 'none' }} >
                <Checkbox 
                    label="Year-over-year change, rather than actuals"
                    defaultChecked = {false}
                    />
            </div>

            <Divider />

            <RaisedButton
                style = {{marginRight:"24px"}}
                type="button"
                label="Download" />

            <RaisedButton
                type="button"
                label="Reset" />
            </CardText>

        </Card>

        // -----------[ DRILLDOWN SEGMENT]-------------

        let drilldownlist = explorer.state.chartmatrix[ChartSeries.DrillDown]

        let drilldowncharts = explorer.getCharts(drilldownlist, ChartSeries.DrillDown)

        let drilldownsegment = 
        <Card initiallyExpanded >

            <CardTitle
                actAsExpander
                showExpandableButton >

                Drill Down

            </CardTitle>

            <CardText expandable >

                <p>
                    Click or tap on any column to drill down.<IconButton tooltip="help"tooltipPosition="top-center" ><FontIcon className="material-icons">help_outline</FontIcon></IconButton>
                </p>
                <div style={{
                    padding: "3px"}}>
                    <span>Viewpoints: </span> 

                    <IconButton 
                        tooltip="Functional" 
                        tooltipPosition="top-center"
                        onTouchTap= {
                            e => {
                                this.switchViewpoint('FUNCTIONAL')
                            }
                        } 
                        style={
                            { backgroundColor: (this.state.userselections.viewpoint == 'FUNCTIONAL')
                                ?'lightgreen'
                                :'transparent' }
                        }>
                        <FontIcon className="material-icons">directions_walk</FontIcon>
                    </IconButton>

                    <IconButton 
                        tooltip="Structural" 
                        tooltipPosition="top-center" 
                        onTouchTap= {
                            e => {
                                this.switchViewpoint('STRUCTURAL')
                            }
                        }
                        style={
                            {
                                backgroundColor: (this.state.userselections.viewpoint == 'STRUCTURAL')
                                    ? 'lightgreen'
                                    : 'transparent'
                            }
                        }>
                        >
                        <FontIcon className="material-icons">layers</FontIcon>
                    </IconButton>

                    <span>Facets: </span>

                    <IconButton 
                        tooltip="Expenses" 
                        tooltipPosition="top-center" 
                        onTouchTap= {
                            e => {
                                this.switchDataSeries('BudgetExpenses')
                            }
                        }
                        style={
                            {
                                backgroundColor: (this.state.userselections.dataseries == 'BudgetExpenses')
                                    ? 'lightgreen'
                                    : 'transparent'
                            }
                        }>
                        <FontIcon className="material-icons">attach_money</FontIcon>
                    </IconButton>

                    <IconButton 
                        tooltip="Revenues" 
                        tooltipPosition="top-center" 
                        onTouchTap= {
                            e => {
                                this.switchDataSeries('BudgetRevenues')
                            }
                        }
                        style={
                            {
                                backgroundColor: (this.state.userselections.dataseries == 'BudgetRevenues')
                                    ? 'lightgreen'
                                    : 'transparent'
                            }
                        }>
                        <FontIcon className="material-icons">receipt</FontIcon>
                    </IconButton>

                    <IconButton 
                        tooltip="Staffing"
                        tooltipPosition="top-center" 
                        onTouchTap= {
                            e => {
                                this.switchDataSeries('BudgetStaffing')
                            }
                        }
                        style={
                            {
                                backgroundColor: (this.state.userselections.dataseries == 'BudgetStaffing')
                                    ? 'lightgreen'
                                    : 'transparent'
                            }
                        }>
                        >
                        <FontIcon className="material-icons">people</FontIcon>
                    </IconButton >

                </div>

                <div style={{ display: "none" }}>

                <RadioButtonGroup
                    style={{display:'inline-block'}}
                    name="datafacet" 
                    defaultSelected={explorer.state.datafacet}
                    onChange={(ev, selection) => {
                        explorer.setState({
                            datafacet: selection,
                        })
                    } }>

                    <RadioButton 
                        value="expenses" 
                        label="Expenses" 
                        iconStyle={{marginRight:"4px"}}
                        labelStyle={{width:"auto",marginRight:"24px"}}
                        style={{ display: 'inline-block', width:'auto' }} />

                    <RadioButton 
                        value="revenues" 
                        label="Revenues" 
                        iconStyle={{ marginRight: "4px" }}
                        labelStyle={{ width: "auto", marginRight: "24px" }}
                        style={{ display: 'inline-block', width: 'auto' }} />

                    <RadioButton
                        value="net"
                        label="Net"
                        iconStyle={{ marginRight: "4px" }}
                        labelStyle={{ width: "auto", marginRight: "24px" }}
                        style={{ display: 'inline-block', width: 'auto' }} />

                    <RadioButton 
                        value="staffing" 
                        label="Staffing" 
                        iconStyle={{ marginRight: "4px" }}
                        labelStyle={{ width: "auto", marginRight: "24px" }}
                        style={{ display: 'inline-block', width: 'auto' }} />

                </RadioButtonGroup>

                <RadioButtonGroup
                    style={{ display: (explorer.state.datafacet != "staffing") ? 'inline-block' : 'none', 
                        backgroundColor: "#eee" }}
                    name="activities"
                    defaultSelected="activities">

                    <RadioButton 
                        value="activities" 
                        label = "Activities" 
                        iconStyle={{ marginRight: "4px" }}
                        labelStyle={{ width: "auto", marginRight: "24px" }}
                        style={{ display: 'inline-block', width: 'auto' }} />

                    <RadioButton 
                        value="categories" 
                        label = "Categories" 
                        iconStyle={{ marginRight: "4px" }}
                        labelStyle={{ width: "auto", marginRight: "24px" }}
                        style={{ display: 'inline-block', width: 'auto' }} />

                </RadioButtonGroup>

                <RadioButtonGroup
                    style={{ display: (explorer.state.datafacet == "staffing") ? 'inline-block' : 'none', 
                        backgroundColor: "#eee" }}
                    name="staffing"
                    defaultSelected="positions" >

                    <RadioButton 
                        value="positions" 
                        label = "Positions" 
                        iconStyle={{ marginRight: "4px" }}
                        labelStyle={{ width: "auto", marginRight: "24px" }}
                        style={{ display: 'inline-block', width: 'auto' }} />

                    <RadioButton 
                        value="budget" 
                        label = "Budget" 
                        iconStyle={{ marginRight: "4px" }}
                        labelStyle={{ width: "auto", marginRight: "24px" }}
                        style={{ display: 'inline-block', width: 'auto' }} />
                </RadioButtonGroup>

                <FontIcon className="material-icons">cloud_download</FontIcon>

                </div>

                <div style={{ whiteSpace: "nowrap" }}>
                    <div style={{ overflow: "scroll" }}>

                        { drilldowncharts }

                        <div style={{ display: "inline-block", width: "500px" }}></div>

                    </div>
                </div>

            </CardText>

        </Card >

        // --------------[ COMPARE SEGMENT]-------------

        let comparelist = explorer.state.chartmatrix[ChartSeries.Compare]

        let comparecharts = explorer.getCharts(comparelist, ChartSeries.Compare)

        let comparesegment = <Card initiallyExpanded = {false}>

            <CardTitle
                actAsExpander
                showExpandableButton >

                Compare

            </CardTitle>

            <CardText expandable >

                <p>Click or tap on any column to drill down</p>
                <div style={{ whiteSpace: "nowrap" }}>

                    <div style={{ overflow: "scroll" }}>

                        { comparecharts }

                        <div style={{ display: "inline-block", width: "500px" }}></div>

                    </div>

                </div>

            </CardText>
            
        </Card>

        // -----------[ DIFFERENCES SEGMENT ]-------------

        let differencessegment = <Card>

            <CardTitle>Show differences</CardTitle>

        </Card>

        // -----------[ CONTEXT SEGMENT ]-------------

        let contextsegment = <Card>

            <CardTitle>Context</CardTitle>

        </Card>

        // -----------[ BUILD SEGMENT ]-------------

        let buildsegment = <Card>

            <CardTitle>Build</CardTitle>

        </Card>

        // -----------[ COMBINE SEGMENTS ]---------------

        return <div>

            { dashboardsegment }

            { drilldownsegment }

            { comparesegment }

            { differencessegment }

            { contextsegment }

            { buildsegment }

        </div>
    }

}

// ====================================================================================
// ------------------------------[ INJECT DATA STORE ]---------------------------------

let mapStateToProps = (state) => {

    let { budgetdata } = state

    return {

        budgetdata,

    }

}

let Explorer: typeof ExplorerClass = injectStore(mapStateToProps)(ExplorerClass)

export { Explorer }

