
// tribes.tsx
// required by bundler
/// <reference path="../../../typings-custom/react-google-charts.d.ts" />
import * as React from 'react'
import ChartObject = require('react-google-charts')
var { Component } = React
import { connect as injectStore} from 'react-redux'
import Card = require('material-ui/lib/card/card')
import CardTitle = require('material-ui/lib/card/card-title')
import CardText = require('material-ui/lib/card/card-text')

let Chart = ChartObject['Chart']

class ExplorerClass extends Component<any, any> {

    constructor(props) {
        super(props);
        this.state = {
            data: null,
            options: null,
            chart_events:null,
            chartsdata: {seriesone:null,seriestwo:null,differences:null},
            chartsmeta:{options:{},seriesone:{},seriestwo:{},differences:{}}
        };
    }

    componentDidMount = () => {
        var chart_events = [
            {
                eventName: 'select',
                callback: (Chart,e) => {
                    let chart = Chart.chart
                    let selection = chart.getSelection()
                    // Returns Chart so you can access props and  the ChartWrapper object from chart.wrapper 
                    console.log("selection",Chart,chart,selection);
                }
            }
        ]

        let options = {
            title: "Toronto Budget 2015/2016 ($Millions) Total: $10,991.5M",
            subtitle:"Something",
            hAxis: {title: 'Departments'},
            vAxis: {title: 'Amount',minValue:0},
            bar: { groupWidth: "95%" },
            width: 240, // 80 per column
            height: 300,
            legend: { position:'bottom'},
        }

        let data = [
            ['Department', '2015','2016',{role:'annotation'}],
            ['Shared Services', 3769.5, 3969.5, '$3,969.5M'],
            ['Support Services', 4393.2, 4593.2, '$4,593.2M'],
            ['Administration', 2228.7, 2428.7, '$2,428.7M'],
        ]
        let columns = [
            // type is required, else throws silent error
            { type:'string', label:"Department" }, 
            { type:'number', label:'2015'}, 
            { type:'number', label:'2016'}, 
            { type:'string', role:'annotation' }
        ]
        let rows = [
            ['Shared Services', 3769.5, 3969.5, '$3,969.5M'],
            ['Support Services', 4393.2, 4593.2, '$4,593.2M'],
            ['Administration', 2228.7, 2428.7, '$2,428.7M']
        ]
        this.setState({
            data,
            rows,
            columns,
            options,
            chart_events,
        });

    }
    render() {
        return <div>
        <Card>
        <hr />
        <CardTitle>Show</CardTitle>
        <CardText>Click or tap on any column to drill down</CardText>
        <Chart
            chartType = "ColumnChart"
            rows = {this.state.rows}
            columns = {this.state.columns}
            // data = {this.state.data}
            options = { this.state.options }
            graph_id = "ColumnChart"
            chartEvents = {this.state.chart_events}
        />
        </Card>
        <Card>
                <hr />
                <CardTitle>Compare</CardTitle>
        </Card>
        <Card>
                <hr />
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

