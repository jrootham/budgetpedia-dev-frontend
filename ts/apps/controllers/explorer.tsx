// tribes.tsx
// required by bundler
/// <reference path="../../../typings-custom/react-google-charts.d.ts" />
import * as React from 'react'
import ChartObject = require('react-google-charts')
var { Component } = React

let Chart = ChartObject['Chart']

console.log('Chart = ',Chart)

class Explorer extends Component<any, any> {

    constructor(props) {
        super(props);
        this.state = {
            data: null,
            options: null
        };
    }

    componentDidMount = () => {

        let options = {
            title: 'Age vs. Weight comparison',
            hAxis: { title: 'Age', minValue: 0, maxValue: 15 },
            vAxis: { title: 'Weight', minValue: 0, maxValue: 15 },
            legend: 'none'
        };

        let data = [
            ['Age', 'Weight'],
            [8, 12],
            [4, 5.5],
            [11, 14],
            [4, 5],
            [3, 3.5],
            [6.5, 7]
        ];
        this.setState({
            data: data,
            options: options
        });

    }
    render() {
        return <Chart
            chartType = "ScatterChart"
            data = { this.state.data }
            options = { this.state.options }
            graph_id = "ScatterChart"
            width = { "100%"} 
            height = { "400px"}  
            legend_toggle = { true }
        />
    }

}

export { Explorer }

