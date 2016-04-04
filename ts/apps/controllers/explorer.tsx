// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// explorer.tsx
/// <reference path="../../../typings-custom/react-google-charts.d.ts" />
/// <reference path="../../../typings-custom/format-number.d.ts" />
'use strict'
import * as React from 'react'
var { Component } = React
import { ExplorerChart } from '../components/explorerchart'
var format = require('format-number')
import { connect as injectStore} from 'react-redux'
import Card = require('material-ui/lib/card/card')
import CardTitle = require('material-ui/lib/card/card-title')
import CardText = require('material-ui/lib/card/card-text')
import { ChartSeries } from '../constants'

interface chartParms {
    name?: string,
    chartlocation: {
        series: number,
        depth: number,
    },
    dataroot: [{ parent: number }],
    range: {
        latestyear:number,
        earliestyear:number,
        fullrange:boolean,
    },
    data?:{
        chartType:string,
        options?:{
            [index:string]:any,
        },
        events?:{
            [index:string]:any,
        }[]
        rows?:any[],
        columns?:any[],
    },
    isError?:boolean
}

class ExplorerClass extends Component<any, any> {

    constructor(props) {
        super(props);
        this.state = {
            seriesdata: [[],[],[],[]], // DrillDown, Compare, Differences, Context
        };
    }

    // returns false if fails
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
        if ((depth +1) >= meta.length) {
            parms.isError = true
            return parms
        }
        options = {
            title: parent[meta[depth].Name] + ' ($Thousands)',
            vAxis: { title: 'Amount', minValue: 0, textStyle: { fontSize: 8 } },
            hAxis: { title: meta[depth].Children, textStyle:{fontSize:8} },
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

    updateCharts = data => {
        console.log('updateCharts data = ', data)

        let seriesdata = this.state.seriesdata

        let sourceparms = data.chartparms,
            selectlocation = sourceparms.chartlocation,
            series = selectlocation.series,
            sourcedepth = selectlocation.depth,
            selection = data.selection[0],
            selectionrow = selection.row

        let serieslist = seriesdata[series]
        serieslist.splice(sourcedepth + 1) // remove subsequent charts
        this.forceUpdate()

        console.log('series, sourcedepth, selectionrow, serieslist', series, sourcedepth, selectionrow, serieslist)

        let oldchartparms = seriesdata[series][sourcedepth]
        let newdataroot = oldchartparms.dataroot.map(node => {
            return Object.assign({},node)
        })
        newdataroot.push({parent:selectionrow})

        let newrange = Object.assign({},oldchartparms.range)

        let newchartparms: chartParms = {
            dataroot: newdataroot,
            chartlocation: {
                series: ChartSeries.DrillDown,
                depth: sourcedepth + 1
            },
            range: newrange,
            data: { chartType: "ColumnChart" }
        }


        newchartparms = this.setChartData(newchartparms)

        if (newchartparms.isError) return

        console.log('newchartparms = ', newchartparms)

        seriesdata[series][sourcedepth + 1] = newchartparms

        this.setState({
            seriesdata,
        })
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

    // initialize once
    componentDidMount = () => {
        // sort budget years
        this.props.budgetdata.sort((a, b) => {
            if ( a.year > b.year )
                return 1
            else if ( a.year < b.year )
                return -1
            else 
                return 0
        })

        // initial graph always latest year, highest level
        let latestyear
        if (this.props.budgetdata.length > 0) {
            // budgetdata is sorted ascending, take the last item
            let ptr = this.props.budgetdata.length - 1
            latestyear = this.props.budgetdata[ptr].Year
        } else {
            latestyear = null
        }

        // assemble parms to get initial dataset
        let rootchartparms:chartParms = {
            dataroot:[{parent:0}],
            chartlocation: {
                series:ChartSeries.DrillDown,
                depth:0
            },
            range: {
                latestyear:latestyear,
                earliestyear:null,
                fullrange:false,
            },
            data: {chartType:"ColumnChart"}
        }

        // get initial dataset
        rootchartparms = this.setChartData(rootchartparms)

        let seriesdata = this.state.seriesdata
        let chartlocation = rootchartparms.chartlocation
        seriesdata[chartlocation.series][chartlocation.depth] = rootchartparms

        // make initial dataset available to chart
        this.setState({
            seriesdata,
        });

    }
    render() {

        let explorer = this

        let seriesdatalist = explorer.state.seriesdata[0]

        let charts = seriesdatalist.map((seriesdata, index) => {

            let data = seriesdata.data

            // separate callback for each instance
            let callback = (function(chartparms: chartParms) {
                let self = explorer
                return function(Chart, err) {
                    let chart = Chart.chart
                    let selection = chart.getSelection()
                    self.updateCharts({ chartparms, chart, selection, err })
                }
            })(seriesdata)
            // select event only for now
            // TODO: use filter for 'select' instead of map
            data.events = data.events.map( eventdata => {
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
                graph_id = {"ChartID" + index}
                />
        })



        return <div>
        <Card>
        <CardTitle>Dashboard</CardTitle>
        </Card>
        <Card initiallyExpanded>
            <CardTitle 
                actAsExpander
                showExpandableButton>
                Drill Down
            </CardTitle>
            <CardText expandable>
                <p>Click or tap on any column to drill down</p>
                <div style={{ whiteSpace: "nowrap" }}>
                <div style={{ overflow: "scroll" }}>

                    { charts }

                    <div style={{display:"inline-block",width:"500px"}}></div>

                </div>
                </div>
            </CardText>
        </Card>
        <Card>
                <CardTitle>Compare</CardTitle>
        </Card>
        <Card>
                <CardTitle>Show differences</CardTitle>
        </Card>
        <Card>
            <CardTitle>Context</CardTitle>
        </Card>
        </div>
    }

}

function mapStateToProps(state) {

    let { budgetdata } = state

    return {

        budgetdata,

    }

}

var Explorer: typeof ExplorerClass = injectStore(mapStateToProps)(ExplorerClass)

export { Explorer }

