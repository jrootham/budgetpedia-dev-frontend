// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// explorerchart.tsx
'use strict'
import * as React from 'react'
var { Component } = React
import ChartObject = require('react-google-charts')
let Chart = ChartObject['Chart']
import IconButton = require('material-ui/lib/icon-button')
import FontIcon = require('material-ui/lib/font-icon')

class ExplorerChart extends Component<any, any> {
    render() {
        return <div style={{ position:"relative", display: "inline-block", padding:"10px",backgroundColor: "Beige" }}>
            <div style={{ position: "absolute", top:0,left:0,zIndex:1000, padding:"3px"}}>
                <IconButton disabled><FontIcon className="material-icons">insert_chart</FontIcon></IconButton>
                <IconButton disabled><FontIcon className="material-icons">pie_chart</FontIcon></IconButton>
            </div>
            <div style={{ position: "absolute", top: 0, right: 0, zIndex: 1000, padding: "3px" }}>
                <IconButton disabled><FontIcon className="material-icons">info_outline</FontIcon></IconButton>
                <IconButton><FontIcon className="material-icons">help_outline</FontIcon></IconButton>
            </div>
            <Chart
                chartType = {this.props.chartType}
                options = { this.props.options }
                chartEvents = {this.props.chartEvents}
                rows = {this.props.rows}
                columns = {this.props.columns}
                // used to create and cache html element id attribute
                graph_id = {this.props.graph_id}
                />
            <div style={{ position: "absolute", bottom: 0, left: 0, zIndex: 1000, padding: "3px" }}>
                <IconButton disabled><FontIcon className="material-icons">view_list</FontIcon></IconButton>
            </div>
            <div style={{ 
                position: "absolute", 
                bottom: "60px",
                top:"60px",
                width:"45px",
                whiteSpace:"normal", 
                right: 0, 
                zIndex: 1000, 
                padding: "3px" }
            }>
                <IconButton style={{backgroundColor:'lightgreen'}}><FontIcon className="material-icons">attach_money</FontIcon></IconButton>
                <IconButton><FontIcon className="material-icons">receipt</FontIcon></IconButton>
                <IconButton><FontIcon className="material-icons">people</FontIcon></IconButton >
            </div>
        </div>
    }
}

export { ExplorerChart }