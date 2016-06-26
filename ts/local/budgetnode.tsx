// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// budgetnode.tsx

import { PortalCell, TimeSpecs } from './databaseapi'
import { ChartTypeCodes, ChartCodeTypes } from '../apps/constants'
import {
    MatrixCellConfig,
    MatrixLocation,
} from '../apps/controllers/explorer/interfaces'

export interface BudgetNodeParms {
    defaultChartType: string,
    viewpointName: string,
    facetName: string,
    portalCharts:PortalCell[],
    timeSpecs: TimeSpecs,
    dataPath: string[],
    matrixLocation: MatrixLocation,
    dataNode:any,
    parentData?:any,
}

class BudgetNode {
    constructor(parms: BudgetNodeParms) {

        let portalcharts = parms.portalCharts
        // // TODO: should be default for each chart...
        let defaultChartCode = ChartTypeCodes[parms.defaultChartType]

        // build cells array
        for (let type in portalcharts) {
            let cell: MatrixCellConfig = {
                googleChartType:parms.defaultChartType,
                chartCode:defaultChartCode,
                nodeDataPropertyName:portalcharts[type].Type
            }
            this._cells.push(cell)
        }

        this.viewpointName = parms.viewpointName
        this.facetName = parms.facetName
        this.dataPath = parms.dataPath
        this.matrixLocation = parms.matrixLocation
        this.timeSpecs = parms.timeSpecs
        this.dataNode = parms.dataNode
        if (parms.parentData) this.parentData = parms.parentData

    }

    private getAvailableCells = () => {
        let availablCells = []
        if (!this.dataNode) return availablCells
        for (let cell of this._cells) {
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

    private _cells: MatrixCellConfig[] = []
    viewpointName: string
    facetName: string
    dataPath: string[]
    matrixLocation: MatrixLocation
    timeSpecs: TimeSpecs
    dataNode: any
    parentData: any = null

    get cells() { // only return cells that have appropriate node datasets available
        return this.getAvailableCells()
    }

    set cells(value) {
        this._cells = value
    }

}

export default BudgetNode
