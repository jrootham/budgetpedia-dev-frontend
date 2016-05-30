// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// explorerchart.tsx
// 
// <reference path="../../../typings-custom/chart.d.ts" />
'use strict'
import * as React from 'react'
var { Component } = React
// var { Chart } = require('../../../forked/react-google-charts/Chart.js')
var { Chart } = require('react-google-charts')
import IconButton = require('material-ui/lib/icon-button')
import FontIcon = require('material-ui/lib/font-icon')
import {
    ChartParms,
    ChartSettings,
} from '../controllers/explorer/interfaces'

interface ExplorerChartProps {
    chartsettings: ChartSettings,
    chartparms: ChartParms,
}

class ExplorerChart extends Component<ExplorerChartProps, any> {

    onChangeChartCode = (chartCode) => {
        this.props.chartsettings.onSwitchChartCode(chartCode)
    }

    render() {

        let chartparms = this.props.chartparms
        let chartsettings = this.props.chartsettings

        return <div>
            <div style={{ padding: "3px" }}>
                <IconButton
                    tooltip="Column Chart"
                    tooltipPosition="top-center"
                    style={
                        {
                            backgroundColor: (chartsettings.chartCode == "ColumnChart")
                                ? "rgba(144,238,144,0.5)"
                                : "transparent",
                            borderRadius: "50%"
                        }
                    }
                    onTouchTap={ e => {
                        this.onChangeChartCode('ColumnChart')
                    } }>
                    <FontIcon className="material-icons">insert_chart</FontIcon>
                </IconButton>
                <IconButton
                    tooltip="Donut Pie Chart"
                    tooltipPosition="top-center"
                    style={
                        {
                            backgroundColor: (chartsettings.chartCode == "DonutChart")
                                ? "rgba(144,238,144,0.5)"
                                : "transparent",
                            borderRadius: "50%"
                        }
                    }
                    onTouchTap={ e => {
                        this.onChangeChartCode('DonutChart')
                    } }>
                    <FontIcon className="material-icons">donut_small</FontIcon>
                </IconButton>
                <IconButton
                    tooltip="Timeline"
                    tooltipPosition="top-center"
                    style={
                        {
                            backgroundColor: (this.props.chartsettings.chartCode == "TimeLine")
                                ? "rgba(144,238,144,0.5)"
                                : "transparent",
                            borderRadius: "50%"
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
                chartType = { chartparms.chartType }
                options = { chartparms.options }
                chartEvents = { chartparms.events }
                rows = { chartparms.rows }
                columns = { chartparms.columns }
                // used to create and cache html element id attribute
                graph_id = { chartsettings.graph_id }
                />
            <div style={{ position: "absolute", bottom: 0, left: 0, zIndex: 1000, padding: "3px" }}>
                <IconButton disabled><FontIcon className="material-icons">view_list</FontIcon></IconButton>
            </div>
            <div style={{ position: "absolute", bottom: 0, right: 0, zIndex: 1000, padding: "3px" }}>
                <IconButton disabled><FontIcon className="material-icons">note</FontIcon></IconButton>
            </div>
        </div>
    }
}

export { ExplorerChart }