// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// explorerbranch.tsx

'use strict'

// -------------------[ libraries ]---------------------
import * as React from 'react'
var { Component } = React

import DropDownMenu from 'material-ui/DropDownMenu'
import MenuItem from 'material-ui/MenuItem'

import {Card, CardTitle, CardText} from 'material-ui/Card'
import FontIcon from 'material-ui/FontIcon'
import IconButton from 'material-ui/IconButton'
import Dialog from 'material-ui/Dialog'
import Snackbar from 'material-ui/Snackbar';

// ------------------------[ modules ]-----------------------------

import {
    PortalConfig,
    CellSettings,
    CellCallbacks,
    ChartConfig,
} from '../modules/interfaces'

import { ExplorerPortal } from './explorerportal'

import { DatasetConfig, TimeSpecs, ViewpointData } from '../classes/databaseapi'

import {branchtypes as branchactiontypes} from '../actions'
import BudgetNode from '../classes/budgetnode'
import BudgetBranch from '../classes/budgetbranch'

interface ExploreBranchProps {
    callbackid: string | number,
    callbackuid: string,
    budgetBranch: BudgetBranch,
    displaycallbacks:{
        workingStatus:Function,
        updateChartSelections:Function,
    },
    actions: {
        addNode:Function,
        removeNode:Function,
        changeViewpoint:Function,
        changeFacet: Function,
    },
    controlData:any,
}

class ExplorerBranch extends Component<ExploreBranchProps, 
    {branchNodes?:BudgetNode[], snackbar?:any, viewpointData?:ViewpointData} > {

    constructor(props) {
        super(props);
    }

    // TODO: these values should be in global state to allow for re-creation after return visit
    // TODO: Take state initialization from external source
    // charts exist in a matrix (row/column) which contain a chartconfig object
    // TODO: most of 
    state = {
        branchNodes:[],
        viewpointData:null, // TODO
        snackbar:{open:false,message:'empty'}
    }

    // for budgetBranch object:
    // return fresh copy of state object; changes after being set
    // used by budgetBranch instance
    getState = () => this.state
    getProps = () => this.props

    addBranchNode = branchuid => settings => {
        return this.props.actions.addNode(branchuid, settings)
    }

    private _actions: any
    // used by callbacks; set by componentDidMount
    private _nodeCallbacks: any

    // complete initialization of budgetBranch and branch explorer objects
    componentWillMount() {

        let { budgetBranch, actions, displaycallbacks, callbackid } = this.props
        budgetBranch.getState = this.getState
        budgetBranch.getProps = this.getProps
        budgetBranch.setState = this.setState.bind(this)

        this._actions = Object.assign({}, actions)
        this._actions.addNode = this.addBranchNode(budgetBranch.uid)
        budgetBranch.actions = this._actions

        let { refreshPresentation, onPortalCreation, updateBranchNodesState } = this

        this._nodeCallbacks = {
            updateChartSelections:displaycallbacks.updateChartSelections,
            workingStatus:displaycallbacks.workingStatus,
            // local
            onPortalCreation,
            updateBranchNodesState,
            refreshPresentation,
        }
        budgetBranch.nodeCallbacks = this._nodeCallbacks
    }

    // initialize once -- set controlData; initialize viewpointData; initialize branch
    componentDidMount() {
        // console.log('did mount')
        let { budgetBranch } = this.props
        let {controlData} = this.props
        this._previousControlData = controlData // initialize
        budgetBranch.getViewpointData()
        if (controlData.branchesById[budgetBranch.uid].nodeList.length == 0) {
            setTimeout(()=>{
                budgetBranch.initializeBranch()
            })
        }
    }

    // remove obsolete node objects
    componentWillReceiveProps(nextProps) {
        let { nodesById } = nextProps.controlData
        let branchNodes = this.props.budgetBranch.nodes
        let newBranchNodes = branchNodes.filter((node) => {
            return !!nodesById[node.uid]
        })
        if (newBranchNodes.length != branchNodes.length) { // some nodes were deleted
            this.setState({
                branchNodes:newBranchNodes,
            })
        }
    }

    harmonizecount: any = null
    // harmonize branch nodes; add pending node objects, and process state changes
    componentDidUpdate() {
        // console.log('did update')
        // refresh branchnodes
        let { budgetBranch } = this.props
        let branchNodes = budgetBranch.nodes
        let { controlData } = this.props
        let branchSettings = controlData.branchesById[this.props.callbackuid]
        // console.log('branchData',branchData)
        let { nodesById } = controlData
        let { nodeList } = branchSettings

        if (this.harmonizecount === null) { // initialize harmonization count
            this.harmonizecount = (nodeList.length - branchNodes.length)
        }

        // first task is to harmonize controlData nodeList list with local branchNode list
        // this condition will keep adding nodes on each render cycle triggered by 
        // addBranchNode, until all nodes are drawn
        // console.log('nodeList, branchNodes lengths', nodeList.length, branchNodes.length, nodeList, branchNodes)
        if (nodeList.length > branchNodes.length) {
            // places sentinal in place in case addNode below fails
            //   generating an infinite loop
            if (this.harmonizecount <= 0) {
                throw Error('error harmonizing branch nodes')
            }
            this.harmonizecount--
            let nodeIndex = branchNodes.length
            let budgetNodeId = nodeList[nodeIndex]
            // console.log('harmonize', nodeIndex, budgetNodeId)
            budgetBranch.addNode(
                budgetNodeId,
                nodeIndex,
                nodesById[budgetNodeId] // settings
            )
            // setTimeout(() => {
            //     this.props.displaycallbacks.updateChartSelections()
            // })
        } else { // otherwise see if there are other cascading actions that have to be taken
            this.harmonizecount = null
            this.controlGlobalStateChange()
        }
    }

    // _previousControlData is not in a closure to allow for initializing in componentDidMount
    private _previousControlData: any

    // state change machine
    private controlGlobalStateChange = () => {
        let previousControlData = this._previousControlData
        let currentControlData = this.props.controlData
        let { lastAction } = currentControlData
        if (!branchactiontypes[lastAction]) {
            return
        }
        // the generation counter could be the same if render is being triggered
        // solely by a local state change, which we want to ignore here
        if (previousControlData && (currentControlData.generation == previousControlData.generation)) {
            return
        }

        let { budgetBranch } = this.props
        switch (lastAction) {
            case branchactiontypes.CHANGE_VIEWPOINT: {
                this.processChangeViewpointStateChange(budgetBranch)
                break
            }
            case branchactiontypes.CHANGE_FACET: {
                this.processChangeFacetStateChange(budgetBranch)
                break
            }
        }
        this._previousControlData = currentControlData
    }

    private processChangeViewpointStateChange = budgetBranch => {
        budgetBranch.getViewpointData()
        setTimeout(()=>{
            budgetBranch.initializeBranch()
        })
    }

    private processChangeFacetStateChange = budgetBranch => {
        budgetBranch.getViewpointData()

        setTimeout(() => {

            let switchResults = budgetBranch.switchFacet()

            let { deeperdata, shallowerdata } = switchResults

            if (deeperdata || shallowerdata) {

                let message = null
                if (deeperdata) {
                    message = "More drilldown is available for current facet selection"
                } else {
                    message = "Less drilldown is available for current facet selection"
                }
                let { snackbar } = this.state
                snackbar = Object.assign ({},snackbar)
                snackbar.message = message
                snackbar.open = true
                this.setState({
                    snackbar,
                })

            }
            let branch = this
            setTimeout(() => {
                branch.props.displaycallbacks.updateChartSelections()
            })

        })
    }

    refreshPresentation = () => {
        this.forceUpdate()
    }

    updateBranchNodesState = branchNodes => {
        this.setState({
            branchNodes,
        })
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
            this._nodeCallbacks.updateChartSelections()
        })
    }

    // ============================================================
    // ---------------------[ *** BRANCH *** CONTROL RESPONSES ]------------------

    // onPortalCreation animates scroll-in of new portal

    branchScrollBlock = null

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
            if (adjustment > 0) {
                adjustment = Math.min(adjustment,scrollleft)
            }
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
        })
    }

    // from https://github.com/DelvarWorld/easing-utils/blob/master/src/easing.js
    easeOutCubic = t => {
        const t1 = t - 1;
        return t1 * t1 * t1 + 1;
    }

    // ---------------------[ user interactions ]---------------------------

    switchViewpoint = (viewpointname) => {

        let { budgetBranch, callbackuid } = this.props
        let { nodes:branchNodes } = budgetBranch

        // branchNodes is just a copy of the component state's BranchNodes
        let removed = branchNodes.splice(0) // identify nodes to remove
        let removedids = removed.map((item) => {
            return item.uid
        })
        // console.log('calling from switchviewpoint',branchsettings, viewpointname, callbackuid, removedids)
        // this will trigger render cycle that will delete the component state's stored nodes
        this.props.actions.removeNode(callbackuid, removedids)
        // now the viewpoint can be changed, triggering a change in viewpoint data
        setTimeout(() => {
            this.props.actions.changeViewpoint(callbackuid, viewpointname)
        })
    }

    switchFacet = (facet) => {
        // console.log('calling changeFacet',facet)
        let { callbackuid } = this.props
        this.props.actions.changeFacet(callbackuid, facet)
        let branch = this
        setTimeout(() => {
            this._nodeCallbacks.updateChartSelections()
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

        let switchResults = budgetBranch.switchChartCode(props)

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

    onChangePortalTab = () => {
        let branch = this
        setTimeout(() => {
            this._nodeCallbacks.updateChartSelections()
        })
    }

    // -----------------------------[ prepare for render ]---------------------------------

    // get React components to render
    getPortals = (budgetNodes) => {

        let { settings:branchsettings } = this.props.budgetBranch

        let budgetdata = {viewpointdata:this.state.viewpointData}

        if (!budgetdata.viewpointdata) return []
        let viewpointdata = budgetdata.viewpointdata
        let itemseriesdata: DatasetConfig = viewpointdata.itemseriesconfigdata
        let portaltitles = itemseriesdata.Titles
        let portalseriesname = itemseriesdata.Name
        if (itemseriesdata.Units == 'DOLLAR') {
            portalseriesname += ' (' + itemseriesdata.UnitsAlias + ')'
        }

        let portals = budgetNodes.map((budgetNode: BudgetNode, nodeindex) => {

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
                displaycallbacks = { {onChangePortalTab: this.onChangePortalTab} }
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
            <MenuItem value={'FUNCTIONAL'} primaryText="Budget (by function)"/>
            <MenuItem value={'STRUCTURAL'} primaryText="Budget (by structure)"/>
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
