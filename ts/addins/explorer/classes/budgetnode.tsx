// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// budgetnode.tsx

import { PortalCell, TimeSpecs } from './databaseapi'
import { GoogleChartTypeToChartCode, ChartCodeToGoogleChartType } from '../../constants'
import {
    CellSettings,
    PortalConfig,
    GetCellChartProps,
    GetChartParmsProps,
    ChartParmsObj,
} from '../modules/interfaces'
import getChartParmsSource from './modules/getchartparms'
import BudgetCell, { CellDeclaration } from './budgetcell'
import {
    ChartSelectionCell, onChartComponentSelection,
} from '../modules/onchartcomponentselection'

export interface BudgetNodeParms {
    viewpointName: string,
    facetName: string, // used to select chartset to display
    portalCharts:PortalCell[],
    timeSpecs: TimeSpecs,
    dataPath: string[],
    nodeIndex: number,
    parentData?:any,
}

// RESPONSE TO SWITCH FACET

// let nodeCellIndex: any = null
// if (!budgetNode) break
// let configData = {
//     viewpointConfig:viewpointData.Configuration,
//     itemseriesConfig:viewpointData.itemseriesconfigdata,
// }
// for (nodeCellIndex in budgetNode.cells) {
//     let props: GetCellChartProps = {
//         chartIndex: nodeCellIndex,
//         branchsettings,
//         configData,
//     }
//     let fcurrent = fn(nodeIndex)(nodeCellIndex),
//     chartParmsObj = budgetNode.getChartParms(props, {current:fcurrent,next:fn})
//     if (chartParmsObj.isError) {
//         let removed = branchNodes.splice(nodeIndex)
//         let removedids = removed.map((item) => {
//             return item.uid
//         })
//         // actions.removeNode(this.getProps().callbackuid, removedids)
//         if (nodeIndex > 0) { // unset the selection of the parent
//             let parentBudgetNode: BudgetNode = branchNodes[nodeIndex - 1]
//             let parentBudgetCell = parentBudgetNode.cells[nodeCellIndex]
//             // disable reselection
//             parentBudgetCell.chartSelection = null
//             // parentBudgetCell.chart = null
//         }
//         isError = true
//         break
//     } else {
//         // TODO: this should be set through reset
//         budgetNode.facetName = branchsettings.facet
//         let budgetCell:BudgetCell = budgetNode.cells[nodeCellIndex]
//         budgetCell.chartParms = chartParmsObj.chartParms
//         budgetCell.chartCode =
//             GoogleChartTypeToChartCode[budgetCell.chartParms.chartType]
//         if (parentBudgetNode) {
//             budgetNode.parentData.dataNode = parentBudgetNode.dataNode
//         }
//     }
// }



// FROM createChildNode

        // let budgetCell:BudgetCell = budgetNode.cells[cellIndex]

        // budgetCell.chartSelection = chartSelectionData.selection



// let chartParmsObj: ChartParmsObj = {} as ChartParmsObj
// let cellindex: any
// let branchuid = this.uid
// let selectfn = onChartComponentSelection(this)
// let {
//     Configuration: viewpointConfig,
//     itemseriesconfigdata: itemseriesConfig,
// } = viewpointdata
// let configData = {
//     viewpointConfig,
//     itemseriesConfig,
// }
// for (cellindex in budgetNode.cells) {
//     let budgetCell:BudgetCell = budgetNode.cells[cellindex]
//     let props: GetCellChartProps = {
//         chartIndex: cellindex,
//         configData,
//         branchsettings,
//     }

//     let fcurrent = selectfn(nodeIndex)(cellindex)

//     chartParmsObj = budgetNode.getChartParms(props, {current:fcurrent,next:selectfn})

//     if (!chartParmsObj.isError) {

//         budgetCell.chartParms = chartParmsObj.chartParms
//         budgetCell.chartCode =
//             GoogleChartTypeToChartCode[budgetCell.chartParms.chartType]

//     } else {
//         break
//     }
// }
// if (!chartParmsObj.isError) {
//     let { nodeIndex } = budgetNode
//     branchNodes[nodeIndex] = budgetNode
//     this.setState({
//         branchNodes,
//     })
// }


class BudgetNode {
    constructor(parms: BudgetNodeParms, uid:string, node:any, parentNode:any = null) {

        let portalcharts = parms.portalCharts

        this.viewpointName = parms.viewpointName
        this.facetName = parms.facetName
        this.dataPath = parms.dataPath
        this.nodeIndex = parms.nodeIndex
        this.timeSpecs = parms.timeSpecs
        this._dataNode = node
        this.uid = uid
        this.portalCharts = parms.portalCharts
        // BOTH SHOULD BE PRESENT OR ABSENT TOGETHER
        if (parms.parentData) this.parentData = parms.parentData
        if (parentNode) this.parentData.dataNode = parentNode

        // this.setCells(portalcharts[parms.facetName],parms.defaultChartType)

    }

    // ====================================================================
    // ---------------------[ PUBLIC ]------------------------------------

    public getChartParms (props: GetCellChartProps, selectionCallbacks) {
        let sourceProps: GetChartParmsProps = {} as GetChartParmsProps
        let node = this
        Object.assign(sourceProps, props, {budgetNode: node})
        return getChartParmsSource(sourceProps, selectionCallbacks)
    }
    uid:string
    viewpointName: string
    facetName: string
    dataPath: string[]
    nodeIndex: number
    timeSpecs: TimeSpecs
    portalCharts:PortalCell[]
    actions: any
    nodeCallbacks: any
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

    // reset = (dataNode, portalCharts, defaultChartType, facet) => {
    update = (dataNode, facet) => {
        this._dataNode = dataNode
        this.facetName = facet
    }

    // ====================================================================
    // ---------------------[ PRIVATE ]------------------------------------

    getCellDeclarationParms = () => {
        let parmsList:CellDeclaration[] = []
        let chartSpecs = this.portalCharts[this.facetName]
        for (let chartSpec of chartSpecs) {
            let cellDeclaration:CellDeclaration = Object.assign({},this.props.declarationData.defaults.cell)
            cellDeclaration.nodeDatasetName = chartSpec.Type // s/b datasetName
            parmsList.push(cellDeclaration)
        }
        return parmsList
    }

    public setCells(cellDeclarations:CellDeclaration[]) {
        let cells = []
        // // TODO: should be default for each chart...
        // build cells array
        for (let cellIndex in cellDeclarations) {
            let cellDeclaration: CellDeclaration = cellDeclarations[cellIndex]
            let {chartSelection, chartCode, nodeDatasetName, uid} = cellDeclaration
            let cell = new BudgetCell(
                {
                    nodeDatasetName,
                    chartCode,
                    chartSelection,
                    uid,
                }
            )
            this._assignCellChartParms(cell)
            cells.push(cell)
        }
        return cells
    }

    private _assignCellChartParms = cell => {
        let budgetNode = this
        let chartParmsObj: ChartParmsObj = {} as ChartParmsObj
        let cellindex: any
        let branchuid = this.uid
        let selectfn = onChartComponentSelection(this)
        let viewpointdata = this.getProps().viewpointData
        let {
            Configuration: viewpointConfig,
            itemseriesconfigdata: itemseriesConfig,
        } = viewpointdata
        let configData = {
            viewpointConfig,
            itemseriesConfig,
        }
        let budgetCell:BudgetCell = cell
        let props: GetCellChartProps = {
            chartIndex: cellindex,
            configData,
            branchsettings:this.getProps().budgetBranch.settings,
            budgetCell: cell,
        }

        let fcurrent = selectfn(this.nodeIndex)(cellindex)

        chartParmsObj = budgetNode.getChartParms(props, {current:fcurrent,next:selectfn})

        console.log('chartParmsObj', chartParmsObj)

        if (!chartParmsObj.isError) {

            budgetCell.chartParms = chartParmsObj.chartParms
            budgetCell.chartCode =
                GoogleChartTypeToChartCode[budgetCell.chartParms.chartType]

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
            if (!this.dataNode[cell.nodeDatasetName]) {
                continue
            }
            availablCells.push(cell)
        }
        return availablCells
    }

    private _dataNode: any

}

export default BudgetNode
