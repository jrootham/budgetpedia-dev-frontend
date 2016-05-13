// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// explorer.tsx

/*
    TODO: 
    - do systematic check for error handling requirements; protect against 
        unexpected data (extrenal)
    - consider creating an instance around 'node' for the key abstraction
        - include getChartParms -> node.getChartParms
    - move state to central store
    ? Classes:
        BudgetData = budgetdata -- package of dataseries, lookup, and viewpoint data
        BudgetExplorer (set of BudgetNodes)
        BudgetNode (derive from chartconfig) Node within Hierarchy
        BedgetChart (derive from chartcomfig) - presentation of BudgetNode
        BudgetInfo explanation of budget node
        BudgetPath series of drilldown budgetnodes
        BudgetMatrix complete set of budget paths for BudgetExplorer
*/

/// <reference path="../../../typings-custom/react-google-charts.d.ts" />
/// <reference path="../../../typings-custom/react-slider.d.ts" />

'use strict'
import * as React from 'react'
var { Component } = React
// doesn't require .d.ts...! (reference available in index.tsx)
import { connect as injectStore} from 'react-redux'
import Card = require('material-ui/lib/card/card')
import CardTitle = require('material-ui/lib/card/card-title')
import CardText = require('material-ui/lib/card/card-text')
import RadioButton = require('material-ui/lib/radio-button')
import RadioButtonGroup = require('material-ui/lib/radio-button-group')
import FontIcon = require('material-ui/lib/font-icon')
import IconButton = require('material-ui/lib/icon-button')
import Divider = require('material-ui/lib/divider')
import Checkbox = require('material-ui/lib/checkbox')
import RaisedButton = require('material-ui/lib/raised-button')
import ReactSlider = require('react-slider')
import DropDownMenu = require('material-ui/lib/drop-down-menu')
import MenuItem = require('material-ui/lib/menus/menu-item')

import { ExplorerChart } from '../components/explorerchart'
import { ChartSeries } from '../constants'
import { ChartTypeCodes, ChartCodeTypes } from '../constants'

import { setViewpointAmounts } from './explorer/setviewpointamounts'
import { getChartParms } from './explorer/getchartparms'
import { updateChartSelections } from './explorer/updatechartselections'

import {
    BudgetNodeConfig,
    NodeChartConfig,
    ChartParms,
    ChartParmsObj,
    ChartSelectionContext,
    MatrixLocation,
    PortalConfig,
    PortalChartSettings,
    PortalChartLocation
} from './explorer/interfaces'
// import { categoryaliases } from '../constants'

class ExplorerClass extends Component< any, any > {

    // ============================================================
    // ---------------------[ INITIALIZE ]-------------------------

    constructor(props) {
        super(props);
    }

    // TODO: these values should be in global state to allow for re-creation after return visit
    // TODO: Take state initialization from external source
    // charts exist in a matrix (row/column) which contain a chartconfig object
    state = {
        chartmatrix: [ [], [] ], // DrillDown, Compare (Later: Differences, Context, Build)
        yearslider: {singlevalue:[2015],doublevalue:[2005,2015]},
        yearscope:"one",
        userselections:{
            latestyear:2015,
            viewpoint:"FUNCTIONAL",
            dataseries:"BudgetExpenses",
            charttype: "ColumnChart",
            inflationadjusted:true,
        }
    }

    branchScrollBlocks = []
    
    // initialize once - create root drilldown and compare series
    componentDidMount = () => {

        this.initializeChartSeries()

    }

    initializeChartSeries = () => {
        let userselections = this.state.userselections,
            chartmatrix = this.state.chartmatrix

        var matrixlocation,
            chartParmsObj:ChartParmsObj

        // ------------------------[ POPULATE VIEWPOINT WITH VALUES ]-----------------------

        let viewpointname = userselections.viewpoint
        let dataseriesname = userselections.dataseries
        let budgetdata = this.props.budgetdata
        setViewpointAmounts(viewpointname, dataseriesname, budgetdata,
            userselections.inflationadjusted)

        // -----------------[ THE DRILLDOWN ROOT ]-----------------

        // assemble parms to get initial dataset
        let drilldownnodeconfig: BudgetNodeConfig =
            this.initRootNodeConfig(ChartSeries.DrillDown, userselections)
        let drilldownindex:any
        for (drilldownindex in drilldownnodeconfig.charts) {
            chartParmsObj = getChartParms(
                drilldownnodeconfig, drilldownindex,
                userselections, budgetdata, this.setState.bind(this), chartmatrix, this.onPortalCreation)

            if (!chartParmsObj.isError) {

                drilldownnodeconfig.charts[drilldownindex].chartparms = chartParmsObj.chartParms
                drilldownnodeconfig.charts[drilldownindex].chartCode = 
                    ChartTypeCodes[drilldownnodeconfig.charts[drilldownindex].chartparms.chartType]

            } else {
                break
            }
        }
        if (!chartParmsObj.isError) {
            drilldownnodeconfig.datanode = chartParmsObj.datanode
            matrixlocation = drilldownnodeconfig.matrixlocation
            chartmatrix[matrixlocation.row][matrixlocation.column] = drilldownnodeconfig
        }

        // -----------------[ THE COMPARE ROOT ]-------------------
        /*
                // assemble parms to get initial dataset
                let comparechartconfig: ChartConfig = this.initRootChartConfig( ChartSeries.Compare, userselections )
        
                chartParmsObj = this.getChartParms( comparechartconfig )
        
                if (!chartParmsObj.error) {
        
                    comparechartconfig.chartparms = chartParmsObj.chartParms
        
                    matrixlocation = comparechartconfig.matrixlocation
                    chartmatrix[ matrixlocation.row ][ matrixlocation.column ] = comparechartconfig
        
                }
        */
        // -------------[ SAVE INITIALIZATION ]----------------

        // make initial dataset available to chart
        this.setState({
            chartmatrix,
        });

    }

    // -------------------[ INITIALIZE ROOT CHART CONFIG ]--------------------

    initRootNodeConfig = (matrixrow, userselections): BudgetNodeConfig => {
        let charttype = userselections.charttype
        let chartCode = ChartTypeCodes[charttype]
        let budgetdata = this.props.budgetdata
        let viewpoint = userselections.viewpoint
        let dataseries = userselections.dataseries
        let portalcharts = budgetdata.Viewpoints[viewpoint].PortalCharts[dataseries]
        let charts = []
        for (let type of portalcharts) {
            let chartconfig:NodeChartConfig = {
                charttype,
                chartCode,
            }
            chartconfig.portalcharttype = type.Type
            charts.push(chartconfig)
        }
        return {
            viewpoint:viewpoint,
            dataseries:dataseries,
            datapath: [], // get data from root viewpoint object
            matrixlocation: {
                row:matrixrow,
                column: 0
            },
            yearscope: {
                latestyear: userselections.latestyear,
                earliestyear: null,
                fullrange: false,
            },
            charts: charts
        }

    }

    // ============================================================
    // ---------------------[ CONTROL RESPONSES ]------------------
    // from https://github.com/DelvarWorld/easing-utils/blob/master/src/easing.js
    easeOutCubic = t => {
        const t1 = t - 1;
        return t1 * t1 * t1 + 1;
    }    
    onPortalCreation = (newPortalLocation:MatrixLocation) => {
        let matrixrow = newPortalLocation.row
        let element:Element = this.branchScrollBlocks[matrixrow]
        if (!element) {
            console.error('expected branch element not found in onPortalCreation',newPortalLocation)
            return
        }
        setTimeout(()=>{

            let scrollwidth = element.scrollWidth
            let scrollleft = element.scrollLeft
            let clientwidth = element.clientWidth
            let scrollright = scrollleft + clientwidth
            let targetright = scrollwidth - 500
            let adjustment = scrollright - targetright
            let frames = 60
            if (adjustment < 0) {
                let t = 1/frames
                let timeinterval = 1000 / frames
                let counter = 0
                let interval = setInterval(() => {
                    counter++
                    let factor = this.easeOutCubic(counter * t)
                    let scrollinterval = adjustment * factor
                    element.scrollLeft = scrollleft - scrollinterval
                    if (counter == frames) {
                        clearInterval(interval)
                    }
                }, timeinterval)
            }
        })
    }

    switchViewpoint = (viewpointname, seriesref) => {

        let userselections = this.state.userselections
        let chartmatrix = this.state.chartmatrix
        let chartseries = chartmatrix[seriesref]
        chartseries.splice(0) // remove subsequent charts
        userselections.viewpoint = viewpointname
        this.setState({
            userselections,
            chartmatrix,
        })
        // defer initialization until after update 
        // triggered by setState, to make sure previous
        // chart is destroyed; otherwise previous viewpoint 
        // settings are retained in error
        // setTimeout(() => {
        this.initializeChartSeries()
        // })

    }

    switchDataSeries = (seriesname,seriesref) => {

        let userselections = this.state.userselections
        userselections.dataseries = seriesname
        let chartmatrix = this.state.chartmatrix
        this.setState({
            userselections,
        })
        let viewpointname = this.state.userselections.viewpoint
        let dataseriesname = this.state.userselections.dataseries
        let budgetdata = this.props.budgetdata
        setViewpointAmounts(viewpointname, dataseriesname, budgetdata,
            this.state.userselections.inflationadjusted)
        let matrixseries = chartmatrix[seriesref]
        let nodeconfig: BudgetNodeConfig
        let cellptr: any
        let isError = false
        let chartParmsObj:ChartParmsObj = null
        for (cellptr in matrixseries ) {
            nodeconfig = matrixseries[cellptr]
            let nodechartindex:any = null
            for (nodechartindex in nodeconfig.charts) {
                chartParmsObj = getChartParms(nodeconfig, nodechartindex,
                    userselections, budgetdata, this.setState.bind(this), chartmatrix, this.onPortalCreation)
                if (chartParmsObj.isError) {
                    matrixseries.splice(cellptr)
                    if (cellptr > 0) { // unset the selection of the parent
                        let parentconfig: BudgetNodeConfig = matrixseries[cellptr - 1]
                        // disable reselection
                        parentconfig.charts[nodechartindex].chartselection = null
                        parentconfig.charts[nodechartindex].chart = null
                    }
                    isError = true
                    break
                } else {
                    nodeconfig.charts[nodechartindex].chartparms = chartParmsObj.chartParms
                    nodeconfig.charts[nodechartindex].chartCode = 
                        ChartTypeCodes[nodeconfig.charts[nodechartindex].chartparms.chartType]
                }
            }
        }
        if (!isError) {
            nodeconfig.dataseries = seriesname
            nodeconfig.datanode = chartParmsObj.datanode
        }
        this.setState({
            chartmatrix,
        })
        setTimeout(() => {
            updateChartSelections(chartmatrix, seriesref)
        })
    }

    // TODO: belongs with explorerchart controller?
    switchChartCode = (location:PortalChartLocation, chartCode) => {
        let chartType = ChartCodeTypes[chartCode]
        let portalIndex = location.portalindex
        let chartmatrix = this.state.chartmatrix
        let nodeConfig: BudgetNodeConfig = chartmatrix[location.matrixlocation.row][location.matrixlocation.column]
        let oldChartType = nodeConfig.charts[portalIndex].charttype
        nodeConfig.charts[portalIndex].charttype = chartType
        let chartParmsObj:ChartParmsObj = getChartParms(
            nodeConfig, 
            portalIndex,
            this.state.userselections, 
            this.props.budgetdata, 
            this.setState.bind(this), 
            chartmatrix,
            this.onPortalCreation)
        if (!chartParmsObj.isError) {
            nodeConfig.charts[portalIndex].chartparms = chartParmsObj.chartParms
            nodeConfig.charts[portalIndex].chartCode = 
                ChartTypeCodes[nodeConfig.charts[portalIndex].chartparms.chartType]
            nodeConfig.datanode = chartParmsObj.datanode
        } else {
            nodeConfig.charts[portalIndex].charttype = oldChartType
        }
        this.setState({
            chartmatrix,
        })
        setTimeout(() => {
            if (nodeConfig.charts[portalIndex].chart) {
                // refresh to new chart created with switch
                nodeConfig.charts[portalIndex].chart = nodeConfig.charts[portalIndex].Chart.chart
                // it turns out that "PieChart" needs column set to null
                // for setSelection to work
                if (nodeConfig.charts[portalIndex].charttype == "PieChart") {
                    nodeConfig.charts[portalIndex].chartselection[0].column = null
                } else {
                    // "ColumnChart" doesn't seem to care about column value,
                    // but we set it back to original (presumed) for consistency
                    nodeConfig.charts[portalIndex].chartselection[0].column = 1
                }
            }
            updateChartSelections(chartmatrix, location.matrixlocation.row)
        })
    }

    onChangeBudgetPortalChart = (portalLocation:MatrixLocation) => {
        setTimeout(()=>{
            updateChartSelections(this.state.chartmatrix, portalLocation.row)
        })
    }

    // ============================================================
    // -------------------[ RENDER METHODS ]---------------------

    // get React components to render
    getCharts = (matrixcolumn, matrixrow) => {

        let userselections = this.state.userselections

        let budgetdata = this.props.budgetdata

        let portaltitles = budgetdata.DataSeries[userselections.dataseries].Titles
        let portalseriesname = budgetdata.DataSeries[userselections.dataseries].Name

        let charts = matrixcolumn.map((nodeconfig: BudgetNodeConfig, index) => {

            let portalcharts = []

            for (let chartindex in nodeconfig.charts) {

                let chartblocktitle = null
                if ((nodeconfig.datanode.Contents == 'BASELINE')
                    || (nodeconfig.charts[chartindex].portalcharttype == 'Categories' )) {
                    chartblocktitle = portaltitles.Components
                } else {
                    chartblocktitle = portaltitles.Baseline
                }

                let portalchartparms = nodeconfig.charts[chartindex].chartparms

                let portalchartsettings: PortalChartSettings = {
                    // matrixlocation: chartconfig.matrixlocation,
                    onSwitchChartCode: this.switchChartCode,
                    chartCode: nodeconfig.charts[chartindex].chartCode,
                    graph_id: "ChartID" + matrixrow + '-' + index + '-' + chartindex,
                    chartblocktitle: "By " + chartblocktitle,
                    // index,
                }

                let portalchart = {
                    portalchartparms,
                    portalchartsettings,
                    portalchartlocation: {
                        matrixlocation: nodeconfig.matrixlocation,
                        portalindex: null // will be set on rendering
                    }
                }

                portalcharts.push(portalchart)

            }
            let portalname = null
            if (nodeconfig.parentdata) {
                portalname = nodeconfig.parentdata.Name
            } else {
                portalname = 'City Budget'
            }

            portalname += ' ' + portalseriesname

            let budgetPortal:PortalConfig = {
                portalCharts:portalcharts,
                portalName: portalname,
                onChangeBudgetPortal:this.onChangeBudgetPortalChart,
                portalLocation:{
                    column:matrixcolumn,
                    row:matrixrow,
                }
            }

            return <ExplorerChart
                key = {index}
                budgetPortal = { budgetPortal }
                onChangePortalChart = {this.onChangeBudgetPortalChart}
                />
        })

        return charts

    }

    // ===================================================================
    // ---------------------------[ RENDER ]------------------------------ 

    render() {

        let explorer = this

        // -----------[ DASHBOARD SEGMENT]-------------

        let singleslider = (explorer.state.yearscope == 'one')?
            <ReactSlider 
                className="horizontal-slider" 
                defaultValue={explorer.state.yearslider.singlevalue} 
                min={ 2003 } 
                max={ 2016 } 
                onChange = {(value) => {
                    explorer.setState({
                        yearslider: Object.assign(explorer.state.yearslider, { 
                            singlevalue: [value] 
                        })
                    })
                }}>
                <div >{explorer.state.yearslider.singlevalue[0]}</div>
            </ReactSlider > :''

        let doubleslider = (explorer.state.yearscope != 'one') ?
            <ReactSlider
                className="horizontal-slider"
                defaultValue={explorer.state.yearslider.doublevalue}
                min={ 2003 }
                max={ 2016 }
                withBars={(explorer.state.yearscope == 'all') ? true : false}
                onChange = {(value) => {
                    explorer.setState({
                        yearslider: Object.assign(explorer.state.yearslider,{ 
                            doublevalue: value 
                        })
                    })
                } }>
                <div >{explorer.state.yearslider.doublevalue[0]}</div>
                <div >{explorer.state.yearslider.doublevalue[1]}</div>
            </ReactSlider>:''

        let dashboardsegment = <Card initiallyExpanded={false}>

            <CardTitle
                actAsExpander
                showExpandableButton >
                Dashboard
            </CardTitle>
            <CardText expandable >
                <div style={{fontStyle:'italic'}} > These dashboard controls are not yet functional </div>
            <Divider />
            <Checkbox 
                label="Inflation adjusted"
                defaultChecked
             />
            <Divider />
            <div style={{ display: 'inline-block', verticalAlign: "bottom", height:"24px", marginRight:"24px" }} > 
                Years: 
            </div>
            <RadioButtonGroup
                style={{ display: 'inline-block' }}
                name="yearscope"
                defaultSelected={explorer.state.yearscope}
                onChange={(ev, selection) => {
                    explorer.setState({yearscope:selection})
                } }>
                <RadioButton
                    value="one"
                    label="One"
                    iconStyle={{ marginRight: "4px" }}
                    labelStyle={{ width: "auto", marginRight: "24px" }}
                    style={{ display: 'inline-block', width: 'auto' }} />
                <RadioButton
                    value="two"
                    label="Two (side-by-side)"
                    iconStyle={{ marginRight: "4px" }}
                    labelStyle={{ width: "auto", marginRight: "24px" }}
                    style={{ display: 'inline-block', width: 'auto' }} />
                <RadioButton
                    value="all"
                    label="All (timelines)"
                    iconStyle={{ marginRight: "4px" }}
                    labelStyle={{ width: "auto", marginRight: "24px" }}
                    style={{ display: 'inline-block', width: 'auto' }} />
            </RadioButtonGroup>

            { singleslider }

            { doubleslider }

            <div style={{ display: (explorer.state.yearscope == 'all') ? 'inline' : 'none' }} >
                <Checkbox 
                    label="Year-over-year change, rather than actuals"
                    defaultChecked = {false}
                    />
            </div>

            <Divider />

            <RaisedButton
                style = {{marginRight:"24px"}}
                type="button"
                label="Download" />

            <RaisedButton
                type="button"
                label="Reset" />
            </CardText>

        </Card>

        // -----------[ DRILLDOWN SEGMENT]-------------

        let drilldownlist = explorer.state.chartmatrix[ChartSeries.DrillDown]

        let drilldowncharts = explorer.getCharts(drilldownlist, ChartSeries.DrillDown)

        let drilldownsegment = 
        <Card initiallyExpanded >

            <CardTitle
                actAsExpander
                showExpandableButton >

                Drill Down

            </CardTitle>

            <CardText expandable >

                <p>In the charts below, Viewpoints include:</p>
                <dl>
                    <dt><strong>Functional</strong></dt>
                    <dd>combines Agencies and Divisions into groups according to the nature of the services delivered (this is the default)</dd>
                    <dt><strong>Structural</strong></dt>
                    <dd>more traditional: separates Agencies from Divisions; groupings are closer to those found
                        in City annual Budget Summaries</dd>
                </dl>
                <p>Facets are the main datasets available: Expenditures, Revenues, and Staffing Positions (Full Time Equivalents)</p>
                <p>This prototype uses data from the City Council Approved Operating Budget Summary 2015 from the City of Toronto's open data portal
                </p>
                <p>
                    Click or tap on any column (in the "By Programs" charts) to drill down.
                    <IconButton tooltip="help"tooltipPosition="top-center" disabled>
                        <FontIcon className="material-icons">help_outline</FontIcon>
                    </IconButton>
                </p>
                <div style={{
                    padding: "3px"}}>
                    <span style={{fontStyle: "italic"}}>Viewpoint: </span> 
                    <DropDownMenu 
                        value={this.state.userselections.viewpoint} 
                        style={{
                        }}
                        onChange={
                            (e,index,value) => {
                                this.switchViewpoint(value, ChartSeries.DrillDown)
                            }
                        }
                    >
                        <MenuItem value={'FUNCTIONAL'} primaryText="Functional"/>
                        <MenuItem value={'STRUCTURAL'} primaryText="Structural"/>
                    </DropDownMenu>

                    <span style={{margin:"0 10px 0 10px",fontStyle:"italic"}}>Facets: </span>

                    <IconButton 
                        tooltip="Expenses" 
                        tooltipPosition="top-center" 
                        onTouchTap= {
                            e => {
                                this.switchDataSeries('BudgetExpenses', ChartSeries.DrillDown)
                            }
                        }
                        style={
                            {
                                backgroundColor: (this.state.userselections.dataseries == 'BudgetExpenses')
                                ? "rgba(144,238,144,0.5)"
                                : 'transparent',
                                borderRadius: "50%"
                            }
                        }>
                        <FontIcon className="material-icons">attach_money</FontIcon>
                    </IconButton>

                    <IconButton 
                        tooltip="Revenues" 
                        tooltipPosition="top-center" 
                        onTouchTap= {
                            e => {
                                this.switchDataSeries('BudgetRevenues', ChartSeries.DrillDown)
                            }
                        }
                        style={
                            {
                                backgroundColor: (this.state.userselections.dataseries == 'BudgetRevenues')
                                ? "rgba(144,238,144,0.5)"
                                : 'transparent',
                                borderRadius: "50%"
                            }
                        }>
                        <FontIcon className="material-icons">receipt</FontIcon>
                    </IconButton>

                    <IconButton 
                        tooltip="Staffing"
                        tooltipPosition="top-center" 
                        onTouchTap= {
                            e => {
                                this.switchDataSeries('BudgetStaffing', ChartSeries.DrillDown)
                            }
                        }
                        style={
                            {
                                backgroundColor: (this.state.userselections.dataseries == 'BudgetStaffing')
                                ? "rgba(144,238,144,0.5)"
                                : 'transparent',
                                borderRadius: "50%"
                            }
                        }>
                        >
                        <FontIcon className="material-icons">people</FontIcon>
                    </IconButton >

                </div>

                <div style={{ whiteSpace: "nowrap" }}>
                    <div ref={node =>{
                        this.branchScrollBlocks[ChartSeries.DrillDown] = node
                    }} style={{ overflow: "scroll" }}>

                        { drilldowncharts }

                        <div style={{ display: "inline-block", width: "500px" }}></div>

                    </div>
                </div>

            </CardText>

        </Card >

        // --------------[ COMPARE SEGMENT]-------------

        let comparelist = explorer.state.chartmatrix[ChartSeries.Compare]

        let comparecharts = explorer.getCharts(comparelist, ChartSeries.Compare)

        let comparesegment = <Card initiallyExpanded = {false}>

            <CardTitle
                actAsExpander
                showExpandableButton >

                Compare

            </CardTitle>

            <CardText expandable >

                <p>Click or tap on any column to drill down</p>
                <div style={{ whiteSpace: "nowrap" }}>

                    <div style={{ overflow: "scroll" }}>

                        { comparecharts }

                        <div style={{ display: "inline-block", width: "500px" }}></div>

                    </div>

                </div>

            </CardText>
            
        </Card>

        // -----------[ DIFFERENCES SEGMENT ]-------------

        let differencessegment = <Card>

            <CardTitle>Show differences</CardTitle>

        </Card>

        // -----------[ CONTEXT SEGMENT ]-------------

        let contextsegment = <Card>

            <CardTitle>Context</CardTitle>

        </Card>

        // -----------[ BUILD SEGMENT ]-------------

        let buildsegment = <Card>

            <CardTitle>Build</CardTitle>

        </Card>

        // -----------[ COMBINE SEGMENTS ]---------------

        return <div>

            { dashboardsegment }

            { drilldownsegment }

            { comparesegment }

            { differencessegment }

            { contextsegment }

            { buildsegment }

        </div>
    }

}

// ====================================================================================
// ------------------------------[ INJECT DATA STORE ]---------------------------------

let mapStateToProps = (state) => {

    let { budgetdata } = state

    return {

        budgetdata,

    }

}

let Explorer: typeof ExplorerClass = injectStore(mapStateToProps)(ExplorerClass)

export { Explorer }

