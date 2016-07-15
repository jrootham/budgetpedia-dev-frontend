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
} from '../modules/interfaces'

import ExplorerChart from './explorerchart'
import BudgetNode from '../classes/budgetnode'

interface ExplorePortalProps {
    callbackid: string | number,
    budgetNode: BudgetNode,// not yet used
    displaycallbacks: {onChangePortalTab:Function,}
    portalSettings:PortalConfig,
}

class ExplorerPortal extends Component<ExplorePortalProps, any> {

    onChangeTab = () => {
        this.props.displaycallbacks.onChangePortalTab() 
    }

    componentDidMount() {
        console.log('chartrefs',this._chartrefs)
    }

    _chartrefs:any[] = []

    getChartTabs = () => {

        // generate array of chart tabs
        let { portalSettings, callbackid, budgetNode } = this.props
        // let budgetCells = budgetNode.cells
        let { chartConfigs } = portalSettings 
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
                    ref = {node => {this._chartrefs[cellIndex] = node}} 
                    callbackid = { cellIndex }
                    cellSettings = { cellSettings }
                    callbacks = { cellCallbacks }
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

        let { portalSettings } = this.props

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
            }>{ portalSettings.portalName }</div>
            { tabobject }
        </div>
    }
}

export { ExplorerPortal }

