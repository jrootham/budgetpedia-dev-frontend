// explorer.tsx
/// <reference path="../../../typings-custom/react-google-charts.d.ts" />
/// <reference path="../../../typings-custom/format-number.d.ts" />

import * as React from 'react'
import ChartObject = require('react-google-charts')
var { Component } = React
var format = require('format-number')
import { connect as injectStore} from 'react-redux'
import Card = require('material-ui/lib/card/card')
import CardTitle = require('material-ui/lib/card/card-title')
import CardText = require('material-ui/lib/card/card-text')

let Chart = ChartObject['Chart']

class ExplorerClass extends Component<any, any> {

    constructor(props) {
        super(props);
        this.state = {
            chartsdata: {seriesone:null,seriestwo:null,differences:null},
            chartsmeta:{options:{},seriesone:{},seriestwo:{},differences:{}}
        };
    }

    getSelectEvent = (parms:Object) => {
        let self = this
        return (Chart, err) => {
            let chart = Chart.chart
            let selection = chart.getSelection()
            let chartparms = parms
            self.updateCharts({ chartparms, chart, selection, err })
        }
    }
    // TODO: all needs to be generalized
    getChartData = (parms:Object) => {
        let options = {},
            events = null,
            rows = [],
            columns = [],
            budgetdata = this.props.budgetdata,
            meta = budgetdata[0].Meta,
            self = this,
            range = parms['range']

        // TODO: capture range, including years
        let {parent, children, depth} = this.getChartDatasets(parms, meta, budgetdata)
        options = {
            title: parent[meta[depth].Name] + ' ($Thousands)',
            hAxis: { title: meta[depth].Children },
            vAxis: { title: 'Amount', minValue:0 },
            bar: { groupWidth: "95%" },
            width: children.length * 120,// 120 per column
            height: 300,
            legend:'none',
        }
        // TODO: watch for memory leaks when the chart is destroyed
        events = [
            {
                eventName: 'select',
                callback: this.getSelectEvent(parms)
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
        console.log('chartdata = ', options, events, columns, rows)
        return { options, events, rows, columns }
    }

    updateCharts = data => {
        console.log('updateCharts data = ', data)
    }

    getChartDatasets = (parms, meta, budgetdata) => {
        let parent, children, depth,
            path = parms['path'],
            range = parms['range']

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
        let rootchartoptions = {
            path:[{parent:0}],
            range: {
                latestyear,
                earliestyear:null,
                fullrange:false,
            }
        }

        // get initial dataset
        let {options, events, rows, columns} = this.getChartData(rootchartoptions)

        // make initial dataset available to chart
        this.setState({
            options,
            events,
            rows,
            columns,
        });

    }
    render() {
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
                <Chart
                    chartType = "ColumnChart"
                    options = { this.state.options }
                    chartEvents = {this.state.events}
                    rows = {this.state.rows}
                    columns = {this.state.columns}
                    // used to create html element id attribute
                    graph_id = "ColumnChartID"
                />
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

