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
    ChartSelectionContext
} from '../controllers/explorer/interfaces'

import { ExplorerChart } from './explorerchart'

interface ExplorePortalProps {
    callbackid: string | number,
    portalNode:PortalConfig,
    onChangePortalChart:Function
}

class ExplorerPortal extends Component<ExplorePortalProps, any> {

    onChangeTab = () => {
        this.props.onChangePortalChart() 
    }

    componentWillMount = () => {
        // console.log('budgetPortal',this.props.budgetPortal)
    }

    getChartTabs = () => {

        // generate array of chart tabs
        let portalcharts = this.props.portalNode.budgetCells
        let chartTabs = portalcharts.map(
            (tabChart:ChartConfig,chartindex) => {
                //!Hack! if more than one chart the first must be expandable
            let expandable = ((portalcharts.length > 1) && (chartindex == 0))
            let chartparms = tabChart.chartparms
            let chartsettings = tabChart.chartsettings
            return <Tab style={{fontSize:"12px"}} 
                label={tabChart.chartblocktitle} 
                value={chartindex}
                key={chartindex}>
                <ExplorerChart 
                    chartsettings = {chartsettings}
                    chartparms = {chartparms}
                    expandable = {expandable}
                />
            </Tab>
        })

        return chartTabs

    }

    getTabObject = (chartTabs) => {
        // this deals with the edge case where switching facets causes current tail
        // chart to change from 2 charts to one by adding a value attr to tabs component
        if (chartTabs.length == 1) {
            return (
                <Tabs
                    value = {0}
                    onChange= { e => {
                        this.onChangeTab()
                    } }>

                    { chartTabs }

                </Tabs>
            )
        } else {
            return (
                <Tabs
                    onChange= { e => {
                        this.onChangeTab()
                    } }>

                    { chartTabs }

                </Tabs>
            )
        }
    }

    render() {

        let chartTabs = this.getChartTabs()

        let tabobject = this.getTabObject(chartTabs)

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
            }>{ this.props.portalNode.portalName }</div>
            { tabobject }
        </div>
    }
}

export { ExplorerPortal }

