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
} from '../containers/explorer/interfaces'

import ExplorerChart from './explorerchart'
import BudgetNode from '../classes/budgetnode'

interface ExplorePortalProps {
    callbackid: string | number,
    portalConfig:PortalConfig,
    portalCallbacks: {onChangePortalTab:Function,}
    budgetNode: BudgetNode,
}

class ExplorerPortal extends Component<ExplorePortalProps, any> {

    onChangeTab = () => {
        this.props.portalCallbacks.onChangePortalTab() 
    }

    getChartTabs = () => {

        // generate array of chart tabs
        let { portalConfig, callbackid, budgetNode } = this.props
        // let budgetCells = budgetNode.cells
        let { chartConfigs } = portalConfig 
        let cellTabs = chartConfigs.map(
            (portalCell:ChartConfig,cellIndex) => {
                //!Hack! if more than one chart the first must be expandable
            let expandable = ((chartConfigs.length > 1) && (cellIndex == 0))
            let { chartParms, cellCallbacks, cellSettings, cellTitle } = portalCell
            // curry callback, prepare for passing to exportchart
            cellCallbacks.onSwitchChartCode = cellCallbacks.onSwitchChartCode(callbackid)
            return <Tab style={{fontSize:"12px"}} 
                label={ cellTitle } 
                value={ cellIndex }
                key={ cellIndex }>
                <ExplorerChart 
                    callbackid = { cellIndex }
                    cellSettings = { cellSettings }
                    cellCallbacks = { cellCallbacks }
                    chartParms = { chartParms }
                    expandable = { expandable }
                />
            </Tab>
        })

        return cellTabs

    }

    getTabObject = (chartTabs) => {
        // this deals with the edge case where switching facets causes current tail
        // chart to change from 2 charts to one by adding a value attr to tabs component
        if (chartTabs.length == 1) {
            return (
                <Tabs
                    value = {0}
                    onChange= { () => {
                        this.onChangeTab()
                    } }>

                    { chartTabs }

                </Tabs>
            )
        } else {
            return (
                <Tabs
                    onChange= { () => {
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

        let { portalConfig } = this.props

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
            }>{ portalConfig.portalName }</div>
            { tabobject }
        </div>
    }
}

export { ExplorerPortal }

