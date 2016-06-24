// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// explorerbranch.tsx

'use strict'
import * as React from 'react'
var { Component } = React

import {
    MatrixNodeConfig,
    MatrixChartConfig,
    ChartParms,
    ChartParmsObj,
    ChartSelectionContext,
    MatrixLocation,
    PortalConfig,
    ChartSettings,
    PortalChartLocation,
    ChartConfig,
    GetChartParmsProps,
    GetChartParmsCallbacks,
    CreateChildNodeProps,
    CreateChildNodeCallbacks,
} from '../controllers/explorer/interfaces'

import { ExplorerPortal } from './explorerportal'
import { getBudgetNode } from '../controllers/explorer/getbudgetnode'

import DropDownMenu from 'material-ui/DropDownMenu'
import MenuItem from 'material-ui/MenuItem'

import {Card, CardTitle, CardText} from 'material-ui/Card'
import FontIcon from 'material-ui/FontIcon'
import IconButton from 'material-ui/IconButton'
import Dialog from 'material-ui/Dialog'
import Snackbar from 'material-ui/Snackbar';

import { ChartTypeCodes, ChartCodeTypes } from '../constants'

import databaseapi , { DatasetConfig } from '../../local/databaseapi'
import getChartParms from '../controllers/explorer/getchartparms'
import { updateChartSelections } from '../controllers/explorer/updatechartselections'
import { createChildNode } from '../controllers/explorer/onchartcomponentselection'
import * as Actions from '../../actions/actions'

interface ExploreBranchProps {
    branchdata: any,
    // budgetdata: any,
    // matrixrow: any,
    callbacks:any,
    userselections:any,
    yearscope:any,
    yearslider:any,
    branchkey:any,
}

class ExplorerBranch extends Component<ExploreBranchProps, any> {

    constructor(props) {
        super(props);
    }

    // TODO: these values should be in global state to allow for re-creation after return visit
    // TODO: Take state initialization from external source
    // charts exist in a matrix (row/column) which contain a chartconfig object
    // TODO: most of 
    state = {
        chartmatrixrow:this.props.branchdata.nodes,
        yearslider: this.props.yearslider,
        yearscope: this.props.yearscope,
        userselections: this.props.userselections,
        snackbar:{open:false,message:'empty'}
    }

    handleSnackbarRequestClose = () => {
        this.setState({
            snackbar: {
                open: false,
                message: 'empty',
            }
        })
        setTimeout(() => {
            updateChartSelections(this.state.chartmatrixrow)
        })
    }

    // numbered scroll elements, which self-register for response to 
    // chart column select clicks
    branchScrollBlock = null

    // initialize once - create root drilldown and compare series
    componentDidMount = () => {

        this.initializeChartSeries()

    }

    initializeChartSeries = () => {
        let userselections = this.state.userselections,
            chartmatrixrow = this.state.chartmatrixrow
        let budgetdata = this.props.branchdata.data
        var matrixlocation,
            chartParmsObj: ChartParmsObj

        // ------------------------[ POPULATE VIEWPOINT WITH VALUES ]-----------------------

        let viewpointname = userselections.viewpoint
        let facet = userselections.facet

        let viewpointdata = databaseapi.getViewpointData({
            viewpointname, 
            dataseriesname: facet,
            wantsInflationAdjusted: userselections.inflationadjusted,
            timeSpecs: {
                leftyear: null,
                rightyear: null,
                spanyears: false,
            }
        })

        // budgetdata.Viewpoints[viewpointname] = viewpointdata
        budgetdata.viewpointdata = viewpointdata
        let itemseriesdata: DatasetConfig = databaseapi.getDatasetConfig(userselections.facet)
        budgetdata.itemseriesconfigdata = itemseriesdata
        // *** CREATE BRANCH
        // -----------------[ THE DRILLDOWN ROOT ]-----------------

        // *** TODO: SIMPLIFY
        // assemble parms to get initial dataset
        let drilldownnodeconfig: MatrixNodeConfig =
            this.initRootNodeConfig(userselections)
        let drilldownindex: any

        // viewpointdata = budgetdata.Viewpoints[drilldownnodeconfig.viewpoint]
        // viewpointdata = budgetdata.viewpoint

        for (drilldownindex in drilldownnodeconfig.charts) {
            let props: GetChartParmsProps = {
                nodeConfig: drilldownnodeconfig,
                chartIndex: drilldownindex,
                budgetdata,
                userselections,
                chartmatrixrow,
            }
            let callbacks: GetChartParmsCallbacks = {
                refreshPresentation: this.refreshPresentation,
                onPortalCreation: this.onPortalCreation,
                workingStatus: this.props.callbacks.workingStatus,
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
            chartmatrixrow[matrixlocation.column] = drilldownnodeconfig
        }

        // -------------[ SAVE INITIALIZATION ]----------------

        // make initial dataset available to chart
        this.refreshPresentation(chartmatrixrow)
        // this.setState({
        //     chartmatrix,
        // });

    }

    // -------------------[ INITIALIZE ROOT CHART CONFIG ]--------------------

    initRootNodeConfig = (userselections): MatrixNodeConfig => {
        let googlecharttype = userselections.charttype
        let chartCode = ChartTypeCodes[googlecharttype]
        let budgetdata = this.props.branchdata.data
        let viewpoint = userselections.viewpoint
        let facet = userselections.facet
        // let viewpointdata = budgetdata.Viewpoints[viewpoint]
        let viewpointdata = budgetdata.viewpointdata
        let portalcharts = viewpointdata.PortalCharts[facet]
        let charts = []
        for (let type of portalcharts) {
            let chartconfig: MatrixChartConfig = {
                googlecharttype,
                chartCode,
            }
            chartconfig.nodedatapropertyname = type.Type
            charts.push(chartconfig)
        }
        return {
            viewpoint: viewpoint,
            facet: facet,
            datapath: [], // get data from root viewpoint object
            matrixlocation: {
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

    // TODO: animate scroll-in from left (currently just from right)
    onPortalCreation = () => {
        let element: Element = this.branchScrollBlock
        if (!element) {
            console.error('expected branch element not found in onPortalCreation')
            return
        }
        setTimeout(() => {

            let scrollwidth = element.scrollWidth
            let scrollleft = element.scrollLeft
            let clientwidth = element.clientWidth
            let scrollright = scrollleft + clientwidth
            let targetright = scrollwidth - 500
            let adjustment = scrollright - targetright
            if (adjustment > 0)
                adjustment = Math.min(adjustment,scrollleft)
            // if (adjustment < 0) {
                let frames = 60
                let t = 1 / frames
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
            // }
        })
    }
    // from https://github.com/DelvarWorld/easing-utils/blob/master/src/easing.js
    easeOutCubic = t => {
        const t1 = t - 1;
        return t1 * t1 * t1 + 1;
    }

    switchViewpoint = (viewpointname) => {

        let userselections = this.state.userselections
        let chartmatrixrow = this.state.chartmatrixrow
        let chartseries = chartmatrixrow
        chartseries.splice(0) // remove subsequent charts
        userselections.viewpoint = viewpointname
        this.setState({
            userselections,
            chartmatrixrow,
        })

        this.initializeChartSeries()

    }

    switchFacet = (facet) => {

        let userselections = this.state.userselections
        userselections.facet = facet

        let viewpointname = this.state.userselections.viewpoint

        let viewpointdata = databaseapi.getViewpointData({
            viewpointname,
            dataseriesname: facet,
            wantsInflationAdjusted: userselections.inflationadjusted,
            timeSpecs: {
                leftyear: null,
                rightyear: null,
                spanyears: false,
            }
        })

        let budgetdata = this.props.branchdata.data
        budgetdata.viewpointdata = viewpointdata
        let itemseriesdata: DatasetConfig = databaseapi.getDatasetConfig(userselections.facet)
        budgetdata.itemseriesconfigdata = itemseriesdata

        // this.setState({
        //     userselections,
        // })

        let chartmatrixrow = this.state.chartmatrixrow
        let oldchartmatrixrow = [...chartmatrixrow]

        // let matrixseries = chartmatrixrow
        let nodeconfig: MatrixNodeConfig = null
        let parentnodeconfig: MatrixNodeConfig
        let cellptr: any
        let isError = false
        let chartParmsObj: ChartParmsObj = null
        for (cellptr in chartmatrixrow) {
            parentnodeconfig = nodeconfig
            nodeconfig = chartmatrixrow[cellptr]
            let nextdatanode = getBudgetNode(viewpointdata, nodeconfig.datapath)
            // let datanode = nodeconfig.datanode
            if (nextdatanode) {
                // there is only one chart where there should be 2
                let deeperdata = (!!nextdatanode.Components && (nodeconfig.charts.length == 1))
                // there are two charts where there should be 1
                let shallowerdata = (!nextdatanode.Components && (nodeconfig.charts.length == 2))
                if ( deeperdata || shallowerdata) {
                    chartmatrixrow.splice(cellptr)
                    nodeconfig.charts = []
                    isError = true
                    //!Hack! remove selector from ancestor graph
                    let prevconfig: MatrixNodeConfig = chartmatrixrow[cellptr - 1]
                    // delete prevconfig.charts[0].chartselection
                    // delete prevconfig.charts[0].chart

                    let context = {
                        selection:prevconfig.charts[0].chartselection,
                        ChartObject: prevconfig.charts[0].ChartObject,
                    }

                    let childprops: CreateChildNodeProps = {
                        nodeconfig:prevconfig,
                        userselections,
                        budgetdata,
                        chartmatrixrow,
                        selectionrow: prevconfig.charts[0].chartselection[0].row,
                        matrixcolumn: prevconfig.matrixlocation.column,
                        portalChartIndex:0,
                        context,
                        chart:prevconfig.charts[0].chart,
                    }
                    let childcallbacks: CreateChildNodeCallbacks = {
                        refreshPresentation: this.refreshPresentation,
                        onPortalCreation: this.onPortalCreation,
                        workingStatus: this.props.callbacks.workingStatus,
                    }
                    createChildNode(childprops, childcallbacks)
                    let message = null
                    if (deeperdata) {
                        message = "More drilldown is available for current facet selection"
                    } else {
                        message = "Less drilldown is available for current facet selection"
                    }
                    this.state.snackbar.message = message
                    this.state.snackbar.open = true
                }
            } else {
                console.error('no data node',nodeconfig)
            }
            let nodechartindex: any = null
            for (nodechartindex in nodeconfig.charts) {
                let props: GetChartParmsProps = {
                    nodeConfig: nodeconfig,
                    chartIndex: nodechartindex,
                    userselections,
                    budgetdata,
                    chartmatrixrow,
                }
                let callbacks: GetChartParmsCallbacks = {
                    refreshPresentation: this.refreshPresentation,
                    onPortalCreation: this.onPortalCreation,
                    workingStatus: this.props.callbacks.workingStatus,
                }
                chartParmsObj = getChartParms(props, callbacks)
                if (chartParmsObj.isError) {
                    chartmatrixrow.splice(cellptr)
                    if (cellptr > 0) { // unset the selection of the parent
                        let parentconfig: MatrixNodeConfig = chartmatrixrow[cellptr - 1]
                        // disable reselection
                        parentconfig.charts[nodechartindex].chartselection = null
                        parentconfig.charts[nodechartindex].chart = null
                    }
                    isError = true
                    break
                } else {
                    nodeconfig.facet = facet
                    nodeconfig.datanode = chartParmsObj.datanode
                    nodeconfig.charts[nodechartindex].chartparms = chartParmsObj.chartParms
                    nodeconfig.charts[nodechartindex].chartCode =
                        ChartTypeCodes[nodeconfig.charts[nodechartindex].chartparms.chartType]
                    if (parentnodeconfig) {
                        nodeconfig.parentdata.datanode = parentnodeconfig.datanode
                    }
                }
            }
        }
        this.refreshPresentation(chartmatrixrow)
        setTimeout(() => {
            updateChartSelections(chartmatrixrow)
        })
    }

    onChangeBudgetPortalChart = () => {
        setTimeout(() => {
            updateChartSelections(this.state.chartmatrixrow)
        })
    }

    refreshPresentation = chartmatrixrow => {
        this.setState({
            chartmatrixrow,
        })
    }

    // ============================================================
    // -------------------[ RENDER METHODS ]---------------------
    // TODO: belongs with explorerchart controller?
    switchChartCode = (location: PortalChartLocation, chartCode) => {
        let chartType = ChartCodeTypes[chartCode]
        let portalIndex = location.portalindex
        let chartmatrixrow = this.state.chartmatrixrow
        let nodeConfig: MatrixNodeConfig = chartmatrixrow[location.matrixlocation.column]
        let oldChartType = nodeConfig.charts[portalIndex].googlecharttype
        nodeConfig.charts[portalIndex].googlecharttype = chartType
        let budgetdata = this.props.branchdata.data
        let props: GetChartParmsProps = {
            nodeConfig: nodeConfig,
            chartIndex: portalIndex,
            userselections: this.state.userselections,
            budgetdata,
            chartmatrixrow,
        }
        let callbacks: GetChartParmsCallbacks = {
            refreshPresentation: this.refreshPresentation,
            onPortalCreation: this.onPortalCreation,
            workingStatus: this.props.callbacks.workingStatus,
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
        this.refreshPresentation(chartmatrixrow)
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
            updateChartSelections(chartmatrixrow)
        })
    }

    // callbacks = this.props.callbacks
    // get React components to render
    getPortals = (matrixrow) => {

        let userselections = this.state.userselections

        let budgetdata = this.props.branchdata.data

        if (!budgetdata.itemseriesconfigdata) return []

        let itemseriesdata: DatasetConfig = budgetdata.itemseriesconfigdata
        let portaltitles = itemseriesdata.Titles
        let portalseriesname = itemseriesdata.Name
        if (itemseriesdata.Units == 'DOLLAR') {
            portalseriesname += ' (' + itemseriesdata.UnitsAlias + ')'
        }

        let portals = matrixrow.map((nodeconfig: MatrixNodeConfig, index) => {

            let portalcharts = []

            for (let chartindex in nodeconfig.charts) {

                let chartblocktitle = null
                if (//(nodeconfig.datanode.Contents == 'BASELINE') ||
                    (nodeconfig.charts[chartindex].nodedatapropertyname == 'Categories')) {
                    chartblocktitle = portaltitles.Categories
                } else {
                    chartblocktitle = portaltitles.Baseline
                }

                let chartparms = nodeconfig.charts[chartindex].chartparms

                let location = {
                    matrixlocation: nodeconfig.matrixlocation,
                    portalindex: Number(chartindex)
                }
                let explorer = this
                let chartsettings: ChartSettings = {
                    onSwitchChartCode: ((location) => {
                        return (chartCode) => {
                            this.switchChartCode(location, chartCode)
                        }
                    })(location),
                    chartCode: nodeconfig.charts[chartindex].chartCode,
                    graph_id: "ChartID" + this.props.branchkey + '-' + index + '-' + chartindex,
                    // index,
                }

                let portalchart: ChartConfig = {
                    chartparms,
                    chartsettings,
                    chartblocktitle: "By " + chartblocktitle,
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

            let budgetPortal: PortalConfig = {
                portalCharts: portalcharts,
                portalName: portalname,
            }

            return <ExplorerPortal
                key = {index}
                budgetPortal = { budgetPortal }
                onChangePortalChart = { this.onChangeBudgetPortalChart }
                />
        })

        return portals

    }

    render() {

    let branch = this
    let drilldownbranch = branch.state.chartmatrixrow

    let drilldownportals = branch.getPortals(drilldownbranch)
    return <div >
    <div>
        <span style={{ fontStyle: "italic" }}>Viewpoint: </span>
        <DropDownMenu
            value={this.state.userselections.viewpoint}
            style={{
            }}
            onChange={
                (e, index, value) => {
                    branch.switchViewpoint(value)
                }
            }
            >
            <MenuItem value={'FUNCTIONAL'} primaryText="Functional"/>
            <MenuItem value={'STRUCTURAL'} primaryText="Structural"/>
        </DropDownMenu>

        <span style={{ margin: "0 10px 0 10px", fontStyle: "italic" }}>Facets: </span>

        <IconButton
            tooltip="Expenditures"
            tooltipPosition="top-center"
            onTouchTap= {
                e => {
                    branch.switchFacet('BudgetExpenses')
                }
            }
            style={
                {
                    backgroundColor: (this.state.userselections.facet == 'BudgetExpenses')
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
                    branch.switchFacet('BudgetRevenues')
                }
            }
            style={
                {
                    backgroundColor: (this.state.userselections.facet == 'BudgetRevenues')
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
                    branch.switchFacet('BudgetStaffing')
                }
            }
            style={
                {
                    backgroundColor: (this.state.userselections.facet == 'BudgetStaffing')
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
        <div ref={node => {
            branch.branchScrollBlock = node
        } } style={{ overflow: "scroll" }}>

            { drilldownportals }

            <div style={{ display: "inline-block", width: "500px" }}></div>

        </div>
    </div>
    <Snackbar
        open={this.state.snackbar.open}
        message={this.state.snackbar.message}
        autoHideDuration={4000}
        onRequestClose={this.handleSnackbarRequestClose}
        />
    </div >
    }

}

export default ExplorerBranch
