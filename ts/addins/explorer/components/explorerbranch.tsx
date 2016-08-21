// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// explorerbranch.tsx
/*
    TODO: 
    - add input fields to title, explorer header, and branch rightmost box
      to allow textual explanations of pages
    - add control to explorer header to toggle show/hide controls of charts
    - have per unit and performance views
    - include document source version (eg. summary vs fpars)
    - prevent resetting branch when viewpoint selected is same as previous
    BUG: after budgetdrilldown a sentinal is left in place which blocks repaint of byUnit menu
    -- this needs serious rationalization.
*/
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
import Snackbar from 'material-ui/Snackbar'
import Toggle from 'material-ui/Toggle'

// ------------------------[ modules ]-----------------------------
import { 
    onChartComponentSelection,
} from '../modules/onchartcomponentselection'

import {
    PortalConfig,
    BranchSettings,
} from '../modules/interfaces'

import { ExplorerNode } from './explorernode'

import { DatasetConfig, ViewpointData } from '../classes/databaseapi'

import { branchTypes as branchActionTypes } from '../actions'
import BudgetNode from '../classes/node.class'
import BudgetCell from '../classes/cell.class'
import BudgetBranch from '../classes/branch.class'

export interface ExplorerBranchActions {
    addNodeDeclaration:Function,
    removeNodeDeclarations:Function,
    changeViewpoint:Function,
    changeVersion: Function,
    toggleShowOptions: Function,
    changeBranchData: Function,
    changeAspect: Function,
    updateCellChartSelection: Function,  
    updateCellChartCode: Function,
    updateCellsDataseriesName: Function,
    resetLastAction: Function,
}

interface DeclarationData {
    branchesById: Object,
    generation: number,
    nodesById: Object,
    lastAction: any,
}

interface SnackbarProps {
    open:boolean,
    message: string,
}

interface ExplorerBranchProps {
    budgetBranch: BudgetBranch,
    displayCallbacks:{
        workingStatus:Function,
        // updateChartSelections:Function,
    },
    globalStateActions: ExplorerBranchActions,
    declarationData: DeclarationData
    handleDialogOpen: Function
}

interface ExplorerBranchState {
    branchNodes?:BudgetNode[], 
    viewpointData?:ViewpointData,
    snackbar?:SnackbarProps, 
    aspect?: string,
    byunitselection?: string,
}

class ExplorerBranch extends Component<ExplorerBranchProps, ExplorerBranchState> {

    state = {
        branchNodes:[],
        viewpointData:null,
        snackbar:{open:false,message:'empty'},
        // aspect:null,
        byunitselection:'Off',
    }

    waitforaction:number = 0

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

    // finish initialization of budgetBranch and branch explorer objects
    componentWillMount() {

        let { budgetBranch, globalStateActions:actions, displayCallbacks } = this.props

        // create global actions bundle for children
        this._stateActions = Object.assign({}, actions)
        // replace originals with curried versions
        this._stateActions.addNodeDeclaration = this.addNodeDeclaration(budgetBranch.uid)
        this._stateActions.removeNodeDeclarations = this.removeNodeDeclarations(budgetBranch.uid)

        let { onPortalCreation } = this
        let { workingStatus } = displayCallbacks

        // create display callbacks bundle for children
        this._nodeDisplayCallbacks = {
            // updateChartSelections,
            workingStatus,
            // local
            onPortalCreation,
            // updateBranchNodesState,
            // refreshPresentation,
        }

        // complete initialization of budgetBranch class instance
        // assign helpful getters and setters to budgetBranch
        budgetBranch.getState = this.getState
        budgetBranch.getProps = this.getProps
        budgetBranch.setState = this.setState.bind(this)
        // assign callbacks to budgetBranch
        budgetBranch.actions = this._stateActions
        budgetBranch.nodeCallbacks = this._nodeDisplayCallbacks
        // this.setState({
        //     aspect: this.props.budgetBranch.settings.viewpoint,
        // })
    }

    // initialize once -- set declarationData; initialize viewpointData; initialize branch
    componentDidMount() {
        let { budgetBranch, declarationData } = this.props
        this._previousControlData = declarationData // initialize
        budgetBranch.getViewpointData().then(() => {

            if (declarationData.branchesById[budgetBranch.uid].nodeList.length == 0) {
                // setTimeout(()=> {
                    // this will trigger harmonization between declarations 
                    // and local node instances in componentDidUpdate
                    this.waitforaction++
                    this._stateActions.changeBranchData(budgetBranch.uid)
                    let budgetNodeParms = budgetBranch.getInitialBranchNodeParms()
                    this._stateActions.addNodeDeclaration(budgetNodeParms)
                // })
            }

        })
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

    shouldComponentUpdate(nextProps: ExplorerBranchProps, nextState) {
        if (this.waitforaction) {
            console.log('waitforaction',this.waitforaction)
            this.waitforaction--
            return false
        }
        let { lastAction } = nextProps.declarationData

        if (nextState.snackbar.open != this.state.snackbar.open) return true

        if (!lastAction.explorer) return false
        let { branchuid } = lastAction
        if (branchuid) {
            let retval = (nextProps.budgetBranch.uid == branchuid)? true: false
            return retval
        }
        return true
    }
/*
    harmonization means creating local nodes to match global declarations
    acts as a sentinel; if count goes below zero, means that some 
    harmonization operation has failed, which is a system error
*/    
    harmonizecount: any = null
    // harmonize branch nodes; add pending node objects, and process state changes
    componentDidUpdate() {
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
        if (nodeList.length > branchNodes.length) {
            // places sentinal in place in case addNode below fails
            //   generating an infinite loop
            if (this.harmonizecount <= 0) {
                console.error('System Error: harmonize error', nodeList, branchNodes)
                // throw Error('error harmonizing branch nodes')
            }
            this.harmonizecount--
            let nodeIndex = branchNodes.length
            let budgetNodeId = nodeList[nodeIndex]
            // this.props.restoreNodes()
            budgetBranch.addNode( // sets state to trigger a render, and re-visitation of this code
                budgetNodeId,
                nodeIndex,
                nodesById[budgetNodeId] // declarations
            )
        } else { // otherwise see if there are other cascading actions that have to be taken
            this.harmonizecount = null // reset
            this._respondToGlobalStateChange()
        }
    }

    // _previousControlData is not in a closure to allow for initializing in componentDidMount
    private _previousControlData: any

    // state change machine
    private _respondToGlobalStateChange = () => {
        let previousControlData = this._previousControlData
        let currentControlData = this.props.declarationData
        let { lastAction } = currentControlData
        let returnvalue = true
        if (!branchActionTypes[lastAction.type]) {
            return false
        }
        // the generation counter could be the same if render is being triggered
        // solely by a local state change, which we want to ignore here
        if (previousControlData && (currentControlData.generation == previousControlData.generation)) {
            return false
        }

        let { budgetBranch } = this.props
        switch (lastAction.type) {
            case branchActionTypes.CHANGE_VIEWPOINT: {
                this._processChangeViewpointStateChange(budgetBranch)
                break
            }
            case branchActionTypes.CHANGE_VERSION: {
                this._processChangeVersionStateChange(budgetBranch)
                break
            }
            case branchActionTypes.CHANGE_ASPECT: {

                this._processChangeAspectStateChange(budgetBranch)
                break
            }
            default:
                returnvalue = false
        }
        this._previousControlData = currentControlData
        return returnvalue
    }

    private _processChangeViewpointStateChange = (budgetBranch:BudgetBranch) => {
        budgetBranch.getViewpointData().then(()=>{

            // setTimeout(()=>{
                this.waitforaction++
                this._stateActions.changeBranchData(budgetBranch.uid)
                let budgetNodeParms = budgetBranch.getInitialBranchNodeParms()
                this._stateActions.addNodeDeclaration(budgetNodeParms)
            // })

        })
    }

    private _processChangeVersionStateChange = (budgetBranch:BudgetBranch) => {
        budgetBranch.getViewpointData().then(()=>{

            // setTimeout(()=>{
                this.waitforaction++
                this._stateActions.changeBranchData(budgetBranch.uid)
                let budgetNodeParms = budgetBranch.getInitialBranchNodeParms()
                this._stateActions.addNodeDeclaration(budgetNodeParms)
            // })

        })
    }

    private _processChangeAspectStateChange = (budgetBranch:BudgetBranch) => {

        budgetBranch.getViewpointData().then(() => {

            // setTimeout(() => {
                this.waitforaction++

                this._stateActions.changeBranchData(budgetBranch.uid)
                let switchResults = budgetBranch.switchAspect()

                let { deeperdata, shallowerdata, mismatch } = switchResults

                if (mismatch) {
                    let message = switchResults.message
                    let { snackbar } = this.state
                    snackbar = Object.assign ({},snackbar)
                    snackbar.message = message
                    snackbar.open = true
                    this.setState({
                        snackbar,
                    })
                }
                if (deeperdata || shallowerdata) {

                    let message = null
                    if (deeperdata) {
                        message = "More drilldown is available for current aspect selection"
                    } else {
                        message = "Less drilldown is available for current aspect selection"
                    }
                    let { snackbar } = this.state
                    snackbar = Object.assign ( {},snackbar )
                    snackbar.message = message
                    snackbar.open = true
                    this.setState({
                        snackbar,
                    })

                }

            // })
        })
    }

    handleSnackbarRequestClose = () => {
        // this.props.globalStateActions.resetLastAction()
        this.setState({
            snackbar: {
                open: false,
                message: 'empty',
            }
        })

    }

    // ============================================================
    // ---------------------[ *** BRANCH *** CONTROL RESPONSES ]------------------

    // onPortalCreation animates scroll-in of new portal

    private branchScrollBlock = null

    onPortalCreation = () => {
        let element: Element = this.branchScrollBlock
        if (!element) {
            console.error('System Error: expected branch element not found in onPortalCreation')
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
    private easeOutCubic = t => {
        const t1 = t - 1;
        return t1 * t1 * t1 + 1;
    }

    // ---------------------[ user interactions ]---------------------------

    switchViewpoint = (viewpointname:string) => {

        let { budgetBranch } = this.props
        let { nodes:branchNodes } = budgetBranch

        // branchNodes is just a copy of the component state's BranchNodes
        let removed = branchNodes.splice(0) // identify nodes to remove
        let removeditems = removed.map((item:BudgetNode) => {
            return {nodeuid:item.uid, cellList:item.cellDeclarationList}
        })
        // this will trigger render cycle that will delete the component state's stored nodes
        let globalStateActions = this._stateActions
        globalStateActions.removeNodeDeclarations(removeditems)
        // now the viewpoint can be changed, triggering a change in viewpoint data
        // setTimeout(() => {
            globalStateActions.changeViewpoint(budgetBranch.uid, viewpointname)
        // })
    }

    switchVersion = (versionName: string) => {
        let { budgetBranch } = this.props
        let { nodes:branchNodes } = budgetBranch

        // branchNodes is just a copy of the component state's BranchNodes
        let removed = branchNodes.splice(0) // identify nodes to remove
        let removeditems = removed.map((item:BudgetNode) => {
            return {nodeuid:item.uid, cellList:item.cellDeclarationList}
        })
        // this will trigger render cycle that will delete the component state's stored nodes
        let globalStateActions = this._stateActions
        globalStateActions.removeNodeDeclarations(removeditems)
        // now the viewpoint can be changed, triggering a change in viewpoint data
        // setTimeout(() => {
            globalStateActions.changeVersion(budgetBranch.uid, versionName)
        // })
    }

    switchAspect = (aspect:string) => {

        switch (aspect) {
            case "Expenses":
            case "Revenues":
            case "Staffing":
            break

            default:

            return
        }

        let { budgetBranch }:{budgetBranch:BudgetBranch} = this.props

        budgetBranch.saveAspectState()

        this.props.globalStateActions.changeAspect(budgetBranch.uid, aspect)

    }

    switchUnit = unitindex => {
        this.setState({
            byunitselection:unitindex
        })
    }

    toggleShowOptions = value => {

        let { budgetBranch }:{budgetBranch:BudgetBranch} = this.props
        this.props.globalStateActions.toggleShowOptions( budgetBranch.uid, value )

    }

    handleSearch = () => {

    }

    // -----------------------------[ prepare for render ]---------------------------------

    // get React components to render
    getPortals = (budgetNodes:BudgetNode[]) => {

        let { viewpointData } = this.state

        if (!viewpointData) return []
        let datasetConfig: DatasetConfig = viewpointData.datasetConfig

        let portalSeriesName = datasetConfig.DatasetName
        if (datasetConfig.Units == 'DOLLAR') {
            portalSeriesName += ' (' + datasetConfig.UnitsAlias + ')'
        }

        let portals = budgetNodes.map((budgetNode: BudgetNode, nodeindex) => {

            let branchDeclaration:BranchSettings = this.props.declarationData.branchesById[this.props.budgetBranch.uid]

            let portalName = null
            if (budgetNode.treeNodeMetaDataFromParentSortedList) {
                portalName = budgetNode.treeNodeMetaDataFromParentSortedList.Name
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
                NamingConfigurations: viewpointNamingConfigs,
                datasetConfig: datasetConfig,
            } = viewpointdata
            let viewpointConfigPack = {
                viewpointNamingConfigs,
                datasetConfig,
            }
            budgetNode.viewpointConfigPack = viewpointConfigPack
            budgetNode.branchSettings = this.props.budgetBranch.settings
            budgetNode.onChartComponentSelection = onChartComponentSelection(this.props.budgetBranch)
            let actions = Object.assign({}, this._stateActions)
            actions.updateCellChartSelection = this._stateActions.updateCellChartSelection(budgetNode.uid)
            actions.updateCellChartCode = this._stateActions.updateCellChartCode(budgetNode.uid)

            return <ExplorerNode
                key = {nodeindex}
                callbackid = { nodeindex }
                budgetNode = { budgetNode }
                declarationData = {this.props.declarationData}
                globalStateActions = { actions }
                showControls = {branchDeclaration.showOptions}
                dataGenerationCounter = { branchDeclaration.branchDataGeneration }
            />
        })

        return portals

    }

    render() {

    let branch = this
    let drilldownrow = branch.props.budgetBranch.nodes

    let drilldownportals = branch.getPortals(drilldownrow)

    let branchDeclaration:BranchSettings = this.props.declarationData.branchesById[this.props.budgetBranch.uid]

    let viewpointselection = (branchDeclaration.showOptions)?<div style={{display:'inline-block', whiteSpace:"nowrap"}}>
        <span style={{ fontStyle: "italic" }}>Viewpoint: </span>
        <DropDownMenu
            value={branchDeclaration.viewpoint}
            onChange={
                (e, index, value) => {
                    branch.switchViewpoint(value)
                }
            }
            >

            <MenuItem value={'FUNCTIONAL'} primaryText="Budget (by function)"/>
            <MenuItem value={'STRUCTURAL'} primaryText="Budget (by structure)"/>
            <MenuItem disabled value={'STATEMENTS'} primaryText="Consolidated Statements"/>
            <MenuItem disabled value={'EXPENSESBYOBJECT'} primaryText="Expenses by Object"/>

        </DropDownMenu>

    </div>:null

    // TODO: add contitional logic depending on viewpoint selection
    let versionselection = (branchDeclaration.showOptions)?<div style={{display:'inline-block', whiteSpace:"nowrap"}}>
        <span style={{ fontStyle: "italic" }}>Version: </span>
        <DropDownMenu
            value = {branchDeclaration.version}
            onChange={
                (e, index, value) => {
                    branch.switchVersion(value)
                }
            }
            >

            <MenuItem value={'SUMMARY'} primaryText="Summary"/>
            <MenuItem value={'PBFT'} primaryText="Detail (PBFT)"/>
            <MenuItem disabled value={'VARIANCE'} primaryText="Variance Reports"/>

        </DropDownMenu>
    </div>:null

    // TODO: add conditional logic depending on version selection
    let aspectselection = (branchDeclaration.showOptions)
        ?
        <div style={{display:'inline-block', whiteSpace:"nowrap"}}>

            <span style={{ fontStyle: "italic" }}>Aspect: </span>

            <DropDownMenu
                value={branchDeclaration.aspect}
                onChange={
                    (e, index, value) => {
                        branch.switchAspect(value)
                    }
                }
                >

                <MenuItem value={'Expenses'} primaryText="Expenses"/>
                <MenuItem value={'Revenues'} primaryText="Revenues"/>
                <MenuItem disabled value={'Both'} primaryText="Both"/>
                <MenuItem disabled value={'Net'} primaryText="Net"/>
                <MenuItem value={'Staffing'} primaryText="Staffing" />

            </DropDownMenu>

        </div>
        :
        null

    let byunitselection = (branchDeclaration.showOptions)?<div style={{display:'inline-block', whiteSpace:"nowrap"}}>
        <span style={{ fontStyle: "italic",color: "rgba(0, 0, 0, 0.3)" }}>By Unit: </span>
        <DropDownMenu
            disabled
            value={this.state.byunitselection}
            onChange={
                (e, index, value) => {
                    this.switchUnit(value)
                }
            }
        >

            <MenuItem value={'Off'} primaryText="Off"/>
            <MenuItem disabled value={'Staff'} primaryText="Per staffing position"/>
            <MenuItem disabled value={'Population'} primaryText="Population: per person"/>
            <MenuItem disabled value={'Population100000'} primaryText="Population: per 100,000 people"/>
            <MenuItem disabled value={'Adult'} primaryText="Population: per adult (15 and over)"/>
            <MenuItem disabled value={'Adult100000'} primaryText="Population: per 100,000 adults"/>
            <MenuItem disabled value={'Child'} primaryText="Population: per child (14 and under)"/>
            <MenuItem disabled value={'Child100000'} primaryText="Population: per 100,000 children"/>
            <MenuItem disabled value={'Household'} primaryText="Per household"/>

        </DropDownMenu>
    </div>:null

    let inflationadjustment = (branchDeclaration.showOptions)
        ?
        <div 
            style={
                {
                    display:'inline-block', 
                    whiteSpace:"nowrap", 
                    verticalAlign:"bottom", 
                    marginRight:'16px',
                }
            }>
            <Toggle 
                disabled
                label={'Inflation adjusted:'} 
                style={
                    {
                        height:'32px', 
                        marginTop:'16px'
                    }
                } 
                labelStyle = {
                    {
                        fontStyle:'italic'
                    }
                } 
                defaultToggled={true} 
            />
        </div>
        :
        null

    let showcontrols = 
        <div 
            style={
                {
                    display:'inline-block', 
                    whiteSpace:"nowrap", 
                    verticalAlign:"bottom"
                }
            }>
            <Toggle 
                label={'Show options:'} 
                style={{height:'32px', marginTop:'16px'}} 
                labelStyle = {{fontStyle:'italic'}} 
                defaultToggled={branchDeclaration.showOptions}
                onToggle = { 
                    (e,value) => {
                        this.toggleShowOptions(value)
                    }
                }
            />
        </div>

    let showhelp = (branchDeclaration.showOptions)
        ?<IconButton tooltip="Help" tooltipPosition="top-center"
            onTouchTap = { this.props.handleDialogOpen }>
            <FontIcon className="material-icons">help_outline</FontIcon>
        </IconButton>
        :null

    let search = (branchDeclaration.showOptions)
        ?<IconButton disabled tooltip="Search" tooltipPosition="top-center"
            onTouchTap = { this.handleSearch }>
            <FontIcon className="material-icons">search</FontIcon>
        </IconButton>
        :null

    return <div >
    <div>

        { viewpointselection }

        { versionselection }

        { aspectselection }

        { byunitselection }

        { inflationadjustment }

        { showcontrols }

        { showhelp }

        { search }

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
