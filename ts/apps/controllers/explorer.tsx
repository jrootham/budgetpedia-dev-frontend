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
    - consider creating an instance around 'node' for the key abstraction
        - include getChartParms -> node.getChartParms
    - move state to central store
    ? Classes:
        Explorer
        ExplorerPortal
        BudgetData = budgetdata -- package of dataseries, lookup, and viewpoint data
        BudgetExplorer (set of BudgetNodes)
        BudgetNode (derive from chartconfig) Node within Hierarchy
        BedgetChart (derive from chartcomfig) - presentation of BudgetNode
        BudgetInfo explanation of budget node
        BudgetPath series of drilldown budgetnodes
        BudgetMatrix complete set of budget paths for BudgetExplorer
*/

/// <reference path="../../../typings-custom/react-google-charts.d.ts" />
/// <reference path="../../../typings-custom/react-slider.d.ts" />

'use strict'
import * as React from 'react'
var { Component } = React
// doesn't require .d.ts...! (reference available in index.tsx)
import { connect as injectStore} from 'react-redux'
import {Card, CardTitle, CardText} from 'material-ui/Card'
import FontIcon from 'material-ui/FontIcon'
import IconButton from 'material-ui/IconButton'
import Dialog from 'material-ui/Dialog'

import { ExplorerBranch } from '../components/explorerbranch'
// import { ChartSeries } from '../constants'
import { ChartTypeCodes, ChartCodeTypes } from '../constants'

import { setViewpointData } from './explorer/setviewpointdata'
import { getChartParms } from './explorer/getchartparms'
import { updateChartSelections } from './explorer/updatechartselections'
import * as Actions from '../../actions/actions'

import {
    MatrixNodeConfig,
    MatrixChartConfig,
    ChartParmsObj,
    MatrixLocation,
    PortalChartLocation,
    GetChartParmsProps,
    GetChartParmsCallbacks,
} from './explorer/interfaces'
// import { categoryaliases } from '../constants'

class ExplorerClass extends Component< any, any > {

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
        chartmatrix: [[], []], // DrillDown, Compare (Later: Differences, Context, Build)
        dialogopen: false,
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
            this.props.dispatch(Actions.showWaitingMessage())
            // this.forceUpdate()
        } else {
            setTimeout(() => {
                this.props.dispatch(Actions.hideWaitingMessage())
            }, 250)
        }

    }

    // ===================================================================
    // ---------------------------[ RENDER ]------------------------------ 

    render() {

        let explorer = this

        let dialogbox =  
            <Dialog
                title = "Budget Explorer Help"
                modal = { false}
                open = { this.state.dialogopen }
                onRequestClose = { this.handleDialogClose }
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
                    onTouchTap={ this.handleDialogClose } >

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


        // -----------[ DASHBOARD SEGMENT]-------------

/*        let singleslider = (explorer.state.yearscope == 'one')?
            <ReactSlider 
                className="horizontal-slider" 
                defaultValue={explorer.state.yearslider.singlevalue} 
                min={ 2003 } 
                max={ 2016 } 
                onChange = {(value) => {
                    explorer.setState({
                        yearslider: Object.assign(explorer.state.yearslider, { 
                            singlevalue: [value] 
                        })
                    })
                }}>
                <div >{explorer.state.yearslider.singlevalue[0]}</div>
            </ReactSlider > :''

        let doubleslider = (explorer.state.yearscope != 'one') ?
            <ReactSlider
                className="horizontal-slider"
                defaultValue={explorer.state.yearslider.doublevalue}
                min={ 2003 }
                max={ 2016 }
                withBars={(explorer.state.yearscope == 'all') ? true : false}
                onChange = {(value) => {
                    explorer.setState({
                        yearslider: Object.assign(explorer.state.yearslider,{ 
                            doublevalue: value 
                        })
                    })
                } }>
                <div >{explorer.state.yearslider.doublevalue[0]}</div>
                <div >{explorer.state.yearslider.doublevalue[1]}</div>
            </ReactSlider>:''

        let dashboardsegment = <Card initiallyExpanded={false}>

            <CardTitle
                actAsExpander
                showExpandableButton >
                Dashboard
            </CardTitle>
            <CardText expandable >
                <div style={{fontStyle:'italic'}} > These dashboard controls are not yet functional </div>
            <Divider />
            <Checkbox 
                label="Inflation adjusted"
                defaultChecked
             />
            <Divider />
            <div style={{ display: 'inline-block', verticalAlign: "bottom", height:"24px", marginRight:"24px" }} > 
                Years: 
            </div>
            <RadioButtonGroup
                style={{ display: 'inline-block' }}
                name="yearscope"
                defaultSelected={explorer.state.yearscope}
                onChange={(ev, selection) => {
                    explorer.setState({yearscope:selection})
                } }>
                <RadioButton
                    value="one"
                    label="One"
                    iconStyle={{ marginRight: "4px" }}
                    labelStyle={{ width: "auto", marginRight: "24px" }}
                    style={{ display: 'inline-block', width: 'auto' }} />
                <RadioButton
                    value="two"
                    label="Two (side-by-side)"
                    iconStyle={{ marginRight: "4px" }}
                    labelStyle={{ width: "auto", marginRight: "24px" }}
                    style={{ display: 'inline-block', width: 'auto' }} />
                <RadioButton
                    value="all"
                    label="All (timelines)"
                    iconStyle={{ marginRight: "4px" }}
                    labelStyle={{ width: "auto", marginRight: "24px" }}
                    style={{ display: 'inline-block', width: 'auto' }} />
            </RadioButtonGroup>

            { singleslider }

            { doubleslider }

            <div style={{ display: (explorer.state.yearscope == 'all') ? 'inline' : 'none' }} >
                <Checkbox 
                    label="Year-over-year change, rather than actuals"
                    defaultChecked = {false}
                    />
            </div>

            <Divider />

            <RaisedButton
                style = {{marginRight:"24px"}}
                type="button"
                label="Download" />

            <RaisedButton
                type="button"
                label="Reset" />
            </CardText>

        </Card>
*/
        // -----------[ DRILLDOWN SEGMENT]-------------


        let drilldownsegment = 
        <Card initiallyExpanded >

            <CardTitle
                actAsExpander={false}
                showExpandableButton={false} >

                Budget Explorer

            </CardTitle>

            <CardText expandable >

                If you're new here, <a href="javascript:void(0)" 
                    onTouchTap={this.handleDialogOpen}>
                    read the help text</a> first.
                <IconButton tooltip="help"tooltipPosition="top-center"
                    onTouchTap = {
                        this.handleDialogOpen
                    }>
                    <FontIcon className="material-icons">help_outline</FontIcon>
                </IconButton>
             </CardText>
             <CardText>
             <ExplorerBranch 
                 budgetdata = {explorer.props.budgetdata}
                 workingStatus = {explorer.workingStatus}
                 matrixrow = {explorer.state.chartmatrix[0]}
                 userselections = {{
                     latestyear: 2015,
                     viewpoint: "FUNCTIONAL",
                     dataseries: "BudgetExpenses",
                     charttype: "ColumnChart",
                     inflationadjusted: true,
                 }}
                 yearslider = {{ singlevalue: [2015], doublevalue: [2005, 2015] }}
                 yearscope = {"one"}
             />
            </CardText>

        </Card >

        // -----------[ COMBINE SEGMENTS ]---------------

        return <div>

            { dialogbox }

            { drilldownsegment }

{
            // { dashboardsegment }

            // { comparesegment }

            // { differencessegment }

            // { contextsegment }

            // { buildsegment }
}
        </div>
    }

}
// ====================================================================================
// ------------------------------[ INJECT DATA STORE ]---------------------------------

let mapStateToProps = (state) => {

    let { budgetdata } = state

    return {

        budgetdata,

    }

}

let Explorer: typeof ExplorerClass = injectStore(mapStateToProps)(ExplorerClass)

export { Explorer }

