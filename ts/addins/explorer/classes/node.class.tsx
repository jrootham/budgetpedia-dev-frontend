// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// budgetnode.tsx

import { DataseriesMeta, YearSpecs } from './databaseapi'
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

import BudgetCell, { CellDeclaration, NodeData } from './cell.class'
// import {
//     ChartSelectionCell, onChartComponentSelection,
// } from '../modules/onchartcomponentselection'

export interface BudgetNodeParms {
    viewpointName: string,
    facetName: string, // used to select chartset to display
    datasetSpecs:DataseriesMeta[],
    yearSpecs: YearSpecs,
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
        this.yearSpecs = parms.yearSpecs
        this._nodeData = node
        this.uid = uid
        this.datasetSpecs = parms.datasetSpecs
        // BOTH SHOULD BE PRESENT OR ABSENT TOGETHER
        if (parms.parentData) this.parentData = parms.parentData
        if (parentNode) this.parentData.nodeData = parentNode

        // this.setCells(portalcharts[parms.facetName],parms.defaultChartType)

    }

    // ====================================================================
    // ---------------------[ PUBLIC ]------------------------------------

    uid:string
    viewpointName: string
    facetName: string
    dataPath: string[]
    nodeIndex: number
    yearSpecs: YearSpecs
    datasetSpecs:DataseriesMeta[]
    actions: any
    nodeCallbacks: any
    viewpointConfigPack: any
    branchSettings:any
    onChartComponentSelection: Function
    new:boolean = true
    updated:boolean = false
    newCells:BudgetCell[] = null
    get nodeData() {
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

    parentData: any = null // includes parentNode for now
    // parentNode: any = null

    portalConfig: PortalConfig

    get cells() { // only return cells that have appropriate node datasets available
        return this.getAvailableCells()
    }

    get allCells() {
        return [...this.state.nodeCells]
    }

    // reset = (nodeData, datasetSpecs, defaultChartType, facet) => {
    update = (facet, nodeData, parentDataNode = null) => {
        this._nodeData = nodeData
        this.facetName = facet
        if (this.parentData && parentDataNode) {
            this.parentData.nodeData = parentDataNode
        }
        this.updated = true
    }

    oldFacetState: number

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

            // cell.cellIndex = parseInt(cellIndex) // parseInt is a compiler requirement
            this._updateCell(cell, cellIndex)
            cells.push(cell)
        }
        return cells
    }

    public resetCells() {
        let budgetNode = this

        let datasetName:string = FacetNameToDatasetName[budgetNode.facetName]
        let chartSpecs = budgetNode.datasetSpecs[datasetName]
        let cells = budgetNode.allCells
        for (let cellIndex in cells) {
            let cell:BudgetCell = cells[cellIndex]
            cell.nodeDataseriesName = chartSpecs[cellIndex].Type
            budgetNode._updateCell(cell, cellIndex)
        }
        return cells
    }

    private _updateCell = (cell:BudgetCell, cellIndex) => {
        let budgetNode = this

        let { viewpointConfigPack, nodeData, yearSpecs, parentData, nodeIndex } = budgetNode
        let nodeDataPack: NodeData = {
            nodeData,
            yearSpecs,
            parentData,
        }

        cell.viewpointConfigPack = viewpointConfigPack
        cell.nodeDataPack = nodeDataPack
        cell.facetName = budgetNode.branchSettings.facet,

        budgetNode._setCellChartParms(cell, cellIndex)
        budgetNode._setCellTitle(cell)
    }

    private _setCellTitle = (budgetCell:BudgetCell) => {
        let portaltitles = budgetCell.viewpointConfigPack.datasetConfig.Titles
        let chartblocktitle = null
        if ((budgetCell.nodeDataseriesName == 'Categories')) {
            chartblocktitle = portaltitles.Categories
        } else {
            chartblocktitle = portaltitles.Baseline
        }
        budgetCell.cellTitle = "By " + chartblocktitle
    }

    private _setCellChartParms = (cell:BudgetCell, cellIndex) => {
        let budgetNode = this

        let selectfn = this.onChartComponentSelection
        let fcurrent = selectfn(budgetNode.nodeIndex)(cellIndex)

        cell.selectionCallback = fcurrent

        cell.setChartParms()

    }

    get cellList() {
        return [...this.getProps().declarationData.nodesById[this.uid].cellList]
    }

    private getAvailableCells() {
        let cells = [...this.state.nodeCells]
        let availablCells = []
        if (!this.nodeData) return availablCells
        for (let cell of cells) {
            let budgetNode = this
            if (!this.nodeData[cell.nodeDataseriesName]) {
                continue
            }
            availablCells.push(cell)
        }
        return availablCells
    }

    private _nodeData: any

}

export default BudgetNode
