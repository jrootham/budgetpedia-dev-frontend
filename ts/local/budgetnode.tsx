// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// budgetnode.tsx

import { PortalCell, TimeSpecs } from './databaseapi'
import { ChartTypeCodes, ChartCodeTypes } from '../apps/constants'
import {
    // MatrixNodeConfig,
    MatrixCellConfig,
    // ChartParms,
    // ChartParmsObj,
    // ChartSelectionContext,
    MatrixLocation,
    // PortalConfig,
    // ChartSettings,
    // PortalChartLocation,
    // ChartConfig,
    // GetChartParmsProps,
    // GetChartParmsCallbacks,
    // CreateChildNodeProps,
    // CreateChildNodeCallbacks,
} from '../apps/controllers/explorer/interfaces'

interface BudgetNodeParms {
    chartType: string,
    viewpointName: string,
    facetName: string,
    portalCharts:PortalCell[],
    timeSpecs: TimeSpecs,
    dataPath: string[],
    matrixLocation: MatrixLocation,
}

class BudgetNode {
    constructor(parms: BudgetNodeParms) {

        let portalcharts = parms.portalCharts
        console.log('portalcharts',portalcharts)
        // // TODO: should be default for each chart...
        let defaultChartCode = ChartTypeCodes[parms.chartType]

        // // create portalCells
        for (let type in portalcharts) {
            console.log('type',type)
            let cell: MatrixCellConfig = {
                googleChartType:parms.chartType,
                chartCode:defaultChartCode,
                nodeDataPropertyName:portalcharts[type].Type
            }
            this.cells.push(cell)
        }
        this.viewpointName = parms.viewpointName
        this.facetName = parms.facetName
        this.dataPath = parms.dataPath
        this.matrixLocation = parms.matrixLocation
        this.timeSpecs = parms.timeSpecs

    }

    cells: MatrixCellConfig[] = []
    viewpointName: string
    facetName: string
    dataPath: string[]
    matrixLocation: MatrixLocation
    timeSpecs: TimeSpecs

}

export default BudgetNode
