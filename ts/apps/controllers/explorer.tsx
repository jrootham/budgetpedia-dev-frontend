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
import Divider = require('material-ui/lib/divider')
import Checkbox = require('material-ui/lib/checkbox')
import RaisedButton = require('material-ui/lib/raised-button')
import ReactSlider = require('react-slider')

import { ExplorerChart } from '../components/explorerchart'
import { ChartSeries } from '../constants'
import { categoryaliases } from '../constants'

interface ChartConfig {
    name?: string,
    viewpoint:string,
    dataseries:string,
    matrixlocation: {
        row: number,
        column: number,
    },
    datapath: string[],
    range: {
        latestyear: number,
        earliestyear: number,
        fullrange: boolean,
    },
    charttype?:string,
    chartparms?:{
        chartType: string,
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
        viewselection:"activities",
        userselections:{
            latestyear:2015,
            viewpoint:"FUNCTIONAL",
            dataseries:"BudgetExpenses",
            charttype: "ColumnChart",
        }
    }
    
    // initialize once - create root drilldown and compare series
    componentDidMount = () => {

        let userselections = this.state.userselections,
            chartmatrix = this.state.chartmatrix

        var matrixlocation, 
            chartParmsObj


        // ------------------------[ POPULATE VIEWPOINT WITH VALUES ]-----------------------

        this.setViewpointAmounts(
            this.state.userselections.viewpoint,
            this.state.userselections.dataseries,
            this.props.budgetdata
        )

        // -----------------[ THE DRILLDOWN ROOT ]-----------------

        // assemble parms to get initial dataset
        let drilldownchartconfig: ChartConfig = 
            this.initRootChartConfig(ChartSeries.DrillDown, userselections)

        chartParmsObj = this.getChartParms( drilldownchartconfig )

        if (!chartParmsObj.error) {

            drilldownchartconfig.chartparms = chartParmsObj.chartParms

            matrixlocation = drilldownchartconfig.matrixlocation
            chartmatrix[ matrixlocation.row ][ matrixlocation.column ] = drilldownchartconfig

        }

        // -----------------[ THE COMPARE ROOT ]-------------------

        // assemble parms to get initial dataset
        let comparechartconfig: ChartConfig = this.initRootChartConfig( ChartSeries.Compare, userselections )

        chartParmsObj = this.getChartParms( comparechartconfig )

        if (!chartParmsObj.error) {

            comparechartconfig.chartparms = chartParmsObj.chartParms

            matrixlocation = comparechartconfig.matrixlocation
            chartmatrix[ matrixlocation.row ][ matrixlocation.column ] = comparechartconfig

        }

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
    setViewpointAmounts = (viewpointname, dataseriesname, budgetdata) => {
        let viewpoint = budgetdata.Viewpoints[viewpointname]

        if (viewpoint.currentdataseries && (viewpoint.currentdataseries == dataseriesname))
            return

        let items = budgetdata.DataSeries[dataseriesname].Items

        let rootcomponent = {"ROOT":viewpoint}

        // set years, and Aggregates by years
        // initiates recursion
        this.setComponentSummaries(rootcomponent, items)

        // create sentinel to prevent unnucessary processing
        viewpoint.currentdataseries = dataseriesname

        console.log('writing viewpoint ',viewpoint)

    }

    setComponentSummaries = (components, items):ComponentSummaries => {
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
            if (component.Config != "BASELINE") {

                // if no components found, loop
                if (component.Components) {

                    // get child component summaries recursively
                    componentSummaries = this.setComponentSummaries(component.Components, items)

                    // capture data for chart-making
                    if (componentSummaries.years)
                        component.years = componentSummaries.years
                    if (componentSummaries.Aggregates)
                        component.Aggregates = componentSummaries.Aggregates

                }

            // for baseline items, fetch the baseline amounts from the dataseries itemlist
            } else {

                // fetch the data from the dataseries itemlist
                let item = items[componentname]

                // first set componentSummaries as usual
                componentSummaries = { 
                    years: item.Components, 
                    Aggregates: item.years, 
                }

                // capture data for chart-making
                if (componentSummaries.years)
                    component.years = componentSummaries.years
                if (componentSummaries.Aggregates)
                    component.Components = componentSummaries.Aggregates

            }

            // aggregate the collected summaries for the caller
            if (componentSummaries)
                this.aggregateComponentSummaries(cumulatingSummaries, componentSummaries)
        }

        return cumulatingSummaries
    }

    aggregateComponentSummaries = (cumulatingSummaries, componentSummaries) => {

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
            range: {
                latestyear: userselections.latestyear,
                earliestyear: null,
                fullrange: false,
            },
            charttype: userselections.charttype
        }

    }

    // ------------------[ GET CHART PARMS ]--------------------------
    /*
        return chartType, columns, rows, options, and events
    */

    // returns chartParmsObj.isError = true if fails
    // TODO: capture range, including years
    getChartParms = (chartConfig: ChartConfig) => {
        let chartParmsObj = {isError:false,chartParms:null}
        let options, events, rows, columns
        let budgetdata = this.props.budgetdata,
            viewpointdata = budgetdata.Viewpoints[chartConfig.viewpoint],
            range = chartConfig.range

        let {parent, children, depth, error} = this.getChartDatasets(chartConfig, budgetdata)

        if (error) { // no more data to show
            chartParmsObj.isError = true
            return chartParmsObj
        }
        // let axistitle = meta[depth].Children
        let axistitle = ''
        axistitle = categoryaliases[axistitle] || axistitle
        options = {
            title: '', // parent[meta[depth].Name], // + ' ($Thousands)',
            vAxis: { title: 'Amount', minValue: 0, textStyle: { fontSize: 8 } },
            hAxis: { title: axistitle, textStyle: { fontSize: 8 } },
            bar: { groupWidth: "95%" },
            // width: children.length * 120,// 120 per column
            height: 400,
            width: 400,
            legend:'none',
            annotations: { alwaysOutside: true }
        }
        // TODO: watch for memory leaks when the chart is destroyed
        events = [
            {
                eventName: 'select',
                callback: ((chartconfig: ChartConfig) => {
                    let self = this
                    return (Chart, err) => {
                        let chart = Chart.chart
                        let selection = chart.getSelection()
                        let context: ChartSelectionContext = { chartconfig, chart, selection, err }
                        self.updateChartsSelection(context)
                    }
                })(chartConfig)
            }
        ]

        let year = range.latestyear
        let categorylabel = '' // meta[depth + 1].Name

        columns = [
            // type is required, else throws silent error
            { type: 'string', label: categorylabel },
            { type: 'number', label: year.toString() },
            { type: 'string', role: 'annotation' }
        ]

        let amountformat = format({prefix:"$",suffix:"T"})
        let rounded = format({round:0, integerSeparator:''})

        rows = children.map(item => {
            let amount = parseInt(rounded(item.Amount/1000))
            // TODO: add % of total to the annotation
            let annotation = amountformat(amount)
            return [item[categorylabel], amount, annotation]            
        })

        // console.log('return = ', options)
        let chartdata = chartConfig.chartparms;
        chartdata.columns = columns
        chartdata.rows = rows
        chartdata.options = options
        chartdata.events = events
        chartdata.chartType = chartConfig.charttype
        chartParmsObj.chartParms = chartdata

        return chartParmsObj

    }

    // ------------------------[ UPDATE CHART BY SELECTION ]-----------------

    // response to user selection of a chart component (such as a column )
    // called by chart callback
    updateChartsSelection = (context:ChartSelectionContext) => {
        // console.log('updateCharts data = ', data)

        let chartmatrix = this.state.chartmatrix

        let sourcechartconfig = context.chartconfig,
            selectmatrixlocation = sourcechartconfig.matrixlocation,
            matrixrow = selectmatrixlocation.row,
            matrixcolumn = selectmatrixlocation.column,
            selection = context.selection[0],
            selectionrow = selection.row,
            viewpoint = sourcechartconfig.viewpoint,
            dataseries = sourcechartconfig.dataseries

        let serieslist = chartmatrix[matrixrow]
        // TODO: abandon here if the next one exists and is the same
        serieslist.splice(matrixcolumn + 1) // remove subsequent charts

        // trigger update to avoid google charts use of cached versions for new charts
        // cached versions keep obsolete chart titles, even if new title fed in through new options
        this.setState({
            chartmatrix,
        });
        // TODO: better to use forceUpdate vs setState?
        // this.forceUpdate()

        // console.log('series, sourcedepth, selectionrow, serieslist', series, sourcedepth, selectionrow, serieslist)

        let parentchartconfig = chartmatrix[matrixrow][matrixcolumn]
        let childdataroot = parentchartconfig.datapath.map(node => {
            return Object.assign({}, node)
        })
        childdataroot.push({ parent: selectionrow })

        let newrange = Object.assign({}, parentchartconfig.range)

        let newchartconfig: ChartConfig = {
            viewpoint,
            dataseries,
            datapath: childdataroot,
            matrixlocation: {
                row: matrixrow,
                column: matrixcolumn + 1
            },
            range: newrange,
            chartparms: { chartType: "ColumnChart" }
        }

        let chartParmsObj = this.getChartParms(newchartconfig)

        if (chartParmsObj.isError) return

        newchartconfig.chartparms = chartParmsObj.chartParms

        // console.log( 'newchartconfig = ', newchartconfig )

        chartmatrix[matrixrow][matrixcolumn + 1] = newchartconfig

        this.setState({
            chartmatrix,
        })
    }

    // --------------------[ GET CHART DATA ]----------------------------

    getChartDatasets = (parms, budgetdata) => {
        let parent, children, depth, error,
            path = parms.datapath,
            range = parms.range

        let meta = {}

        let list = budgetdata.filter( item => {
            // TODO: needs to be enhanced to account for 2 year or multi-year scope
            return (item.Year == range.latestyear)? true: false
        })

        for (depth = 0; depth < path.length; depth++) {
            let ref = path[depth]
            parent = list[ref.parent]
            list = parent[meta[depth].Children]
        }
        depth-- // last successful reference
        children = list
        error = false

        return {parent, children, depth, error}
    }

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
                <div style={{ display: 'inline-block', verticalAlign: "bottom", height: "24px", marginRight:"24px" }} > 
                    Viewpoint: 
                </div>
                <RadioButtonGroup
                    style={{
                        display: (explorer.state.datafacet != "staffing") ? 'inline-block' : 'none',
                    }}
                    name="viewselection"
                    defaultSelected="functional">
                    <RadioButton
                        value="functional"
                        label = "Functional"
                        iconStyle={{ marginRight: "4px" }}
                        labelStyle={{ width: "auto", marginRight: "24px" }}
                        style={{ display: 'inline-block', width: 'auto' }} />
                    <RadioButton
                        value="structural"
                        label = "Structural"
                        iconStyle={{ marginRight: "4px" }}
                        labelStyle={{ width: "auto", marginRight: "24px" }}
                        style={{ display: 'inline-block', width: 'auto' }} />
                    <RadioButton
                        value="auditor"
                        label = "Auditor"
                        iconStyle={{ marginRight: "4px" }}
                        labelStyle={{ width: "auto", marginRight: "24px" }}
                        style={{ display: 'inline-block', width: 'auto' }} />
                </RadioButtonGroup> <br />
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

        let drilldownsegment = <Card initiallyExpanded >

            <CardTitle
                actAsExpander
                showExpandableButton >

                Drill Down

            </CardTitle>

            <CardText expandable >

                <p>
                    Click or tap on any column to drill down. 
                </p>
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
                    defaultSelected="positions"
                    >
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

