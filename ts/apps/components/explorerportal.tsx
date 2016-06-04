// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// explorerportal.tsx

'use strict'
import * as React from 'react'
var { Component } = React
// var Chart = require('../../../forked/react-google-charts/Chart.js')
import IconButton from 'material-ui/IconButton'
import FontIcon from 'material-ui/FontIcon'
import { Tabs, Tab } from 'material-ui/Tabs'
import {
    ChartParms,
    PortalConfig,
    ChartConfig,
    PortalChartLocation,
    ChartSettings,
    ChartSelectionContext
} from '../controllers/explorer/interfaces'

import { ExplorerChart } from './explorerchart'

interface ExplorePortalProps {
    budgetPortal:PortalConfig,
    onChangePortalChart:Function
}

class ExplorerPortal extends Component<ExplorePortalProps, any> {

    onChangeTab = () => {
        this.props.onChangePortalChart(this.props.budgetPortal.matrixLocation)
    }

    componentWillMount = () => {
        // console.log('budgetPortal',this.props.budgetPortal)
    }

    getTabs = () => {

        // generate array of chart tabs
        let chartTabs = this.props.budgetPortal.portalCharts.map(
            (chartTab:ChartConfig,chartindex) => {
            let chartparms = chartTab.portalchartparms
            let chartsettings = chartTab.portalchartsettings
            return <Tab style={{fontSize:"12px"}} 
                label={chartTab.chartblocktitle} 
                value="programs"
                key={chartindex}>
                <ExplorerChart 
                    chartsettings = {chartsettings}
                    chartparms = {chartparms}
                />
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
            <Tabs 
                onChange= { e => {
                    this.onChangeTab()
            }}>

                { chartTabs }

            </Tabs>
        </div>
    }
}

export { ExplorerPortal }

