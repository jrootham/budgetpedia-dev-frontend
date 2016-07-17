// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// budgetcell.tsx

import {
    ChartParms,
} from '../modules/interfaces'

import {
    ChartSelectionCell,
} from '../modules/onchartcomponentselection'

class BudgetCell {

    chartComponent: any // the react Chart component, allows access to google chart objects
    googleChartType: string
    chartCode: string
    chartparms: ChartParms
    nodeDataPropertyName:string
    // chart selection data
    chartselection: ChartSelectionCell[] = null
    get chart() {return this.chartComponent.chart}
    chartConfig: any

}

export default BudgetCell