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
// import {
//     ChartSelectionCell, onChartComponentSelection,
// } from '../modules/onchartcomponentselection'

export interface BudgetNodeParms {
    viewpointName: string,
    aspectName: string, // used to select chartset to display
    // datasetSpecs:DataseriesMeta[],
    yearSpecs: YearSpecs,
    dataPath: string[],
    nodeIndex: number,
    treeNodeMetaDataFromParentSortedList?:any,
}

class BudgetNode {
    constructor(parms: BudgetNodeParms, uid:string, node:any, parentBudgetNode:any = null) {

        // let portalcharts = parms.datasetSpecs

        this.viewpointName = parms.viewpointName
        this.aspectName = parms.aspectName
        this.dataPath = parms.dataPath
        this.nodeIndex = parms.nodeIndex
        this.yearSpecs = parms.yearSpecs
        this._nodeData = node
        this.uid = uid
        // this.datasetSpecs = parms.datasetSpecs
        // BOTH SHOULD BE PRESENT OR ABSENT TOGETHER
        if (parms.treeNodeMetaDataFromParentSortedList) this.treeNodeMetaDataFromParentSortedList = parms.treeNodeMetaDataFromParentSortedList
        if (parentBudgetNode) this.treeNodeMetaDataFromParentSortedList.parentBudgetNode = parentBudgetNode

    }

    // ====================================================================
    // ---------------------[ PUBLIC ]------------------------------------

    uid:string
    viewpointName: string
    aspectName: string
    dataPath: string[]
    nodeIndex: number
    yearSpecs: YearSpecs
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

    treeNodeMetaDataFromParentSortedList: any = null // includes parentNode for now
    // parentNode: any = null

    portalConfig: PortalConfig

    get cells() { // only return cells that have appropriate node datasets available
        return [...this.state.nodeCells]
    }

    // reset = (treeNodeData, datasetSpecs, defaultChartType, aspect) => {
    update = (aspect, treeNodeData, parentDataNode = null) => {
        this._nodeData = treeNodeData
        this.aspectName = aspect
        if (this.treeNodeMetaDataFromParentSortedList && parentDataNode) {
            this.treeNodeMetaDataFromParentSortedList.treeNodeData = parentDataNode
        }
        this.updated = true
    }

    oldAspectState: number

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
        // console.log('cellDeclarations in setCells',cellDeclarations)
        for (let cellIndex in cellDeclarations) {
            let cellDeclaration: CellDeclaration = cellDeclarations[cellIndex]
            let {nodeDataseriesName, celluid} = cellDeclaration
            let settings = cellDeclaration.yearScopeChartConfigs[cellDeclaration.yearScope]
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
        return cells
    }

    private _updateCell = (cell:BudgetCell, cellIndex) => {
        let budgetNode = this

        let { viewpointConfigPack, treeNodeData, yearSpecs, treeNodeMetaDataFromParentSortedList, nodeIndex } = budgetNode
        let nodeDataPack: NodeData = {
            treeNodeData,
            yearSpecs,
            treeNodeMetaDataFromParentSortedList,
        }

        cell.viewpointConfigPack = viewpointConfigPack
        cell.nodeDataPack = nodeDataPack
        cell.aspectName = budgetNode.branchSettings.aspect,

        budgetNode._setCellChartParms(cell, cellIndex)
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
        budgetCell.cellTitle = "By " + chartblocktitle
    }

    private _setCellChartParms = (cell:BudgetCell, cellIndex) => {
        let budgetNode = this

        let selectfn = this.onChartComponentSelection
        let fcurrent = selectfn(budgetNode.nodeIndex)(cellIndex)

        cell.selectionCallback = fcurrent

        // cell.setChartParms()

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
