// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// explorerchart.tsx

/*
    BUG: The rightmost piechart does not have its selected component reselected
        after migrate away from, and return to explorer page.
    TODO: two way arrow icon to signify impose current chart settings on entire branch
*/

// <reference path="../../../typings-custom/chart.d.ts" />
'use strict'
import * as React from 'react'
var { Component } = React
var { Chart } = require('../../../../forked/react-google-charts/Chart.js')
// var { Chart } = require('react-google-charts')
import IconButton from 'material-ui/IconButton'
import FontIcon from 'material-ui/FontIcon'
import SvgIcon from 'material-ui/SvgIcon'
import DropDownMenu from 'material-ui/DropDownMenu'
import MenuItem from 'material-ui/MenuItem'
import {
    ChartParms,
} from '../modules/interfaces'
import BudgetCell from '../classes/cell.class'
import { TimeScope } from '../constants'
import { cellTypes as cellActionTypes } from '../actions'

import * as Utilities from '../modules/utilities'

interface ExplorerCellProps {
    callbackid: string | number,
    budgetCell: BudgetCell,
    declarationData: any,
    globalStateActions: {
        updateCellChartCode:Function,
    },
    showControls: boolean,
}

// interface ExplorerCellState {
//     timescope:
// }

class ExplorerCell extends Component<ExplorerCellProps, any> {

    state = {
        timescope: TimeScope[TimeScope.OneYear],
        deltastate: false,
        netstate:false,
        variancestate:false,
        chartParms: null,
    }

    // for use by BudgetCell instance...
    getState = () => this.state
    getProps = () => this.props

    componentWillMount() {
        let { budgetCell } = this.props
        budgetCell.getProps = this.getProps
        budgetCell.getState = this.getState
        budgetCell.setState = this.setState.bind(this)
        budgetCell.setChartParms()
    }

    componentDidMount() {
        this._previousControlData = this.props.declarationData // initialize
        let { budgetCell } = this.props
        setTimeout(() =>{ // give time for chart to be assigned to budgetCell
            budgetCell.refreshSelection() // for re-creation; last pie chart is missed
        })
    }

    private lastactiongeneration: number = 0

    private waitafteraction:number = 0

    shouldComponentUpdate(nextProps: ExplorerCellProps, nextState) {

        let cellComponent = this

        return Utilities.filterActionsForUpdate(nextProps, cellComponent)

    }

    componentDidUpdate() {

        let budgetCell = this
        budgetCell._respondToGlobalStateChange()
        budgetCell.props.budgetCell.refreshSelection()

    }

    private _previousControlData: any

    // state change manager
    private _respondToGlobalStateChange = () => {
        let previousControlData = this._previousControlData
        let currentControlData = this.props.declarationData
        let { lastAction } = currentControlData
        let returnvalue = true
        if (!cellActionTypes[lastAction.type]) {
            return false
        }
        // only process once
        if (previousControlData && (currentControlData.generation == previousControlData.generation)) {
            return false
        }
        let { budgetCell } = this.props
        let cellDeclaration = this.props.declarationData.cellsById[budgetCell.uid]

        switch (lastAction.type) {
            case cellActionTypes.UPDATE_CELL_CHART_CODE: {

                budgetCell.switchChartCode(
                    cellDeclaration.yearScopeChartConfigs[cellDeclaration.yearScope].explorerChartCode)
                break;
            }
        }
        this._previousControlData = currentControlData
    }

    onChangeChartCode = (explorerChartCode) => {

        let { budgetCell } = this.props
        // budgetCell.switchChartCode(explorerChartCode)

        this.props.globalStateActions.updateCellChartCode(budgetCell.uid,explorerChartCode)
    }

    onChangeTimeCode = explorerTimeCode => {
        this.setState({
            timescope:explorerTimeCode,
        })
    }

    onToggleDelta = () => {
        this.setState({
            deltastate: !this.state.deltastate
        })
    }


    onToggleNet = () => {
        this.setState({
            netstate: !this.state.netstate
        })
    }

    onToggleVariance = () => {
        this.setState({
            variancestate: !this.state.variancestate
        })
    }

    onDataTable = () => {

    }

    onHarmonize = () => {

    }

    render() {
        let { budgetCell } = this.props
        let cellDeclaration = this.props.declarationData.cellsById[budgetCell.uid]
        let yearScope = cellDeclaration.yearScope
        let { chartParms, explorerChartCode, graph_id, viewpointConfigPack } = budgetCell
        // console.log('budgetCell',budgetCell, explorerChartCode)
        let { datasetConfig } = viewpointConfigPack
        let {start: startYear, end: endYear } = datasetConfig.YearsRange
        let yearSpan = endYear - startYear

        let timescopes = 
            <div style = {
                {
                    paddingTop:"10px",
                    borderRight:"1px solid silver", 
                    marginRight:"3px", 
                    position:"relative", 
                    display:"inline-block"
                }
            }>
                <div style={{position:"absolute",top:"0", left:"0",fontSize:"8px"}}>years</div>
                <IconButton
                    tooltip="One year"
                    tooltipPosition="top-center"
                    style={
                        {
                            backgroundColor: (this.state.timescope == TimeScope[TimeScope.OneYear])
                                ? "rgba(144,238,144,0.5)"
                                : "rgba(255,255,255,0.5)",
                            borderRadius:"15%",
                            padding:"0",
                            height:"36px",
                            width:"36px",
                            marginRight:"3px",
                        }
                    }
                    onTouchTap={ e => {
                        this.onChangeTimeCode(TimeScope[TimeScope.OneYear])
                    } }>
                    <SvgIcon style={{height:"36px",width:"36px"}} viewBox = "0 0 36 36" >
                        <rect x="13" y="13" width="10" height="10" />
                    </SvgIcon>
                </IconButton>
                <IconButton
                    disabled = {yearSpan === 0}
                    tooltip="Two years"
                    tooltipPosition="top-center"
                    style={
                        {
                            backgroundColor: (this.state.timescope == TimeScope[TimeScope.TwoYears])
                                ? "rgba(144,238,144,0.5)"
                                : "rgba(255,255,255,0.5)",
                            borderRadius:"15%",
                            padding:"0",
                            height:"36px",
                            width:"36px",
                            marginRight:"3px",
                        }
                    }
                    onTouchTap={ e => {
                        this.onChangeTimeCode(TimeScope[TimeScope.TwoYears])
                    } }
                    >
                    <SvgIcon style={{height:"36px",width:"36px"}}  viewBox = "0 0 36 36" >
                      <rect x="4" y="13" width="10" height="10" />
                      <rect x="22" y="13" width="10" height="10" />
                    </SvgIcon>
                </IconButton>
                <IconButton
                    tooltip="All years"
                    tooltipPosition="top-center"
                    disabled = {yearSpan === 0}
                    style={
                        {
                            backgroundColor: (this.state.timescope == TimeScope[TimeScope.AllYears])
                                ? "rgba(144,238,144,0.5)"
                                : "rgba(255,255,255,0.5)",
                            borderRadius:"15%",
                            padding:"0",
                            height:"36px",
                            width:"36px",
                            marginRight:"3px",
                        }
                    }
                    onTouchTap={ e => {
                        this.onChangeTimeCode(TimeScope[TimeScope.AllYears])
                    } }
                    >
                    <SvgIcon style={{height:"36px",width:"36px"}}  viewBox = "0 0 36 36" >
                        <ellipse cx="6" cy="18" rx="4" ry="4"/>
                        <ellipse cx="18" cy="18" rx="4" ry="4"/>
                        <ellipse cx="30" cy="18" rx="4" ry="4"/>
                    </SvgIcon>
                </IconButton>
            </div>

        // =====================[ options for getchartoptions() ]=======================

        let columnchart = 
            <IconButton
                key = 'columnchart'
                tooltip="Column Chart"
                tooltipPosition="top-center"
                style={
                    {
                        backgroundColor: (explorerChartCode == "ColumnChart")
                            ? "rgba(144,238,144,0.5)"
                            : "transparent",
                        borderRadius: "50%",
                        padding:"0",
                        height:"36px",
                        width:"36px",
                        marginRight:"3px",
                    }
                }
                onTouchTap={ e => {
                    this.onChangeChartCode('ColumnChart')
                } }>
                <FontIcon className="material-icons">insert_chart</FontIcon>
            </IconButton>

        let doublecolumnchart = 
            <IconButton
                key = 'doublecolumnchart'
                tooltip="Column Chart"
                tooltipPosition="top-center"
                style={
                    {
                        backgroundColor: (explorerChartCode == "DoubleColumnChart")
                            ? "rgba(144,238,144,0.5)"
                            : "transparent",
                        borderRadius: "50%",
                        padding:"0",
                        height:"36px",
                        width:"36px",
                        marginRight:"3px",
                    }
                }
                onTouchTap={ e => {
                    this.onChangeChartCode('DoubleColumnChart')
                } }>
                <FontIcon className="material-icons">insert_chart</FontIcon>
            </IconButton>

        let donutchart = 
            <IconButton
                key = 'donutchart'
                tooltip="Donut Pie Chart"
                tooltipPosition="top-center"
                style={
                    {
                        backgroundColor: (explorerChartCode == "DonutChart")
                            ? "rgba(144,238,144,0.5)"
                            : "transparent",
                        borderRadius: "50%",
                        padding:"0",
                        height:"36px",
                        width:"36px",
                        marginRight:"3px",
                    }
                }
                onTouchTap={ e => {
                    this.onChangeChartCode('DonutChart')
                } }>
                <FontIcon className="material-icons">donut_small</FontIcon>
            </IconButton>

        let contextchart = 
            <IconButton
                disabled
                key = 'contextchart'
                tooltip="Context Chart"
                tooltipPosition="top-center"
                style={
                    {
                        backgroundColor: (explorerChartCode == "ContextChart")
                            ? "rgba(144,238,144,0.5)"
                            : "transparent",
                        borderRadius: "50%",
                        padding:"0",
                        height:"36px",
                        width:"36px",
                        marginRight:"3px",
                    }
                }
                onTouchTap={ e => {
                    this.onChangeChartCode('ContextChart')
                } }>
                <FontIcon className="material-icons">view_quilt</FontIcon>
            </IconButton>

        let timelines =
            <IconButton
                key = 'timelines'
                tooltip="Timeline"
                tooltipPosition="top-center"
                style={
                    {
                        backgroundColor: (explorerChartCode == "TimeLine")
                            ? "rgba(144,238,144,0.5)"
                            : "transparent",
                        borderRadius: "50%",
                        padding:"0",
                        height:"36px",
                        width:"36px",
                        marginRight:"3px",
                    }
                }
                disabled
                onTouchTap={ e => {
                    this.onChangeChartCode('Timeline')
                } }>
                <FontIcon className="material-icons">timelines</FontIcon>
            </IconButton>

        let stackedchart = 
            <IconButton
                key = 'stackedchart'
                tooltip="Stacked chart"
                tooltipPosition="top-center"
                style={
                    {
                        backgroundColor: (explorerChartCode == "StackedArea")
                            ? "rgba(144,238,144,0.5)"
                            : "transparent",
                        borderRadius: "50%",
                        padding:"0",
                        height:"36px",
                        width:"36px",
                        marginRight:"3px",
                    }
                }
                disabled
                onTouchTap={ e => {
                    this.onChangeChartCode('StackedArea')
                } }>
                <SvgIcon style={{height:"24px",width:"24px"}} >
                    <path d="M20,6c0-0.587-0.257-1.167-0.75-1.562c-0.863-0.69-2.121-0.551-2.812,0.312l-2.789,3.486L11.2,6.4  c-0.864-0.648-2.087-0.493-2.762,0.351l-4,5C4.144,12.119,4,12.562,4,13v3h16V6z"/>
                    <path d="M20,19H4c-0.552,0-1,0.447-1,1s0.448,1,1,1h16c0.552,0,1-0.447,1-1S20.552,19,20,19z"/>
                </SvgIcon>
            </IconButton>

        let proportionalchart =
            <IconButton
                key = 'propchart'
                tooltip="Proportional chart"
                tooltipPosition="top-center"
                style={
                    {
                        backgroundColor: (explorerChartCode == "Proportional")
                            ? "rgba(144,238,144,0.5)"
                            : "transparent",
                        borderRadius: "50%",
                        padding:"0",
                        height:"36px",
                        width:"36px",
                        marginRight:"3px",
                    }
                }
                disabled
                onTouchTap={ e => {
                    this.onChangeChartCode('Proportional')
                } }>
                <FontIcon className="material-icons">view_stream</FontIcon>
            </IconButton>

        let getchartoptions = () => {

            let chartoptions

            switch (this.state.timescope) {
                case TimeScope[TimeScope.OneYear]:
                    chartoptions = [ columnchart, donutchart, contextchart ]
                    break;
                case TimeScope[TimeScope.TwoYears]:
                    chartoptions = [ doublecolumnchart ]
                    break;
                case TimeScope[TimeScope.AllYears]:
                    chartoptions = [ timelines, stackedchart, proportionalchart ]
                    break;
            }
            

            return <div style = {
                {
                    paddingTop:"10px",
                    borderRight:"1px solid silver", 
                    marginRight:"3px", 
                    position:"relative", 
                    display:"inline-block"
                }
            }>
                <div style={{position:"absolute",top:"0", left:"0",fontSize:"8px"}}>charts</div>

                { chartoptions }

            </div>
        }

        let chartoptions = getchartoptions()

        let deltatoggle = (this.state.timescope != TimeScope[TimeScope.OneYear])?
            <div style = {
                {
                    paddingTop:"10px",
                    borderRight:"1px solid silver", 
                    marginRight:"3px", 
                    position:"relative", 
                    display:"inline-block"
                }
            }>
                <div style={
                    {
                        position:"absolute",
                        top:"0", 
                        left:"0",
                        fontSize:"8px",
                        zIndex:"10"
                    }
                }>year-over-<br /> year</div>
                <IconButton 
                    disabled = {false}
                    tooltip="Year-over-year change"
                    tooltipPosition="top-center"
                    style={
                        {
                            backgroundColor: (this.state.deltastate)
                                ? "rgba(144,238,144,0.5)"
                                : "rgba(255,255,255,0.5)",
                            borderRadius:"15%",
                            padding:"0",
                            height:"36px",
                            width:"36px",
                            marginRight:"3px",
                        }
                    }
                    onTouchTap={ (e) => {
                        this.onToggleDelta()
                    } }>
                    <FontIcon className="material-icons">change_history</FontIcon>
                </IconButton>
            </div> : null

        let nettoggle = (this.state.timescope != TimeScope[TimeScope.OneYear])?
            <div style = {
                {
                    paddingTop:"10px",
                    borderRight:"1px solid silver", 
                    marginRight:"3px", 
                    position:"relative", 
                    display:"inline-block"
                }
            }>
                <div style={{position:"absolute",top:"0", left:"0",fontSize:"8px"}}>net</div>
                <IconButton 
                    disabled
                    tooltip="Net (revenue - expenses)"
                    tooltipPosition="top-center"
                    style={
                        {
                            backgroundColor: (this.state.netstate)
                                ? "rgba(144,238,144,0.5)"
                                : "rgba(255,255,255,0.5)",
                            borderRadius:"15%",
                            padding:"0",
                            height:"36px",
                            width:"36px",
                            marginRight:"3px",
                        }
                    }
                    onTouchTap={ e => {
                        this.onToggleNet()
                    } }>
                    <FontIcon className="material-icons">exposure</FontIcon>
                </IconButton>
            </div> : null

        let variancetoggle = (this.state.timescope != TimeScope[TimeScope.OneYear])?
            <div style = {
                {
                    paddingTop:"10px",
                    borderRight:"1px solid silver", 
                    marginRight:"3px", 
                    position:"relative", 
                    display:"inline-block"
                }
            }>
                <div style={{position:"absolute",top:"0", left:"0",fontSize:"8px"}}>variance</div>
                <IconButton 
                    disabled
                    tooltip="Variance (actual - budget)"
                    tooltipPosition="top-center"
                    style={
                        {
                            backgroundColor: (this.state.variancestate)
                                ? "rgba(144,238,144,0.5)"
                                : "rgba(255,255,255,0.5)",
                            borderRadius:"15%",
                            padding:"0",
                            height:"36px",
                            width:"36px",
                            marginRight:"3px",
                        }
                    }
                    onTouchTap={ e => {
                        this.onToggleVariance()
                    } }>
                    <FontIcon className="material-icons">exposure</FontIcon>
                </IconButton>
            </div> : null

        // ----------------------[ options for below the chart ]---------------------------

        let datatable = 
            <div style = {
                {
                    paddingTop:"10px",
                    borderLeft:"1px solid silver", 
                    marginRight:"3px", 
                    position:"relative", 
                    display:"inline-block",
                }
            }>
                <div style={{paddingLeft: '3px', position:"absolute",top:"0", left:"0",fontSize:"8px"}}>data</div>
                <IconButton 
                    disabled
                    tooltip="Data Table"
                    tooltipPosition="top-center"
                    style={
                        {
                            backgroundColor: (explorerChartCode == "DataTable")
                                ? "rgba(144,238,144,0.5)"
                                : "transparent",
                            borderRadius: "50%",
                            padding:"0",
                            height:"36px",
                            width:"36px",
                            marginRight:"3px",
                        }
                    }
                    onTouchTap={ e => {
                        this.onDataTable()
                    } }>
                    <FontIcon className="material-icons">view_list</FontIcon>
                </IconButton>
            </div>

        let harmonizeoptions = 
            <div style = {
                {
                    paddingTop:"10px",
                    borderLeft:"1px solid silver", 
                    borderRight:"1px solid silver", 
                    paddingRight:"3px", 
                    position:"relative", 
                    display:"inline-block",
                }
            }>
                <div style={{paddingLeft: '3px', position:"absolute",top:"0", left:"0",fontSize:"8px"}}>harmonize</div>
                <IconButton 
                    disabled
                    tooltip="Harmonize settings for row"
                    tooltipPosition="top-center"
                    style={
                        {
                            borderRadius: "50%",
                            padding:"0",
                            height:"36px",
                            width:"36px",
                            marginRight:"3px",
                        }
                    }
                    onTouchTap={ e => {
                        this.onHarmonize()
                    } }>
                    <FontIcon className="material-icons">swap_horiz</FontIcon>
                </IconButton>
            </div>

        let socialoptions = 
            <div style=
                {
                    { 
                        paddingTop:"10px",
                        display:"inline-block",
                        position:"relative",
                    }
                }>
                <div style={{paddingLeft:"3px",position:"absolute",top:"0", left:"0",fontSize:"8px"}}>social</div>
                <IconButton tooltip="Shared stories"
                    tooltipPosition="top-center"
                    style = {
                        {
                            padding:"0",
                            height:"36px",
                            width:"36px",
                            marginRight:"3px",                                
                        }
                    }
                    disabled>
                    <FontIcon className="material-icons">share</FontIcon>
                </IconButton>
                <IconButton tooltip="Calls to action"
                    tooltipPosition="top-center"
                    style = {
                        {
                            padding:"0",
                            height:"36px",
                            width:"36px",
                            marginRight:"3px",
                            marginLeft:"3px",                             
                        }
                    }
                    disabled>
                    <FontIcon className="material-icons">announcement</FontIcon>
                </IconButton>
            </div>

        let informationoptions = 
            <div style=
                {
                    { 
                        display:"inline-block",
                        paddingTop:"10px",
                        borderLeft:"1px solid silver",
                        borderRight:"1px solid silver",
                        position:"relative",
                    }
                }>
                <div style={{paddingLeft:"3px",position:"absolute",top:"0", left:"0",fontSize:"8px"}}>information</div>
                <IconButton tooltip="Information"
                    tooltipPosition="top-center"
                    style = {
                        {
                            padding:"0",
                            height:"36px",
                            width:"36px",
                            marginRight:"3px",                                
                        }
                    }
                    disabled>
                    <FontIcon className="material-icons">info_outline</FontIcon>
                </IconButton>
                <IconButton tooltip="Technical notes"
                    tooltipPosition="top-center"
                    style = {
                        {
                            padding:"0",
                            height:"36px",
                            width:"36px",
                            marginRight:"3px",
                            marginLeft:"3px",                             
                        }
                    }
                    disabled>
                    <FontIcon className="material-icons">note</FontIcon>
                </IconButton>
            </div>

        // ------------------------------[ the chart itself ]-----------------------------

        let chart =  (chartParms)?
            <Chart
                ref = {node => {
                    budgetCell.chartComponent = node
                }} 
                chartType = { chartParms.chartType }
                options = { chartParms.options }
                chartEvents = { chartParms.events }
                rows = { chartParms.rows }
                columns = { chartParms.columns }
                // used to create and cache html element id attribute
                graph_id = { graph_id }
                />
            :<div> waiting for chart data... </div>

        let drilldownprompt = 
            <div style={{
                position:"absolute",
                bottom:"10px",
                left:"40px",
                fontSize:"9px",
                fontStyle:"italic",
            }}>
            </div>

        // ----------------------[ year selections ]---------------------------------

        let yearsoptions = () => {
            let years = []
            for (let year = startYear; year <= endYear; year++ ) {
                let yearitem = 
                <MenuItem key = {year } value={year} primaryText={year.toString()}/>
                years.push(yearitem)
            }
            return years
        } 

        let yearselection = 
            <div style={{paddingBottom:"3px"}}>
                <span style={{ fontStyle: "italic" }}>Select {
                    (yearScope == TimeScope[TimeScope.OneYear])? 'year': 'years'}: </span>
                    
                {(yearScope != TimeScope[TimeScope.OneYear])?(<DropDownMenu
                    value={startYear}
                    style={{
                    }}
                    onChange={ e => {} }
                    >

                    { yearsoptions() }

                </DropDownMenu>):null}

                {
                    (yearScope == TimeScope[TimeScope.OneYear])?null
                    : (
                        (yearScope == TimeScope[TimeScope.TwoYears])? ':'
                        :'-'
                    )
                }

                <DropDownMenu
                    value={endYear}
                    style={{
                    }}
                    onChange={ e => {} }
                    >

                    { yearsoptions() }

                </DropDownMenu>
            </div>

        return <div>

            {(this.props.showControls)?<div style={{ padding: "3px" }}>

                { timescopes }

                { chartoptions }

                { deltatoggle }

                { nettoggle }

                { variancetoggle }

            </div>:null}

            <div style={{position:"relative"}}>

                { chart }

                { drilldownprompt }

            </div>

            <div style={{ padding: "3px", textAlign:"center" }}>

                {(this.props.showControls)?
                    yearselection:null}

                { informationoptions }

                { socialoptions }

                { datatable }

                { harmonizeoptions }

            </div>
            
        </div>
    }
}

export default ExplorerCell