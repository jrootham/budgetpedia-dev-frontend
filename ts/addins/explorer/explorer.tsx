// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// explorer.tsx

/*
    BUG: 'Working' sign persists when click fails to drill down,
        such as when staff facet is selected and max depth is reached
    BUG: navigating to dialog help box loses bar selection
    TODO: 
    - change 'Facets' to 'Perspectives'
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
var { Component } = React
// doesn't require .d.ts...! (reference available in index.tsx)
import { connect } from 'react-redux'
// import { withRouter } from 'react-router' // not ready yet!!
import {Card, CardTitle, CardText, CardActions} from 'material-ui/Card'
import FontIcon from 'material-ui/FontIcon'
import IconButton from 'material-ui/IconButton'
import Dialog from 'material-ui/Dialog'

import ExplorerBranch from './components/explorerbranch'

// import { updateBranchChartSelections } from './modules/updatebranchchartselections'
import * as Actions from '../../core/actions/actions'
import * as ExplorerActions from './actions'
import BudgetBranch from './classes/branch.class'
import { getExplorerDeclarationData } from './reducers'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import ContentAdd from 'material-ui/svg-icons/content/add'
import ContentRemove from 'material-ui/svg-icons/content/remove'

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
    // toggleInflationAdjustement:Function
}

interface MappedExplorerActions extends MappedBranchActions {
    // actions composed with dispatch
    addBranchDeclaration:Function, // dispatcher from ExplorerActions through connect
    removeBranchDeclaration:Function,
    resetLastAction:Function,
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
}

let Explorer = class extends Component< ExplorerProps, ExplorerState > 
{

    // ============================================================
    // ---------------------[ INITIALIZE ]-------------------------

    state = {
        budgetBranches:[],
        dialogOpen: false,
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
        // sort branches into correct order
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

        }

        this.setState({
            budgetBranches,
        })
    }

    componentWillUnmount() {
        this.props.resetLastAction()
    }

    handleDialogOpen = () => {
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

    onExpandChange = () => {
        // console.log('sending resetLastAction')
        this.props.resetLastAction()
    }

    // ===================================================================
    // ---------------------------[ RENDER ]------------------------------ 

    render() {

        let explorer = this

        // console.log('declarationData',explorer.props.declarationData)
        // console.log('rendering Explorer')
        
        let dialogbox =  
            <Dialog
                title = "Budget Explorer Help"
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
                }

                let displayCallbackFunctions = { 
                    workingStatus: explorer.workingStatus,
                    // updateChartSelections: explorer.updateChartSelections(branchIndex),
                }

                // ----------------[ Contains ExplorerBranch ]-------------------------

                return <Card initiallyExpanded 
                    key = {budgetBranch.uid}
                    onExpandChange = {() => {
                        this.onExpandChange()
                    }}
                    >

                    <CardTitle
                        actAsExpander={true}
                        showExpandableButton={true} >

                        {"Explorer Branch " + (branchIndex +1) } 

                    </CardTitle>

                    <CardText expandable>
                    <ExplorerBranch 
                        budgetBranch = { budgetBranch }
                        declarationData = { explorer.props.declarationData }
                        globalStateActions = { actionFunctions }
                        displayCallbacks = { displayCallbackFunctions }
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

        <Card initiallyExpanded = {false}>

            <CardTitle
                actAsExpander={true}
                showExpandableButton={true} >

                Budget Explorer

            </CardTitle>
            <CardText expandable >

                If you're new here, <a href="javascript:void(0)" 
                    onTouchTap={explorer.handleDialogOpen}>
                    read the help text</a> first.
                <IconButton tooltip="help"tooltipPosition="top-center"
                    onTouchTap = {
                        explorer.handleDialogOpen
                    }>
                    <FontIcon className="material-icons">help_outline</FontIcon>
                </IconButton>
            </CardText>
        </Card>
        
            { dialogbox }

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
    updateCellChartSelection: ExplorerActions.updateCellChartSelection,
    changeTab: ExplorerActions.changeTab,
    updateCellsDataseriesName: ExplorerActions.updateCellsDataseriesName,
    updateCellChartCode: ExplorerActions.updateCellChartCode,
    resetLastAction: ExplorerActions.resetLastAction,
    // changeChart
    // changeSelection
    // toggleInflationAdjustment
    // toggleDelta
})(Explorer)

export default Explorer

