// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// explorerbranch.tsx

'use strict'
import * as React from 'react'
var { Component } = React

import {
    MatrixCellConfig,
    ChartParms,
    ChartParmsObj,
    PortalConfig,
    CellSettings,
    CellCallbacks,
    PortalChartLocation,
    ChartConfig,
    GetCellChartProps,
    BranchSettings,
} from '../modules/interfaces'

import { ExplorerPortal } from './explorerportal'
import getBudgetNode from '../modules/getbudgetnode'

import DropDownMenu from 'material-ui/DropDownMenu'
import MenuItem from 'material-ui/MenuItem'

import {Card, CardTitle, CardText} from 'material-ui/Card'
import FontIcon from 'material-ui/FontIcon'
import IconButton from 'material-ui/IconButton'
import Dialog from 'material-ui/Dialog'
import Snackbar from 'material-ui/Snackbar';

import { ChartTypeCodes, ChartCodeTypes } from '../../constants'

import databaseapi , { DatasetConfig, TimeSpecs, Viewpoint } from '../classes/databaseapi'
// import getChartParms from '../controllers/explorer/getchartparms'
import { createChildNode,
    ChartSelectionContext,
    CreateChildNodeProps,
    CreateChildNodeCallbacks,
    onChartComponentSelection,
} from '../modules/onchartcomponentselection'
import * as Actions from '../../../core/actions/actions'
import BudgetNode from '../classes/budgetnode'
import BudgetBranch from '../classes/budgetbranch'

interface ExploreBranchProps {
    callbackid: string | number
    budgetBranch: BudgetBranch,
    displaycallbacks:{
        workingStatus:Function,
        updateChartSelections:Function,
    },
}

class ExplorerBranch extends Component<ExploreBranchProps, {branchNodes?:any, snackbar?:any} > {

    constructor(props) {
        super(props);
    }

    // TODO: these values should be in global state to allow for re-creation after return visit
    // TODO: Take state initialization from external source
    // charts exist in a matrix (row/column) which contain a chartconfig object
    // TODO: most of 
    state = {
        branchNodes:[],
        snackbar:{open:false,message:'empty'}
    }

    componentWillMount() {
        let { budgetBranch } = this.props
        budgetBranch.getState = this.getState
        budgetBranch.setState = this.setState.bind(this)
    }

    // numbered scroll elements, which self-register for response to 
    // chart column select clicks
    branchScrollBlock = null

    // return fresh copy of state object; changes after being set
    getState = () => this.state

    handleSnackbarRequestClose = () => {
        this.setState({
            snackbar: {
                open: false,
                message: 'empty',
            }
        })
        let branch = this
        setTimeout(() => {
            branch.props.displaycallbacks.updateChartSelections()
        })
    }

    // initialize once - create root drilldown and compare series
    componentDidMount = () => {

        let { displaycallbacks, callbackid, budgetBranch } = this.props
        let { refreshPresentation, onPortalCreation, updateBranchNodes } = this
        displaycallbacks.updateChartSelections = displaycallbacks.updateChartSelections(callbackid)
        this._nodeCallbacks = {
            updateChartSelections:displaycallbacks.updateChartSelections,
            refreshPresentation: refreshPresentation,
            onPortalCreation: onPortalCreation,
            workingStatus:displaycallbacks.workingStatus,
            updateBranchNodes,
        }
        this.initializeChartSeries()

    }

    private _nodeCallbacks

    public updateBranchNodes = branchNodes => {
        this.setState({
            branchNodes,
        })
    }

    initializeChartSeries = () => {

        let { budgetBranch } = this.props

        budgetBranch.initializeChartSeries(this._nodeCallbacks)

        this.refreshPresentation()

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

    refreshPresentation = () => {
        this.forceUpdate()
    }

    // ---------------------[ user interactions ]---------------------------

    onChangePortalTab = () => {
        let branch = this
        setTimeout(() => {
            branch.props.displaycallbacks.updateChartSelections()
        })
    }

    switchViewpoint = (viewpointname) => {

        let { settings:branchsettings, nodes:branchNodes } = this.props.budgetBranch

        branchNodes.splice(0) // remove subsequent charts
        branchsettings.viewpoint = viewpointname
        this.setState({
            branchNodes,
        })
        setTimeout(()=>{
            this.initializeChartSeries()
        })

    }

    switchFacet = (facet) => {

        let { budgetBranch }:{budgetBranch:BudgetBranch} = this.props

        let branchsettings = budgetBranch.settings
        
        branchsettings.facet = facet

        let switchResults = budgetBranch.switchFacet(this._nodeCallbacks)

        let { deeperdata, shallowerdata } = switchResults

        if (deeperdata || shallowerdata) {

            let message = null
            if (deeperdata) {
                message = "More drilldown is available for current facet selection"
            } else {
                message = "Less drilldown is available for current facet selection"
            }
            this.state.snackbar.message = message
            this.state.snackbar.open = true

        }

        this.refreshPresentation()
        let branch = this
        setTimeout(() => {
            branch.props.displaycallbacks.updateChartSelections()
        })
    }

    // TODO: belongs with explorerchart controller?
    switchChartCode = (nodeIndex,cellIndex, chartCode) => {

        let { budgetBranch }:{budgetBranch: BudgetBranch } = this.props
        // let { settings } = budgetBranch

        let props = {
            nodeIndex,
            cellIndex,
            chartCode,
        }

        let callbacks = this._nodeCallbacks

        let switchResults = budgetBranch.switchChartCode(props,callbacks)

        let { budgetCell } = switchResults
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
            branch.props.displaycallbacks.updateChartSelections()
        })
    }

    // -----------------------------[ prepare for rencer ]---------------------------------

    // get React components to render
    getPortals = (matrixrow) => {

        let { settings:branchsettings, data:budgetdata } = this.props.budgetBranch

        if (!budgetdata.viewpointdata) return []
        let viewpointdata = budgetdata.viewpointdata
        let itemseriesdata: DatasetConfig = viewpointdata.itemseriesconfigdata
        let portaltitles = itemseriesdata.Titles
        let portalseriesname = itemseriesdata.Name
        if (itemseriesdata.Units == 'DOLLAR') {
            portalseriesname += ' (' + itemseriesdata.UnitsAlias + ')'
        }

        let portals = matrixrow.map((budgetNode: BudgetNode, nodeindex) => {

            let chartConfigs = []

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

                let chartConfig: ChartConfig = {
                    chartParms,
                    cellCallbacks,
                    cellSettings,
                    cellTitle: "By " + chartblocktitle,
                }

                chartConfigs.push(chartConfig)

            }
            let portalName = null
            if (budgetNode.parentData) {
                portalName = budgetNode.parentData.Name
            } else {
                portalName = 'City Budget'
            }

            portalName += ' ' + portalseriesname

            let portalConfig: PortalConfig = {
                chartConfigs,
                portalName,
            }

            // TODO: pass budgetNode instead of budgetCells?
            return <ExplorerPortal
                key = {nodeindex}
                callbackid = {nodeindex}
                budgetNode = { budgetNode }
                callbacks = { {onChangePortalTab: this.onChangePortalTab} }
                portalSettings = { portalConfig }
            />
        })

        return portals

    }

    render() {

    let branch = this
    let drilldownrow = branch.props.budgetBranch.nodes

    let drilldownportals = branch.getPortals(drilldownrow)
    return <div >
    <div>
        <span style={{ fontStyle: "italic" }}>Viewpoint: </span>
        <DropDownMenu
            value={this.props.budgetBranch.settings.viewpoint}
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
                    backgroundColor: (this.props.budgetBranch.settings.facet == 'BudgetExpenses')
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
                    backgroundColor: (this.props.budgetBranch.settings.facet == 'BudgetRevenues')
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
                    backgroundColor: (this.props.budgetBranch.settings.facet == 'BudgetStaffing')
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
