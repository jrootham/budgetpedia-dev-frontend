// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// budgetnode.tsx

import { DataseriesMeta, TimeSpecs } from './databaseapi'
import { 
    FacetNameToDatasetName, 
    GoogleChartTypeToChartCode, 
    ChartCodeToGoogleChartType 
} from '../../constants'
import {
    PortalConfig,
    GetCellChartProps,
    GetChartParmsProps,
    ChartParmsObj,
} from '../modules/interfaces'

import BudgetCell, { CellDeclaration } from './cell.class'
// import {
//     ChartSelectionCell, onChartComponentSelection,
// } from '../modules/onchartcomponentselection'

export interface BudgetNodeParms {
    viewpointName: string,
    facetName: string, // used to select chartset to display
    datasetSpecs:DataseriesMeta[],
    timeSpecs: TimeSpecs,
    dataPath: string[],
    nodeIndex: number,
    parentData?:any,
}

class BudgetNode {
    constructor(parms: BudgetNodeParms, uid:string, node:any, parentNode:any = null) {

        let portalcharts = parms.datasetSpecs

        this.viewpointName = parms.viewpointName
        this.facetName = parms.facetName
        this.dataPath = parms.dataPath
        this.nodeIndex = parms.nodeIndex
        this.timeSpecs = parms.timeSpecs
        this._dataNode = node
        this.uid = uid
        this.datasetSpecs = parms.datasetSpecs
        // BOTH SHOULD BE PRESENT OR ABSENT TOGETHER
        if (parms.parentData) this.parentData = parms.parentData
        if (parentNode) this.parentData.dataNode = parentNode

        // this.setCells(portalcharts[parms.facetName],parms.defaultChartType)

    }

    // ====================================================================
    // ---------------------[ PUBLIC ]------------------------------------

    uid:string
    viewpointName: string
    facetName: string
    dataPath: string[]
    nodeIndex: number
    timeSpecs: TimeSpecs
    datasetSpecs:DataseriesMeta[]
    actions: any
    nodeCallbacks: any
    viewpointConfigData: any
    branchSettings:any
    onChartComponentSelection: Function
    new:boolean = true
    updated:boolean = false
    newCells:BudgetCell[] = null
    get dataNode() {
        return this._dataNode
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

    parentData: any = null // includes parentNode for now
    // parentNode: any = null

    portalConfig: PortalConfig

    get cells() { // only return cells that have appropriate node datasets available
        return this.getAvailableCells()
    }

    get allCells() {
        return [...this.state.nodeCells]
    }

    // reset = (dataNode, datasetSpecs, defaultChartType, facet) => {
    update = (facet, dataNode, parentDataNode = null) => {
        this._dataNode = dataNode
        this.facetName = facet
        if (this.parentData && parentDataNode) {
            this.parentData.dataNode = parentDataNode
        }
        this.updated = true
    }

    // ====================================================================
    // ---------------------[ PRIVATE ]------------------------------------

    getCellDeclarationParms = () => {
        let parmsList:CellDeclaration[] = []
        let datasetName:string = FacetNameToDatasetName[this.facetName]
        let chartSpecs = this.datasetSpecs[datasetName]
        for (let chartSpec of chartSpecs) {
            let cellDeclaration:CellDeclaration = Object.assign({},this.props.declarationData.defaults.cell)
            cellDeclaration.nodeDataseriesName = chartSpec.Type // s/b dataseriesName
            parmsList.push(cellDeclaration)
        }
        return parmsList
    }

    public setCells(cellDeclarations:CellDeclaration[]) {
        let cells = []
        // console.log('cellDeclarations in setCells', cellDeclarations)
        // // TODO: should be default for each chart...
        // build cells array
        for (let cellIndex in cellDeclarations) {
            let cellDeclaration: CellDeclaration = cellDeclarations[cellIndex]
            let {chartSelection, explorerChartCode, nodeDataseriesName, celluid} = cellDeclaration
            let cell = new BudgetCell(
                {
                    nodeDataseriesName,
                    explorerChartCode,
                    chartSelection,
                    uid:celluid,
                }
            )

            cell.cellIndex = parseInt(cellIndex) // parseInt is a compiler requirement
            this._updateCell(cell)
            cells.push(cell)
        }
        return cells
    }

    public resetCells() {
        let datasetName:string = FacetNameToDatasetName[this.facetName]
        let chartSpecs = this.datasetSpecs[datasetName]
        let cells = this.allCells
        for (let cellIndex in cells) {
            let cell:BudgetCell = cells[cellIndex]
            cell.nodeDataseriesName = chartSpecs[cellIndex].Type
            this._updateCell(cell)
        }
        return cells
    }

    private _updateCell = (cell:BudgetCell) => {
        let viewpointConfigData = this.viewpointConfigData

        let { dataNode, timeSpecs, parentData, nodeIndex } = this
        let nodeData = {
            dataNode,
            timeSpecs,
            parentData,
            nodeIndex,
        }

        cell.viewpointConfigData = viewpointConfigData
        cell.nodeData = nodeData
        cell.branchSettings = this.branchSettings,

        this._assignCellChartParms(cell)
        this._setCellTitle(cell)
    }

    private _setCellTitle = (budgetCell:BudgetCell) => {
        let portaltitles = budgetCell.viewpointConfigData.datasetConfig.Titles
        let chartblocktitle = null
        if ((budgetCell.nodeDataseriesName == 'Categories')) {
            chartblocktitle = portaltitles.Categories
        } else {
            chartblocktitle = portaltitles.Baseline
        }
        budgetCell.cellTitle = "By " + chartblocktitle
    }

    private _assignCellChartParms = (cell:BudgetCell) => {
        let budgetNode = this

        let selectfn = this.onChartComponentSelection
        let fcurrent = selectfn(budgetNode.nodeIndex)(cell.cellIndex)

        cell.chartCallbacks = {selectionCallback:fcurrent}

        let chartParmsObj:ChartParmsObj = cell.getChartParms()

        if (!chartParmsObj.isError) {

            cell.chartParms = chartParmsObj.chartParms

        }
    }

    get cellList() {
        return [...this.getProps().declarationData.nodesById[this.uid].cellList]
    }

    private getAvailableCells() {
        let cells = [...this.state.nodeCells]
        let availablCells = []
        if (!this.dataNode) return availablCells
        for (let cell of cells) {
            let budgetNode = this
            if (!this.dataNode[cell.nodeDataseriesName]) {
                continue
            }
            availablCells.push(cell)
        }
        return availablCells
    }

    private _dataNode: any

}

export default BudgetNode