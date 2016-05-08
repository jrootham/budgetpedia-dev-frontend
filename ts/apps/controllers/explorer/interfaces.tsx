// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// interfaces.tsx
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

interface BudgetPortal {
    budgetCharts: BudgetChart[],
    portalName: string,
}

interface BudgetChart {
    chartparms: ChartParms,
    settings: ChartSettings,
    location?:MatrixLocation,
}

interface MatrixLocation {
    row: number,
    column: number,
    index?:number,
}

interface YearScope {
    latestyear: number,
    earliestyear: number,
    fullrange: boolean,
}

interface ChartSettings {
    location: MatrixLocation,
    onChartCode: Function,
    chartCode: string,
    graph_id: string,
    title: string,
    index: number,
}

interface ChartParms {
    chartType?: string,
    chartCode?: string,
    options?: {
        [index: string]: any,
    },
    events?: {
        [index: string]: any,
    }[]
    rows?: any[],
    columns?: any[],
}

interface ChartParmsObj {
    isError: Boolean,
    chartParms?: ChartParms,
}

interface ComponentSummaries {
    years?: any,
    Categories?: any,
}

interface ChartSelectionContext {
    configlocation: any,
    Chart: any,
    selection: any[],
    err: any,
}

export {
    ChartConfig, 
    MatrixLocation, 
    YearScope, 
    ChartParms, 
    ChartParmsObj, 
    ComponentSummaries, 
    ChartSelectionContext,
    ChartSettings,
    BudgetPortal,
    BudgetChart,
}
