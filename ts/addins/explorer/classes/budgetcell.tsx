// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// budgetcell.tsx

import {
    ChartParms,
    CellCallbacks
} from '../modules/interfaces'

import {
    ChartSelectionCell,
} from '../modules/onchartcomponentselection'

class BudgetCell {

    // primary
    nodeDatasetName:string
    chartSelection: ChartSelectionCell[] = null
    chartCode: string
    // derivative
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