// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// budgetcell.tsx

import {
    ChartParms,
    CellCallbacks
} from '../modules/interfaces'

import {
    ChartSelectionCell,
} from '../modules/onchartcomponentselection'

export interface CellSpecParms {
    nodeDatasetName:string, 
    chartCode:string, 
    chartSelection:ChartSelectionCell[],
    uid: string,
}

class BudgetCell {

    constructor(specs:CellSpecParms) {
        let { nodeDatasetName, chartCode, chartSelection, uid } = specs
        this.nodeDatasetName = nodeDatasetName
        this.chartCode = chartCode
        this.chartSelection = chartSelection
        this.uid = uid
    }

    // primary properties
    nodeDatasetName:string
    chartSelection: ChartSelectionCell[]
    chartCode: string
    uid: string

    // derivative properties
    chartComponent: any // the react Chart component, allows access to google chart objects
    googleChartType: string
    chartParms: ChartParms
    get chart() {return this.chartComponent.chart}
    cellCallbacks: CellCallbacks
    expandable: boolean
    graph_id: string
    cellTitle: string

}

export default BudgetCell