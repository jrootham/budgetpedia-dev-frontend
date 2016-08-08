// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// explorer.tsx

/*
    BUG: 'Working' sign persists when click fails to drill down,
        such as when staff facet is selected and max depth is reached
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
        BudgetData = budgetdata -- package of facets, lookup, and viewpoint data
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

import ExplorerBranch from './components/explorerbranch'

import * as Actions from '../../core/actions/actions'
import * as ExplorerActions from './actions'
import BudgetBranch from './classes/branch.class'
import { getExplorerDeclarationData } from './reducers'

import {
    ChartParmsObj,
    PortalChartLocation,
    GetChartParmsProps,
    BranchSettings,
    BranchConfig,
} from './modules/interfaces'

interface MappedNodeActions {
    addCellDeclarations:Function,
    changeTab:Function,
    updateCellChartCode:Function,
    // removeCellDeclarations:Function,
    // changeChart:Function,
    // toggleDelta:Function,
}

interface MappedBranchActions extends MappedNodeActions {
    addNodeDeclaration:Function,
    removeNodeDeclarations: Function,
    changeViewpoint: Function,
    changeFacet: Function,
    updateCellChartSelection:Function,
    updateCellsDataseriesName: Function,
    resetLastAction: Function,
    // toggleInflationAdjustement:Function
}

interface MappedExplorerActions extends MappedBranchActions {
    // actions composed with dispatch
    addBranchDeclaration:Function, // dispatcher from ExplorerActions through connect
    removeBranchDeclaration:Function,
    resetLastAction:Function,
    branchMoveUp: Function,
    branchMoveDown: Function,
}

interface MappedActions extends MappedExplorerActions{
    showWaitingMessage:Function, // dispatcher from Actions 
    hideWaitingMessage:Function, // dispatcher from Actions
}

interface ExplorerProps extends MappedActions {
    declarationData:any, // from global state.explorer; contains object declarations
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

    // ============================================================
    // ---------------------[ INITIALIZE ]-------------------------

    state = {
        budgetBranches:[],
        dialogOpen: false,
        popover:{
            open:false
        },
        showdashboard:false
    }

    freshstart:boolean = false

    popover_ref:any

    popoverClose = () => {
        this.setState({
            popover: {
                open:false
            }
        })
    }

    // see if any initialization is required
    /*
        branchList will have a count of zero from a cold start
        A count above zero signifies a return to the page during the same session 
        or loading of a saved workspace
    */
    componentWillMount() {
        // global var used to suppress
        // unnecessary renders
        // global var is defined in typings-custom/general.d.ts
        // window.nodeUpdateControl = {
        //     nodeuid:null,
        //     new: null,
        // }
        let { branchList, branchesById } = this.props.declarationData
        if (branchList.length == 0) { // initialize explorer with first branch
            this.freshstart = true
            let defaultSettings:BranchSettings = JSON.parse(JSON.stringify(this.props.declarationData.defaults.branch))
            this.props.addBranchDeclaration(null,defaultSettings)
        } else {
            // this.props.restoreBranches()
            let budgetBranches:BudgetBranch[] = [...this.state.budgetBranches]
            budgetBranches = this.harmonizeBranches(budgetBranches, branchList, branchesById)
            // console.log('setState for branches')
            this.setState({
                budgetBranches,
            })
        }
    }

    addBranch = refbranchuid => {
        // console.log('adding branch from', branchuid)
        let defaultSettings:BranchSettings = JSON.parse(JSON.stringify(this.props.declarationData.defaults.branch))
        this.props.addBranchDeclaration( refbranchuid, defaultSettings )        
    }

    removeBranch = branchuid => {
        // console.log('removing branch', branchuid)
        this.props.removeBranchDeclaration(branchuid)
    }

    /*
        harmonizeBranches creates branches to match branch declarations
        called from componentWillMount for initialization of imported workspaces
        and from componentWillReceiveProps to modify branch list
    */
    harmonizeBranches = (budgetBranches, branchList, branchesById) => {
        // delete branches no longer required
        let newBranches = budgetBranches.filter((branch) => {
            return !!branchesById[branch.uid]
        })
        // add branches not yet created
        let length = newBranches.length
        for ( let i = 0; i < branchList.length ; i++ ) {
            let uid = branchList[i]
            let foundbranch = newBranches.filter(branch => {
                if (branch.uid == uid) 
                    return branch
            })
            if (foundbranch.length == 0) {
                let settings = branchesById[uid]
                let budgetBranch = new BudgetBranch({settings,uid})
                newBranches.push(budgetBranch)
            }
        }
        // sort branches into correct order
        let sortedBranches = []
        for ( let i = 0; i < branchList.length ; i++ ) {
            let uid = branchList[i]
            let foundbranch = newBranches.filter(branch => {
                if (branch.uid == uid)
                    return branch
            })
            if (!(foundbranch.length == 1)) {
                console.error('System error -- unexpected mismatch between state branch list and explorer branch list',
                    branchList, newBranches)
                throw Error('System error -- unexpected mismatch between state branch list and explorer branch list')
            }
            sortedBranches.push(foundbranch[0])
        }        
        return sortedBranches
    }

    /*    
        harmonize budgetBranches objects  with control data
        also update branch settings from declarations
        then setState to trigger render
    */    
    componentWillReceiveProps(nextProps) {

        let { branchList, branchesById } = nextProps.declarationData
        let budgetBranches:BudgetBranch[] = [...this.state.budgetBranches]


        budgetBranches = this.harmonizeBranches(budgetBranches, branchList, branchesById)
        
        // in any case update settings in case change made
        // TODO: only update when actual change made
        for (let i = 0; i < branchList.length; i++) {
            if (branchList[i] != budgetBranches[i].uid) {
                throw Error('mismatched order between declarationData list and branch list')
            }

            budgetBranches[i].settings = branchesById[branchList[i]]
            // console.log('branch settings for ', budgetBranches[i])
        }

        this.setState({
            budgetBranches,
        })
    }

    componentDidMount() {
        if (this.freshstart) {
            this.setState({
                popover:{
                    open:true
                }
            })
        }
    }

    componentWillUnmount() {
        this.props.resetLastAction()
    }

    handleDialogOpen = (e) => {
        e.stopPropagation()
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
            setTimeout(() => {
                this.props.hideWaitingMessage()
            })
        }

    }

    private changeTab = branchuid => (nodeuid, tabvalue) => this.props.changeTab(branchuid, nodeuid,tabvalue)

    private addCellDeclarations = branchuid => (nodeuid, settingslist) => this.props.addCellDeclarations(branchuid, nodeuid, settingslist)

    // private updateCellsDataseriesName = branchuid => cellItemList => this.props.updateCellsDataseriesName(branchuid, cellItemList)

    private updateCellChartSelection = branchuid => nodeuid => (celluid,selection) => (
        this.props.updateCellChartSelection(branchuid, nodeuid, celluid, selection )
    )

    private updateCellChartCode = branchuid => nodeuid => (celluid, explorerChartCode) => this.props.updateCellChartCode(branchuid, nodeuid, celluid, explorerChartCode)

    onExpandChange = (expanded) => {
        // TODO: change background color of title if it is collapsed
        // console.log('sending resetLastAction')
        this.props.resetLastAction()
    }

    branchMoveUp = branchuid => {
        this.props.branchMoveUp(branchuid)
    }

    branchMoveDown = branchuid => {
        this.props.branchMoveDown(branchuid)
    }
    // ===================================================================
    // ---------------------------[ RENDER ]------------------------------ 

    render() {

        let explorer = this

        // console.log('declarationData',explorer.props.declarationData)
        // console.log('rendering Explorer')
        
        let dialogbox =  
            <Dialog
                title = "Budget Explorer Options"
                modal = { false}
                open = { explorer.state.dialogOpen }
                onRequestClose = { explorer.handleDialogClose }
                autoScrollBodyContent
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

                <p>In the explorer charts, Viewpoints include: </p>
                <dl>
                    <dt><strong>Functional</strong></dt>
                    <dd>combines City of Toronto Agencies and Divisions into groups according to the nature of the services delivered (this is the default ) </dd>
                    <dt><strong>Structural</strong></dt>
                    <dd>more traditional: separates Agencies from Divisions; groupings are closer to those found
                        in City annual Budget Summaries</dd>
                </dl>
                <p>Facets are the main datasets available: Expenditures, Revenues, and Staffing Positions (Full Time Equivalents) </p>
                <p>This prototype uses data from the City Council Approved Operating Budget Summary 2015 from the City of Toronto's open data portal
                </p>

                <p>
                    Click or tap on any column in the "By Programs" charts to drill-down. Other charts do not 
                    currently support drill-down.
                </p>

            </Dialog >

        let popover = <Popover
            style={{borderRadius:"15px"}}
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
                    <p>Click or tap on any chart column to drill down.</p>
                </CardText>
            </Card>
        </Popover>

        // -----------[ DRILLDOWN SEGMENT]-------------

        let drilldownSegments = () => {

            let budgetBranches = explorer.state.budgetBranches

            let segments = budgetBranches.map((budgetBranch:BudgetBranch, branchIndex) => {

                let actionFunctions:MappedBranchActions = {
                    addCellDeclarations: this.addCellDeclarations(budgetBranch.uid),
                    updateCellChartSelection: this.updateCellChartSelection(budgetBranch.uid),
                    changeTab: this.changeTab(budgetBranch.uid),
                    updateCellChartCode: this.updateCellChartCode(budgetBranch.uid),
                    // removeCellDeclarations: this.props.removeCellDeclarations,
                    addNodeDeclaration: this.props.addNodeDeclaration,
                    removeNodeDeclarations: this.props.removeNodeDeclarations,
                    changeViewpoint: this.props.changeViewpoint,
                    changeFacet: this.props.changeFacet,
                    updateCellsDataseriesName: this.props.updateCellsDataseriesName,
                    resetLastAction: this.props.resetLastAction,
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

                        {"Exhibit " + (branchIndex + 1 ) + " "} 
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

        let branches = drilldownSegments()

        // console.log('branches', branches)

        return <div>

        <Card expanded = {this.state.showdashboard}>

            <CardTitle
                ref = {node => {this.popover_ref = findDOMNode(node)}} >

                <Toggle 
                    label={'Show dashboard:'} 
                    toggled = {this.state.showdashboard}
                    style={{
                        height:'32px', position:"absolute",
                        top:0,
                        right:0, 
                        margin:'16px 16px 0 0',
                        display:"block",
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

Explorer = connect(mapStateToProps, {
    // presentation
    showWaitingMessage: Actions.showWaitingMessage,
    hideWaitingMessage: Actions.hideWaitingMessage,
    // toggleShowControls

    // branch actions - components
    addBranchDeclaration:ExplorerActions.addBranchDeclaration,
    removeBranchDeclaration: ExplorerActions.removeBranchDeclaration,
    addNodeDeclaration:ExplorerActions.addNodeDeclaration,
    removeNodeDeclarations:ExplorerActions.removeNodeDeclarations,
    addCellDeclarations:ExplorerActions.addCellDeclarations,
    // removeCellDeclarations:ExplorerActions.removeCellDeclarations,

    // branch actions - variations
    changeViewpoint: ExplorerActions.changeViewpoint,
    changeFacet: ExplorerActions.changeFacet,
    resetLastAction: ExplorerActions.resetLastAction,
    // toggleInflationAdjustment
    branchMoveUp: ExplorerActions.branchMoveUp,
    branchMoveDown: ExplorerActions.branchMoveDown,

    // node actions
    changeTab: ExplorerActions.changeTab,

    // cell actions
    updateCellChartSelection: ExplorerActions.updateCellChartSelection,
    updateCellsDataseriesName: ExplorerActions.updateCellsDataseriesName,
    updateCellChartCode: ExplorerActions.updateCellChartCode,
    // toggleDelta
    // toggleVariance
    
})(Explorer)

export default Explorer

