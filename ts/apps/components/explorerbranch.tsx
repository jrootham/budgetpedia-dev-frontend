// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// explorerbranch.tsx

'use strict'
import * as React from 'react'
var { Component } = React

import {
    MatrixCellConfig,
    ChartParms,
    ChartParmsObj,
    MatrixLocation,
    PortalConfig,
    CellSettings,
    CellCallbacks,
    PortalChartLocation,
    ChartConfig,
    GetCellChartProps,
    // GetChartParmsCallbacks,
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

import databaseapi , { DatasetConfig, TimeSpecs, Viewpoint } from '../../local/databaseapi'
// import getChartParms from '../controllers/explorer/getchartparms'
import { createChildNode,
    ChartSelectionContext,
    CreateChildNodeProps,
    CreateChildNodeCallbacks,
    onChartComponentSelection,
} from '../controllers/explorer/onchartcomponentselection'
import * as Actions from '../../actions/actions'
import BudgetNode from '../../local/budgetnode'

interface ExploreBranchProps {
    budgetBranch: any,
    callbacks:{
        workingStatus:Function,
        updateChartSelections:Function,
    },
    userselections:any,
    yearscope:any,
    yearslider:any,
    callbackid: string | number
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
        chartmatrixrow:this.props.budgetBranch.nodes,
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
        let branch = this
        setTimeout(() => {
            branch.props.callbacks.updateChartSelections()
        })
    }

    // numbered scroll elements, which self-register for response to 
    // chart column select clicks
    branchScrollBlock = null

    // initialize once - create root drilldown and compare series
    componentDidMount = () => {

        let { callbacks, callbackid } = this.props
        callbacks.updateChartSelections = callbacks.updateChartSelections(callbackid)
        this.initializeChartSeries()

    }

    initializeChartSeries = () => {
        let { userselections, chartmatrixrow } = this.state
        let budgetdata = this.props.budgetBranch.data
        let matrixlocation,
            chartParmsObj: ChartParmsObj

        // ------------------------[ POPULATE VIEWPOINT WITH VALUES ]-----------------------

        let { viewpoint: viewpointname, facet } = userselections

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
        let datapath = []
        let node = getBudgetNode(viewpointdata, datapath)

        let budgetNodeParms = {
            defaultChartType: userselections.charttype,
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
            dataNode:node,
        }

        let budgetNode:BudgetNode = new BudgetNode(budgetNodeParms)

        let cellindex: any

        let callbacks = {
            updateChartSelections: this.props.callbacks.updateChartSelections,
            refreshPresentation: this.refreshPresentation,
            onPortalCreation: this.onPortalCreation,
            workingStatus: this.props.callbacks.workingStatus,
        }
        let selectfn = onChartComponentSelection(userselections)(budgetdata)(chartmatrixrow)(callbacks)
        let configData = {
            viewpointConfig:budgetdata.viewpointdata.Configuration,
            itemseriesConfig:budgetdata.viewpointdata.itemseriesconfigdata,
        }
        for (cellindex in budgetNode.cells) {
            let budgetCell = budgetNode.cells[cellindex]
            let props: GetCellChartProps = {
                chartIndex: cellindex,
                configData,
                userselections,
            }

            let fcurrent = selectfn(0)(cellindex)

            chartParmsObj = budgetNode.getChartParms(props, {current:fcurrent,next:selectfn})

            if (!chartParmsObj.isError) {

                budgetCell.chartparms = chartParmsObj.chartParms
                budgetCell.chartCode =
                    ChartTypeCodes[budgetCell.chartparms.chartType]

            } else {
                break
            }
        }
        if (!chartParmsObj.isError) {
            matrixlocation = budgetNode.matrixLocation
            chartmatrixrow[matrixlocation.column] = budgetNode
        }

        // -------------[ SAVE INITIALIZATION ]----------------

        this.refreshPresentation()

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
        // let chartseries = chartmatrixrow
        chartmatrixrow.splice(0) // remove subsequent charts
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

        let viewpointdata:Viewpoint = databaseapi.getViewpointData({
            viewpointname,
            dataseriesname: facet,
            wantsInflationAdjusted: userselections.inflationadjusted,
            timeSpecs: {
                leftYear: null,
                rightYear: null,
                spanYears: false,
            }
        })

        let budgetdata = this.props.budgetBranch.data
        budgetdata.viewpointdata = viewpointdata

        let chartmatrixrow = this.state.chartmatrixrow
        let oldchartmatrixrow = [...chartmatrixrow]

        let budgetNode: BudgetNode = null
        let parentBudgetNode: BudgetNode
        let cellptr: any
        let isError = false
        let chartParmsObj: ChartParmsObj = null

        let childcallbacks: CreateChildNodeCallbacks = {
            updateChartSelections: this.props.callbacks.updateChartSelections,
            refreshPresentation: this.refreshPresentation,
            onPortalCreation: this.onPortalCreation,
            workingStatus: this.props.callbacks.workingStatus,
        }
        let fn = onChartComponentSelection(userselections)(budgetdata)(chartmatrixrow)(childcallbacks)

        for (cellptr in chartmatrixrow) {
            parentBudgetNode = budgetNode
            budgetNode = chartmatrixrow[cellptr]
            let nextdataNode = getBudgetNode(viewpointdata, budgetNode.dataPath)
            if (nextdataNode) {
                // check previous cell configuration against previous node
                // TODO: THIS IS A PROXY THAT NEEDS TO BE REPLACED
                // there is only one chart where there should be 2
                let deeperdata = (!!nextdataNode.Components && (budgetNode.cells.length == 1))
                // there are two charts where there should be 1
                let shallowerdata = (!nextdataNode.Components && (budgetNode.cells.length == 2))
                // now set budgetNode with new data node
                budgetNode.update(
                    nextdataNode,
                    // viewpointdata.PortalCharts,
                    // userselections.charttype,
                    userselections.facet
                )
                if ( deeperdata || shallowerdata) {
                    // replace budgetNode
                    isError = true
                    let prevBudgetNode: BudgetNode = chartmatrixrow[cellptr - 1]
                    chartmatrixrow.splice(cellptr)

                    let prevBudgetCell = prevBudgetNode.cells[0]

                    let context = {
                        selection:prevBudgetCell.chartselection,
                        ChartObject: prevBudgetCell.ChartObject,
                    }

                    let childprops: CreateChildNodeProps = {
                        budgetNode:prevBudgetNode,
                        userselections,
                        budgetdata,
                        chartmatrixrow,
                        selectionrow: prevBudgetCell.chartselection[0].row,
                        nodeIndex: prevBudgetNode.matrixLocation.column,
                        cellIndex:0,
                        context,
                        chart:prevBudgetCell.chart,
                    }
                    let fcurrent = fn(cellptr)(0)
                    createChildNode(childprops, childcallbacks,{current:fcurrent,next:fn})
                    let message = null
                    if (deeperdata) {
                        message = "More drilldown is available for current facet selection"
                    } else {
                        message = "Less drilldown is available for current facet selection"
                    }
                    this.state.snackbar.message = message
                    this.state.snackbar.open = true
                    budgetNode = null // chartmatrixrow[cellptr] // created by createChildNode as side effect
                }
            } else {
                console.error('no data node')
            }
            let nodecellindex: any = null
            if (!budgetNode) break
            let configData = {
                viewpointConfig:budgetdata.viewpointdata.Configuration,
                itemseriesConfig:budgetdata.viewpointdata.itemseriesconfigdata,
            }
            for (nodecellindex in budgetNode.cells) {
                let props: GetCellChartProps = {
                    chartIndex: nodecellindex,
                    userselections,
                    configData,
                }
                let fcurrent = fn(cellptr)(nodecellindex),
                chartParmsObj = budgetNode.getChartParms(props, {current:fcurrent,next:fn})
                if (chartParmsObj.isError) {
                    chartmatrixrow.splice(cellptr)
                    if (cellptr > 0) { // unset the selection of the parent
                        let parentBudgetNode: BudgetNode = chartmatrixrow[cellptr - 1]
                        let parentBudgetCell = parentBudgetNode.cells[nodecellindex]
                        // disable reselection
                        parentBudgetCell.chartselection = null
                        parentBudgetCell.chart = null
                    }
                    isError = true
                    break
                } else {
                    // TODO: this should be set through reset
                    // budgetNode.facetName = facet
                    let budgetCell = budgetNode.cells[nodecellindex]
                    budgetCell.chartparms = chartParmsObj.chartParms
                    budgetCell.chartCode =
                        ChartTypeCodes[budgetCell.chartparms.chartType]
                    if (parentBudgetNode) {
                        budgetNode.parentData.dataNode = parentBudgetNode.dataNode
                    }
                }
            }
        }
        this.refreshPresentation()
        let branch = this
        setTimeout(() => {
            branch.props.callbacks.updateChartSelections()
        })
    }

    onChangePortalTab = () => {
        let branch = this
        setTimeout(() => {
            branch.props.callbacks.updateChartSelections()
        })
    }

    refreshPresentation = () => {
        this.setState({
            chartmatrixrow:this.state.chartmatrixrow,
        })
    }

    // ============================================================
    // -------------------[ RENDER METHODS ]---------------------
    // TODO: belongs with explorerchart controller?
    switchChartCode = (nodeIndex,cellIndex, chartCode) => {
        let chartType = ChartCodeTypes[chartCode]
        // let cellIndex = location.cellIndex
        let chartmatrixrow = this.state.chartmatrixrow
        let budgetNode: BudgetNode = chartmatrixrow[nodeIndex]
        let budgetCell = budgetNode.cells[cellIndex]
        let oldChartType = budgetCell.googleChartType
        budgetCell.googleChartType = chartType
        let budgetdata = this.props.budgetBranch.data
        let configData = {
            viewpointConfig:budgetdata.viewpointdata.Configuration,
            itemseriesConfig:budgetdata.viewpointdata.itemseriesconfigdata,
        }        
        let props: GetCellChartProps = {
            chartIndex: cellIndex,
            userselections: this.state.userselections,
            configData,
        }
        let callbacks = {
            updateChartSelections: this.props.callbacks.updateChartSelections,
            refreshPresentation: this.refreshPresentation,
            onPortalCreation: this.onPortalCreation,
            workingStatus: this.props.callbacks.workingStatus,
        }
        let fn = onChartComponentSelection(this.state.userselections)(budgetdata)(chartmatrixrow)(callbacks)
        let fncurrent = fn(nodeIndex)(cellIndex)
        let chartParmsObj: ChartParmsObj = budgetNode.getChartParms(props,{current: fncurrent, next: fn})
        if (!chartParmsObj.isError) {
            budgetCell.chartparms = chartParmsObj.chartParms
            budgetCell.chartCode =
                ChartTypeCodes[budgetCell.chartparms.chartType]
        } else {
            budgetCell.googleChartType = oldChartType
        }
        this.refreshPresentation()
        let branch = this
        setTimeout(() => {
            if (budgetCell.chart) {
                // refresh to new chart created with switch
                budgetCell.chart = budgetCell.ChartObject.chart
                // it turns out that "PieChart" needs column set to null
                // for setSelection to work
                if (budgetCell.googleChartType == "PieChart") {
                    budgetCell.chartselection[0].column = null
                } else {
                    // "ColumnChart" doesn't seem to care about column value,
                    // but we set it back to original (presumed) for consistency
                    budgetCell.chartselection[0].column = 1
                }
            }
            branch.props.callbacks.updateChartSelections()
        })
    }

    // callbacks = this.props.callbacks
    // get React components to render
    getPortals = (matrixrow) => {

        let userselections = this.state.userselections

        let budgetdata = this.props.budgetBranch.data

        if (!budgetdata.viewpointdata) return []
        let viewpointdata = budgetdata.viewpointdata
        let itemseriesdata: DatasetConfig = viewpointdata.itemseriesconfigdata
        let portaltitles = itemseriesdata.Titles
        let portalseriesname = itemseriesdata.Name
        if (itemseriesdata.Units == 'DOLLAR') {
            portalseriesname += ' (' + itemseriesdata.UnitsAlias + ')'
        }

        let portals = matrixrow.map((budgetNode: BudgetNode, nodeindex) => {

            let budgetCells = []

            for (let cellindex in budgetNode.cells) {
                let budgetCell = budgetNode.cells[cellindex]
                let chartblocktitle = null
                if ((budgetCell.nodeDataPropertyName == 'Categories')) {
                    chartblocktitle = portaltitles.Categories
                } else {
                    chartblocktitle = portaltitles.Baseline
                }

                let chartParms = budgetCell.chartparms

                let explorer = this
                let cellCallbacks: CellCallbacks = {
                    onSwitchChartCode: (nodeIndex) => (cellIndex, chartCode) => {
                            explorer.switchChartCode(nodeIndex, cellIndex, chartCode)
                    },
                }
                let cellSettings: CellSettings = {
                    chartCode: budgetCell.chartCode,
                    graph_id: "ChartID" + this.props.callbackid + '-' + nodeindex + '-' + cellindex,
                    // index,
                }

                let portalchart: ChartConfig = {
                    chartParms,
                    cellCallbacks,
                    cellSettings,
                    cellTitle: "By " + chartblocktitle,
                }

                budgetCells.push(portalchart)

            }
            let portalName = null
            if (budgetNode.parentData) {
                portalName = budgetNode.parentData.Name
            } else {
                portalName = 'City Budget'
            }

            portalName += ' ' + portalseriesname

            let portalNode: PortalConfig = {
                budgetCells: budgetCells,
                portalName: portalName,
            }

            // TODO: pass budgetNode instead of budgetCells?
            return <ExplorerPortal
                callbackid = {nodeindex}
                key = {nodeindex}
                portalNode = { portalNode }
                onChangePortalTab = { this.onChangePortalTab }
            />
        })

        return portals

    }

    render() {

    let branch = this
    let drilldownrow = branch.state.chartmatrixrow

    let drilldownportals = branch.getPortals(drilldownrow)
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
