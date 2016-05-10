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
import {
    // ChartConfig,
    ChartParms,
    PortalConfig,
    PortalChartConfig,
    PortalChartLocation,
    PortalChartSettings,
    ChartSelectionContext
} from '../controllers/explorer/interfaces'

interface ExploreChartProps {
    budgetPortal:PortalConfig,
}

class ExplorerChart extends Component<ExploreChartProps, any> {

    onChangeChartCode = (chartCode,location:PortalChartLocation) => {
        this.props.budgetPortal.portalCharts[location.portalindex]
            .portalchartsettings.onSwitchChartCode(location, chartCode)
    }

    componentWillMount = () => {
        // console.log('budgetPortal',this.props.budgetPortal)
    }

    getTabs = () => {

        // generate array of chart tabs
        let chartTabs = this.props.budgetPortal.portalCharts.map((chartTab:PortalChartConfig,chartindex) => {
            chartTab.portalchartlocation.portalindex = chartindex
            let chartparms = chartTab.portalchartparms
            return <Tab style={{fontSize:"12px"}} 
                label={chartTab.portalchartsettings.chartblocktitle} 
                value="programs"
                key={chartindex}>
                <div style={{ padding: "3px" }}>
                    <IconButton
                        tooltip="Column Chart"
                        tooltipPosition="top-center"
                        style={
                            {
                                backgroundColor: (chartTab.portalchartsettings.chartCode == "ColumnChart")
                                    ? "rgba(144,238,144,0.5)"
                                    : "transparent",
                                borderRadius: "50%"
                            }
                        }
                        onTouchTap={ e => {
                            this.onChangeChartCode('ColumnChart',chartTab.portalchartlocation)
                        } }>
                        <FontIcon className="material-icons">insert_chart</FontIcon>
                    </IconButton>
                    <IconButton
                        tooltip="Donut Pie Chart"
                        tooltipPosition="top-center"
                        style={
                            {
                                backgroundColor: (chartTab.portalchartsettings.chartCode == "DonutChart")
                                    ? "rgba(144,238,144,0.5)"
                                    : "transparent",
                                borderRadius: "50%"
                            }
                        }
                        onTouchTap={ e => {
                            this.onChangeChartCode('DonutChart',chartTab.portalchartlocation)
                        } }>
                        <FontIcon className="material-icons">donut_small</FontIcon>
                    </IconButton>
                    <IconButton
                        tooltip="Timeline"
                        tooltipPosition="top-center"
                        style={
                            {
                                backgroundColor: (chartTab.portalchartsettings.chartCode == "TimeLine")
                                    ? "rgba(144,238,144,0.5)"
                                    : "transparent",
                                borderRadius: "50%"
                            }
                        }
                        disabled
                        onTouchTap={ e => {
                            this.onChangeChartCode('Timeline',chartTab.portalchartlocation)
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
                    graph_id = { chartTab.portalchartsettings.graph_id }
                    />
                <div style={{ position: "absolute", bottom: 0, left: 0, zIndex: 1000, padding: "3px" }}>
                    <IconButton disabled><FontIcon className="material-icons">view_list</FontIcon></IconButton>
                </div>
            </Tab>
        })

        // return chartTabs to caller
        return chartTabs

    }

    render() {

        let chartTabs = this.getTabs()

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
                    left: "10px", 
                    padding: "3px 20px 3px 20px",
                    borderRadius: "6px",
                    border:"1px solid silver",
                    fontSize:"12px",
                    color:"lightgreen",
                    fontWeight:"bold",
                    display: "inline-block", 
                    backgroundColor: "#00bcd4",
                }
            }>{ this.props.budgetPortal.portalName }</div>
            <Tabs>

                { chartTabs }

            </Tabs>
        </div>
    }
}

export { ExplorerChart }

