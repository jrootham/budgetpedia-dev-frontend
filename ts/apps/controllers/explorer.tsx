// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// explorer.tsx

/*
    TODO: 
    - do systematic check for error handling requirements; protect against 
        unexpected data (extrenal)
    - consider creating an instance around 'node' for the key abstraction
        - include getChartParms -> node.getChartParms
    - move state to central store
    ? Classes:
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
import Card = require('material-ui/lib/card/card')
import CardTitle = require('material-ui/lib/card/card-title')
import CardText = require('material-ui/lib/card/card-text')
import RadioButton = require('material-ui/lib/radio-button')
import RadioButtonGroup = require('material-ui/lib/radio-button-group')
import FontIcon = require('material-ui/lib/font-icon')
import IconButton = require('material-ui/lib/icon-button')
import Divider = require('material-ui/lib/divider')
import Checkbox = require('material-ui/lib/checkbox')
import RaisedButton = require('material-ui/lib/raised-button')
import ReactSlider = require('react-slider')

import { ExplorerChart } from '../components/explorerchart'
import { ChartSeries } from '../constants'
import { ChartTypeCodes } from '../constants'

import { setViewpointAmounts } from './explorer/setviewpointamounts'
import { getChartParms } from './explorer/getchartparms'
import { updateChartSelections } from './explorer/updatechartselections'

import {
    ChartConfig,
    ChartParms,
    ChartSelectionContext
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
    state = {
        chartmatrix: [ [], [] ], // DrillDown, Compare (Later: Differences, Context, Build)
        yearslider: {singlevalue:[2015],doublevalue:[2005,2015]},
        yearscope:"one",
        userselections:{
            latestyear:2015,
            viewpoint:"FUNCTIONAL",
            dataseries:"BudgetExpenses",
            charttype: "ColumnChart",
            inflationadjusted:true,
        }
    }
    
    // initialize once - create root drilldown and compare series
    componentDidMount = () => {

        this.initializeChartSeries()

    }

    initializeChartSeries = () => {
        let userselections = this.state.userselections,
            chartmatrix = this.state.chartmatrix

        var matrixlocation,
            chartParmsObj

        // ------------------------[ POPULATE VIEWPOINT WITH VALUES ]-----------------------

        let viewpointname = userselections.viewpoint
        let dataseriesname = userselections.dataseries
        let budgetdata = this.props.budgetdata
        setViewpointAmounts(viewpointname, dataseriesname, budgetdata,
            userselections.inflationadjusted)

        // -----------------[ THE DRILLDOWN ROOT ]-----------------

        // assemble parms to get initial dataset
        let drilldownchartconfig: ChartConfig =
            this.initRootChartConfig(ChartSeries.DrillDown, userselections)

        chartParmsObj = getChartParms(drilldownchartconfig, userselections, budgetdata, this.setState.bind(this), chartmatrix)

        if (!chartParmsObj.error) {

            drilldownchartconfig.chartparms = chartParmsObj.chartParms

            matrixlocation = drilldownchartconfig.matrixlocation
            chartmatrix[matrixlocation.row][matrixlocation.column] = drilldownchartconfig

        }

        // -----------------[ THE COMPARE ROOT ]-------------------
        /*
                // assemble parms to get initial dataset
                let comparechartconfig: ChartConfig = this.initRootChartConfig( ChartSeries.Compare, userselections )
        
                chartParmsObj = this.getChartParms( comparechartconfig )
        
                if (!chartParmsObj.error) {
        
                    comparechartconfig.chartparms = chartParmsObj.chartParms
        
                    matrixlocation = comparechartconfig.matrixlocation
                    chartmatrix[ matrixlocation.row ][ matrixlocation.column ] = comparechartconfig
        
                }
        */
        // -------------[ SAVE INITIALIZATION ]----------------

        // make initial dataset available to chart
        this.setState({
            chartmatrix,
        });

    }

    // -------------------[ INITIALIZE ROOT CHART CONFIG ]--------------------

    initRootChartConfig = ( matrixrow, userselections ): ChartConfig => {
        let chartCode = ChartTypeCodes[userselections.charttype]
        return {
            viewpoint:userselections.viewpoint,
            dataseries:userselections.dataseries,
            datapath: [], // get data from root viewpoint object
            matrixlocation: {
                row:matrixrow,
                column: 0
            },
            yearscope: {
                latestyear: userselections.latestyear,
                earliestyear: null,
                fullrange: false,
            },
            charttype: userselections.charttype,
            chartCode,
        }

    }

    // ============================================================
    // ---------------------[ CONTROL RESPONSES ]------------------

    switchViewpoint = (viewpointname, seriesref) => {

        let userselections = this.state.userselections
        let chartmatrix = this.state.chartmatrix
        let chartseries = chartmatrix[seriesref]
        chartseries.splice(0) // remove subsequent charts
        userselections.viewpoint = viewpointname
        this.setState({
            userselections,
            chartmatrix,
        })
        // defer initialization until after update 
        // triggered by setState, to make sure previous
        // chart is destroyed; otherwise previous viewpoint 
        // settings are retained in error
        // setTimeout(() => {
        this.initializeChartSeries()
        // })

    }

    // TODO: add seriesref like switchViewpoint
    switchDataSeries = seriesname => {

        let userselections = this.state.userselections
        userselections.dataseries = seriesname
        let chartmatrix = this.state.chartmatrix
        this.setState({
            userselections,
        })
        let viewpointname = this.state.userselections.viewpoint
        let dataseriesname = this.state.userselections.dataseries
        let budgetdata = this.props.budgetdata
        setViewpointAmounts(viewpointname, dataseriesname, budgetdata,
            this.state.userselections.inflationadjusted)
        for (let matrixseries of chartmatrix) {
            let cellconfig:ChartConfig
            let cellptr: number
            for (cellptr = 0; cellptr < matrixseries.length; cellptr++ ) {
                cellconfig = matrixseries[cellptr]
                let chartParmsObj = getChartParms(cellconfig, userselections, budgetdata, this.setState, chartmatrix)
                if (chartParmsObj.isError) {
                    matrixseries.splice(cellptr)
                    if (cellptr > 0) { // unset the selection of the parent
                        let parentconfig:ChartConfig = matrixseries[cellptr - 1]
                        // disable reselection
                        parentconfig.chartselection = null
                        parentconfig.chart = null
                    }
                } else {
                    cellconfig.chartparms = chartParmsObj.chartParms
                    cellconfig.dataseries = seriesname
                }
            }
        }
        setTimeout(() => {
            this.setState({
                chartmatrix,
            })
            for (let row = 0; row < chartmatrix.length; row++) {
                updateChartSelections(chartmatrix, row)
            }
        })
    }

    // TODO: belongs with explorerchart controller?
    switchChartType = (location, chartType) => {
        console.log('onChartType')
        // TODO set chartconfig codeType
    }

    // ============================================================
    // -------------------[ RENDER METHODS ]---------------------

    // get React components to render
    getCharts = (matrixcolumn, matrixrow) => {

        let charts = matrixcolumn.map((chartconfig:ChartConfig, index) => {

            let chartparms = chartconfig.chartparms

            let settings = { 
                location: chartconfig.matrixlocation,
                onChartType: this.switchChartType,
                chartCode:chartconfig.chartCode,
            }

            return <ExplorerChart
                key = {index}
                chartType = {chartparms.chartType}
                options = { chartparms.options }
                chartEvents = {chartparms.events}
                rows = {chartparms.rows}
                columns = {chartparms.columns}
                // used to create html element id attribute
                graph_id = { "ChartID" + matrixrow + '' + index }
                settings = { settings }
                />
        })

        return charts

    }

    // ===================================================================
    // ---------------------------[ RENDER ]------------------------------ 

    render() {

        let explorer = this

        // -----------[ DASHBOARD SEGMENT]-------------

        let singleslider = (explorer.state.yearscope == 'one')?
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

        // -----------[ DRILLDOWN SEGMENT]-------------

        let drilldownlist = explorer.state.chartmatrix[ChartSeries.DrillDown]

        let drilldowncharts = explorer.getCharts(drilldownlist, ChartSeries.DrillDown)

        let drilldownsegment = 
        <Card initiallyExpanded >

            <CardTitle
                actAsExpander
                showExpandableButton >

                Drill Down

            </CardTitle>

            <CardText expandable >

                <p>
                    Click or tap on any column to drill down.<IconButton tooltip="help"tooltipPosition="top-center" ><FontIcon className="material-icons">help_outline</FontIcon></IconButton>
                </p>
                <div style={{
                    padding: "3px"}}>
                    <span>Viewpoints: </span> 

                    <IconButton 
                        tooltip="Functional" 
                        tooltipPosition="top-center"
                        onTouchTap= {
                            e => {
                                this.switchViewpoint('FUNCTIONAL',ChartSeries.DrillDown)
                            }
                        } 
                        style={
                            { backgroundColor: (this.state.userselections.viewpoint == 'FUNCTIONAL')
                                ?'lightgreen'
                                :'transparent' }
                        }>
                        <FontIcon className="material-icons">directions_walk</FontIcon>
                    </IconButton>

                    <IconButton 
                        tooltip="Structural" 
                        tooltipPosition="top-center" 
                        onTouchTap= {
                            e => {
                                this.switchViewpoint('STRUCTURAL', ChartSeries.DrillDown)
                            }
                        }
                        style={
                            {
                                backgroundColor: (this.state.userselections.viewpoint == 'STRUCTURAL')
                                    ? 'lightgreen'
                                    : 'transparent'
                            }
                        }>
                        >
                        <FontIcon className="material-icons">layers</FontIcon>
                    </IconButton>

                    <span>Facets: </span>

                    <IconButton 
                        tooltip="Expenses" 
                        tooltipPosition="top-center" 
                        onTouchTap= {
                            e => {
                                this.switchDataSeries('BudgetExpenses')
                            }
                        }
                        style={
                            {
                                backgroundColor: (this.state.userselections.dataseries == 'BudgetExpenses')
                                    ? 'lightgreen'
                                    : 'transparent'
                            }
                        }>
                        <FontIcon className="material-icons">attach_money</FontIcon>
                    </IconButton>

                    <IconButton 
                        tooltip="Revenues" 
                        tooltipPosition="top-center" 
                        onTouchTap= {
                            e => {
                                this.switchDataSeries('BudgetRevenues')
                            }
                        }
                        style={
                            {
                                backgroundColor: (this.state.userselections.dataseries == 'BudgetRevenues')
                                    ? 'lightgreen'
                                    : 'transparent'
                            }
                        }>
                        <FontIcon className="material-icons">receipt</FontIcon>
                    </IconButton>

                    <IconButton 
                        tooltip="Staffing"
                        tooltipPosition="top-center" 
                        onTouchTap= {
                            e => {
                                this.switchDataSeries('BudgetStaffing')
                            }
                        }
                        style={
                            {
                                backgroundColor: (this.state.userselections.dataseries == 'BudgetStaffing')
                                    ? 'lightgreen'
                                    : 'transparent'
                            }
                        }>
                        >
                        <FontIcon className="material-icons">people</FontIcon>
                    </IconButton >

                </div>

                <div style={{ whiteSpace: "nowrap" }}>
                    <div style={{ overflow: "scroll" }}>

                        { drilldowncharts }

                        <div style={{ display: "inline-block", width: "500px" }}></div>

                    </div>
                </div>

            </CardText>

        </Card >

        // --------------[ COMPARE SEGMENT]-------------

        let comparelist = explorer.state.chartmatrix[ChartSeries.Compare]

        let comparecharts = explorer.getCharts(comparelist, ChartSeries.Compare)

        let comparesegment = <Card initiallyExpanded = {false}>

            <CardTitle
                actAsExpander
                showExpandableButton >

                Compare

            </CardTitle>

            <CardText expandable >

                <p>Click or tap on any column to drill down</p>
                <div style={{ whiteSpace: "nowrap" }}>

                    <div style={{ overflow: "scroll" }}>

                        { comparecharts }

                        <div style={{ display: "inline-block", width: "500px" }}></div>

                    </div>

                </div>

            </CardText>
            
        </Card>

        // -----------[ DIFFERENCES SEGMENT ]-------------

        let differencessegment = <Card>

            <CardTitle>Show differences</CardTitle>

        </Card>

        // -----------[ CONTEXT SEGMENT ]-------------

        let contextsegment = <Card>

            <CardTitle>Context</CardTitle>

        </Card>

        // -----------[ BUILD SEGMENT ]-------------

        let buildsegment = <Card>

            <CardTitle>Build</CardTitle>

        </Card>

        // -----------[ COMBINE SEGMENTS ]---------------

        return <div>

            { dashboardsegment }

            { drilldownsegment }

            { comparesegment }

            { differencessegment }

            { contextsegment }

            { buildsegment }

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

