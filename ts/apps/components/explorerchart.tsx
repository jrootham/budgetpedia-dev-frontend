// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// explorerchart.tsx
'use strict'
import * as React from 'react'
var { Component } = React
import ChartObject = require('react-google-charts')
let Chart = ChartObject['Chart']

class ExplorerChart extends Component<any, any> {
    render() {
        return <div style={{ display: "inline-block", padding:"10px",backgroundColor: "Beige" }}>
            <Chart
                chartType = {this.props.chartType}
                options = { this.props.options }
                chartEvents = {this.props.chartEvents}
                rows = {this.props.rows}
                columns = {this.props.columns}
                // used to create and cache html element id attribute
                graph_id = {this.props.graph_id}
                />
        </div>
    }
}

export { ExplorerChart }