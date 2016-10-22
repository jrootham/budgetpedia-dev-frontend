// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// explorer.tsx

/*
    BUG: in _getBranchCloneSettings unselect parent child creates 'data not availble in child branch'
    BUG: 'Working' sign persists when click fails to drill down,
        such as when staff aspect is selected and max depth is reached
    BUG: navigating to dialog help box loses bar selection
    TODO: 
    - use general state to track fact that popover has been seen in session in explorer
      to avoid having it appear whenever user returns to explorer
    - add popover from componentDidMount to explain that the charts are drill-down
      (maybe for first branch)
    - scroll down to new branch after hitting + sign
    - do systematic check for error handling requirements; protect against 
        unexpected data (extrenal)
    - move state to central store
    ? Classes:
        Explorer
        ExporerNode
        BudgetData = budgetdata -- package of aspects, lookup, and viewpoint data
        BudgetExplorer (set of BudgetNodes)
        BudgetNode (derive from chartconfig) Node within Hierarchy
        BedgetChart (derive from chartcomfig) - presentation of BudgetNode
        BudgetInfo explanation of budget node
        BudgetPath series of drilldown budgetnodes
        BudgetMatrix complete set of budget paths for BudgetExplorer
*/

/// <reference path="../../../typings-custom/react-google-charts.d.ts" />
/// <reference path="../../../typings-custom/react-slider.d.ts" />
/// <reference path="../../../typings-custom/general.d.ts" />
// <reference path="../../../typings/globals/react-router/index.d.ts" />

'use strict'
import * as React from 'react'
import { findDOMNode } from 'react-dom'
var { Component } = React
// doesn't require .d.ts...! (reference available in index.tsx)
import { connect } from 'react-redux'
// import { withRouter } from 'react-router' // not ready yet!!
import {Card, CardTitle, CardText, CardActions} from 'material-ui/Card'
import FontIcon from 'material-ui/FontIcon'
import IconButton from 'material-ui/IconButton'
import Dialog from 'material-ui/Dialog'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import ContentAdd from 'material-ui/svg-icons/content/add'
import ContentRemove from 'material-ui/svg-icons/content/remove'
import Popover from 'material-ui/Popover'
import Toggle from 'material-ui/Toggle'

let uuid = require('node-uuid') // use uuid.v4() for unique id
let jsonpack = require('jsonpack')

import ExplorerBranch from './components/explorerbranch'

import * as Actions from '../../core/actions/actions'
import * as ExplorerActions from './actions'
import BudgetBranch from './classes/branch.class'
import { getExplorerDeclarationData } from './reducers'
import dialogcontent from './content/helpcontent'

import {
    BranchSettings,
} from './modules/interfaces'

// mapStateToProps wraps these redux actions with redux dispatch
// for use in explorernode
export interface MappedNodeActions {
    addCellDeclarations: Function,
    changeTab: Function,
    updateCellChartCode: Function,
    updateCellYearSelections: Function,
    normalizeCellYearDependencies: Function,
    updateNode: Function,
    // removeCellDeclarations:Function,
    // changeChart:Function,
    // toggleDelta:Function,
}

// for use in explorerbranch
export interface MappedBranchActions extends MappedNodeActions {
    addNodeDeclaration:Function,
    removeNodeDeclarations: Function,
    changeViewpoint: Function,
    changeVersion: Function,
    changeAspect: Function,
    toggleInflationAdjusted: Function,
    updateProrata: Function,
    toggleShowOptions: Function,
    incrementBranchDataVersion: Function,
    updateCellChartSelection:Function,
    updateCellTimeScope:Function,
    updateCellYearSelections: Function,
    updateCellChartCode: Function,
    updateCellsDataseriesName: Function,
    resetLastAction: Function,
    harmonizeCells: Function,
    // toggleInflationAdjustement:Function
}

// for use here
interface MappedExplorerActions extends MappedBranchActions {
    // actions composed with dispatch
    addBranchDeclaration:Function, // dispatcher from ExplorerActions through connect
    cloneBranchDeclaration:Function,
    removeBranchDeclaration:Function,
    resetLastAction:Function,
    branchMoveUp: Function,
    branchMoveDown: Function,
}

// also used here
interface MappedActions extends MappedExplorerActions{
    showWaitingMessage:Function, // dispatcher from Actions 
    hideWaitingMessage:Function, // dispatcher from Actions
}

interface ExplorerProps extends MappedActions {
    declarationData:any, // from global state.explorer; contains object declarations
    location?:any,
}

interface ExplorerState {
    budgetBranches?:BudgetBranch[],
    dialogOpen?: boolean,
    popover?: {
        open:boolean
    },
    showdashboard?: boolean
}

let Explorer = class extends Component< ExplorerProps, ExplorerState > 
{

    // ---------------------[ Initialize ]-------------------------

    state = {
        budgetBranches:[],
        dialogOpen: false,
        popover:{
            open:false
        },
        showdashboard:false
    }

    // calculated referece for popover location
    popover_ref:any

    popoverClose = () => {
        this.setState({
            popover: {
                open:false
            }
        })
    }

    // ----------------------------[ Lifecycle operations ]-------------------------------

    urlparms:any = null

    clearUrlParms = () => {
        this.urlparms = null
    }

    componentWillMount() {

        console.log('explorer props location.query',this.props.location.query)

        let {query} = this.props.location

        let branchdata, settingsdata

        if (query.branch && query.settings) {

            branchdata = jsonpack.unpack(query.branch)
            settingsdata = jsonpack.unpack(query.settings)

            this.urlparms = {
                branchdata,
                settingsdata,
            }

            let defaultSettings:BranchSettings = JSON.parse(JSON.stringify(this.props.declarationData.defaults.branch))
            console.log('branchdata, settingsdata,defaultSettings',branchdata,settingsdata,defaultSettings)

            let querysettings = {
                inflationAdjusted:branchdata.ad,
                aspect:branchdata.as,
                prorata:branchdata.pr,
                repository:branchdata.g,
                version:branchdata.ve,
                viewpoint:branchdata.vi,
            }

            let settings = Object.assign(defaultSettings,querysettings)

            this.props.addBranchDeclaration(null,settings) // change state
            return

        }

        let { branchList, branchesById } = this.props.declarationData

        if (branchList.length == 0) { // initialize explorer with first branch

            // this.freshstart = true
            let defaultSettings:BranchSettings = JSON.parse(JSON.stringify(this.props.declarationData.defaults.branch))
            this.props.addBranchDeclaration(null,defaultSettings) // change state

        } else { // harmonize branch instances to branch declarations

            let { branchList, branchesById } = this.props.declarationData
            let budgetBranches:BudgetBranch[] = [...this.state.budgetBranches]

            this.harmonizeBranchesToState(budgetBranches, branchList, branchesById)
        }
    }

    // start with open reminder to user that click on charts drills down
    componentDidMount() {
        this.setState({
            popover:{
                open:true
            }
        })
    }

    componentWillUnmount() {
        this.props.resetLastAction() // clear sentinals for unmount //TODO verify this!
    }

    componentDidUpdate() {

        let { branchList, branchesById } = this.props.declarationData
        let budgetBranches:BudgetBranch[] = [...this.state.budgetBranches]

        this.harmonizeBranchesToState(budgetBranches, branchList, branchesById)

    }

    /*
        harmonizeBranches creates branches to match branch declarations
        called from componentWillMount for initialization of imported workspaces
        and from componentWillReceiveProps to modify branch list
    */
    harmonizeBranchesToState = (budgetBranches, branchList, branchesById) => {
        // reset state branches if a change is made
        let change = false

        // delete branches that are no longer required
        let newBranches = budgetBranches.filter((branch) => {
            return !!branchesById[branch.uid]
        })
        if (newBranches.length != budgetBranches.length) {
            change = true
        }
        // add branches not yet created
        // let length = newBranches.length
        for ( let i = 0; i < branchList.length ; i++ ) {
            let uid = branchList[i]
            let foundbranch = newBranches.filter(branch => {
                if (branch.uid == uid) 
                    return branch
            })
            if (foundbranch.length == 0) { // branch not found, so add it
                if (!change) change = true
                let budgetBranch = new BudgetBranch({uid})
                newBranches.push(budgetBranch)
            }
        }
        // sort branches into correct order, per state branchlist
        let sortedBranches = []
        for ( let i = 0; i < branchList.length ; i++ ) {
            let uid = branchList[i]
            let foundbranch = newBranches.filter(branch => {
                if (branch.uid == uid)
                    return branch
            })
            if (!(foundbranch.length == 1)) {
                console.error(
                    'System error -- unexpected mismatch between state branch list and explorer branch list',
                    branchList, newBranches)
                throw Error('System error -- unexpected mismatch between state branch list and explorer branch list')
            }
            sortedBranches.push(foundbranch[0])
        }
        if (!change) {
            for (let i = 0; i<budgetBranches.length; i++) {
                if (budgetBranches[i].uid != sortedBranches[i].uid) {
                    change = true
                    break
                }
            }
        }
        if (change) {
            this.setState({
                budgetBranches:sortedBranches,
            })
        }
    }

    // ------------------------[ andcillary ui ]---------------------------

    handleDialogOpen = (e) => {
        e.stopPropagation()
        e.preventDefault()
        this.setState({
            dialogOpen: true
        })
    }

    handleDialogClose = () => {
        this.setState({
            dialogOpen: false
        })
    }

    // callbacks
    workingStatus = status => {
        if (status) {
            this.props.showWaitingMessage()
        } else {
            this.props.hideWaitingMessage()
        }

    }

    // ---------------[ create action calls versions for currying (branchid) ]---------------

    // node consumer
    private updateNode = branchuid => 
        nodeuid => 
        this.props.updateNode(branchuid, nodeuid)
    private changeTab = branchuid => 
        (nodeuid, tabvalue) => 
        this.props.changeTab(branchuid, nodeuid,tabvalue)
    private addCellDeclarations = branchuid => 
        (nodeuid, settingslist) => 
        this.props.addCellDeclarations(branchuid, nodeuid, settingslist)
    private normalizeCellYearDependencies = branchuid => 
        (nodeuid, cellList, yearsRange) => 
        this.props.normalizeCellYearDependencies(branchuid, nodeuid, cellList, yearsRange)

    // cell consumer
    private updateCellTimeScope = branchuid => 
        nodeuid => (celluid,selection) =>
        this.props.updateCellTimeScope(branchuid, nodeuid, celluid, selection )
    private updateCellChartSelection = branchuid => 
        nodeuid => (celluid,selection) =>
        this.props.updateCellChartSelection(branchuid, nodeuid, celluid, selection )
    private updateCellYearSelections = branchuid => 
        nodeuid => (leftyear,rightyear) =>
        this.props.updateCellYearSelections(branchuid, nodeuid, leftyear, rightyear )
    private updateCellChartCode = branchuid => 
        nodeuid => (celluid, explorerChartCode) => 
        this.props.updateCellChartCode(branchuid, nodeuid, celluid, explorerChartCode)
    
    // ----------------------------[ ui responses ]------------------------------

    onExpandChange = (expanded) => { // TODO: validate this
        // TODO: change background color of title if it is collapsed
        this.props.resetLastAction()
    }

    branchMoveUp = branchuid => {
        this.props.branchMoveUp(branchuid)
    }

    branchMoveDown = branchuid => {
        this.props.branchMoveDown(branchuid)
    }

    private _getBranchCloneSettings = refbranchid => {
        let declarationData = this.props.declarationData
        let clones = {
            branch:{},
            nodes:{},
            cells:{},
        }
        let uidmap = {}
        // clone branch
        uidmap[refbranchid] = uuid.v4()
        clones.branch[refbranchid] = this._getClone(declarationData.branchesById[refbranchid])
        // console.log('clones', clones)
        // clone branch nodes
        for (let nodeid of clones.branch[refbranchid].nodeList) {
            let nodeobject = declarationData.nodesById[nodeid]
            // console.log('nodeobject', nodeobject)
            clones.nodes[nodeid] = this._getClone(nodeobject)
            uidmap[nodeid] = uuid.v4()
        }
        // clone node cells
        for (let nodeid in clones.nodes) {
            for (let cellid of clones.nodes[nodeid].cellList) {
                clones.cells[cellid] = this._getClone(declarationData.cellsById[cellid])
                uidmap[cellid] = uuid.v4()
                clones.cells[cellid].celluid = uidmap[cellid] // TODO: this reference shouldn't be in cell declaration!!
            }
        }

        // console.log('cell clones',clones.cells)
        // map old uid's to new uid's
        let newclones = {
            newbranchid:uidmap[refbranchid],
            branch:{},
            nodes:{},
            cells:{},
        }
        let newrefbranchid = uidmap[refbranchid]
        newclones.branch[newrefbranchid] = clones.branch[refbranchid]
        let oldlist = newclones.branch[newrefbranchid].nodeList
        let newlist = []
        for (let id of oldlist) {
            newlist.push(uidmap[id])
        }
        newclones.branch[newrefbranchid].nodeList = newlist
        for (let id in clones.nodes) {
            let newid = uidmap[id]
            let nodeclone = newclones.nodes[newid] = clones.nodes[id]

            let oldlist = nodeclone.cellList
            let newlist = []
            for (let cellid of oldlist) {
                newlist.push(uidmap[cellid])
            }
            nodeclone.cellList = newlist

        }
        for (let oldid in clones.cells) {
            newclones.cells[uidmap[oldid]] = clones.cells[oldid]
        }
        return newclones
    }

    private _getClone = object => {
        return JSON.parse(JSON.stringify(object))
    }

    addBranch = refbranchuid => {
        let cloneSettings = this._getBranchCloneSettings(refbranchuid)

        // console.log('branch clone',refbranchuid,cloneSettings)

        this.props.cloneBranchDeclaration( refbranchuid, cloneSettings )
        this.onCloneCreation()

    }

    // crude scroll down on branch clone
    onCloneCreation = () => {

        setTimeout(() => {

            let adjustment = 400
            let frames = 60
            let t = 1 / frames
            let counter = 0
            let base = 0
            let tick = () => {
                counter++
                let factor = this.easeOutCubic(counter * t)
                let scrollinterval = adjustment * factor
                window.scrollBy(0,scrollinterval - base)
                base = scrollinterval
                if (counter < frames) {
                    requestAnimationFrame(tick)
                }
            }

            requestAnimationFrame(tick)

        },1000) // give charts some time to render and take up space
    }

    // TODO: should be in utilities
    // from https://github.com/DelvarWorld/easing-utils/blob/master/src/easing.js
    private easeOutCubic = t => {
        const t1 = t - 1;
        return t1 * t1 * t1 + 1;
    }

    removeBranch = branchuid => {
        this.props.removeBranchDeclaration(branchuid)
    }

    // ===================================================================
    // ---------------------------[ Render ]------------------------------ 

    render() {

        let explorer = this

        let dialogbox =  
            <Dialog
                title = "Budget Explorer Options"
                modal = { false}
                open = { explorer.state.dialogOpen }
                onRequestClose = { explorer.handleDialogClose }
                bodyStyle={{padding:'12px'}}
                autoScrollBodyContent
                contentStyle = {{width:'95%',maxWidth:'600px'}}
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
                    onTouchTap={ explorer.handleDialogClose } >

                    <FontIcon
                        className="material-icons"
                        style = {{ cursor: "pointer" }} >

                        close

                    </FontIcon>

                </IconButton>

                { dialogcontent }

            </Dialog >

        let popover = <Popover
            style={{borderRadius:"15px",maxWidth:"400px"}}
            open = {this.state.popover.open}
            onRequestClose = {this.popoverClose}
            anchorEl = {this.popover_ref}
        >
            <Card 
                style={{border:"4px solid orange", borderRadius:"15px"}}
            >
                <CardText>
                <div>
                    <IconButton
                        style={{
                            padding: 0,
                            float:"right",
                            height: "36px",
                            width: "36px",
                        }}
                        onTouchTap={ explorer.popoverClose } >

                        <FontIcon
                            className="material-icons"
                            style = {{ cursor: "pointer" }} >

                            close

                        </FontIcon>

                    </IconButton>
                    </div>
                    <p>Click or tap on any chart column to drill down (except as noted).</p>
                </CardText>
            </Card>
        </Popover>

        // -----------[ BRANCH SEGMENT]-------------

        let branchSegments = () => {

            let budgetBranches = explorer.state.budgetBranches

            // console.log('budgetBranches',budgetBranches)
            // map over budgetBranches state
            let segments = budgetBranches.map((budgetBranch:BudgetBranch, branchIndex) => {

                let urlparms = null
                if (branchIndex == 0 && this.urlparms) {
                    urlparms = this.urlparms
                    // this.urlparms = null // pass once only
                    // console.log('branchIndex, urlparms in explorer map branches',branchIndex,urlparms)
                }
                // collect functions to pass down to nested components
                let actionFunctions:MappedBranchActions = {
                    
                    // curried
                    addCellDeclarations: this.addCellDeclarations(budgetBranch.uid),
                    normalizeCellYearDependencies: this.normalizeCellYearDependencies(budgetBranch.uid),
                    updateCellTimeScope: this.updateCellTimeScope(budgetBranch.uid),
                    updateCellChartSelection: this.updateCellChartSelection(budgetBranch.uid),
                    updateCellYearSelections: this.updateCellYearSelections(budgetBranch.uid),
                    changeTab: this.changeTab(budgetBranch.uid),
                    updateCellChartCode: this.updateCellChartCode(budgetBranch.uid),
                    updateNode: this.updateNode(budgetBranch.uid),

                    // pass-through
                    addNodeDeclaration: this.props.addNodeDeclaration,
                    removeNodeDeclarations: this.props.removeNodeDeclarations,
                    changeViewpoint: this.props.changeViewpoint,
                    changeVersion: this.props.changeVersion,
                    toggleInflationAdjusted: this.props.toggleInflationAdjusted,
                    updateProrata:this.props.updateProrata,
                    changeAspect: this.props.changeAspect,
                    incrementBranchDataVersion: this.props.incrementBranchDataVersion,
                    toggleShowOptions: this.props.toggleShowOptions,
                    updateCellsDataseriesName: this.props.updateCellsDataseriesName,
                    resetLastAction: this.props.resetLastAction,
                    harmonizeCells: this.props.harmonizeCells,
                }

                let displayCallbackFunctions = { 
                    workingStatus: explorer.workingStatus,
                    // updateChartSelections: explorer.updateChartSelections(branchIndex),
                }

                // ----------------[ Contains ExplorerBranch ]-------------------------

                return <Card initiallyExpanded 
                    key = {budgetBranch.uid}
                    onExpandChange = {(expanded) => {
                        this.onExpandChange(expanded)
                    }}
                    >

                    <CardTitle
                        actAsExpander={true}
                        showExpandableButton={true} >

                        {"Row " + (branchIndex + 1 ) + " "} 
                        <input 
                            type="text" 
                            onTouchTap = {(ev) => {ev.stopPropagation()}}
                        />

                        <IconButton
                            style={{
                                float:"right",
                                marginRight:"30px"
                            }}
                            disabled = {(branchIndex == (budgetBranches.length - 1))}
                            onTouchTap = { 
                                (uid => 
                                    ev => {
                                        ev.stopPropagation()
                                        this.branchMoveDown(uid)
                                    }
                                )(budgetBranch.uid)
                            }
                            tooltip= "Move down"
                            >

                            <FontIcon
                                className="material-icons"
                                style = {{ cursor: "pointer" }} >

                                arrow_downward

                            </FontIcon>

                        </IconButton>
                        <IconButton
                            style={{
                                float:"right"
                            }}
                            disabled = {(branchIndex == 0)}
                            onTouchTap = { 
                                (uid => 
                                    ev => {
                                        ev.stopPropagation()
                                        this.branchMoveUp(uid)
                                    }
                                )(budgetBranch.uid)
                            }
                            tooltip= "Move up"
                            >

                            <FontIcon
                                className="material-icons"
                                style = {{ cursor: "pointer" }} >

                                arrow_upward

                            </FontIcon>

                        </IconButton>

                    </CardTitle>

                    <CardText expandable>
                    <ExplorerBranch 
                        budgetBranch = { budgetBranch }
                        declarationData = { explorer.props.declarationData }
                        globalStateActions = { actionFunctions }
                        displayCallbacks = { displayCallbackFunctions }
                        handleDialogOpen = {this.handleDialogOpen}
                        urlparms = { urlparms }
                        clearUrlParms = {this.clearUrlParms}
                    />
                    </CardText>
                    <CardActions expandable>
                        <FloatingActionButton
                            onTouchTap = {
                                (uid => () => {
                                    this.addBranch(uid)
                                })(budgetBranch.uid)
                            }
                        >
                            <ContentAdd />
                        </FloatingActionButton>
                        {( budgetBranches.length > 1 )?<FloatingActionButton 
                            onTouchTap = {
                                (uid => () => {
                                    this.removeBranch(uid)
                                })(budgetBranch.uid)
                            }
                            secondary={true}>
                            <ContentRemove />
                        </FloatingActionButton>:null}
                    </CardActions>

                </Card >
            })

            return segments
        }
        // -----------[ COMBINE SEGMENTS ]---------------

        let branches = branchSegments()

        return <div>

        <Card expanded = {this.state.showdashboard}>

            <CardTitle
                ref = {node => {this.popover_ref = findDOMNode(node)}} >

                <Toggle 
                    label={'Show dashboard:'} 
                    toggled = {this.state.showdashboard}
                    style={{
                        height:'32px', float:"right",
                        display:"inline-block",
                        width:'auto',
                    }} 
                    labelStyle = {{fontStyle:'italic'}} 
                    onToggle = { (e,value) => {
                        e.stopPropagation()
                        this.setState({
                            showdashboard:value
                        })
                    }}/>

                Budget Explorer

            </CardTitle>
            <CardText expandable >

                <span style= {{fontStyle:'italic'}}>[content to be determined]</span>
            </CardText>
        </Card>
        
            { dialogbox }

            { popover }

            { branches }

        </div>
    }

}
// ====================================================================================
// ------------------------------[ INJECT DATA STORE ]---------------------------------

let mapStateToProps = state => ({ 
    declarationData:getExplorerDeclarationData(state), 
})

// initialize all these call backs with dispatch

Explorer = connect(mapStateToProps, {
    // presentation
    showWaitingMessage: Actions.showWaitingMessage,
    hideWaitingMessage: Actions.hideWaitingMessage,
    // toggleShowControls

    // branch actions - components
    addBranchDeclaration:ExplorerActions.addBranchDeclaration,
    cloneBranchDeclaration:ExplorerActions.cloneBranchDeclaration,
    removeBranchDeclaration: ExplorerActions.removeBranchDeclaration,
    addNodeDeclaration:ExplorerActions.addNodeDeclaration,
    removeNodeDeclarations:ExplorerActions.removeNodeDeclarations,
    addCellDeclarations:ExplorerActions.addCellDeclarations,
    normalizeCellYearDependencies: ExplorerActions.normalizeCellYearDependencies,
    harmonizeCells: ExplorerActions.harmonizeCells,
    // removeCellDeclarations:ExplorerActions.removeCellDeclarations,

    // branch actions - variations
    changeViewpoint: ExplorerActions.changeViewpoint,
    changeVersion: ExplorerActions.changeVersion,
    changeAspect: ExplorerActions.changeAspect,
    toggleInflationAdjusted: ExplorerActions.toggleInflationAdjusted,
    updateProrata: ExplorerActions.updateProrata,
    incrementBranchDataVersion: ExplorerActions.incrementBranchDataVersion,
    toggleShowOptions: ExplorerActions.toggleShowOptions,
    resetLastAction: ExplorerActions.resetLastAction,
    // toggleInflationAdjustment
    branchMoveUp: ExplorerActions.branchMoveUp,
    branchMoveDown: ExplorerActions.branchMoveDown,

    // node actions
    changeTab: ExplorerActions.changeTab,

    // cell actions
    updateCellTimeScope: ExplorerActions.updateCellTimeScope,
    updateCellChartSelection: ExplorerActions.updateCellChartSelection,
    updateCellYearSelections: ExplorerActions.updateCellYearSelections,
    // updateCellsDataseriesName: ExplorerActions.updateCellsDataseriesName,
    updateCellChartCode: ExplorerActions.updateCellChartCode,
    updateNode: ExplorerActions.updateNode,
    // toggleDelta
    // toggleVariance
    
})(Explorer)

export default Explorer

