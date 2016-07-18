// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// budgetnode.tsx

import { PortalCell, TimeSpecs } from './databaseapi'
import { ChartTypeCodes, ChartCodeTypes } from '../../constants'
import {
    // MatrixCellConfig,
    // MatrixLocation,
    PortalConfig,
    GetCellChartProps,
    GetChartParmsProps
} from '../modules/interfaces'
import getChartParmsSource from './modules/getchartparms'
import BudgetCell from './budgetcell'

export interface BudgetNodeParms {
    defaultChartType: string,
    viewpointName: string,
    facetName: string, // used to select chartset to display
    portalCharts:PortalCell[],
    timeSpecs: TimeSpecs,
    dataPath: string[],
    nodeIndex: number,
    parentData?:any,
}

class BudgetNode {
    constructor(parms: BudgetNodeParms, uid:string, node:any, parentNode:any = null) {

        let portalcharts = parms.portalCharts

        this.setCells(portalcharts[parms.facetName],parms.defaultChartType)

        this.viewpointName = parms.viewpointName
        this.facetName = parms.facetName
        this.dataPath = parms.dataPath
        this.nodeIndex = parms.nodeIndex
        this.timeSpecs = parms.timeSpecs
        this._dataNode = node
        this.uid = uid
        // BOTH SHOULD BE PRESENT OR ABSENT TOGETHER
        if (parms.parentData) this.parentData = parms.parentData
        if (parentNode) this.parentData.dataNode = parentNode

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
    get dataNode() {
        return this._dataNode
    }
    parentData: any = null // includes parentNode for now
    // parentNode: any = null

    portalConfig: PortalConfig

    get cells() { // only return cells that have appropriate node datasets available
        return this.getAvailableCells()
    }

    // reset = (dataNode, portalCharts, defaultChartType, facet) => {
    update = (dataNode, facet) => {
        this._dataNode = dataNode
        this.facetName = facet
    }

    // ====================================================================
    // ---------------------[ PRIVATE ]------------------------------------

    private setCells(portalcharts, defaultChartType) {
        this._cells = []
        // // TODO: should be default for each chart...
        let defaultChartCode = ChartTypeCodes[defaultChartType]
        // build cells array
        for (let type in portalcharts) {
            let cell = new BudgetCell()
            cell.googleChartType = defaultChartType,
            cell.chartCode = defaultChartCode,
            cell.nodeDatasetName = portalcharts[type].Type
            this._cells.push(cell)
        }
    }

    private getAvailableCells() {
        let availablCells = []
        if (!this.dataNode) return availablCells
        for (let cell of this._cells) {
            if (cell.nodeDatasetName == 'Components' && !this.dataNode.Components) {
                continue
            }
            if (cell.nodeDatasetName == 'Categories' && !this.dataNode.Categories) {
                continue
            }
            availablCells.push(cell)
        }
        return availablCells
    }

    private _cells: BudgetCell[]
    private _dataNode: any

    // // TODO: TEMPORARY
    // set cells(value) {
    //     this._cells = value
    // }

}

export default BudgetNode
