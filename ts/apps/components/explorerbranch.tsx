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
} from '../controllers/explorer/interfaces'

import { ExplorerPortal } from './explorerportal'
import DropDownMenu from 'material-ui/DropDownMenu'
import MenuItem from 'material-ui/MenuItem'

import {Card, CardTitle, CardText} from 'material-ui/Card'
import FontIcon from 'material-ui/FontIcon'
import IconButton from 'material-ui/IconButton'
import Dialog from 'material-ui/Dialog'

import { ChartTypeCodes, ChartCodeTypes } from '../constants'

import { setViewpointData } from '../controllers/explorer/setviewpointdata'
import { getChartParms } from '../controllers/explorer/getchartparms'
import { updateChartSelections } from '../controllers/explorer/updatechartselections'
import * as Actions from '../../actions/actions'

interface ExploreBranchProps {
    budgetdata: any,
    matrixrow: any,
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
        chartmatrixrow:this.props.matrixrow,
        yearslider: this.props.yearslider,
        yearscope: this.props.yearscope,
        userselections: this.props.userselections,
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
        let budgetdata = this.props.budgetdata

        var matrixlocation,
            chartParmsObj: ChartParmsObj

        // ------------------------[ POPULATE VIEWPOINT WITH VALUES ]-----------------------

        let viewpointname = userselections.viewpoint
        let facet = userselections.facet
        setViewpointData(viewpointname, facet, budgetdata,
            userselections.inflationadjusted)

        // *** CREATE BRANCH
        // -----------------[ THE DRILLDOWN ROOT ]-----------------

        // *** TODO: SIMPLIFY
        // assemble parms to get initial dataset
        let drilldownnodeconfig: MatrixNodeConfig =
            this.initRootNodeConfig(userselections)
        let drilldownindex: any

        for (drilldownindex in drilldownnodeconfig.charts) {
            let props: GetChartParmsProps = {
                nodeConfig: drilldownnodeconfig,
                chartIndex: drilldownindex,
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
        let budgetdata = this.props.budgetdata
        let viewpoint = userselections.viewpoint
        let facet = userselections.facet
        let portalcharts = budgetdata.Viewpoints[viewpoint].PortalCharts[facet]
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
    // TODO: isolate location from matrix location -- use branch column location instead
    // TODO: use requestAnimationFrame 
    //     https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame

    // from https://github.com/DelvarWorld/easing-utils/blob/master/src/easing.js
    onPortalCreation = () => {
        // let matrixrow = newMatrixLocation.row
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
        let chartmatrixrow = this.state.chartmatrixrow
        this.setState({
            userselections,
        })
        let viewpointname = this.state.userselections.viewpoint
        let facetname = this.state.userselections.facet
        let budgetdata = this.props.budgetdata
        setViewpointData(viewpointname, facetname, budgetdata,
            this.state.userselections.inflationadjusted)
        let matrixseries = chartmatrixrow
        let nodeconfig: MatrixNodeConfig
        let cellptr: any
        let isError = false
        let chartParmsObj: ChartParmsObj = null
        for (cellptr in matrixseries) {
            nodeconfig = matrixseries[cellptr]
            let datanode = nodeconfig.datanode
            if (datanode) {
                if ((datanode.Components && (nodeconfig.charts.length == 1)) || 
                    (!datanode.Components && (nodeconfig.charts.length == 2))) {
                    matrixseries.splice(cellptr)
                    nodeconfig.charts = []
                    isError = true
                    //!Hack! remove selector from ancestor graph
                    let prevconfig = matrixseries[cellptr - 1]
                    delete prevconfig.charts[0].chartselection
                    delete prevconfig.charts[0].chart
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
            nodeconfig.facet = facet
            nodeconfig.datanode = chartParmsObj.datanode
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
        let chartmatrixrow = this.state.chartmatrixrow
        let nodeConfig: MatrixNodeConfig = chartmatrixrow[location.matrixlocation.column]
        let oldChartType = nodeConfig.charts[portalIndex].googlecharttype
        nodeConfig.charts[portalIndex].googlecharttype = chartType
        let props: GetChartParmsProps = {
            nodeConfig: nodeConfig,
            chartIndex: portalIndex,
            userselections: this.state.userselections,
            budgetdata: this.props.budgetdata,
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

        let budgetdata = this.props.budgetdata

        let portaltitles = budgetdata.DataSeries[userselections.facet].Titles
        let dataseries = budgetdata.DataSeries[userselections.facet]
        let portalseriesname = dataseries.Name
        if (dataseries.Units == 'DOLLAR') {
            portalseriesname += ' (' + dataseries.UnitsAlias + ')'
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
    </div >
    }

}

export { ExplorerBranch }
