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

interface chartParms {
    name?: string,
    viewpoint:string,
    dataseries:string,
    location: {
        series: number,
        depth: number,
    },
    dataroot: { parent: number }[],
    range: {
        latestyear: number,
        earliestyear: number,
        fullrange: boolean,
    },
    data?:{
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

class ExplorerClass extends Component< any, any > {

    constructor(props) {
        super(props);
    }

    // should be in global state to allow for re-creation after return visit
    // TODO: Take state initialization from external source
    state = {
        seriesdata: [ [], [] ], // DrillDown, Compare (Later: Differences, Context, Build)
        dataselection:"expenses",
        slider: {singlevalue:[2015],doublevalue:[2005,2015]},
        yearselection:"one",
        viewselection:"activities",
        userselections:{
            latestyear:2015,
            viewpoint:"FUNCTIONAL",
            dataseries:"BudgetExpenses",
        }
    }
    
    // initialize once - create seed drilldown and compare series
    componentDidMount = () => {

        var userselections = this.state.userselections

        let seriesdata = this.state.seriesdata

        var chartlocation

        this.setViewpointAmounts(
            this.state.userselections.viewpoint,
            this.state.userselections.dataseries,
            this.props.budgetdata
        )

        // ========================================================
        // -----------------[ THE DRILLDOWN SEED ]-----------------

        // assemble parms to get initial dataset
        let drilldownchartparms: chartParms = this.initSeedChartParms( ChartSeries.DrillDown, userselections )

        drilldownchartparms = this.addChartSpecs( drilldownchartparms )

        chartlocation = drilldownchartparms.location
        seriesdata[ chartlocation.series ][ chartlocation.depth ] = drilldownchartparms

        // ========================================================
        // -----------------[ THE COMPARE SEED ]-------------------

        // assemble parms to get initial dataset
        let comparechartparms: chartParms = this.initSeedChartParms( ChartSeries.Compare, userselections )

        comparechartparms = this.addChartSpecs( comparechartparms )

        chartlocation = comparechartparms.location
        seriesdata[ chartlocation.series ][ chartlocation.depth ] = comparechartparms

        // ====================================================
        // -------------[ SAVE INITIALIZATION ]----------------

        // make initial dataset available to chart
        this.setState({
            seriesdata,
        });

    }

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
            // isolate a component
            let component = components[componentname]

            // remove any previous aggregations
            if (component.years) delete component.years
            if (component.Aggregates) delete component.Aggregates

            // for non-baseline items, recurse to collect aggregations
            if (component.Config != "BASELINE") {

                // if no components found, loop
                if (component.Components) {

                    // get child component summaries recursively
                    let componentSummaries = this.setComponentSummaries(component.Components, items)

                    // save data for reference for chart-making
                    if (componentSummaries.years)
                        component.years = componentSummaries.years
                    if (componentSummaries.Aggregates)
                        component.Aggregates = componentSummaries.Aggregates

                    // aggregate the returned summaries for the caller
                    this.aggregateComponentSummaries(cumulatingSummaries,componentSummaries)
                }

            // for baseline items, fetch the baseline amounts from the dataseries itemlist
            } else {

                // fetch the data from the dataseries itemlist
                let item = items[componentname]

                // save the data for chart-making
                if (item.years)
                    component.years = item.years
                if (item.Components)
                    component.Components = item.Components

                // accumulate the data for the caller
                // first set componentSummaries as usual
                let componentSummaries = {years:{},Aggregates:{}}
                componentSummaries.Aggregates = item.Components
                componentSummaries.years = item.years

                // then aggregate the summaries to the cumulating summaries
                this.aggregateComponentSummaries(cumulatingSummaries,componentSummaries)

            }
        }

        return cumulatingSummaries
    }

    aggregateComponentSummaries = (cumulatingSummaries, componentSummaries) => {

        // if years have been collected, add them to the total
        if (componentSummaries.years) {

            let years = componentSummaries.years
            for (let yearname in years) {

                let yearvalue = years[yearname]

                if (cumulatingSummaries.years[yearname])
                    cumulatingSummaries.years[yearname] += yearvalue
                else
                    cumulatingSummaries.years[yearname] = yearvalue
            }
        }
        // if Aggregates have been collected, add them to the totals
        if (componentSummaries.Aggregates) {

            let Aggregates = componentSummaries.Aggregates
            for (let aggregatename in Aggregates) {

                let Aggregate = Aggregates[aggregatename]
                // collect year values for the Aggregates if they exist
                if (Aggregate.years) {

                    let years = Aggregate.years

                    for (let yearname in years) {

                        let yearvalue = years[yearname]
                        let cumulatingAggregate = cumulatingSummaries.Aggregates[aggregatename] || {years:{}}

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

    // ================================================================
    // -------------------[ INITIALIZE SEED CHART ]--------------------

    initSeedChartParms = ( series, userselections ): chartParms => {
        return {
            viewpoint:userselections.viewpoint,
            dataseries:userselections.dataseries,
            dataroot: [{ parent: 0 }],
            location: {
                series,
                depth: 0
            },
            range: {
                latestyear: userselections.latestyear,
                earliestyear: null,
                fullrange: false,
            },
            data: { chartType: "ColumnChart" }
        }

    }

    // ===============================================================
    // ------------------[ ADD CHART SPECS ]--------------------------
    /*
        add columns, rows, options, and events to the parms 
        object's data property
    */

    // returns parms.isError = true if fails
    addChartSpecs = (parms:chartParms):chartParms => {
        let options = {},
            events = null,
            rows = [],
            columns = [],
            budgetdata = this.props.budgetdata,
            viewpointdata = budgetdata.Viewpoints[parms.viewpoint],
            // meta = budgetdata[0].Meta,
            self = this,
            range = parms.range,
            meta = []

        // TODO: capture range, including years
        let {parent, children, depth} = this.getChartDatasets(parms, budgetdata)
        if ((depth +1) >= meta.length) { // no more data to show
            parms.isError = true
            return parms
        }
        let axistitle = meta[depth].Children
        axistitle = categoryaliases[axistitle] || axistitle
        options = {
            title: parent[meta[depth].Name], // + ' ($Thousands)',
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
                // callback created in immediately invoked function in
                // order to set correct parms var in closure
                // created in getCharts
                // callback: this.getSelectEvent(parms)
            }
        ]

        let year = range.latestyear
        let categorylabel = meta[depth + 1].Name

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
        let chartdata = parms.data;
        chartdata.columns = columns
        chartdata.rows = rows
        chartdata.options = options
        chartdata.events = events
        // console.log('chartdata = ', options, events, columns, rows)
        return parms
    }

    // response to user selection of a chart component (such as a column )
    // called by chart callback
    updateChartsSelection = data => {
        // console.log('updateCharts data = ', data)

        let seriesdata = this.state.seriesdata

        let sourcechartparms = data.chartparms,
            selectchartlocation = sourcechartparms.location,
            series = selectchartlocation.series,
            sourcedepth = selectchartlocation.depth,
            selection = data.selection[0],
            selectionrow = selection.row,
            viewpoint = sourcechartparms.viewpoint,
            dataseries = sourcechartparms.dataseries

        let serieslist = seriesdata[series]
        // TODO: abandon here if the next one exists and is the same
        serieslist.splice(sourcedepth + 1) // remove subsequent charts

        // trigger update to avoid google charts use of cached versions for new charts
        // cached versions keep obsolete chart titles, even if new title fed in through new options
        this.setState({
            seriesdata,
        });
        // TODO: better to use forceUpdate vs setState?
        // this.forceUpdate()

        // console.log('series, sourcedepth, selectionrow, serieslist', series, sourcedepth, selectionrow, serieslist)

        let parentchartparms = seriesdata[series][sourcedepth]
        let childdataroot = parentchartparms.dataroot.map(node => {
            return Object.assign({}, node)
        })
        childdataroot.push({ parent: selectionrow })

        let newrange = Object.assign({}, parentchartparms.range)

        let newchartparms: chartParms = {
            viewpoint,
            dataseries,
            dataroot: childdataroot,
            location: {
                series,
                depth: sourcedepth + 1
            },
            range: newrange,
            data: { chartType: "ColumnChart" }
        }

        newchartparms = this.addChartSpecs(newchartparms)

        if (newchartparms.isError) return

        // console.log( 'newchartparms = ', newchartparms )

        seriesdata[series][sourcedepth + 1] = newchartparms

        this.setState({
            seriesdata,
        })
    }

    // ==================================================================
    // --------------------[ GET CHART DATA ]----------------------------

    getChartDatasets = (parms, budgetdata) => {
        let parent, children, depth,
            path = parms.dataroot,
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

        return {parent, children, depth}
    }

    // get React components to render
    getCharts = (datalist, series) => {

        let charts = datalist.map((seriesdata, index) => {

            let data = seriesdata.data

            // separate callback for each instance
            let callback = ((chartparms: chartParms) => {
                let self = this
                return (Chart, err) => {
                    let chart = Chart.chart
                    let selection = chart.getSelection()
                    self.updateChartsSelection({ chartparms, chart, selection, err })
                }
            })(seriesdata)
            // select event only for now
            // TODO: use filter for 'select' instead of map
            data.events = data.events.map(eventdata => {
                eventdata.callback = callback
                return eventdata
            })

            return <ExplorerChart
                key = {index}
                chartType = {data.chartType}
                options = { data.options }
                chartEvents = {data.events}
                rows = {data.rows}
                columns = {data.columns}
                // used to create html element id attribute
                graph_id = {"ChartID" + series + '' + index}
                />
        })

        return charts

    }

    render() {

        let explorer = this

        // ============================================
        // -----------[ DASHBOARD SEGMENT]-------------
        let singleslider = (explorer.state.yearselection == 'one')?
            <ReactSlider 
                className="horizontal-slider" 
                defaultValue={explorer.state.slider.singlevalue} 
                min={ 2003 } 
                max={ 2016 } 
                onChange = {(value) => {
                    explorer.setState({
                        slider: Object.assign(explorer.state.slider, { 
                            singlevalue: [value] 
                        })
                    })
                }}>
                <div >{explorer.state.slider.singlevalue[0]}</div>
            </ReactSlider > :''
        let doubleslider = (explorer.state.yearselection != 'one') ?
            <ReactSlider
                className="horizontal-slider"
                defaultValue={explorer.state.slider.doublevalue}
                min={ 2003 }
                max={ 2016 }
                withBars={(explorer.state.yearselection == 'all') ? true : false}
                onChange = {(value) => {
                    explorer.setState({
                        slider: Object.assign(explorer.state.slider,{ 
                            doublevalue: value 
                        })
                    })
                } }>
                <div >{explorer.state.slider.doublevalue[0]}</div>
                <div >{explorer.state.slider.doublevalue[1]}</div>
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
                        display: (explorer.state.dataselection != "staffing") ? 'inline-block' : 'none',
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
                name="yearselection"
                defaultSelected={explorer.state.yearselection}
                onChange={(ev, selection) => {
                    explorer.setState({yearselection:selection})
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
            <div style={{ display: (explorer.state.yearselection == 'all') ? 'inline' : 'none' }} >
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

        // ============================================
        // -----------[ DRILLDOWN SEGMENT]-------------

        let drilldownlist = explorer.state.seriesdata[ChartSeries.DrillDown]

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
                    name="dataselection" 
                    defaultSelected={explorer.state.dataselection}
                    onChange={(ev, selection) => {
                        explorer.setState({
                            dataselection: selection,
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
                    style={{ display: (explorer.state.dataselection != "staffing") ? 'inline-block' : 'none', 
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
                    style={{ display: (explorer.state.dataselection == "staffing") ? 'inline-block' : 'none', 
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

        // =============================================
        // --------------[ COMPARE SEGMENT]-------------

        let comparelist = explorer.state.seriesdata[ChartSeries.Compare]

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

        // ===============================================
        // -----------[ DIFFERENCES SEGMENT ]-------------

        let differencessegment = <Card>

            <CardTitle>Show differences</CardTitle>

        </Card>

        // ===========================================
        // -----------[ CONTEXT SEGMENT ]-------------

        let contextsegment = <Card>

            <CardTitle>Context</CardTitle>

        </Card>

        // ===========================================
        // -----------[ BUILD SEGMENT ]-------------

        let buildsegment = <Card>

            <CardTitle>Build</CardTitle>

        </Card>

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

let mapStateToProps = (state) => {

    let { budgetdata } = state

    return {

        budgetdata,

    }

}

let Explorer: typeof ExplorerClass = injectStore(mapStateToProps)(ExplorerClass)

export { Explorer }

