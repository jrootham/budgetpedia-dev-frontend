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

import ExplorerChart from './explorerchart'

interface ExplorePortalProps {
    callbackid: string | number,
    portalNode:PortalConfig,
    onChangePortalTab:Function
}

class ExplorerPortal extends Component<ExplorePortalProps, any> {

    onChangeTab = () => {
        this.props.onChangePortalTab() 
    }

    getChartTabs = () => {

        // generate array of chart tabs
        let { portalNode, callbackid } = this.props
        let { budgetCells } = portalNode
        let cellTabs = budgetCells.map(
            (portalCell:ChartConfig,cellIndex) => {
                //!Hack! if more than one chart the first must be expandable
            let expandable = ((budgetCells.length > 1) && (cellIndex == 0))
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

