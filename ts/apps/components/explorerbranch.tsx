// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// explorerbranch.tsx

'use strict'
import * as React from 'react'
var { Component } = React

import {
    // MatrixNodeConfig,
    MatrixCellConfig,
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

import databaseapi , { DatasetConfig, TimeSpecs } from '../../local/databaseapi'
import getChartParms from '../controllers/explorer/getchartparms'
import { updateChartSelections } from '../controllers/explorer/updatechartselections'
import { createChildNode } from '../controllers/explorer/onchartcomponentselection'
import * as Actions from '../../actions/actions'
import BudgetNode from '../../local/budgetnode'

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
                leftYear: null,
                rightYear: null,
                spanYears: false,
            }
        })

        budgetdata.viewpointdata = viewpointdata
        // *** CREATE BRANCH
        // -----------------[ THE DRILLDOWN ROOT ]-----------------

        let budgetNodeParms = {
            chartType: userselections.charttype,
            viewpointName: userselections.viewpoint,
            facetName: userselections.facet,
            portalCharts:viewpointdata.PortalCharts,
            timeSpecs: {
                leftYear:null,
                rightYear:userselections.latestyear,
                spanYears:false,
            },
            dataPath: [],
            matrixLocation: {column:0},
        }

        let budgetnode = new BudgetNode(budgetNodeParms)

        let drilldownnodeconfig:BudgetNode = budgetnode

        // let drilldownnodeconfig: MatrixNodeConfig =
        //     this.initRootNodeConfig(userselections)
        let drilldownindex: any

        for (drilldownindex in drilldownnodeconfig.cells) {
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

                drilldownnodeconfig.cells[drilldownindex].chartparms = chartParmsObj.chartParms
                drilldownnodeconfig.cells[drilldownindex].chartCode =
                    ChartTypeCodes[drilldownnodeconfig.cells[drilldownindex].chartparms.chartType]

            } else {
                break
            }
        }
        if (!chartParmsObj.isError) {
            drilldownnodeconfig.dataNode = chartParmsObj.dataNode
            matrixlocation = drilldownnodeconfig.matrixLocation
            chartmatrixrow[matrixlocation.column] = drilldownnodeconfig
        }

        // -------------[ SAVE INITIALIZATION ]----------------

        this.refreshPresentation(chartmatrixrow)

    }

    // -------------------[ INITIALIZE ROOT CHART CONFIG ]--------------------

    // REPLACED BY BUDGETNODE CLASS
    // initRootNodeConfig = (userselections): MatrixNodeConfig => {
    //     let googleChartType = userselections.charttype
    //     let chartCode = ChartTypeCodes[googleChartType]
    //     let budgetdata = this.props.branchdata.data
    //     let viewpoint = userselections.viewpoint
    //     let facet = userselections.facet
    //     // let viewpointdata = budgetdata.Viewpoints[viewpoint]
    //     let viewpointdata = budgetdata.viewpointdata
    //     let portalcharts = viewpointdata.PortalCharts[facet]
    //     let charts = []
    //     for (let type of portalcharts) {
    //         let chartconfig: MatrixCellConfig = {
    //             googleChartType,
    //             chartCode,
    //         }
    //         chartconfig.nodeDataPropertyName = type.Type
    //         charts.push(chartconfig)
    //     }
    //     return {
    //         viewpointName: viewpoint,
    //         facetName: facet,
    //         dataPath: [], // get data from root viewpoint object
    //         matrixLocation: {
    //             column: 0
    //         },
    //         timeSpecs: {
    //             rightYear: userselections.latestyear,
    //             leftYear: null,
    //             spanYears: false,
    //         },
    //         cells: charts
    //     }

    // }

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
                leftYear: null,
                rightYear: null,
                spanYears: false,
            }
        })

        let budgetdata = this.props.branchdata.data
        budgetdata.viewpointdata = viewpointdata

        let chartmatrixrow = this.state.chartmatrixrow
        let oldchartmatrixrow = [...chartmatrixrow]

        let nodeconfig: BudgetNode = null
        let parentnodeconfig: BudgetNode
        let cellptr: any
        let isError = false
        let chartParmsObj: ChartParmsObj = null
        for (cellptr in chartmatrixrow) {
            parentnodeconfig = nodeconfig
            nodeconfig = chartmatrixrow[cellptr]
            let nextdataNode = getBudgetNode(viewpointdata, nodeconfig.dataPath)
            // let dataNode = nodeconfig.dataNode
            if (nextdataNode) {
                // there is only one chart where there should be 2
                let deeperdata = (!!nextdataNode.Components && (nodeconfig.cells.length == 1))
                // there are two charts where there should be 1
                let shallowerdata = (!nextdataNode.Components && (nodeconfig.cells.length == 2))
                if ( deeperdata || shallowerdata) {
                    chartmatrixrow.splice(cellptr)
                    nodeconfig.cells = []
                    isError = true
                    let prevconfig: BudgetNode = chartmatrixrow[cellptr - 1]

                    let context = {
                        selection:prevconfig.cells[0].chartselection,
                        ChartObject: prevconfig.cells[0].ChartObject,
                    }

                    let childprops: CreateChildNodeProps = {
                        nodeconfig:prevconfig,
                        userselections,
                        budgetdata,
                        chartmatrixrow,
                        selectionrow: prevconfig.cells[0].chartselection[0].row,
                        matrixcolumn: prevconfig.matrixLocation.column,
                        portalChartIndex:0,
                        context,
                        chart:prevconfig.cells[0].chart,
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
                    // TODO: possibly set nodeconfig = null
                    nodeconfig = null // chartmatrixrow[cellptr] // created by createChildNode as side effect
                }
            } else {
                console.error('no data node')
            }
            let nodechartindex: any = null
            if (!nodeconfig) break
            for (nodechartindex in nodeconfig.cells) {
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
                        let parentconfig: BudgetNode = chartmatrixrow[cellptr - 1]
                        // disable reselection
                        parentconfig.cells[nodechartindex].chartselection = null
                        parentconfig.cells[nodechartindex].chart = null
                    }
                    isError = true
                    break
                } else {
                    nodeconfig.facetName = facet
                    nodeconfig.dataNode = chartParmsObj.dataNode
                    nodeconfig.cells[nodechartindex].chartparms = chartParmsObj.chartParms
                    nodeconfig.cells[nodechartindex].chartCode =
                        ChartTypeCodes[nodeconfig.cells[nodechartindex].chartparms.chartType]
                    if (parentnodeconfig) {
                        nodeconfig.parentData.dataNode = parentnodeconfig.dataNode
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
        let nodeConfig: BudgetNode = chartmatrixrow[location.matrixlocation.column]
        let oldChartType = nodeConfig.cells[portalIndex].googleChartType
        nodeConfig.cells[portalIndex].googleChartType = chartType
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
            nodeConfig.cells[portalIndex].chartparms = chartParmsObj.chartParms
            nodeConfig.cells[portalIndex].chartCode =
                ChartTypeCodes[nodeConfig.cells[portalIndex].chartparms.chartType]
            nodeConfig.dataNode = chartParmsObj.dataNode
        } else {
            nodeConfig.cells[portalIndex].googleChartType = oldChartType
        }
        this.refreshPresentation(chartmatrixrow)

        setTimeout(() => {
            if (nodeConfig.cells[portalIndex].chart) {
                // refresh to new chart created with switch
                nodeConfig.cells[portalIndex].chart = nodeConfig.cells[portalIndex].ChartObject.chart
                // it turns out that "PieChart" needs column set to null
                // for setSelection to work
                if (nodeConfig.cells[portalIndex].googleChartType == "PieChart") {
                    nodeConfig.cells[portalIndex].chartselection[0].column = null
                } else {
                    // "ColumnChart" doesn't seem to care about column value,
                    // but we set it back to original (presumed) for consistency
                    nodeConfig.cells[portalIndex].chartselection[0].column = 1
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

        if (!budgetdata.viewpointdata) return []
        let viewpointdata = budgetdata.viewpointdata
        let itemseriesdata: DatasetConfig = viewpointdata.itemseriesconfigdata
        let portaltitles = itemseriesdata.Titles
        let portalseriesname = itemseriesdata.Name
        if (itemseriesdata.Units == 'DOLLAR') {
            portalseriesname += ' (' + itemseriesdata.UnitsAlias + ')'
        }

        let portals = matrixrow.map((nodeconfig: BudgetNode, index) => {

            let portalcharts = []

            for (let chartindex in nodeconfig.cells) {

                let chartblocktitle = null
                if (//(nodeconfig.dataNode.Contents == 'BASELINE') ||
                    (nodeconfig.cells[chartindex].nodeDataPropertyName == 'Categories')) {
                    chartblocktitle = portaltitles.Categories
                } else {
                    chartblocktitle = portaltitles.Baseline
                }

                let chartparms = nodeconfig.cells[chartindex].chartparms

                let location = {
                    matrixlocation: nodeconfig.matrixLocation,
                    portalindex: Number(chartindex)
                }
                let explorer = this
                let chartsettings: ChartSettings = {
                    onSwitchChartCode: ((location) => {
                        return (chartCode) => {
                            this.switchChartCode(location, chartCode)
                        }
                    })(location),
                    chartCode: nodeconfig.cells[chartindex].chartCode,
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
            if (nodeconfig.parentData) {
                portalname = nodeconfig.parentData.Name
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
