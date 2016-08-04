// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// explorerportal.tsx

/*
    TODO: include output checkbox per node for printing prep
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
import { cellTypes } from '../actions'

interface ExplorerNodeProps {
    callbackid: string | number,
    budgetNode: BudgetNode,
    displayCallbacks: { 
        // onChangePortalTab:Function,
        // updateChartSelections:Function, 
    }
    globalStateActions: any,
    declarationData: any,
}

export interface ExporerNodeActions {
    addCellDeclarations:Function,
    updateCellsDataseriesName: Function,
    updateCellChartCode: Function,
    updateCellChartSelection: Function,
}

class ExporerNode extends Component<ExplorerNodeProps, {nodeCells: BudgetCell[]}> {

    state = {
        nodeCells:[],
    }

    getState = () => this.state
    getProps = () => this.props

    private _stateActions: ExporerNodeActions
    private _nodeDisplayCallbacks

    componentWillMount() {
        let { budgetNode } = this.props

        this._stateActions = Object.assign({},this.props.globalStateActions)
        this._nodeDisplayCallbacks = this.props.displayCallbacks

        budgetNode.getState = this.getState
        budgetNode.getProps = this.getProps
        budgetNode.setState = this.setState.bind(this)
        budgetNode.actions = this._stateActions
        budgetNode.nodeCallbacks = this._nodeDisplayCallbacks

    }

    componentDidMount() {
        let { budgetNode, declarationData } = this.props
        let nodeDeclaration = declarationData.nodesById[budgetNode.uid]        

        if (nodeDeclaration.cellList == null) {
            // console.log('creating new cell declarations', budgetNode)
            // get controlData for cellList
            let cellDeclarationParms = budgetNode.getCellDeclarationParms()
            this._stateActions.addCellDeclarations(budgetNode.uid,cellDeclarationParms)
        } else {
            // console.log('harmonizing cells', budgetNode)
            this._harmonizeCells()
        }
    }

    // TODO: generate action to update cell nodeDataseriesName
    // remove obsolete cell objects; update cell list if needed
    componentWillReceiveProps(nextProps) {
        let { budgetNode, declarationData } = nextProps // this.props
        if (budgetNode.updated) {
            this.setState({
                nodeCells:budgetNode.newCells
            })
            let updatedCells = budgetNode.newCells
            let cellslist = []
            for (let cell of cellslist) {
                cellslist.push(
                    {
                        celluid: cell.uid, 
                        nodeDataseriesName: cell.nodeDataseriesName 
                    }
                )
            }
            // console.log('sending updateCellsDataseriesName', budgetNode)
            this._stateActions.updateCellsDataseriesName(cellslist)
            budgetNode.newCells = null
            budgetNode.updated = false
        } else {
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
    }

/*  
    return false for redundant updates
    this reduces updates by about half, therefore 
    reducing update delay caused by cascading events
*/    
    shouldComponentUpdate(nextProps: ExplorerNodeProps, nextState) {
        let { lastAction } = nextProps.declarationData
        // console.log('lastAction',lastAction)
        let { nodeuid } = lastAction
        if (nodeuid) {
            let retval = (nextProps.budgetNode.uid == nodeuid)? true: false
            // console.log('node',retval, nodeuid, nextProps.budgetNode.uid, lastAction.type)
            return retval
        }
        return true
    }

    componentDidUpdate() {
        if (!this._harmonizeCells()) {
            this._controlGlobalStateChange()
        }
        setTimeout(()=>{
            this.props.budgetNode.new = false
        })
    }

    // _previousControlData is not in a closure to allow for initializing in componentDidMount
    private _previousControlData: any

    // state change machine
    private _controlGlobalStateChange = () => {
        let previousControlData = this._previousControlData
        let currentControlData = this.props.declarationData
        let { lastAction } = currentControlData
        let returnvalue = true
        if (!cellTypes[lastAction.type]) {
            return false
        }
        // the generation counter could be the same if render is being triggered
        // solely by a local state change, which we want to ignore here
        if (previousControlData && (currentControlData.generation == previousControlData.generation)) {
            return false
        }

        switch (lastAction.type) {
            case cellTypes.UPDATE_CELL_SELECTION: {
                this._processUpdateCellSelection()
                break
            }
            case cellTypes.CHANGE_FACET: {
                // this._processChangeFacet()
                break
            }
            default:
                returnvalue = false
        }
        this._previousControlData = currentControlData
        return returnvalue
    }

    private _processUpdateCellSelection = () => {
        // let nodeCells = [ ...this.state.nodeCells ]
        // nodeCells.map((budgetCell)=>{
        //     budgetCell.chartSelection = this.props.declarationData.cellsById[budgetCell.uid].chartSelection
        // })
        // this.setState({
        //     nodeCells,
        // })
    }

    private _processChangeFacet = () => {
        let { budgetNode } = this.props
        console.log('processing node change facet')
        // let cellDeclarationParms = budgetNode.getCellDeclarationParms()
        // this._stateActions.addCellDeclarations(budgetNode.uid,cellDeclarationParms)
    }

    harmonizecount: any = null
    // harmonize branch nodes; add pending node objects, and process state changes
    private _harmonizeCells = () => {
        let returnvalue = false
        let { budgetNode, declarationData } = this.props
        let cells = budgetNode.allCells
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
                <ExplorerCell
                    declarationData = { this.props.declarationData }
                    callbackid = { cellIndex }
                    budgetCell = { budgetCell }
                    globalStateActions = { {updateCellChartCode: this.props.globalStateActions.updateCellChartCode } }
                />
            </Tab>
        })

        return cellTabs

    }

    getTabObject = (chartTabs) => {
        // this deals with the edge case where switching facets causes current tail
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

        // console.log('rendering ExplorerNode', this.props.budgetNode)

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

export { ExporerNode }

