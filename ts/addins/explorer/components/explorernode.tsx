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
import { nodeTypes as nodeActionTypes} from '../actions'

import { MappedNodeActions as ExplorerNodeActions } from '../explorer'

import * as Utilities from '../modules/utilities'

interface ExplorerNodeProps {
    callbackid: string | number,
    budgetNode: BudgetNode,
    globalStateActions: any,
    declarationData: any,
    showControls: boolean,
    dataGenerationCounter: number,
}

// export interface ExporerNodeActions {
//     addCellDeclarations:Function,
//     // updateCellsDataseriesName: Function,
//     updateCellChartCode: Function,
//     updateCellChartSelection: Function,
//     normalizeCellYearDependencies: Function,
//     updateNode: Function,
// }

class ExplorerNode extends Component<ExplorerNodeProps, {nodeCells: BudgetCell[]}> {

    state = {
        nodeCells:[],
    }

    waitafteraction:number = 0

    // for BudgetNode instance...
    getState = () => this.state
    getProps = () => this.props

    private _stateActions: ExplorerNodeActions

    componentWillMount() {
        let { budgetNode, declarationData } = this.props

        this._stateActions = Object.assign({},this.props.globalStateActions)

        budgetNode.getState = this.getState
        budgetNode.getProps = this.getProps
        budgetNode.setState = this.setState.bind(this)
        budgetNode.actions = this._stateActions

        let nodeDeclaration = declarationData.nodesById[budgetNode.uid]        

        if (nodeDeclaration.cellList == null) {
            // console.log('declaring new cells')
            // get controlData for cellList
            let cellDeclarationParms = budgetNode.getCellDeclarationParms()
            this._stateActions.addCellDeclarations(budgetNode.uid,cellDeclarationParms)

        } else {
            // console.log('updating node from declarations in componentWillMount', budgetNode.uid)
            this._stateActions.updateNode(budgetNode.uid) // trigger update -> render
            // this.updateCellsFromDeclarations(this.props)
        }

    }

    private oldDataGenerationCounter: number = null

    // remove obsolete cell objects; update cell list if needed
    componentWillReceiveProps(nextProps) {
        let { dataGenerationCounter, budgetNode } = nextProps
        let { oldDataGenerationCounter } = this
        let lastAction = nextProps.declarationData.lastAction
        // console.log('lastAction from node componentWillReceiveProps', lastAction.type, lastAction.nodeuid, budgetNode.uid)

        if ( oldDataGenerationCounter === null || (dataGenerationCounter > oldDataGenerationCounter)) {
            // console.log('normalizing cellDeclarations', budgetNode.uid)
            this.oldDataGenerationCounter = dataGenerationCounter
            // normalize cell settings to year dependency constraints
            // console.log('normalizeCellDeclarations',dataGenerationCounter)
            this._normalizeCellDeclarations(nextProps)

        } else {

            // console.log('updating NODE cells from declarations in componentWillReceiveProps', budgetNode.uid)
            this.updateCellsFromDeclarations(nextProps)
            this._harmonizeCellsToState(nextProps)
            if ( budgetNode.new ) {
                budgetNode.new = false
            }

        }
    }


/*  
    return false for redundant updates
    this reduces updates by about half, therefore 
    reducing update delay caused by cascading events
*/    
    private lastactiongeneration: number = 0
    
    shouldComponentUpdate(nextProps: ExplorerNodeProps) {

        let nodeComponent = this

        return Utilities.filterActionsForUpdate(nextProps, nodeComponent)

    }

    componentDidUpdate() {

        let budgetNode = this
        budgetNode._respondToGlobalStateChange()

    }

    private _previousControlData: any

    // state change manager
    private _respondToGlobalStateChange = () => {
        let previousControlData = this._previousControlData
        let currentControlData = this.props.declarationData
        let { lastAction } = currentControlData
        let returnvalue = true
        if (!nodeActionTypes[lastAction.type]) {
            return false
        }
        // only process once
        if (previousControlData && (currentControlData.generation == previousControlData.generation)) {
            return false
        }
        let { budgetNode } = this.props
        let nodeDeclaration = this.props.declarationData.nodesById[budgetNode.uid]

        switch (lastAction.type) {
            case nodeActionTypes.NORMALIZE_CELL_YEAR_DEPENDENCIES: {
                // console.log('node responding to year dependencies', currentControlData, previousControlData , this.state.nodeCells)
                let cells = this.state.nodeCells
                if (cells.length == 0) break
                let testuid = cells[0].uid
                let testCurrentYearSelections = currentControlData.cellsById[testuid].yearSelections
                let testPreviousYearSelections = previousControlData.cellsById[testuid].yearSelections
                // console.log('tests', testCurrentYearSelections, testPreviousYearSelections)
                if (testCurrentYearSelections.leftYear !== testPreviousYearSelections.leftYear ||
                    testCurrentYearSelections.rightYear !== testPreviousYearSelections.rightYear) { 
                    // console.log('resetting cells')
                    budgetNode.resetCells()
                    this.forceUpdate()
                }
                break
            }
        }
        this._previousControlData = currentControlData
    }


    updateCellsFromDeclarations = (props) => {
        let { budgetNode, declarationData }:{budgetNode:BudgetNode, declarationData:any} = props // this.props
        if (budgetNode.updated) {
            // console.log('updated cells being saved - setState')
            this.setState({
                nodeCells:budgetNode.newCells
            })
            budgetNode.newCells = null
            budgetNode.updated = false
        }

    }

    // // state change machine
    // private _respondToGlobalStateChange = () => {

    // }

    harmonizecount: any = null
    // harmonize branch nodes; add pending node objects, and process state changes
    private _harmonizeCellsToState = (props) => {
        let returnvalue = false
        let { budgetNode, declarationData } = props
        let cells = budgetNode.cells
        let { cellList } = declarationData.nodesById[budgetNode.uid]

        // remove any deleted cells
        let { cellsById } = declarationData
        let newCells = cells.filter(cell =>{
            return !!cellsById[cell.uid]
        })
        if (newCells.length != cells.length) {
            this.setState({
                nodeCells:newCells
            })
            cells = budgetNode.cells
        }
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

    private _normalizeCellDeclarations = (props) => {

        let { budgetNode } = props
        let nodeDeclaration = props.declarationData.nodesById[budgetNode.uid] 

        // console.log('budgetNode in normalizeCells', budgetNode.uid)       

        let cellList = nodeDeclaration.cellList
        let yearsRange = budgetNode.viewpointConfigPack.datasetConfig.YearsRange

        // console.log('normalizing cells',budgetNode, nodeDeclaration, budgetNode.uid,cellList,yearsRange)

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
            let { cellTitle } = budgetCell
            return <Tab style={{fontSize:"12px"}} 
                label={ cellTitle } 
                value={ cellIndex }
                key={ cellIndex }>
                <ExplorerCell
                    declarationData = { this.props.declarationData }
                    callbackid = { cellIndex }
                    budgetCell = { budgetCell }
                    globalStateActions = { {
                        updateCellChartCode: this.props.globalStateActions.updateCellChartCode,
                        updateCellYearSelections: this.props.globalStateActions.updateCellYearSelections, 
                    } }
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
            Waiting for data...
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

        // console.log('render node', this.props.budgetNode.uid, this.props.budgetNode)

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

