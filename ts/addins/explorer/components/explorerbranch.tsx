// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// explorerbranch.tsx
/*
    TODO: 
    - implement scrolldown to new clone
    - implement inheritance of settings to new clone
    - add input fields to title, explorer header, and branch rightmost box
      to allow textual explanations of pages
    - add control to explorer header to toggle show/hide controls of charts
    - have per unit and performance views
    - include document source version (eg. summary vs fpars)
    - prevent resetting branch when viewpoint selected is same as previous
*/
'use strict'

// -------------------[ libraries ]---------------------
import * as React from 'react'
var { Component } = React

import DropDownMenu from 'material-ui/DropDownMenu'
import MenuItem from 'material-ui/MenuItem'
import { Card, CardTitle, CardText } from 'material-ui/Card'
import FontIcon from 'material-ui/FontIcon'
import IconButton from 'material-ui/IconButton'
import Dialog from 'material-ui/Dialog'
import Snackbar from 'material-ui/Snackbar'
import Toggle from 'material-ui/Toggle'
import RaisedButton from 'material-ui/RaisedButton'
let jsonpack = require('jsonpack')

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
import BudgetNode, {BudgetNodeDeclarationParms} from '../classes/node.class'
import BudgetCell from '../classes/cell.class'
import BudgetBranch from '../classes/branch.class'

import { MappedBranchActions as ExplorerBranchActions } from '../explorer'

import * as Utilities from '../modules/utilities'

export { ExplorerBranchActions }

interface DeclarationData {
    branchesById: Object,
    generation: number,
    nodesById: Object,
    cellsById: Object,
    lastAction: any,
    lastTargetedAction: any,
}

interface SnackbarProps {
    open:boolean,
    message: string,
}

interface ExplorerBranchProps {
    budgetBranch: BudgetBranch,
    displayCallbacks:{
        workingStatus:Function,
    },
    globalStateActions: ExplorerBranchActions,
    declarationData: DeclarationData,
    handleDialogOpen: Function,
    urlparms: {
        branchdata: any,
        settingsdata: any,
    },
    clearUrlParms: Function,
}

interface ExplorerBranchState {
    branchNodes?:BudgetNode[], 
    viewpointData?:ViewpointData,
    snackbar?:SnackbarProps, 
    comparatorselection?: string,
}

class ExplorerBranch extends Component<ExplorerBranchProps, ExplorerBranchState> {

    state = {

        branchNodes:[],
        viewpointData:null,
        snackbar:{open:false,message:'empty'},
        comparatorselection:'Off',

    }

    waitafteraction:number = 0

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
    private addNodeDeclaration = (branchUid) => {
        return (settings) => {
            console.log('running addNodeDeclaration SINGULAR')
            return this.props.globalStateActions.addNodeDeclaration(branchUid,settings);
        }
    }

    private addNodeDeclarations = (branchUid) => {
        return (settingslist) => {
            console.log('running addNodeDeclarations PLURAL')
            return this.props.globalStateActions.addNodeDeclarations(branchUid,settingslist);
        }
    }

    private removeNodeDeclarations = (branchUid) => {
        return (nodeItems) => {
            return this.props.globalStateActions.removeNodeDeclarations(branchUid, nodeItems)
        }
    }

    urlparms:any = null

    // finish initialization of budgetBranch and branch explorer objects
    componentWillMount() {

        this._initialize()

        let { budgetBranch, declarationData } = this.props

        budgetBranch.getViewpointData().then(() => {

            this._stateActions.incrementBranchDataVersion(budgetBranch.uid) // change data generation counter for child compare

            if (declarationData.branchesById[budgetBranch.uid].nodeList.length == 0) {

                let { urlparms } = this.props

                if (urlparms) {
                    this.urlparms = urlparms
                    this.props.clearUrlParms()
                    console.log('this.urlparms in branch will mount',this.urlparms)

                    let settingslist = this._geturlsettingslist(urlparms)

                    console.log('settingslist in branch will mount',settingslist)
                    this._stateActions.addNodeDeclarations(settingslist)

                } else {

                    let budgetNodeParms:BudgetNodeDeclarationParms = budgetBranch.getInitialBranchNodeParms()

                    console.log('budgetNodeParms in branchWillMount',budgetNodeParms)
                    this._stateActions.addNodeDeclaration(budgetNodeParms)

                }

            } else {

                setTimeout(()=>{ // attempt to reduce screen flash on return and renewal TODO: verify this!! 

                    this._stateActions.resetLastAction() // trigger update -> render

                })

            }

        }).catch(reason => {

            console.error('error in data fetch, componentWillMount (branch)', reason)

        })
    }

    private _geturlsettingslist = (urlparms) => {
        let nodesettings = urlparms.settingsdata
        let branch = urlparms.branchdata
        let settingslist = []
        for (let nodeindex in nodesettings) {
            let node = nodesettings[nodeindex]
            let settings = {
                aspectName:branch.as,
                cellIndex:node.ci,
                cellList:null,
                dataPath: branch.pa.slice(0,parseInt(nodeindex)),
                nodeIndex:parseInt(nodeindex),
                viewpointName:branch.vi,
                yearSelections:node.ys,
                yearsRange:{
                    firstYear:null,
                    lastYear:null,
                },
            }
            settingslist.push({
                settings,
            })
        }

        return settingslist
    } 

    private _initialize = () => {

        let branch = this

        let { budgetBranch, globalStateActions:actions, displayCallbacks, declarationData } = branch.props

        // create global actions bundle for children
        branch._stateActions = Object.assign({}, actions)
        // replace originals with curried versions
        branch._stateActions.addNodeDeclaration = branch.addNodeDeclaration(budgetBranch.uid)
        branch._stateActions.addNodeDeclarations = branch.addNodeDeclarations(budgetBranch.uid)
        branch._stateActions.removeNodeDeclarations = branch.removeNodeDeclarations(budgetBranch.uid)

        let { onPortalCreation } = branch
        let { workingStatus } = displayCallbacks

        // create display callbacks bundle for children
        branch._nodeDisplayCallbacks = {
            // updateChartSelections,
            workingStatus,
            // local
            onPortalCreation,
        }

        // complete initialization of budgetBranch class instance
        // assign helpful getters and setters to budgetBranch
        budgetBranch.getProps = branch.getProps
        budgetBranch.getState = branch.getState
        budgetBranch.setState = branch.setState.bind(branch)

        // assign callbacks to budgetBranch
        budgetBranch.actions = branch._stateActions
        budgetBranch.nodeCallbacks = branch._nodeDisplayCallbacks

        branch._previousControlData = declarationData // initialize

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

    private lastactiongeneration:number = 0

    shouldComponentUpdate(nextProps: ExplorerBranchProps, nextState) {

        let show = false // debug

        // Exception: allow snackbar open through in any case
        if (nextState.snackbar.open != this.state.snackbar.open) {
            if (show) console.log('should update branch return true for snackbar')
            return true
        }

        let branchComponent = this

        return Utilities.filterActionsForUpdate(nextProps, branchComponent, show)

    }

    componentDidUpdate() {

        // refresh branchnodes
        let { budgetBranch, declarationData } = this.props
        let branchDeclarations = declarationData.branchesById[budgetBranch.uid]
        let { nodeList } = branchDeclarations
        let { nodesById } = this.props.declarationData
        let branchNodes = this.props.budgetBranch.nodes // copy

        // harmonize is here for first setup; called from will mount for re-creation
        if (!this.harmonizeNodesToState(branchNodes, nodeList, nodesById, budgetBranch)) {

            this._respondToGlobalStateChange()
        }

    }

/*
    harmonization means creating local nodes to match global declarations
    acts as a sentinel; if count goes below zero, means that some 
    harmonization operation has failed, which is a system error
*/
    harmonizecount: any = null
    // harmonize branch nodes; add pending node objects, and process state changes
    harmonizeNodesToState = (branchNodes, nodeList, nodesById, budgetBranch) => {

        if (this.harmonizecount === null) { // initialize harmonization count

            this.harmonizecount = (nodeList.length - branchNodes.length)

        }

        // let harmonizecount = (nodeList.length - branchNodes.length)
        // first task is to harmonize declarationData nodeList list with local branchNode list
        // this condition will keep adding nodes on each render cycle triggered by 
        // addBranchNode, until all nodes are drawn
        if (this.harmonizecount > 0) {
            // places sentinal in place in case addNode below fails
            //   generating an infinite loop
            this.harmonizecount--

            let nodeIndex = branchNodes.length
            let budgetNodeId = nodeList[nodeIndex]

            // TODO: investigate doing addNodes instead, and adding them to the nodes state in one operation
            budgetBranch.addNode( // sets state to trigger a render, and re-visitation of this code
                budgetNodeId,
                nodeIndex,
                nodesById[budgetNodeId] // declarations
            )
            return true
        } else { // otherwise see if there are other cascading actions that have to be taken
            this.harmonizecount = null // reset
            return false
        }

    }

    // _previousControlData is not in a closure to allow for initializing in componentDidMount
    private _previousControlData: any

    // state change machine
    // TODO return value is ignored
    private _respondToGlobalStateChange = () => {

        let { budgetBranch } = this.props
        let previousControlData = this._previousControlData
        let currentControlData = this.props.declarationData
        let { lastTargetedAction } = currentControlData
        let lastAction = lastTargetedAction[budgetBranch.uid] || {}
        let returnvalue = true

        if (!branchActionTypes[lastAction.type]) {

            return false

        }

        // the generation counter could be the same if render is being triggered
        // solely by a local state change, which we want to ignore here
        if (previousControlData && (currentControlData.generation == previousControlData.generation)) {

            return false

        }

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
            case branchActionTypes.TOGGLE_INFLATION_ADJUSTED: {

                this._processToggleInflationAdjustedStateChange(budgetBranch)
                break

            }
            case branchActionTypes.UPDATE_PRORATA: {
                this._processUpdateProrataStateChange(budgetBranch)
                break
            }
            case branchActionTypes.HARMONIZE_CELLS: {
                budgetBranch.harmonizeCells()
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

            this._stateActions.incrementBranchDataVersion(budgetBranch.uid)
            let budgetNodeParms:BudgetNodeDeclarationParms = budgetBranch.getInitialBranchNodeParms()
            this._stateActions.addNodeDeclaration(budgetNodeParms)

        }).catch(reason => {

            console.error('error in data fetch, changeviewpoint', reason)

        })
    }

    private _processChangeVersionStateChange = (budgetBranch:BudgetBranch) => {

        budgetBranch.getViewpointData().then(()=>{

            this._stateActions.incrementBranchDataVersion(budgetBranch.uid)
            let budgetNodeParms:BudgetNodeDeclarationParms = budgetBranch.getInitialBranchNodeParms()
            this._stateActions.addNodeDeclaration(budgetNodeParms)

        }).catch(reason => {

            console.error('error in data fetch, changeversion', reason)

        })

    }

    private _processToggleInflationAdjustedStateChange = (budgetBranch:BudgetBranch) => {
        budgetBranch.getViewpointData().then(() => {

            this._stateActions.incrementBranchDataVersion(budgetBranch.uid)
            budgetBranch.toggleInflationAdjusted()

        }).catch(reason => {

            console.error('error in data fetch, toggle inflation adjustment',reason)

        })
    }

    private _processUpdateProrataStateChange = (budgetBranch:BudgetBranch) => {
        budgetBranch.calculateProRata(this.state.viewpointData).then(() => {

            this._stateActions.incrementBranchDataVersion(budgetBranch.uid)
            budgetBranch.updateProrata()

        }).catch(reason => {

            console.error('error in data fetch, updata prorata',reason)

        })
    }

    private _processChangeAspectStateChange = (budgetBranch:BudgetBranch) => {

        budgetBranch.getViewpointData().then(() => {

            this._stateActions.incrementBranchDataVersion(budgetBranch.uid)
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

        }).catch(reason => {

            console.error('error in data fetch, changeaspect',reason)

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

        globalStateActions.changeViewpoint(budgetBranch.uid, viewpointname)

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

        globalStateActions.changeVersion(budgetBranch.uid, versionName)

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

    switchComparator = comparatorindex => {

        let { budgetBranch } = this.props
        this.props.globalStateActions.updateProrata(budgetBranch.uid, comparatorindex)

    }

    toggleInflationAdjustment = value => {

        let { budgetBranch }:{budgetBranch:BudgetBranch} = this.props

        this.props.globalStateActions.toggleInflationAdjusted(budgetBranch.uid, value)

    }

    toggleShowOptions = value => {

        let { budgetBranch }:{budgetBranch:BudgetBranch} = this.props
        this.props.globalStateActions.toggleShowOptions( budgetBranch.uid, value )

    }

    handleSearch = () => {

    }

    // ---------------------------[ callbacks ]------------------------------

    /*
        harmonize:
        node:
        - tab selection cellIndex
        - yearSelections selection yearSelections
        cell:
        - yearScope selection "OneYear" etc.
        - chart selection [YearScope].ExplorerChartCode

        TODO: if the reference chart is an expenditure chart
            then all other nodes should also show expenditure chart
            -- so if the reference chart is in the leaf node
    */
    harmonizeCells = (nodeUid, cellUid) => {

        let { budgetBranch } = this.props
        let nodeList = []
        let cellList = []
        let nodeProperties = { cellIndex:null, yearSelections:null }
        let cellProperties = { yearScope:null, chartCode:null, nodeDataseriesName:null }
        let declarationData = this.props.declarationData
        let refnode = declarationData.nodesById[nodeUid]
        let refcell = declarationData.cellsById[cellUid]

        // get defaults to apply
        nodeProperties.cellIndex = refnode.cellIndex
        nodeProperties.yearSelections = Object.assign({},refnode.yearSelections)

        cellProperties.yearScope = refcell.yearScope
        cellProperties.chartCode = refcell.chartConfigs[refcell.yearScope].explorerChartCode
        cellProperties.nodeDataseriesName = refcell.nodeDataseriesName

        // collect node and cell lists
        let nodeidlist = declarationData.branchesById[budgetBranch.uid].nodeList
        for (let nodeid of nodeidlist) {
            // if (nodeid == nodeUid) continue
            nodeList.push(nodeid)
            let tempnode = declarationData.nodesById[nodeid]
            let cellidlist = tempnode.cellList
            for (let cellid of cellidlist) {
                if (cellid == cellUid) continue
                cellList.push(cellid)
            }
        }

        if (nodeList.length > 0) {

            this._stateActions.harmonizeCells(
                budgetBranch.uid,
                nodeProperties,
                cellProperties,
                nodeList,
                cellList
            )

        }

    }

    // -----------------------------[ prepare for render ]---------------------------------

    // get React components to render
    getPortals = (budgetNodes:BudgetNode[]) => {

        let branch = this

        let { viewpointData } = branch.state

        if (!viewpointData) return []
        let datasetConfig: DatasetConfig = viewpointData.Meta.datasetConfig

        let portalSeriesName = datasetConfig.DatasetName
        if (datasetConfig.Units == 'DOLLAR') {
            portalSeriesName += ' (' + datasetConfig.UnitsAlias + ')'
        }

        let portals = budgetNodes.map((budgetNode: BudgetNode, nodeindex) => {

            let branchDeclaration:BranchSettings = branch.props.declarationData.branchesById[branch.props.budgetBranch.uid]

            let portalName = null
            let treeNodeData = budgetNode.treeNodeData
            if (treeNodeData.Name) { // .Name) // MetaDataFromParentSortedList) {
                portalName = budgetNode.treeNodeData.Name
                portalName += ' ' + portalSeriesName
            } else {
                portalName = datasetConfig.DatasetTitle //'City Budget'
            }

            let portalConfig: PortalConfig = {
                portalName,
            }

            budgetNode.portalConfig = portalConfig

            let viewpointdata:ViewpointData = branch.state.viewpointData
            let {
                NamingConfigurations: viewpointNamingConfigs,
                // datasetConfig, declared previously
                isInflationAdjusted,
            } = viewpointdata.Meta

            let viewpointConfigPack = {
                viewpointNamingConfigs,
                datasetConfig,
                isInflationAdjusted,
                prorata:branchDeclaration.prorata,
            }
            budgetNode.viewpointConfigPack = viewpointConfigPack
            budgetNode.branchSettings = branch.props.budgetBranch.branchDeclaration
            budgetNode.onChartComponentSelection = onChartComponentSelection(branch.props.budgetBranch)
            let actions = Object.assign({}, branch._stateActions)
            actions.updateCellTimeScope = branch._stateActions.updateCellTimeScope(budgetNode.uid)
            actions.updateCellChartSelection = branch._stateActions.updateCellChartSelection(budgetNode.uid)
            actions.updateCellChartCode = branch._stateActions.updateCellChartCode(budgetNode.uid)
            actions.updateCellYearSelections = branch._stateActions.updateCellYearSelections(budgetNode.uid)

            return <ExplorerNode
                key = {nodeindex}
                callbackid = { nodeindex }
                budgetNode = { budgetNode }
                declarationData = {branch.props.declarationData}
                globalStateActions = { actions }
                showControls = {branchDeclaration.showOptions}
                dataGenerationCounter = { branchDeclaration.branchDataGeneration }
                callbacks = { {harmonizeCells:branch.harmonizeCells} }
                urlparms = {this.urlparms}
            />
        })

        return portals

    }

    shareBranch = () => {
        let branch = this
        console.log('declarationData',branch.props.declarationData)
        let branchDeclaration:BranchSettings = branch.props.declarationData.branchesById[branch.props.budgetBranch.uid]
        let government = branchDeclaration.repository
        let viewpoint = branchDeclaration.viewpoint
        let version = branchDeclaration.version
        let aspect = branchDeclaration.aspect
        let prorata = branchDeclaration.prorata
        let adjusted = branchDeclaration.inflationAdjusted
        let path = this.state.branchNodes[this.state.branchNodes.length - 1].dataPath
        let query = {
            g:government,
            vi:viewpoint,
            ve:version,
            as:aspect,
            pr:prorata,
            ad:adjusted,
            pa:path,
        }
        let nodeDeclarations = []
        let node:BudgetNode
        for (node of this.state.branchNodes) {
            nodeDeclarations.push(node.nodeDeclaration)
        }
        let settings = []
        for (let nodeDeclaration of nodeDeclarations) {
            let cellDeclarations = []
            for (let celluid of nodeDeclaration.cellList) {
                cellDeclarations.push(branch.props.declarationData.cellsById[celluid])
            }
            let cellSettingsList=[]
            // TODO: only process the cellDeclaration for current cellIndex
            for (let cellDeclaration of cellDeclarations) {
                let cellSettings = {
                    ys:cellDeclaration.yearScope,
                    // cs:cellDeclaration.chartSelection,
                    ct:cellDeclaration.chartConfigs[cellDeclaration.yearScope].explorerChartCode
                }
                cellSettingsList.push(cellSettings)
            }
            let nodesettings = {
                ci:nodeDeclaration.cellIndex,
                ys:{
                    ly:nodeDeclaration.yearSelections.leftYear,
                    ry:nodeDeclaration.yearSelections.rightYear,
                },
                c:cellSettingsList[nodeDeclaration.cellIndex],
            }
            settings.push(nodesettings)
        }
        let branchstring = jsonpack.pack(query)
        let bsencoded = encodeURIComponent(branchstring)
        let settingsstring = jsonpack.pack(settings)
        let ssencoded = encodeURIComponent(settingsstring)
        console.log('query',query, branchstring,branchstring.length,bsencoded,bsencoded.length)
        console.log('settings',settings,settingsstring, settingsstring.length,ssencoded,ssencoded.length)
        let url = location.hostname + '/explorer?branch=' + bsencoded + '&settings=' + ssencoded
        console.log('url',url,url.length)
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

            <MenuItem value={'FUNCTIONAL'} primaryText="Functional (budget)"/>
            <MenuItem value={'STRUCTURAL'} primaryText="Structural (budget)"/>
            <MenuItem value={'ACTUALEXPENSES'} primaryText="Expenses (actual)"/>
            <MenuItem value={'ACTUALREVENUES'} primaryText="Revenues (actual)"/>
            <MenuItem value={'EXPENDITURES'} primaryText="Expenses by Object (actual)"/>

        </DropDownMenu>

    </div>:null

    let governmentselection = (branchDeclaration.showOptions)?<div style={{display:'inline-block', whiteSpace:"nowrap"}}>
        <span style={{ fontStyle: "italic" }}>Government: </span>
        <DropDownMenu
            value={"Toronto"}
            disabled
            >

            <MenuItem value={'Toronto'} primaryText="Toronto, Ontario"/>

        </DropDownMenu>

    </div>:null

    // TODO externalize this; make it metadata-driven
    const versionchoices = () => {
        switch (branchDeclaration.viewpoint) {
            case "FUNCTIONAL":
            case "STRUCTURAL":
                return [<MenuItem key = {1} value={'SUMMARY'} primaryText="Summary"/>,
                <MenuItem key = {2} value={'PBFT'} primaryText="Detail (PBFT)"/>,
                <MenuItem key = {3} disabled value={'VARIANCE'} primaryText="Variance Reports"/>]
            case 'ACTUALEXPENSES':
                return [<MenuItem key = {4} value={'ACTUALEXPENSES'} primaryText="Expense Summary"/>]
            case 'ACTUALREVENUES':
                return [<MenuItem key = {4} value={'ACTUALREVENUES'} primaryText="Revenue Summary"/>]
            case 'EXPENDITURES':
                return [<MenuItem key = {4} value={'EXPENDITURES'} primaryText="Expenses by Object"/>]
        }
    }

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

            { versionchoices() }

        </DropDownMenu>
    </div>:null

    // TODO externalize this; make it metadata-driven
    const aspectchoices = () => {
        switch (branchDeclaration.viewpoint) {
            case "FUNCTIONAL":
            case "STRUCTURAL":
                return [<MenuItem key = {1} value={'Expenses'} primaryText="Expenses"/>,
                <MenuItem key = {2} value={'Revenues'} primaryText="Revenues"/>,
                <MenuItem key = {3} value={'Staffing'} primaryText="Staffing" />]
            case 'ACTUALEXPENSES':
                return [<MenuItem key = {4} value={'Expenses'} primaryText="Expenses"/>]
            case 'ACTUALREVENUES':
                return [<MenuItem key = {4} value={'Revenues'} primaryText="Revenues"/>]
            case 'EXPENDITURES':
                return [<MenuItem key = {4} value={'Expenditure'} primaryText="Expenditure"/>]
        }
    }

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

                { aspectchoices() }

            </DropDownMenu>

        </div>
        :
        null

    let byunitselection = (branchDeclaration.showOptions)?<div style={{display:'inline-block', whiteSpace:"nowrap"}}>
        <span style={{ fontStyle: "italic" }}>Prorated: </span>
        <DropDownMenu
            value={branchDeclaration.prorata}
            onChange={
                (e, index, value) => {
                    this.switchComparator(value)
                }
            }
        >

            <MenuItem value={'OFF'} primaryText="Off"/>
            <MenuItem value={'PERPERSON'} primaryText="Per person"/>
            <MenuItem value={'PER100000PERSONS'} primaryText="Per 100,000 people"/>
            <MenuItem value={'PERHOUSEHOLD'} primaryText="Per household"/>
            <MenuItem value={'PER50000HOUSEHOLDS'} primaryText="Per 50,000 households"/>

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
                label={'Inflation adjusted:'} 
                style={
                    {
                        height:'32px', 
                        marginTop:'16px'
                    }
                } 
                onToggle = {(e,value) => {
                    this.toggleInflationAdjustment(value)
                }}
                labelStyle = {
                    {
                        fontStyle:'italic'
                    }
                } 
                defaultToggled={branchDeclaration.inflationAdjusted} 
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

    let technotes = (branchDeclaration.showOptions)
        ?<div 
            style={
                {
                    display:'inline-block', 
                    whiteSpace:"nowrap", 
                    verticalAlign:"bottom",
                    position:"relative",
                }
            }>
            <IconButton tooltip="Source documents and technical notes" tooltipPosition="top-center"
            disabled
            style={{top:'3px'}}
            // onTouchTap = {}
            >
            <FontIcon 
                className="material-icons">note</FontIcon>
        </IconButton></div>
        :null

    let showhelp = (branchDeclaration.showOptions)
        ?<div 
            style={
                {
                    display:'inline-block', 
                    whiteSpace:"nowrap", 
                    verticalAlign:"bottom",
                    position:"relative",
                }
            }>
            <IconButton tooltip="Help" tooltipPosition="top-center"
            style={{top:'3px'}}
            onTouchTap = { this.props.handleDialogOpen }>
            <FontIcon 
                className="material-icons">help_outline</FontIcon>
        </IconButton></div>
        :null

    let search = (branchDeclaration.showOptions)
        ?<div 
            style={
                {
                    display:'inline-block', 
                    whiteSpace:"nowrap", 
                    verticalAlign:"bottom",
                    position:"relative",
                }
            }>
            <IconButton disabled tooltip="Find an entry point" tooltipPosition="top-center"
            style={{top:'3px'}}
            onTouchTap = { this.handleSearch }>
            <FontIcon 
                className="material-icons">search</FontIcon>
        </IconButton></div>
        :null

    let shareurl = (branchDeclaration.showOptions)
        ?<RaisedButton
            type="button"
            label="Share"
            onTouchTap={this.shareBranch} 
        />:null


    return <div >
    <div>

        { governmentselection }

        { viewpointselection }

        { versionselection }

        { aspectselection }

        { byunitselection }

        { inflationadjustment }

        { showcontrols }

        { technotes }

        { showhelp }

        { search }

        { shareurl }

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
