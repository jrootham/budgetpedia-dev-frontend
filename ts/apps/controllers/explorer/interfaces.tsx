// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// interfaces.tsx

// configuration for budget portal, saveed in matrix
interface BudgetPortalConfig {
    budgetCharts: BudgetChart[],
    portalName: string,
}

// configuration for individual chart of budget portal
interface BudgetChart {
    chartparms: ChartParms,
    settings: ChartSettings,
    location?: ChartLocation,
}

// used to configure single chart of chart portal
interface ChartConfig {
    name?: string,
    viewpoint: string,
    dataseries: string,
    matrixlocation: MatrixLocation,
    chartselection?: any[],
    chart?: any,
    Chart?:any,
    datapath: string[],
    parentdata?: any,
    yearscope: YearScope,
    charttype?: string,
    chartCode?: string,
    chartparms?: ChartParms,
    isError?: boolean
}

// location of chart config in for portal
interface MatrixLocation {
    row: number,
    column: number,
    // index?:number,
}

interface ChartSelectionData {
    row:number,
    column:number
}

interface ChartLocation {
    location: MatrixLocation,
    index: number,
}

// component of chart config
interface YearScope {
    latestyear: number,
    earliestyear: number,
    fullrange: boolean,
}

// settings for individual portal chart
interface ChartSettings {
    location: MatrixLocation,
    onChartCode: Function,
    chartCode: string,
    graph_id: string,
    title: string,
    index: number,
}

// parameters to be passed to google chart
interface ChartParms {
    chartType?: string,
    options?: {
        [index: string]: any,
    },
    events?: {
        [index: string]: any,
    }[]
    rows?: any[],
    columns?: any[],
}

// return by getChartParms; returns isError with ChartParms
interface ChartParmsObj {
    isError: Boolean,
    chartParms?: ChartParms,
}

// returned when user clicks on a chart component 
// for drill-down or other action
interface ChartSelectionContext {
    configlocation: ChartLocation,
    Chart: any,
    selection: ChartSelectionData[],
    err: any,
}

export {
    ChartConfig, 
    MatrixLocation,
    ChartLocation, 
    ChartSelectionData,
    YearScope, 
    ChartParms, 
    ChartParmsObj, 
    ChartSelectionContext,
    ChartSettings,
    BudgetPortalConfig,
    BudgetChart,
}
