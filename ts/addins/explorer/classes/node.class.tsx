// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// budgetnode.tsx

import { YearSpecs } from './databaseapi'
import { 
    AspectNameToDatasetName, 
    ChartCodeToGoogleChartType 
} from '../constants'
import {
    PortalConfig,
    GetCellChartProps,
    GetChartParmsProps,
    ChartParmsObj,
} from '../modules/interfaces'

import BudgetCell, { CellDeclaration, NodeData } from './cell.class'

export interface BudgetNodeParms {
    viewpointName: string,
    aspectName: string, // used to select chartset to display
    // datasetSpecs:DataseriesMeta[],
    yearSpecs: YearSpecs,
    yearSelections: any,
    dataPath: string[],
    nodeIndex: number,
    // treeNodeMetaDataFromParentSortedList?:any,
}

export interface BudgetNodeDeclarationParms {
    viewpointName: string,
    aspectName: string, // used to select chartset to display
    // datasetSpecs:DataseriesMeta[],
    yearSpecs: YearSpecs,
    yearSelections: any,
    dataPath: string[],
    nodeIndex: number,
    cellIndex: any,
}

class BudgetNode {
    constructor(parms: BudgetNodeParms, uid:string, node:any, parentBudgetNode:any = null) {

        // let portalcharts = parms.datasetSpecs

        this.viewpointName = parms.viewpointName
        this.aspectName = parms.aspectName
        this.dataPath = parms.dataPath
        this.nodeIndex = parms.nodeIndex
        this.yearSpecs = parms.yearSpecs
        this.yearSelections = parms.yearSelections
        this._nodeData = node
        this.uid = uid

        if (parentBudgetNode) this.parentBudgetNode = parentBudgetNode

    }

    // ====================================================================
    // ---------------------[ PUBLIC ]------------------------------------

    uid:string
    viewpointName: string
    aspectName: string
    dataPath: string[]
    nodeIndex: number
    yearSpecs: YearSpecs
    yearSelections: any
    actions: any
    viewpointConfigPack: any
    branchSettings:any
    onChartComponentSelection: Function
    new:boolean = true
    updated:boolean = false
    newCells:BudgetCell[] = null
    get treeNodeData() {
        return this._nodeData
    }
    get state() {
        return this.getState()
    }

    get props() {
        return this.getProps()
    }

    public getState: Function

    public setState: Function

    public getProps: Function

    // treeNodeMetaDataFromParentSortedList: any = null // includes parentNode for now
    // parentNode: any = null
    parentBudgetNode: any = null

    portalConfig: PortalConfig

    get cells() { // only return cells that have appropriate node datasets available
        return [...this.state.nodeCells]
    }

    updateAspect = (aspect, treeNodeData) => { //, parentDataNode = null) => {
        this.aspectName = aspect
        this.updateDataNode(treeNodeData) //, parentDataNode)
    }

    updateDataNode = (treeNodeData) => {// , parentDataNode = null) => {
        this._nodeData = treeNodeData
        // if (this.treeNodeMetaDataFromParentSortedList && parentDataNode) {
        //     this.treeNodeMetaDataFromParentSortedList.treeNodeData = parentDataNode
        // }
        this.updated = true

    }

    oldAspectState: boolean // !!dataNode.Components

    // ====================================================================
    // ---------------------[ PRIVATE ]------------------------------------

    getCellDeclarationParms = () => {
        let parmsList:CellDeclaration[] = []
        let datasetName:string = AspectNameToDatasetName[this.aspectName]
        let chartSpecs = this.viewpointConfigPack.datasetConfig.Dataseries
        let node = this.treeNodeData
        for (let chartSpec of chartSpecs) {
            let cellDeclaration:CellDeclaration = Object.assign({},this.props.declarationData.defaults.cell)
            // not only must the dataseries be mandated, but also present...
            if (node[chartSpec.Type]) {
                cellDeclaration.nodeDataseriesName = chartSpec.Type
                parmsList.push(cellDeclaration)
            }
        }
        return parmsList
    }

    public setCells(cellDeclarations:CellDeclaration[]) {
        let cells = []
        // // TODO: should be default for each chart...
        // build cells array
        for (let cellIndex in cellDeclarations) {
            let cellDeclaration: CellDeclaration = cellDeclarations[cellIndex]
            let {nodeDataseriesName, celluid} = cellDeclaration
            let settings = cellDeclaration.chartConfigs[cellDeclaration.yearScope]
            let { explorerChartCode, chartSelection } = settings
            let cell = new BudgetCell(
                {
                    nodeDataseriesName,
                    explorerChartCode,
                    chartSelection,
                    uid:celluid,
                }
            )

            this._updateCell(cell, cellIndex)
            cells.push(cell)
        }
        // this.newCells = cells
        // this.updated = true
        return cells
    }

    public resetCells() {

        let budgetNode = this

        let cells = budgetNode.cells
        for (let cellIndex in cells) {

            let cell:BudgetCell = cells[cellIndex]

            budgetNode._updateCell(cell, cellIndex)
            cell.setChartParms()

        }
        this.newCells = cells
        this.updated = true

    }

    switchYearSelections(yearSelections) {

        let budgetNode = this

        this.yearSelections = yearSelections

        let cells = budgetNode.cells
        for (let cellIndex in cells) {

            let cell:BudgetCell = cells[cellIndex]

            budgetNode._updateCell(cell, cellIndex)
            cell.setChartParms()

        }
        this.newCells = cells
        this.updated = true

    }

    private _updateCell = (cell:BudgetCell, cellIndex) => {

        let budgetNode = this

        let { viewpointConfigPack, treeNodeData, yearSpecs, yearSelections, parentBudgetNode, nodeIndex } = budgetNode
        let nodeDataPack: NodeData = {
            treeNodeData,
            yearSpecs,
            yearSelections,
            parentBudgetNode,
            budgetNode,
        }

        cell.viewpointConfigPack = viewpointConfigPack
        cell.nodeDataPack = nodeDataPack
        cell.aspectName = budgetNode.branchSettings.aspect,

        budgetNode._setCellSelectionCallback(cell, cellIndex)
        budgetNode._setCellTitle(cell)

    }

    private _setCellTitle = (budgetCell:BudgetCell) => {

        let portaltitles = budgetCell.viewpointConfigPack.datasetConfig.CellTitles
        let chartblocktitle = null
        if ((budgetCell.nodeDataseriesName == 'CommonDimension')) {
            chartblocktitle = portaltitles.CommonDimension
        } else {
            chartblocktitle = portaltitles.Components
        }
        budgetCell.cellTitle = chartblocktitle
        
    }

    private _setCellSelectionCallback = (cell:BudgetCell, cellIndex) => {
        let budgetNode = this

        let selectfn = this.onChartComponentSelection
        let fcurrent = selectfn(budgetNode.nodeIndex)(cellIndex)

        cell.selectionCallback = fcurrent

    }

    get cellDeclarationList() {
        let list = this.getProps().declarationData.nodesById[this.uid].cellList

        if (list == null)
            return list
        else 
            return [...list]
    }

    private _nodeData: any

}

export default BudgetNode
