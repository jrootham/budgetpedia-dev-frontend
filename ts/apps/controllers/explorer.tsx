// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// explorer.tsx

/*
    BUG: 'Working' sign persists when click fails to drill down,
        such as when staff facet is selected and max depth is reached
    BUG: navigating to dialog help box loses bar selection
    TODO: 
    - change 'Facets' to 'Perspectives'
    - do systematic check for error handling requirements; protect against 
        unexpected data (extrenal)
    - consider creating an instance around 'node' for the key abstraction
        - include getChartParms -> node.getChartParms
    - move state to central store
    ? Classes:
        Explorer
        ExplorerPortal
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
import {Card, CardTitle, CardText} from 'material-ui/Card'
import FontIcon from 'material-ui/FontIcon'
import IconButton from 'material-ui/IconButton'
import Dialog from 'material-ui/Dialog'

import { ExplorerBranch } from '../components/explorerbranch'
import { ChartSeries } from '../constants'
import { ChartTypeCodes, ChartCodeTypes } from '../constants'

import { setViewpointData } from './explorer/setviewpointdata'
import { getChartParms } from './explorer/getchartparms'
import { updateChartSelections } from './explorer/updatechartselections'
import * as Actions from '../../actions/actions'

import {
    MatrixNodeConfig,
    MatrixChartConfig,
    ChartParmsObj,
    MatrixLocation,
    PortalChartLocation,
    GetChartParmsProps,
    GetChartParmsCallbacks,
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
    // TODO: most of 
    state = {
        chartmatrix: [ [], [] ], // DrillDown, Compare (Later: Differences, Context, Build)
        yearslider: {singlevalue:[2015],doublevalue:[2005,2015]},
        yearscope:"one",
        dialogopen:false,
        userselections:{
            latestyear:2015,
            viewpoint:"FUNCTIONAL",
            dataseries:"BudgetExpenses",
            charttype: "ColumnChart",
            inflationadjusted:true,
        }
    }

    // numbered scroll elements, which self-register for response to 
    // chart column select clicks
    branchScrollBlocks = []
    
    // initialize once - create root drilldown and compare series
    componentDidMount = () => {

        this.initializeChartSeries()

    }

    initializeChartSeries = () => {
        let userselections = this.state.userselections,
            chartmatrix = this.state.chartmatrix
        let budgetdata = this.props.budgetdata

        var matrixlocation,
            chartParmsObj:ChartParmsObj

        // ------------------------[ POPULATE VIEWPOINT WITH VALUES ]-----------------------

        let viewpointname = userselections.viewpoint
        let dataseriesname = userselections.dataseries
        setViewpointData(viewpointname, dataseriesname, budgetdata,
            userselections.inflationadjusted)

        // *** CREATE BRANCH
        // -----------------[ THE DRILLDOWN ROOT ]-----------------

        // *** TODO: SIMPLIFY
        // assemble parms to get initial dataset
        let drilldownnodeconfig: MatrixNodeConfig =
            this.initRootNodeConfig(ChartSeries.DrillDown, userselections)
        let drilldownindex:any

        for (drilldownindex in drilldownnodeconfig.charts) {
            let props: GetChartParmsProps = {
                nodeConfig: drilldownnodeconfig,
                chartIndex: drilldownindex,
                userselections,
                budgetdata,
                chartmatrix,
            }
            let callbacks: GetChartParmsCallbacks = {
                refreshPresentation: this.refreshPresentation,
                onPortalCreation: this.onPortalCreation,
                workingStatus: this.workingStatus,
            }
            chartParmsObj = getChartParms(props, callbacks)

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

        // -------------[ SAVE INITIALIZATION ]----------------

        // make initial dataset available to chart
        this.refreshPresentation(chartmatrix)
        // this.setState({
        //     chartmatrix,
        // });

    }

    // -------------------[ INITIALIZE ROOT CHART CONFIG ]--------------------

    initRootNodeConfig = (matrixrow, userselections): MatrixNodeConfig => {
        let googlecharttype = userselections.charttype
        let chartCode = ChartTypeCodes[googlecharttype]
        let budgetdata = this.props.budgetdata
        let viewpoint = userselections.viewpoint
        let dataseries = userselections.dataseries
        let portalcharts = budgetdata.Viewpoints[viewpoint].PortalCharts[dataseries]
        let charts = []
        for (let type of portalcharts) {
            let chartconfig:MatrixChartConfig = {
                googlecharttype,
                chartCode,
            }
            chartconfig.nodedatapropertyname = type.Type
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

    handleDialogOpen = () => {
        this.setState({
            dialogopen: true
        })
    }

    handleDialogClose = () => {
        this.setState({
            dialogopen: false
        })
    }

    // ============================================================
    // ---------------------[ *** BRANCH *** CONTROL RESPONSES ]------------------

    // onPortalCreation animates scroll-in of new portal
    // TODO: isolate location from matrix location -- use branch column location instead
    // TODO: use requestAnimationFrame 
    //     https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
    
    // from https://github.com/DelvarWorld/easing-utils/blob/master/src/easing.js
    onPortalCreation = (newMatrixLocation:MatrixLocation) => {
        let matrixrow = newMatrixLocation.row
        let element:Element = this.branchScrollBlocks[matrixrow]
        if (!element) {
            console.error('expected branch element not found in onPortalCreation',newMatrixLocation)
            return
        }
        setTimeout(()=>{

            let scrollwidth = element.scrollWidth
            let scrollleft = element.scrollLeft
            let clientwidth = element.clientWidth
            let scrollright = scrollleft + clientwidth
            let targetright = scrollwidth - 500
            let adjustment = scrollright - targetright
            if (adjustment < 0) {
                let frames = 60
                let t = 1 / frames
                let timeinterval = 1000 / frames
                let counter = 0
                let tick = () => {
                    counter++
                    let factor = this.easeOutCubic(counter * t)
                    let scrollinterval = adjustment * factor
                    element.scrollLeft = scrollleft - scrollinterval
                    if (counter < frames) {
                        requestAnimationFrame(tick)
                    }
                }
                requestAnimationFrame(tick)
            }
        })
    }
    easeOutCubic = t => {
        const t1 = t - 1;
        return t1 * t1 * t1 + 1;
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

        this.initializeChartSeries()

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
        setViewpointData(viewpointname, dataseriesname, budgetdata,
            this.state.userselections.inflationadjusted)
        let matrixseries = chartmatrix[seriesref]
        let nodeconfig: MatrixNodeConfig
        let cellptr: any
        let isError = false
        let chartParmsObj:ChartParmsObj = null
        for (cellptr in matrixseries ) {
            nodeconfig = matrixseries[cellptr]
            let nodechartindex:any = null
            for (nodechartindex in nodeconfig.charts) {
                let props: GetChartParmsProps = {
                    nodeConfig: nodeconfig,
                    chartIndex: nodechartindex,
                    userselections,
                    budgetdata,
                    chartmatrix,
                }
                let callbacks: GetChartParmsCallbacks = {
                    refreshPresentation: this.refreshPresentation,
                    onPortalCreation: this.onPortalCreation,
                    workingStatus: this.workingStatus,
                }
                chartParmsObj = getChartParms(props, callbacks)
                if (chartParmsObj.isError) {
                    matrixseries.splice(cellptr)
                    if (cellptr > 0) { // unset the selection of the parent
                        let parentconfig: MatrixNodeConfig = matrixseries[cellptr - 1]
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
        this.refreshPresentation(chartmatrix)
        // this.setState({
        //     chartmatrix,
        // })
        setTimeout(() => {
            updateChartSelections(chartmatrix, seriesref)
        })
    }

    // callbacks
    workingStatus = status => {
        if (status) {
            this.props.dispatch(Actions.showWaitingMessage())
            // this.forceUpdate()
        } else {
            setTimeout(() => {
                this.props.dispatch(Actions.hideWaitingMessage())
            }, 250)
        }

    }

    onChangeBudgetPortalChart = (matrixLocation: MatrixLocation) => {
        setTimeout(()=>{
            updateChartSelections(this.state.chartmatrix, matrixLocation.row)
        })
    }

    refreshPresentation = chartmatrix => {
        this.setState({
            chartmatrix,
        })
    }

    // ============================================================
    // -------------------[ RENDER METHODS ]---------------------
    // TODO: belongs with explorerchart controller?
    switchChartCode = (location: PortalChartLocation, chartCode) => {
        let chartType = ChartCodeTypes[chartCode]
        let portalIndex = location.portalindex
        let chartmatrix = this.state.chartmatrix
        let nodeConfig: MatrixNodeConfig = chartmatrix[location.matrixlocation.row][location.matrixlocation.column]
        let oldChartType = nodeConfig.charts[portalIndex].googlecharttype
        nodeConfig.charts[portalIndex].googlecharttype = chartType
        let props: GetChartParmsProps = {
            nodeConfig: nodeConfig,
            chartIndex: portalIndex,
            userselections: this.state.userselections,
            budgetdata: this.props.budgetdata,
            chartmatrix,
        }
        let callbacks: GetChartParmsCallbacks = {
            refreshPresentation: this.refreshPresentation,
            onPortalCreation: this.onPortalCreation,
            workingStatus: this.workingStatus,
        }
        let chartParmsObj: ChartParmsObj = getChartParms(props, callbacks)
        if (!chartParmsObj.isError) {
            nodeConfig.charts[portalIndex].chartparms = chartParmsObj.chartParms
            nodeConfig.charts[portalIndex].chartCode =
                ChartTypeCodes[nodeConfig.charts[portalIndex].chartparms.chartType]
            nodeConfig.datanode = chartParmsObj.datanode
        } else {
            nodeConfig.charts[portalIndex].googlecharttype = oldChartType
        }
        this.refreshPresentation(chartmatrix)
        // this.setState({
        //     chartmatrix,
        // })
        setTimeout(() => {
            if (nodeConfig.charts[portalIndex].chart) {
                // refresh to new chart created with switch
                nodeConfig.charts[portalIndex].chart = nodeConfig.charts[portalIndex].ChartObject.chart
                // it turns out that "PieChart" needs column set to null
                // for setSelection to work
                if (nodeConfig.charts[portalIndex].googlecharttype == "PieChart") {
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


    // ===================================================================
    // ---------------------------[ RENDER ]------------------------------ 

    render() {

        let explorer = this


        let dialogbox =  
            <Dialog
                title = "Budget Explorer Help"
                modal = { false}
                open = { this.state.dialogopen }
                onRequestClose = { this.handleDialogClose }
                autoScrollBodyContent
            >
                <IconButton
                    style={{
                        top: 0,
                        right: 0,
                        padding: 0,
                        height: "36px",
                        width: "36px",
                        position: "absolute",
                        zIndex: 2,
                    }}
                    onTouchTap={ this.handleDialogClose } >

                    <FontIcon
                        className="material-icons"
                        style = {{ cursor: "pointer" }} >

                        close

                    </FontIcon>

                </IconButton>

                <p>In the explorer charts, Viewpoints include: </p>
                <dl>
                    <dt><strong>Functional</strong></dt>
                    <dd>combines City of Toronto Agencies and Divisions into groups according to the nature of the services delivered (this is the default ) </dd>
                    <dt><strong>Structural</strong></dt>
                    <dd>more traditional: separates Agencies from Divisions; groupings are closer to those found
                        in City annual Budget Summaries</dd>
                </dl>
                <p>Facets are the main datasets available: Expenditures, Revenues, and Staffing Positions (Full Time Equivalents) </p>
                <p>This prototype uses data from the City Council Approved Operating Budget Summary 2015 from the City of Toronto's open data portal
                </p>

                <p>
                    Click or tap on any column in the "By Programs" charts to drill-down. Other charts do not 
                    currently support drill-down.
                </p>

            </Dialog >


        // -----------[ DASHBOARD SEGMENT]-------------

/*        let singleslider = (explorer.state.yearscope == 'one')?
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
*/
        // -----------[ DRILLDOWN SEGMENT]-------------


        let drilldownsegment = 
        <Card initiallyExpanded >

            <CardTitle
                actAsExpander={false}
                showExpandableButton={false} >

                Budget Explorer

            </CardTitle>

            <CardText expandable >

                If you're new here, <a href="javascript:void(0)" 
                    onTouchTap={this.handleDialogOpen}>
                    read the help text</a> first.
                <IconButton tooltip="help"tooltipPosition="top-center"
                    onTouchTap = {
                        this.handleDialogOpen
                    }>
                    <FontIcon className="material-icons">help_outline</FontIcon>
                </IconButton>
             </CardText>
             <CardText>
             <ExplorerBranch 
                 budgetdata = {explorer.props.budgetdata}
                 chartmatrix = {explorer.state.chartmatrix}
                 userselections = {explorer.state.userselections}
                 callbacks = {{
                     switchChartCode:explorer.switchChartCode,
                     onChangeBudgetPortalChart: explorer.onChangeBudgetPortalChart,
                     switchViewpoint: explorer.switchViewpoint,
                     switchDataSeries: explorer.switchDataSeries,
                 }}
                 branchScrollBlocks = {explorer.branchScrollBlocks}
             />
            </CardText>

        </Card >

        // -----------[ COMBINE SEGMENTS ]---------------

        return <div>

            { dialogbox }

            { drilldownsegment }

{
            // { dashboardsegment }

            // { comparesegment }

            // { differencessegment }

            // { contextsegment }

            // { buildsegment }
}
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

