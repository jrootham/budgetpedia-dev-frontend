// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// explorerchart.tsx

'use strict'
import * as React from 'react'
var { Component } = React
var Chart = require('../../../forked/react-google-charts/Chart.js')
import IconButton = require('material-ui/lib/icon-button')
import FontIcon = require('material-ui/lib/font-icon')
import Tabs = require('material-ui/lib/tabs/tabs')
import Tab = require('material-ui/lib/tabs/tab')

interface ExploreChartProps {
    chartType: string,
    options: any,
    chartEvents: any[],
    rows: any[],
    columns: any[],
    graph_id: string,
    settings: any,
    title?:string,
}

class ExplorerChart extends Component<ExploreChartProps, any> {

    onChangeChartCode = chartCode => {
        this.props.settings.onChartCode(this.props.settings.location, chartCode)
    }

    render() {
        return <div style={
                { 
                    position:"relative", 
                    display: "inline-block", 
                    padding:"10px",
                    backgroundColor: "Beige",
                    verticalAlign:"top",
                    width:"400px",
                }
            }>
            <div style={
                { 
                    position: "absolute", 
                    top: 0, 
                    left: "150px", 
                    width:"100px", 
                    display: "inline-block", 
                    zIndex: "1500",
                    textAlign:"center"
                }
            }>City Budget</div>
            <Tabs>
                <Tab label="by Programs" value="programs">
                    <div style={{ position: "absolute", top: 0, left: 0, zIndex: 1000, padding: "3px" }}>
                        <IconButton 
                            tooltip="Column Chart" 
                            tooltipPosition="bottom-center" 
                            style={
                                { backgroundColor: (this.props.settings.chartCode == "ColumnChart")
                                    ? "rgba(144,238,144,0.5)"
                                    : "transparent" 
                                }
                            }
                            onTouchTap={ e =>{
                                this.onChangeChartCode('ColumnChart')
                            }}>
                            <FontIcon className="material-icons">insert_chart</FontIcon>
                        </IconButton>
                        <IconButton 
                            tooltip="Donut Pie Chart" 
                            tooltipPosition="bottom-center"
                            style={
                                {
                                    backgroundColor: (this.props.settings.chartCode == "DonutChart")
                                        ? "rgba(144,238,144,0.5)"
                                        : "transparent"
                                }
                            }
                            onTouchTap={ e => {
                                this.onChangeChartCode('DonutChart')
                            } }>
                            <FontIcon className="material-icons">donut_small</FontIcon>
                        </IconButton>
                        <IconButton 
                            tooltip="Timeline" 
                            tooltipPosition="bottom-center"
                            style={
                                {
                                    backgroundColor: (this.props.settings.chartCode == "TimeLine")
                                        ? "rgba(144,238,144,0.5)"
                                        : "transparent"
                                }
                            }
                            disabled
                            onTouchTap={ e => {
                                this.onChangeChartCode('Timeline')
                            } }>
                            <FontIcon className="material-icons">timeline</FontIcon>
                        </IconButton>
                    </div>
                    <div style={{ position: "absolute", top: 0, right: 0, zIndex: 1000, padding: "3px" }}>
                        <IconButton disabled><FontIcon className="material-icons">info_outline</FontIcon></IconButton>
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
                </Tab>
                <Tab label = "By Expenditures" value="resources">
                    <div>Resources</div>
                </Tab>
            </Tabs>
        </div>
    }
}

export { ExplorerChart }