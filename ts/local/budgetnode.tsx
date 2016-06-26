// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// budgetnode.tsx

import { PortalCell, TimeSpecs } from './databaseapi'
import { ChartTypeCodes, ChartCodeTypes } from '../apps/constants'
import {
    MatrixCellConfig,
    MatrixLocation,
} from '../apps/controllers/explorer/interfaces'

export interface BudgetNodeParms {
    chartType: string,
    viewpointName: string,
    facetName: string,
    portalCharts:PortalCell[],
    timeSpecs: TimeSpecs,
    dataPath: string[],
    matrixLocation: MatrixLocation,
    dataNode:any,
    parentData?:any,
    cells?:any,
}

class BudgetNode {
    constructor(parms: BudgetNodeParms) {

        let portalcharts = parms.portalCharts
        // // TODO: should be default for each chart...
        let defaultChartCode = ChartTypeCodes[parms.chartType]

        // TODO: resolve need for this -- node children controls type of portalcharts
        // should perhaps be checked at cell creation time rather than at budgetnode
        // creation type
        if (parms.cells) {
            this.cells = parms.cells
        // create portalCells
        } else {
            for (let type in portalcharts) {
                let cell: MatrixCellConfig = {
                    googleChartType:parms.chartType,
                    chartCode:defaultChartCode,
                    nodeDataPropertyName:portalcharts[type].Type
                }
                this.cells.push(cell)
            }
        }
        this.viewpointName = parms.viewpointName
        this.facetName = parms.facetName
        this.dataPath = parms.dataPath
        this.matrixLocation = parms.matrixLocation
        this.timeSpecs = parms.timeSpecs
        this.dataNode = parms.dataNode
        if (parms.parentData) this.parentData = parms.parentData

    }

    getAvailableCells = () => {
        let availablCells = []
        if (!this.dataNode) return availablCells
        for (let cell of this.cells) {
            if (cell.nodeDataPropertyName == 'Components' && !this.dataNode.Components) {
                continue
            }
            if (cell.nodeDataPropertyName == 'Categories' && !this.dataNode.Categories) {
                continue
            }
            availablCells.push(cell)
        }
        return availablCells
    }

    cells: MatrixCellConfig[] = []
    viewpointName: string
    facetName: string
    dataPath: string[]
    matrixLocation: MatrixLocation
    timeSpecs: TimeSpecs
    dataNode: any
    parentData: any = null

}

export default BudgetNode
