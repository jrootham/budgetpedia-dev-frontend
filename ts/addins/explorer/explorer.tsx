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
// console.log('withrouter',withRouter)
import {Card, CardTitle, CardText} from 'material-ui/Card'
import FontIcon from 'material-ui/FontIcon'
import IconButton from 'material-ui/IconButton'
import Dialog from 'material-ui/Dialog'

import ExplorerBranch from './components/explorerbranch'
import { ChartTypeCodes, ChartCodeTypes } from '../constants'

import { updateBranchChartSelections } from './modules/updatebranchchartselections'
import * as Actions from '../../core/actions/actions'
import BudgetBranch from './classes/budgetbranch'
let uuid = require('node-uuid') // use uuid.v4() for unique id

import {
    MatrixCellConfig,
    ChartParmsObj,
    PortalChartLocation,
    GetChartParmsProps,
    BranchSettings,
} from './modules/interfaces'

interface ExplorerProps {
    showWaitingMessage:Function,
    hideWaitingMessage:Function,
    settings:any,
}

let Explorer = class extends Component< ExplorerProps, any > {

    // ============================================================
    // ---------------------[ INITIALIZE ]-------------------------

    constructor(props) {
        super(props);
    }

    // TODO: these values should be in global state to allow for re-creation after return visit
    // TODO: Take state initialization from external source
    // charts exist in a matrix (row/column) which contain a chartconfig object
    // TODO: most of 
    
    state = {
        // chartmatrix: [[], []], // DrillDown, Compare (Later: Differences, Context, Build)
        // budgetBranches:[
        //     // new BudgetBranch({data:{}, nodes:[], settings: this.props.settings.defaults.branch})
        // ],
        dialogopen: false,
    }

    componentDidMount() {
        let branchSettingsList:BranchSettings[] = this.props.settings.branchList
        let defaultSettings:BranchSettings = this.props.settings.defaults.branch
        if (branchSettingsList.length == 0) {
            // TODO: do this using actions
            branchSettingsList.push(defaultSettings)
            this.forceUpdate()
        }
    }

    componentWillUpdate() {
        let branchSettingsList:BranchSettings[] = this.props.settings.branchList
        let budgetBranches:BudgetBranch[] = this.budgetBranches
        if (budgetBranches.length < branchSettingsList.length) {
            budgetBranches.push(new BudgetBranch({settings:branchSettingsList[0]}))
        } else {
            // TODO: do extensive matching checks using uid
            for (let i = 0; i < branchSettingsList.length; i++) {
                budgetBranches[i].settings = branchSettingsList[i]
            }
        }
    }

    budgetBranches:BudgetBranch[] = []

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
            // this.forceUpdate()
        } else {
            setTimeout(() => {
                this.props.hideWaitingMessage()
            }, 250)
        }

    }

    updateIndexChartSelections = branchIndex => {
        let budgetBranch = this.budgetBranches[branchIndex]
        updateBranchChartSelections(budgetBranch.nodes)
    }

    updateChartSelections = branchIndex => () => this.updateIndexChartSelections(branchIndex)

    // ===================================================================
    // ---------------------------[ RENDER ]------------------------------ 

    render() {

        let explorer = this

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

        // let budgetBranch: BudgetBranch = explorer.state.budgetBranches[0]

        // let branchsettings: BranchSettings = this.props.settings.defaults.branch

        let drilldownsegments = () => {

            let budgetbranches = explorer.budgetBranches

            let segments = budgetbranches.map((budgetBranch, branchIndex) => {

         return <Card initiallyExpanded 
             key = {branchIndex}>

            <CardTitle
                actAsExpander={true}
                showExpandableButton={true} >

                Explorer Branch

            </CardTitle>

             <CardText expandable>
             <ExplorerBranch 
                 callbackid = {branchIndex}
                 budgetBranch = {budgetBranch}
                 displaycallbacks = {{ 
                     workingStatus: explorer.workingStatus,
                     updateChartSelections: explorer.updateChartSelections,
                  }}
             />
            </CardText>

        </Card >
            })

        return segments
    }
        // -----------[ COMBINE SEGMENTS ]---------------

        let segments = drilldownsegments()

        return <div>

        <Card initiallyExpanded >

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

            { segments }

        </div>
    }

}
// ====================================================================================
// ------------------------------[ INJECT DATA STORE ]---------------------------------

let mapStateToProps = state => {

    // mapStateToBranches()
    return {

        settings:state.explorer,

    }
}

// TODO: mapdispatch to props

// let Explorer: typeof ExplorerClass = withRouter(injectStore(mapStateToProps)(ExplorerClass))
Explorer = connect(mapStateToProps,
    {
        showWaitingMessage: Actions.showWaitingMessage,
        hideWaitingMessage: Actions.hideWaitingMessage,
    }
    )(Explorer)

export default Explorer

