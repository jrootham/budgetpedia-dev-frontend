// tribes.tsx
// required by bundler
/// <reference path="../../../typings-custom/react-google-charts.d.ts" />
import * as React from 'react'
import ChartObject = require('react-google-charts')
var { Component } = React
import { connect as injectStore} from 'react-redux'

let Chart = ChartObject['Chart']

class ExplorerClass extends Component<any, any> {

    constructor(props) {
        super(props);
        this.state = {
            data: null,
            options: null,
            chart_events:null,
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
            title: "Toronto Budget 2016 $M (Total: $10,991.5M)",
            hAxis: {title: 'Departments'},
            vAxis: {title: 'Amount'},
            bar: { groupWidth: "95%" },
            width: 250,
            height: 250,
            legend: 'none',
        }

        let data = [
            ['Department', '2016',{role:'annotation'},{role: 'annotationText'}],
            ['Shared Services', 3969.5, '$3,969.5M','Roads, Parks etc.'],
            ['Support Services', 4593.2, '$4,593.2M','Police, Housing etc.'],
            ['Administration', 2428.7, '$2,428.7M','City Hall etc.'],
        ]
        this.setState({
            data,
            options,
            chart_events,
        });

    }
    render() {
        return <Chart
            chartType = "ColumnChart"
            data = { this.state.data }
            options = { this.state.options }
            graph_id = "ColumnChart"
            chartEvents = {this.state.chart_events}
        />
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

