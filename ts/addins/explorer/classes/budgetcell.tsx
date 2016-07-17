// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// budgetcell.tsx

import {
    ChartParms,
} from '../modules/interfaces'

import {
    ChartSelectionCell,
} from '../modules/onchartcomponentselection'

class BudgetCell {

    googleChartType: string
    chartCode: string
    chartparms: ChartParms
    nodeDataPropertyName:string
    // chart selection data
    chartselection: ChartSelectionCell[]
    chart: any
    ChartObject: any
    chartConfig: any

}

export default BudgetCell