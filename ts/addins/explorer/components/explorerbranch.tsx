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
    onChartComponentSelection,
} from '../modules/onchartcomponentselection'

import {
    PortalConfig,
    CellSettings,
    CellCallbacks,
} from '../modules/interfaces'

import { ExplorerPortal } from './explorerportal'

import { DatasetConfig, ViewpointData } from '../classes/databaseapi'

import { branchTypes as branchActionTypes } from '../actions'
import BudgetNode from '../classes/budgetnode'
import BudgetCell from '../classes/budgetcell'
import BudgetBranch from '../classes/budgetbranch'

export interface ExplorerBranchActions {
    addNodeDeclaration:Function,
    removeNodeDeclarations:Function,
    changeViewpoint:Function,
    changeFacet: Function,    
}

interface DeclarationData {
    branchesById: Object,
    generation: number,
    nodesById: Object,
    lastAction: string,
}

interface ExploreBranchProps {
    budgetBranch: BudgetBranch,
    displayCallbacks:{
        workingStatus:Function,
        updateChartSelections:Function,
    },
    globalStateActions: ExplorerBranchActions,
    declarationData: DeclarationData
}

interface SnackbarProps {
    open:boolean,
    message: string,
}

class ExplorerBranch extends Component<ExploreBranchProps, 
    {branchNodes?:BudgetNode[], snackbar?:SnackbarProps, viewpointData?:ViewpointData} > {

    state = {
        branchNodes:[],
        viewpointData:null,
        snackbar:{open:false,message:'empty'}
    }

/*    
    getState() and getProps() for budgetBranch object:
    return fresh copy of state object; changes after being set
    used by budgetBranch instance
*/
    getState = () => this.state
    getProps = () => this.props

    private _stateActions: ExplorerBranchActions
    // used by callbacks; set by componentDidMount
    private _nodeDisplayCallbacks: any

    // provide for curried versions
    private addNodeDeclaration = 
        branchUid => settings => this.props.globalStateActions.addNodeDeclaration(branchUid,settings)
    private removeNodeDeclarations = 
        branchUid => nodeItems => this.props.globalStateActions.removeNodeDeclarations(branchUid, nodeItems)

    // complete initialization of budgetBranch and branch explorer objects
    componentWillMount() {

        let { budgetBranch, globalStateActions:actions, displayCallbacks } = this.props

        // create global actions bundle for children
        this._stateActions = Object.assign({}, actions)
        // replace originals with curried versions
        this._stateActions.addNodeDeclaration = this.addNodeDeclaration(budgetBranch.uid)
        this._stateActions.removeNodeDeclarations = this.removeNodeDeclarations(budgetBranch.uid)

        let { refreshPresentation, onPortalCreation, updateBranchNodesState } = this
        let { updateChartSelections, workingStatus } = displayCallbacks

        // create display callbacks bundle for children
        this._nodeDisplayCallbacks = {
            updateChartSelections,
            workingStatus,
            // local
            onPortalCreation,
            updateBranchNodesState,
            refreshPresentation,
        }

        // complete initialization of budgetBranch class instance
        // assign helpful getters and setters to budgetBranch
        budgetBranch.getState = this.getState
        budgetBranch.getProps = this.getProps
        budgetBranch.setState = this.setState.bind(this)
        // assign callbacks to budgetBranch
        budgetBranch.actions = this._stateActions
        budgetBranch.nodeCallbacks = this._nodeDisplayCallbacks
    }

    // initialize once -- set declarationData; initialize viewpointData; initialize branch
    componentDidMount() {
        let { budgetBranch, declarationData } = this.props
        this._previousControlData = declarationData // initialize
        budgetBranch.getViewpointData()
        if (declarationData.branchesById[budgetBranch.uid].nodeList.length == 0) {
            setTimeout(()=>{
                // this will trigger harmonization between declarations 
                // and local node instances in componentDidUpdate
                let budgetNodeParms = budgetBranch.getInitialBranchNodeParms()
                this._stateActions.addNodeDeclaration(budgetNodeParms)
            })
        }
    }

    // remove obsolete node objects
    componentWillReceiveProps(nextProps) {
        let { nodesById } = nextProps.declarationData
        let branchNodes = this.props.budgetBranch.nodes // copy
        let newBranchNodes = branchNodes.filter((node) => {
            return !!nodesById[node.uid]
        })
        if (newBranchNodes.length != branchNodes.length) { // some nodes were deleted
            this.setState({
                branchNodes:newBranchNodes,
            })
        }
    }
/*
    harmonization means creating local nodes to match global declarations
    acts as a sentinel; if count goes below zero, means that some 
    harmonization operation has failed, which is a system error
*/    
    harmonizecount: any = null
    // harmonize branch nodes; add pending node objects, and process state changes
    componentDidUpdate() {
        // console.log('did update')
        // refresh branchnodes
        let { budgetBranch, declarationData } = this.props
        let { nodes:branchNodes } = budgetBranch
        let { nodesById } = declarationData
        let branchDeclarations = declarationData.branchesById[budgetBranch.uid]
        let { nodeList } = branchDeclarations

        if (this.harmonizecount === null) { // initialize harmonization count
            this.harmonizecount = (nodeList.length - branchNodes.length)
        }

        // first task is to harmonize declarationData nodeList list with local branchNode list
        // this condition will keep adding nodes on each render cycle triggered by 
        // addBranchNode, until all nodes are drawn
        // console.log('nodeList, branchNodes lengths', nodeList.length, branchNodes.length, nodeList, branchNodes)
        if (nodeList.length > branchNodes.length) {
            // places sentinal in place in case addNode below fails
            //   generating an infinite loop
            if (this.harmonizecount <= 0) {
                console.log('harmonize error', nodeList, branchNodes)
                throw Error('error harmonizing branch nodes')
            }
            this.harmonizecount--
            let nodeIndex = branchNodes.length
            let budgetNodeId = nodeList[nodeIndex]
            budgetBranch.addNode( // sets state to trigger a render, and re-visitation of this code
                budgetNodeId,
                nodeIndex,
                nodesById[budgetNodeId] // declarations
            )
        } else { // otherwise see if there are other cascading actions that have to be taken
            this.harmonizecount = null // reset
            this.controlGlobalStateChange()
        }
    }

    // _previousControlData is not in a closure to allow for initializing in componentDidMount
    private _previousControlData: any

    // state change machine
    private controlGlobalStateChange = () => {
        let previousControlData = this._previousControlData
        let currentControlData = this.props.declarationData
        let { lastAction } = currentControlData
        if (!branchActionTypes[lastAction]) {
            return
        }
        // the generation counter could be the same if render is being triggered
        // solely by a local state change, which we want to ignore here
        if (previousControlData && (currentControlData.generation == previousControlData.generation)) {
            return
        }

        let { budgetBranch } = this.props
        switch (lastAction) {
            case branchActionTypes.CHANGE_VIEWPOINT: {
                this.processChangeViewpointStateChange(budgetBranch)
                break
            }
            case branchActionTypes.CHANGE_FACET: {
                this.processChangeFacetStateChange(budgetBranch)
                break
            }
        }
        this._previousControlData = currentControlData
    }

    private processChangeViewpointStateChange = (budgetBranch:BudgetBranch) => {
        budgetBranch.getViewpointData()
        setTimeout(()=>{
            let budgetNodeParms = budgetBranch.getInitialBranchNodeParms()
            this._stateActions.addNodeDeclaration(budgetNodeParms)
        })
    }

    private processChangeFacetStateChange = (budgetBranch:BudgetBranch) => {
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
                branch.props.displayCallbacks.updateChartSelections()
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
            this._nodeDisplayCallbacks.updateChartSelections()
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

    switchViewpoint = (viewpointname:string) => {

        let { budgetBranch } = this.props
        let { nodes:branchNodes } = budgetBranch

        // branchNodes is just a copy of the component state's BranchNodes
        let removed = branchNodes.splice(0) // identify nodes to remove
        let removeditems = removed.map((item) => {
            return {uid:item.uid, cellList:item.cellList}
        })
        // console.log('calling from switchviewpoint',branchsettings, viewpointname, callbackuid, removedids)
        // this will trigger render cycle that will delete the component state's stored nodes
        let globalStateActions = this._stateActions
        globalStateActions.removeNodeDeclarations(removeditems)
        // now the viewpoint can be changed, triggering a change in viewpoint data
        setTimeout(() => {
            globalStateActions.changeViewpoint(budgetBranch.uid, viewpointname)
        })
    }

    switchFacet = (facet:string) => {
        // console.log('calling changeFacet',facet)
        let { budgetBranch } = this.props
        this.props.globalStateActions.changeFacet(budgetBranch.uid, facet)
        let branch = this
        setTimeout(() => {
            this._nodeDisplayCallbacks.updateChartSelections()
        })
    }

    // -----------------------------[ prepare for render ]---------------------------------

    // get React components to render
    getPortals = (budgetNodes:BudgetNode[]) => {

        // let { settings:branchSettings } = this.props.budgetBranch

        let { viewpointData } = this.state

        if (!viewpointData) return []
        let itemSeriesData: DatasetConfig = viewpointData.itemseriesconfigdata
        // let portalTitles = itemSeriesData.Titles
        let portalSeriesName = itemSeriesData.Name
        if (itemSeriesData.Units == 'DOLLAR') {
            portalSeriesName += ' (' + itemSeriesData.UnitsAlias + ')'
        }

        let portals = budgetNodes.map((budgetNode: BudgetNode, nodeindex) => {

            let portalName = null
            if (budgetNode.parentData) {
                portalName = budgetNode.parentData.Name
            } else {
                portalName = 'City Budget'
            }

            portalName += ' ' + portalSeriesName

            let portalConfig: PortalConfig = {
                portalName,
            }

            budgetNode.portalConfig = portalConfig

            let viewpointdata = this.state.viewpointData
            let {
                Configuration: viewpointConfig,
                itemseriesconfigdata: itemseriesConfig,
            } = viewpointdata
            let configData = {
                viewpointConfig,
                itemseriesConfig,
            }

            return <ExplorerPortal
                key = {nodeindex}
                callbackid = { nodeindex }
                branchSettings = {this.props.budgetBranch.settings}
                budgetNode = { budgetNode }
                declarationData = {this.props.declarationData}
                configData = {configData}
                globalStateActions = { this._stateActions }
                displayCallbacks = { {onChangePortalTab: this.onChangePortalTab} }
                onChartComponentSelection = {onChartComponentSelection(this.props.budgetBranch)}
            />
        })

        return portals

    }

    onChangePortalTab = () => {
        let branch = this
        setTimeout(() => {
            branch._nodeDisplayCallbacks.updateChartSelections()
        })
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
