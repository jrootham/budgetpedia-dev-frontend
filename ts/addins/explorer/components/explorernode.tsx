// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// explorerportal.tsx

/*
    TODO: include output checkbox per node for printing prep
    - with clean start, switching to second tab causes 'jump' to top of page
       ... but not clicking first tab after selecting second
*/

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

import ExplorerCell from './explorercell'
import BudgetNode from '../classes/node.class'
import BudgetCell from '../classes/cell.class'
import { nodeTypes } from '../actions'

interface ExplorerNodeProps {
    callbackid: string | number,
    budgetNode: BudgetNode,
    globalStateActions: any,
    declarationData: any,
    showControls: boolean,
    dataGenerationCounter: number,
}

export interface ExporerNodeActions {
    addCellDeclarations:Function,
    updateCellsDataseriesName: Function,
    updateCellChartCode: Function,
    updateCellChartSelection: Function,
    normalizeCellYearDependencies: Function,
}

class ExplorerNode extends Component<ExplorerNodeProps, {nodeCells: BudgetCell[]}> {

    state = {
        nodeCells:[],
    }

    waitforaction:number = 0

    private oldDataGenerationCounter: number = null

    // for BudgetNode instance...
    getState = () => this.state
    getProps = () => this.props

    private _stateActions: ExporerNodeActions

    componentWillMount() {
        let { budgetNode } = this.props

        this._stateActions = Object.assign({},this.props.globalStateActions)

        budgetNode.getState = this.getState
        budgetNode.getProps = this.getProps
        budgetNode.setState = this.setState.bind(this)
        budgetNode.actions = this._stateActions

    }

    componentDidMount() {
        let { budgetNode, declarationData } = this.props
        let nodeDeclaration = declarationData.nodesById[budgetNode.uid]        

        if (nodeDeclaration.cellList == null) {

            // get controlData for cellList
            // this.waitforaction++
            let cellDeclarationParms = budgetNode.getCellDeclarationParms()
            this._stateActions.addCellDeclarations(budgetNode.uid,cellDeclarationParms)
        // } else {

        //     this._harmonizeCells()

        }
    }

    // TODO: generate action to update cell nodeDataseriesName
    // remove obsolete cell objects; update cell list if needed
    componentWillReceiveProps(nextProps) {
    }

    updateCellsFromDeclarations = () => {
        let { budgetNode, declarationData }:{budgetNode:BudgetNode, declarationData:any} = this.props // this.props
        if (budgetNode.updated) {
            this.setState({
                nodeCells:budgetNode.newCells
            })
            let updatedCells = budgetNode.newCells
            let cellslist = []
            for (let cell of updatedCells) {
                cellslist.push(
                    {
                        celluid: cell.uid, 
                        nodeDataseriesName: cell.nodeDataseriesName 
                    }
                )
            }
            // this._stateActions.updateCellsDataseriesName(cellslist)
            budgetNode.newCells = null
            budgetNode.updated = false
        } else {
            let cells = budgetNode.cells
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

    }

/*  
    return false for redundant updates
    this reduces updates by about half, therefore 
    reducing update delay caused by cascading events
*/    
    private lastgenerationcounter: number = 0

    shouldComponentUpdate(nextProps: ExplorerNodeProps, nextState) {
        if (this.waitforaction) {
            this.waitforaction--
            return false
        }
        let { lastAction } = nextProps.declarationData
        
        let { nodeuid } = lastAction
        if (nodeuid) {
            let retval = (nextProps.budgetNode.uid == nodeuid)? true: false

            return retval
        }
        return true
    }

    componentDidUpdate() {
        this._harmonizeCells(this.props)
        let { dataGenerationCounter } = this.props
        let { oldDataGenerationCounter } = this
        // console.log('datagenerationcounter comparison', oldDataGenerationCounter, dataGenerationCounter)
        if ( oldDataGenerationCounter === null || (dataGenerationCounter > oldDataGenerationCounter)) {
            this.oldDataGenerationCounter = dataGenerationCounter
            // normalize cell settings to year dependency constraints
            this._normalizeCells()
        }        
        // if (!this._harmonizeCells()) {
            this._respondToGlobalStateChange()
        // }
        if ( this.props.budgetNode.new ) {
            // setTimeout(()=>{
                this.props.budgetNode.new = false
            // })
        } 
        this.updateCellsFromDeclarations()
    }

    // state change machine
    private _respondToGlobalStateChange = () => {

    }

    harmonizecount: any = null
    // harmonize branch nodes; add pending node objects, and process state changes
    private _harmonizeCells = (props) => {
        let returnvalue = false
        let { budgetNode, declarationData } = props
        let cells = budgetNode.cells
        let { cellList } = declarationData.nodesById[budgetNode.uid]
        // harmonization required if there is a mismatch between cells and cellList
        if ((cells.length != cellList.length) && (this.harmonizecount == null)) {
            this.harmonizecount = cellList.length - cells.length
            let cellParms = []
            let { cellsById } = declarationData
            for (let cellid of cellList) {
                cellParms.push(cellsById[cellid])
            }
            // this.props.restoreCells()
            let newcells = budgetNode.setCells(cellParms)
            if (newcells.length == cellList.length) {
                this.harmonizecount = null
            }
            returnvalue = true
            this.setState({
                nodeCells:newcells
            })
        }
        return returnvalue
    }

    private _normalizeCells = () => {

        let { budgetNode } = this.props
        let nodeDeclaration = this.props.declarationData.nodesById[budgetNode.uid] 

        // console.log('budgetNode in normalizeCells', budgetNode)       

        let cellList = nodeDeclaration.cellList
        let yearsRange = budgetNode.viewpointConfigPack.datasetConfig.YearsRange

        // console.log('normalizing cells',budgetNode, nodeDeclaration, budgetNode.uid,cellList,yearsRange)

        this.waitforaction++
        this._stateActions.normalizeCellYearDependencies(budgetNode.uid, cellList, yearsRange)

    }

    onChangeTab = (tabref) => {
        // window.nodeUpdateControl.nodeuid = this.props.budgetNode.uid
        this.props.globalStateActions.changeTab(this.props.budgetNode.uid,tabref)
        // this.props.displayCallbacks.onChangePortalTab() 
    }

    _chartrefs:any[] = []

    getChartTabs = () => {

        // generate array of chart tabs
        let { callbackid, budgetNode } = this.props
        let budgetCells = budgetNode.cells
        // console.log('budgetCells in getChartTabs', budgetCells, budgetNode)
        let portalSettings = budgetNode.portalConfig
        // let { chartConfigs } = portalSettings 
        let cellTabs = budgetCells.map(
            (budgetCell:BudgetCell,cellIndex) => {
                //!Hack! if more than one chart the first must be expandable
            let expandable = ((budgetCells.length > 1) && (cellIndex == 0))
            budgetCell.expandable = expandable
            let { cellTitle } = budgetCell
            return <Tab style={{fontSize:"12px"}} 
                label={ cellTitle } 
                value={ cellIndex }
                key={ cellIndex }>
                <ExplorerCell
                    declarationData = { this.props.declarationData }
                    callbackid = { cellIndex }
                    budgetCell = { budgetCell }
                    globalStateActions = { {updateCellChartCode: this.props.globalStateActions.updateCellChartCode } }
                    showControls = {this.props.showControls}
                />
            </Tab>
        })

        return cellTabs

    }

    getTabObject = chartTabs => {
        // this deals with the edge case where switching aspects causes current tail
        // chart to change from 2 charts to one by adding a value attr to tabs component
        let tabSelection = this.props.declarationData.nodesById[this.props.budgetNode.uid].cellIndex
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
        return (
            <Tabs
                value = {tabSelection}
                onChange= { (tabref) => {
                    this.onChangeTab(tabref)
                } }>

                { chartTabs }

            </Tabs>
        )
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
                    borderRight:"1px solid silver",
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
            }>{ (this.props.budgetNode.nodeIndex + 1) + ". " + portalSettings.portalName }</div>

            { tabobject }

        </div>
    }
}

export { ExplorerNode }

