// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// explorerchart.tsx
// 
// <reference path="../../../typings-custom/chart.d.ts" />
'use strict'
import * as React from 'react'
var { Component } = React
var { Chart } = require('../../../forked/react-google-charts/Chart.js')
// var { Chart } = require('react-google-charts')
import IconButton from 'material-ui/IconButton'
import FontIcon from 'material-ui/FontIcon'
import SvgIcon from 'material-ui/SvgIcon'
import {
    ChartParms,
    ChartSettings,
    ChartCallbacks,
} from '../controllers/explorer/interfaces'

interface ExplorerChartProps {
    callbackid: string | number,
    cellSettings: ChartSettings,
    cellCallbacks: ChartCallbacks,
    chartParms: ChartParms,
    expandable: boolean,
}

class ExplorerChart extends Component<ExplorerChartProps, any> {


    onChangeChartCode = (chartCode) => {
        this.props.cellCallbacks.onSwitchChartCode(chartCode)
    }

    render() {

        let chartparms = this.props.chartParms
        if (!this.props.expandable) {
            chartparms.options['backgroundColor'] = '#E4E4E4'
        }
        let chartsettings = this.props.cellSettings

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
                            backgroundColor: (this.props.cellSettings.chartCode == "TimeLine")
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
                <IconButton
                    tooltip="Stacked chart"
                    tooltipPosition="top-center"
                    style={
                        {
                            backgroundColor: (this.props.cellSettings.chartCode == "StackedArea")
                                ? "rgba(144,238,144,0.5)"
                                : "transparent",
                            borderRadius: "50%"
                        }
                    }
                    disabled
                    onTouchTap={ e => {
                        this.onChangeChartCode('StackedArea')
                    } }>
                    <SvgIcon style={{height:"24px",width:"24px"}} >
                        <path d="M20,6c0-0.587-0.257-1.167-0.75-1.562c-0.863-0.69-2.121-0.551-2.812,0.312l-2.789,3.486L11.2,6.4  c-0.864-0.648-2.087-0.493-2.762,0.351l-4,5C4.144,12.119,4,12.562,4,13v3h16V6z"/>
                        <path d="M20,19H4c-0.552,0-1,0.447-1,1s0.448,1,1,1h16c0.552,0,1-0.447,1-1S20.552,19,20,19z"/>
                    </SvgIcon>
                </IconButton>
            </div>
            <div style={{ position: "absolute", top: 0, right: "72px", zIndex: 1000, padding: "3px" }}>
                <IconButton tooltip="Information"
                    tooltipPosition="top-center"
                    disabled><FontIcon className="material-icons">info_outline</FontIcon></IconButton>
            </div>
            <div style={{ position: "absolute", top: 0, right: "36px", zIndex: 1000, padding: "3px" }}>
                <IconButton tooltip="Shared stories"
                    tooltipPosition="top-center"
                    disabled><FontIcon className="material-icons">share</FontIcon></IconButton>
            </div>
            <div style={{ position: "absolute", top: 0, right: 0, zIndex: 1000, padding: "3px" }}>
                <IconButton tooltip="Calls to action"
                    tooltipPosition="top-center"
                    disabled><FontIcon className="material-icons">announcement</FontIcon></IconButton>
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
            <div style={{
                position:"absolute",
                bottom:0,
                left:"40px",
                fontSize:"9px",
                fontStyle:"italic",
            }}>
               {this.props.expandable?'drill down':'no drill down'}
            </div>
        </div>
    }
}

export { ExplorerChart }