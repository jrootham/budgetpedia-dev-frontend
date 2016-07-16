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
        ExplorerPortal
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
import {Card, CardTitle, CardText} from 'material-ui/Card'
import FontIcon from 'material-ui/FontIcon'
import IconButton from 'material-ui/IconButton'
import Dialog from 'material-ui/Dialog'

import ExplorerBranch from './components/explorerbranch'
import { ChartTypeCodes, ChartCodeTypes } from '../constants'

import { updateBranchChartSelections } from './modules/updatebranchchartselections'
import * as Actions from '../../core/actions/actions'
import * as ExplorerActions from './actions'
import BudgetBranch from './classes/budgetbranch'
import { getExplorerControlData } from './reducers'

import {
    MatrixCellConfig,
    ChartParmsObj,
    PortalChartLocation,
    GetChartParmsProps,
    BranchSettings,
    BranchConfig,
} from './modules/interfaces'

interface MappedBranchActions {
    addNode:Function,
    changeViewpoint: Function,
    changeFacet: Function,
    removeNode: Function,
}

interface MappedExplorerActions extends MappedBranchActions {
    // actions composed with dispatch
    addBranch:Function, // dispatcher from ExplorerActions through connect
    removeBranch:Function,
}

interface MappedActions extends MappedExplorerActions{
    showWaitingMessage:Function, // dispatcher from Actions 
    hideWaitingMessage:Function, // dispatcher from Actions
}

interface ExplorerProps extends MappedActions {
    controlData:any, // from global state.explorer
}

interface ExplorerState {
    budgetBranches?:BudgetBranch[],
    dialogopen?: boolean,
}

let Explorer = class extends Component< ExplorerProps, ExplorerState > 
{

    // ============================================================
    // ---------------------[ INITIALIZE ]-------------------------

    constructor(props) {
        super(props);
    }

    state = {
        budgetBranches:[],
        dialogopen: false,
    }

    // see if any initialization is required
    componentWillMount() {
        let { branchList, branchesById } = this.props.controlData
        if (branchList.length == 0) { // initialize explorer with first branch
            let defaultSettings:BranchSettings = this.props.controlData.defaults.branch
            this.props.addBranch(defaultSettings)
        } else {
            let budgetBranches:BudgetBranch[] = this.state.budgetBranches
            this.harmonizeBudgetBranches(budgetBranches, branchList, branchesById)
            this.setState({
                budgetBranches,
            })
        }
    }

    harmonizeBudgetBranches = (budgetBranches, branchList, branchesById) => {
        if (budgetBranches.length < branchList.length ) { // new branch
            let length = budgetBranches.length
            for ( let i = length; i < branchList.length ; i++ ) {
                let uid = branchList[i]
                let settings = branchesById[uid]
                budgetBranches.push(new BudgetBranch({settings,uid}))
            }
        }
    }
    // harmonize budgetBranches objects  with control data
    componentWillReceiveProps(nextProps) {

        let { branchList, branchesById } = nextProps.controlData
        let budgetBranches:BudgetBranch[] = this.state.budgetBranches

        // remove deleted branches
        budgetBranches = budgetBranches.filter(budgetBranch => {
            return !!branchesById[budgetBranch.uid]
        })

        this.harmonizeBudgetBranches(budgetBranches, branchList, branchesById)
        
        // in any case update settings in case change made
        for (let i = 0; i < branchList.length; i++) {
            if (branchList[i] != budgetBranches[i].uid) {
                throw Error('mismatched order between controlData list and branch list')
            }

            budgetBranches[i].settings = branchesById[branchList[i]]

        }

        this.setState({
            budgetBranches,
        })
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

    updateIndexChartSelections = branchIndex => {
        let budgetBranch = this.state.budgetBranches[branchIndex]
        updateBranchChartSelections(budgetBranch.nodes)
    }

    updateChartSelections = branchIndex => () => {
        return this.updateIndexChartSelections(branchIndex)
    }

    // ===================================================================
    // ---------------------------[ RENDER ]------------------------------ 

    render() {

        let explorer = this
        // console.log('controlData',explorer.props.controlData)
        let dialogbox =  
            <Dialog
                title = "Budget Explorer Help"
                modal = { false}
                open = { explorer.state.dialogopen }
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

        let drilldownsegments = () => {

            let budgetbranches = explorer.state.budgetBranches

            let segments = budgetbranches.map((budgetBranch, branchIndex) => {
                let actionprops:MappedBranchActions = {
                    addNode: this.props.addNode,
                    removeNode: this.props.removeNode,
                    changeViewpoint: this.props.changeViewpoint,
                    changeFacet: this.props.changeFacet,
                }

                 return <Card initiallyExpanded 
                     key = {branchIndex}>

                    <CardTitle
                        actAsExpander={true}
                        showExpandableButton={true} >

                        Explorer Branch

                    </CardTitle>

                    <CardText expandable>
                    <ExplorerBranch 
                        callbackuid = { budgetBranch.uid }
                        callbackid = { branchIndex }
                        budgetBranch = {budgetBranch}
                        displaycallbacks = {{ 
                            workingStatus: explorer.workingStatus,
                            updateChartSelections: explorer.updateChartSelections(branchIndex),
                        }}
                        actions = { actionprops }
                        controlData = {explorer.props.controlData}
                    />
                    </CardText>

                </Card >
            })

            return segments
        }
        // -----------[ COMBINE SEGMENTS ]---------------

        let branches = drilldownsegments()

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
    controlData:getExplorerControlData(state), 
})

Explorer = connect(mapStateToProps, {
    showWaitingMessage: Actions.showWaitingMessage,
    hideWaitingMessage: Actions.hideWaitingMessage,
    // branch actions
    addBranch:ExplorerActions.addBranch,
    removeBranch: ExplorerActions.removeBranch,
    addNode:ExplorerActions.addNode,
    removeNode:ExplorerActions.removeNode,
    changeViewpoint: ExplorerActions.changeViewpoint,
    changeFacet: ExplorerActions.changeFacet,
})(Explorer)

export default Explorer

