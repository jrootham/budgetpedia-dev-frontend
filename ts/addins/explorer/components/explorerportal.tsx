// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// explorerportal.tsx

'use strict'
import * as React from 'react'
var { Component } = React
// var Chart = require('../../../forked/react-google-charts/Chart.js')
import IconButton from 'material-ui/IconButton'
import FontIcon from 'material-ui/FontIcon'
import { Tabs, Tab } from 'material-ui/Tabs'
import {
    ChartParms,
    PortalConfig,
    PortalChartLocation,
} from '../modules/interfaces'

import ExplorerChart from './explorerchart'
import BudgetNode from '../classes/budgetnode'
import BudgetCell from '../classes/budgetcell'

interface ExplorePortalProps {
    callbackid: string | number,
    budgetNode: BudgetNode,
    displayCallbacks: { onChangePortalTab:Function }
    globalStateActions: any,
    declarationData: any,
}

export interface ExplorerPortalActions {
    addCellDeclarations:Function,
    // removeCellDeclarations:Function,
}

// for (let cellindex in budgetNode.cells) {
//     let budgetCell:BudgetCell = budgetNode.cells[cellindex]
//     let chartblocktitle = null
//     if ((budgetCell.nodeDatasetName == 'Categories')) {
//         chartblocktitle = portaltitles.Categories
//     } else {
//         chartblocktitle = portaltitles.Baseline
//     }

//     let chartParms = budgetCell.chartParms

//     let explorer = this
//     let cellCallbacks: CellCallbacks = {
//         onSwitchChartCode: (nodeIndex) => (cellIndex, chartCode) => {
//                 explorer.switchChartCode(nodeIndex, cellIndex, chartCode)
//         },
//     }
//     budgetCell.graph_id = "ChartID" + this.props.callbackid + '-' + nodeindex + '-' + cellindex,
//     budgetCell.cellCallbacks = cellCallbacks
//     budgetCell.cellTitle = "By " + chartblocktitle

// }

class ExplorerPortal extends Component<ExplorePortalProps, any> {

    state = {
        nodeCells:[],
    }

    getState = () => this.state
    getProps = () => this.props

    private _stateActions: ExplorerPortalActions
    private _nodeDisplayCallbacks

    componentWillMount() {
        let { budgetNode } = this.props

        this._stateActions = this.props.globalStateActions
        this._nodeDisplayCallbacks = this.props.displayCallbacks

        budgetNode.getState = this.getState
        budgetNode.getProps = this.getProps
        budgetNode.setState = this.setState.bind(this)
        budgetNode.actions = this._stateActions
        budgetNode.nodeCallbacks = this._nodeDisplayCallbacks

    }

    componentDidMount() {
        console.log('explorer portal componentDidMount')
        let { budgetNode, declarationData } = this.props
        let nodeDeclaration = declarationData.nodesById[budgetNode.uid]        
        // console.log('nodeDeclaration, portalCharts',nodeDeclaration, budgetNode.portalCharts)
        if (nodeDeclaration.cellList == null) {
            // get controlData for cellList
            let cellDeclarationParms = budgetNode.getCellDeclarationParms()
            this._stateActions.addCellDeclarations(budgetNode.uid,cellDeclarationParms)
        }
    }

    // remove obsolete cell objects
    componentWillReceiveProps(nextProps) {
        let { budgetNode, declarationData } = this.props
        let cells = budgetNode.allCells
        let { cellsById } = declarationData
        let newCells = cells.filter(cell =>{
            return !!cellsById[cell.uid]
        })
        if (newCells.length != cells.length) {
            this.setState({
                nodeCells:newCells
            })
        }
    }

    harmonizecount: any = null
    // harmonize branch nodes; add pending node objects, and process state changes
    componentDidUpdate() {
        let { budgetNode, declarationData } = this.props
        let cells = budgetNode.allCells
        let { cellList } = declarationData.nodesById[budgetNode.uid]
        console.log('cells, cellList in componentDidUpdate',cells, cellList)
        // harmonization required if there is a mismatch between cells and cellList
        if ((cells.length != cellList.length) && (this.harmonizecount == null)) {
            this.harmonizecount = cellList.length - cells.length
            let cellParms = []
            let { cellsById } = declarationData
            console.log('cellsById, cellList',cellsById, [...cellList])
            for (let cellid of cellList) {
                cellParms.push(cellsById[cellid])
            }
            console.log('cellParms',cellParms)
            let newcells = budgetNode.setCells(cellParms)
            console.log('cells for setState',newcells)
            if (newcells.length == cellList.length) {
                console.log('harmonization achieved')
                this.harmonizecount = null
            }
            this.setState({
                nodeCells:newcells
            })
        }
    }

    onChangeTab = () => {
        this.props.displayCallbacks.onChangePortalTab() 
    }

    _chartrefs:any[] = []

    getChartTabs = () => {

        // generate array of chart tabs
        let { callbackid, budgetNode } = this.props
        let budgetCells = budgetNode.cells
        console.log('budgetCells in getChartTabs',budgetCells)
        let portalSettings = budgetNode.portalConfig
        // let { chartConfigs } = portalSettings 
        let cellTabs = budgetCells.map(
            (budgetCell:BudgetCell,cellIndex) => {
                //!Hack! if more than one chart the first must be expandable
            let expandable = ((budgetCells.length > 1) && (cellIndex == 0))
            budgetCell.expandable = expandable
            let {cellCallbacks, cellTitle } = budgetCell
            // curry callback, prepare for passing to exportchart
            // cellCallbacks.onSwitchChartCode = cellCallbacks.onSwitchChartCode(callbackid)
            return <Tab style={{fontSize:"12px"}} 
                label={ cellTitle } 
                value={ cellIndex }
                key={ cellIndex }>
                <ExplorerChart
                    budgetCell = { budgetCell }
                    callbackid = { cellIndex }
                />
            </Tab>
        })

        return cellTabs

    }

    getTabObject = (chartTabs) => {
        // this deals with the edge case where switching facets causes current tail
        // chart to change from 2 charts to one by adding a value attr to tabs component
        if (chartTabs.length == 0) {
            return <div style={
                {
                    height:"400px",
                    textAlign:"center", 
                    verticalAlign:"middle", 
                    lineHeight:"400px"
                }}>
            No data...
            </div>
        }
        if (chartTabs.length == 1) {
            return (
                <Tabs
                    value = {0}
                    onChange= { () => {
                        this.onChangeTab()
                    } }>

                    { chartTabs }

                </Tabs>
            )
        } else {
            return (
                <Tabs
                    onChange= { () => {
                        this.onChangeTab()
                    } }>

                    { chartTabs }

                </Tabs>
            )
        }
    }

    render() {

        let chartTabs = this.getChartTabs()

        let tabobject = this.getTabObject(chartTabs)

        let { portalConfig:portalSettings } = this.props.budgetNode

        return <div style={
                { 
                    position:"relative", 
                    display: "inline-block", 
                    padding:"10px",
                    backgroundColor: "Beige",
                    verticalAlign:"top",
                    width:"400px",
                }
            }>
            <div style={
                { 
                    position: "absolute", 
                    top: 0, 
                    left: "10px", 
                    padding: "3px 20px 3px 20px",
                    borderRadius: "6px",
                    border:"1px solid silver",
                    fontSize:"12px",
                    color:"lightgreen",
                    fontWeight:"bold",
                    display: "inline-block", 
                    backgroundColor: "#00bcd4",
                }
            }>{ portalSettings.portalName }</div>
            { tabobject }
        </div>
    }
}

export { ExplorerPortal }

