
// tribes.tsx
// required by bundler
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
            width: children.length * 120,// 80 per column
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
            return [item[categorylabel],amount,amountformat(amount)]            
        })

        // console.log('return = ', options)
        console.log('chartdata = ', options, events, columns, rows)
        return { options, events, rows, columns }
    }

    updateCharts = data => {
        console.log('updateCharts data = ', data)
    }

    getChartDatasets = (parms, meta, budgetdata) => {
        let parent, children,
            path = parms['path'],
            depth = 0,
            range = parms['range']

        let list = budgetdata.filter( item => {
            // TODO: needs to be enhanced to account for 2 year or multi-year scope
            return (item.Year == range.latestyear)? true: false
        })

        for (depth; depth < path.length; depth++) {
            let ref = path[depth]
            parent = list[ref.parent]
            list = parent[meta[depth].Children]
        }
        depth--
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
        let latestyear

        if (this.props.budgetdata.length > 0)
            latestyear = this.props.budgetdata[0].Year
        else 
            latestyear = null
        var rootchartoptions = {
            path:[{parent:0}],
            range: {
                latestyear,
                earliestyear:null,
                fullrange:false,
            }
        }
        var {options, events, rows, columns} = this.getChartData(rootchartoptions)

        // =============================

        var testchart_events = [
            {
                eventName: 'select',
                callback: (Chart,e) => {
                    let chart = Chart.chart
                    let selection = chart.getSelection()
                    // Returns Chart so you can access props and  the ChartWrapper object from chart.wrapper 
                    // console.log("selection",Chart,chart,selection);
                }
            }
        ]

        let testoptions = {
            title: "Toronto Budget 2015/2016 ($Millions) Total: $10,991.5M",
            hAxis: {title: 'Departments'},
            vAxis: {title: 'Amount',minValue:0},
            bar: { groupWidth: "95%" },
            width: 240, // 80 per column
            height: 300,
            legend: { position:'bottom'},
        }

        let testcolumns = [
            // type is required, else throws silent error
            { type:'string', label:"Department" }, 
            { type:'number', label:'2015'}, 
            { type:'number', label:'2016'}, 
            { type:'string', role:'annotation' }
        ]
        let testrows = [
            ['Shared Services', 3769.5, 3969.5, '$3,969.5M'],
            ['Support Services', 4393.2, 4593.2, '$4,593.2M'],
            ['Administration', 2228.7, 2428.7, '$2,428.7M']
        ]

        // =============================

        this.setState({
            rows:rows,
            columns:columns,
            options:options,
            events:events,
        });

    }
    render() {
        return <div>
        <Card>
        <CardTitle>Dashboard</CardTitle>
        </Card>
        <Card initiallyExpanded>
        <CardTitle 
            actAsExpander={true}
            showExpandableButton={true}>
            Drill Down
        </CardTitle>
        <CardText expandable>
        <p>Click or tap on any column to drill down</p>
        <Chart
            chartType = "ColumnChart"
            rows = {this.state.rows}
            columns = {this.state.columns}
            // data = {this.state.data}
            options = { this.state.options }
            // used to create html element id attribute
            graph_id = "ColumnChartID"
            chartEvents = {this.state.events}
        />
        </CardText>
        </Card>
        <Card>
                <CardTitle>Compare</CardTitle>
        </Card>
        <Card>
                <CardTitle>Show differences</CardTitle>
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

