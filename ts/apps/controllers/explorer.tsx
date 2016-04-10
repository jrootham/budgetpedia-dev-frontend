// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// explorer.tsx
/// <reference path="../../../typings-custom/react-google-charts.d.ts" />

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

import { ExplorerChart } from '../components/explorerchart'
import { ChartSeries } from '../constants'
import { categoryaliases } from '../constants'

interface chartParms {
    name?: string,
    chartlocation: {
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

class ExplorerClass extends Component< any, any > {

    constructor(props) {
        super(props);
    }

    // should be in global state to allow for re-creation after return visit
    state = {
        seriesdata: [[], [], [], []], // DrillDown, Compare, Differences, Context
        dataselection:"expenses"
    }
    
    // initialize once - create seed drilldown and compare series
    componentDidMount = () => {
        // sort budget years
        this.props.budgetdata.sort((a, b) => {
            if (a.Year > b.Year)
                return 1
            else if (a.Year < b.Year)
                return -1
            else
                return 0
        })

        // initial graph always latest year, highest level
        var latestyear

        if (this.props.budgetdata.length > 0) {
            // budgetdata is sorted ascending, take the last item
            let ptr = this.props.budgetdata.length - 1
            latestyear = this.props.budgetdata[ptr].Year
        } else {
            latestyear = null
        }

        let seriesdata = this.state.seriesdata

        var chartlocation

        // ====================================================
        // -----------------[ DRILLDOWN SEED ]-----------------

        // assemble parms to get initial dataset
        let drilldownparms: chartParms = this.getSeedChartParms( ChartSeries.DrillDown, latestyear )

        drilldownparms = this.setChartData( drilldownparms )

        chartlocation = drilldownparms.chartlocation
        seriesdata[ chartlocation.series ][ chartlocation.depth ] = drilldownparms

        // ====================================================
        // -----------------[ COMPARE SEED ]-------------------

        // assemble parms to get initial dataset
        let compareparms: chartParms = this.getSeedChartParms( ChartSeries.Compare, latestyear )

        compareparms = this.setChartData( compareparms )

        chartlocation = compareparms.chartlocation
        seriesdata[ chartlocation.series ][ chartlocation.depth ] = compareparms

        // ====================================================
        // -------------[ SAVE INITIALIZATION ]----------------

        // make initial dataset available to chart
        this.setState({
            seriesdata,
        });

    }

    getSeedChartParms = ( series, latestyear ): chartParms => {
        return {
            dataroot: [{ parent: 0 }],
            chartlocation: {
                series,
                depth: 0
            },
            range: {
                latestyear: latestyear,
                earliestyear: null,
                fullrange: false,
            },
            data: { chartType: "ColumnChart" }
        }

    }

    // response to user selection of a chart component (such as a column )
    // called by chart callback
    updateChartsSelection = data => {
        // console.log('updateCharts data = ', data)

        let seriesdata = this.state.seriesdata

        let sourceparms = data.chartparms,
            selectlocation = sourceparms.chartlocation,
            series = selectlocation.series,
            sourcedepth = selectlocation.depth,
            selection = data.selection[0],
            selectionrow = selection.row

        let serieslist = seriesdata[series]
        // TODO: abandon here if the next one exists and is the same
        serieslist.splice( sourcedepth + 1 ) // remove subsequent charts

        // trigger update to avoid google charts use of cached versions for new charts
        // cached versions keep obsolete chart titles, even if new title fed in through new options
        this.setState({
            seriesdata,
        });
        // TODO: better to use forceUpdate vs setState?
        // this.forceUpdate()

        // console.log('series, sourcedepth, selectionrow, serieslist', series, sourcedepth, selectionrow, serieslist)

        let oldchartparms = seriesdata[ series ][ sourcedepth ]
        let newdataroot = oldchartparms.dataroot.map( node => {
            return Object.assign( {}, node )
        })
        newdataroot.push( { parent: selectionrow } )

        let newrange = Object.assign( {}, oldchartparms.range )

        let newchartparms: chartParms = {
            dataroot: newdataroot,
            chartlocation: {
                series,
                depth: sourcedepth + 1
            },
            range: newrange,
            data: { chartType: "ColumnChart" }
        }

        newchartparms = this.setChartData( newchartparms )

        if (newchartparms.isError) return

        console.log( 'newchartparms = ', newchartparms )

        seriesdata[ series ][ sourcedepth + 1 ] = newchartparms

        this.setState({
            seriesdata,
        })
    }

    // returns parms.isError = true if fails
    setChartData = (parms:chartParms):chartParms => {
        let options = {},
            events = null,
            rows = [],
            columns = [],
            budgetdata = this.props.budgetdata,
            meta = budgetdata[0].Meta,
            self = this,
            range = parms.range

        // TODO: capture range, including years
        let {parent, children, depth} = this.getChartDatasets(parms, meta, budgetdata)
        if ((depth +1) >= meta.length) { // no more data to show
            parms.isError = true
            return parms
        }
        let axistitle = meta[depth].Children
        axistitle = categoryaliases[axistitle] || axistitle
        options = {
            title: parent[meta[depth].Name] + ' ($Thousands)',
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

    getChartDatasets = (parms, meta, budgetdata) => {
        let parent, children, depth,
            path = parms.dataroot,
            range = parms.range

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

        let dashboardsegment = <Card>

            <CardTitle>Dashboard</CardTitle>

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
                        value="staffing" 
                        label="Staffing" 
                        iconStyle={{ marginRight: "4px" }}
                        labelStyle={{ width: "auto", marginRight: "24px" }}
                        style={{ display: 'inline-block', width: 'auto' }} />
                </RadioButtonGroup>
                <RadioButtonGroup
                    style={{ display: (explorer.state.dataselection != "staffing") ? 'inline-block' : 'none', backgroundColor: "#eee" }}
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
                    style={{ display: (explorer.state.dataselection=="staffing")?'inline-block':'none', backgroundColor: "#eee" }}
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

        return <div>

            { dashboardsegment }

            { drilldownsegment }

            { comparesegment }

            { differencessegment }

            { contextsegment }

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

