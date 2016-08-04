// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// explorerchart.tsx
// 
// <reference path="../../../typings-custom/chart.d.ts" />
'use strict'
import * as React from 'react'
var { Component } = React
var { Chart } = require('../../../../forked/react-google-charts/Chart.js')
// var { Chart } = require('react-google-charts')
import IconButton from 'material-ui/IconButton'
import FontIcon from 'material-ui/FontIcon'
import SvgIcon from 'material-ui/SvgIcon'
import {
    ChartParms,
} from '../modules/interfaces'
import BudgetCell from '../classes/cell.class'

interface ExplorerCellProps {
    callbackid: string | number,
    budgetCell: BudgetCell,
    declarationData: any,
    globalStateActions: {
        updateCellChartCode:Function,
    }
}

class ExplorerCell extends Component<ExplorerCellProps, any> {

    onChangeChartCode = (explorerChartCode) => {

        // console.log('onChangeChartCode',explorerChartCode, this.props)
        let { budgetCell } = this.props
        budgetCell.switchChartCode(explorerChartCode)
         // console.log('budgetCell in explorercell on ChangeChartCode', budgetCell)
        this.props.globalStateActions.updateCellChartCode(budgetCell.uid,explorerChartCode)
    }

    onChangeTimeCode = explorerTimeCode => {

    }

    shouldComponentUpdate(nextProps: ExplorerCellProps, nextState) {
        let { lastAction } = nextProps.declarationData
        // console.log('lastAction in cell',lastAction)
        let { celluid } = lastAction
        if (celluid) {
            let retval = (nextProps.budgetCell.uid == celluid)? true: false
            // console.log('cell should update',retval, celluid, nextProps.budgetCell.uid, lastAction.type)
            return retval
        }
        return true
    }

    componentDidUpdate() {
        // setTimeout(()=>{
            let { budgetCell }:{budgetCell:BudgetCell} = this.props
            // console.log('will update with setSelection', budgetCell, budgetCell.chart.getSelection())
            if (budgetCell.chartSelection) {
                // it turns out that "PieChart" needs column set to null
                // for setSelection to work
                if (budgetCell.chartSelection[0] && budgetCell.chart && budgetCell.chart.getSelection().length == 0) {
                    if (budgetCell.googleChartType == "PieChart" ) {
                        budgetCell.chartSelection[0].column = null
                    } else {
                        // we set it back to original (presumed) for consistency
                        budgetCell.chartSelection[0].column = 1
                    }
                    budgetCell.chart.setSelection(budgetCell.chartSelection)
                    // console.log('have invoked setSelection from componentDidUpdate', budgetCell)
                }
            }        
        // })
    }

    render() {

        // console.log('rendering ExplorerCell', this.props.budgetCell.uid)

        let { chartParms, explorerChartCode, expandable, graph_id } = this.props.budgetCell
        if (!expandable) {
            chartParms.options['backgroundColor'] = '#E4E4E4'
        }

        let chart =  <Chart
                ref = {node => {this.props.budgetCell.chartComponent = node}} 
                chartType = { chartParms.chartType }
                options = { chartParms.options }
                chartEvents = { chartParms.events }
                rows = { chartParms.rows }
                columns = { chartParms.columns }
                // used to create and cache html element id attribute
                graph_id = { graph_id }
                />

        let explorerTimeCode = 'OneYear'

        return <div>
            <div style={{ padding: "3px" }}>
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
                                backgroundColor: (explorerTimeCode == "OneYear")
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
                            this.onChangeTimeCode('OneYear')
                        } }>
                        <SvgIcon style={{height:"36px",width:"36px"}} viewBox = "0 0 36 36" >
                            <rect x="13" y="13" width="10" height="10" />
                        </SvgIcon>
                    </IconButton>
                    <IconButton
                        tooltip="Two years"
                        tooltipPosition="top-center"
                        style={
                            {
                                backgroundColor: (explorerTimeCode == "Two years")
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
                            this.onChangeTimeCode('TwoYears')
                        } }
                        disabled>
                        <SvgIcon style={{height:"36px",width:"36px"}}  viewBox = "0 0 36 36" >
                          <rect x="4" y="13" width="10" height="10" />
                          <rect x="22" y="13" width="10" height="10" />
                        </SvgIcon>
                    </IconButton>
                    <IconButton
                        tooltip="All years"
                        tooltipPosition="top-center"
                        style={
                            {
                                backgroundColor: (explorerTimeCode == "AllYears")
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
                            this.onChangeTimeCode('AllYears')
                        } }
                        disabled>
                        <SvgIcon style={{height:"36px",width:"36px"}}  viewBox = "0 0 36 36" >
                            <ellipse cx="6" cy="18" rx="4" ry="4"/>
                            <ellipse cx="18" cy="18" rx="4" ry="4"/>
                            <ellipse cx="30" cy="18" rx="4" ry="4"/>
                        </SvgIcon>
                    </IconButton>
                </div>
                <div style = {
                    {
                        paddingTop:"10px",
                        borderRight:"1px solid silver", 
                        marginRight:"3px", 
                        position:"relative", 
                        display:"inline-block"
                    }
                }>
                    <div style={{position:"absolute",top:"0", left:"0",fontSize:"8px"}}>charts</div>
                    <IconButton
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
                    <IconButton
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
                            this.onChangeChartCode('DataTable')
                        } }>
                        <FontIcon className="material-icons">view_list</FontIcon>
                    </IconButton>
                </div>
            </div>

            { chart }

            <div style={{
                position:"absolute",
                bottom:"10px",
                left:"40px",
                fontSize:"9px",
                fontStyle:"italic",
            }}>
               {expandable?'drill down':'no drill down'}
            </div>
            <div style={{ padding: "3px" }}>
                <div style=
                    {
                        { 
                            float:"right", 
                            padding: "3px",
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
                <div style=
                    {
                        { 
                            float:"right", 
                            padding: "3px",
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
            </div>
        </div>
    }
}

                // <IconButton
                //     tooltip="Timeline"
                //     tooltipPosition="top-center"
                //     style={
                //         {
                //             backgroundColor: (explorerChartCode == "TimeLine")
                //                 ? "rgba(144,238,144,0.5)"
                //                 : "transparent",
                //             borderRadius: "50%"
                //         }
                //     }
                //     disabled
                //     onTouchTap={ e => {
                //         this.onChangeChartCode('Timeline')
                //     } }>
                //     <FontIcon className="material-icons">timeline</FontIcon>
                // </IconButton>
                // <IconButton
                //     tooltip="Stacked chart"
                //     tooltipPosition="top-center"
                //     style={
                //         {
                //             backgroundColor: (explorerChartCode == "StackedArea")
                //                 ? "rgba(144,238,144,0.5)"
                //                 : "transparent",
                //             borderRadius: "50%"
                //         }
                //     }
                //     disabled
                //     onTouchTap={ e => {
                //         this.onChangeChartCode('StackedArea')
                //     } }>
                //     <SvgIcon style={{height:"24px",width:"24px"}} >
                //         <path d="M20,6c0-0.587-0.257-1.167-0.75-1.562c-0.863-0.69-2.121-0.551-2.812,0.312l-2.789,3.486L11.2,6.4  c-0.864-0.648-2.087-0.493-2.762,0.351l-4,5C4.144,12.119,4,12.562,4,13v3h16V6z"/>
                //         <path d="M20,19H4c-0.552,0-1,0.447-1,1s0.448,1,1,1h16c0.552,0,1-0.447,1-1S20.552,19,20,19z"/>
                //     </SvgIcon>
                // </IconButton>


export default ExplorerCell