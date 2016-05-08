// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// interfaces.tsx

// configuration for budget portal, saved in matrix
interface BudgetPortalConfig {
    budgetCharts: PortalBudgetChart[],
    portalName: string,
}

// configuration for individual chart of budget portal
interface PortalBudgetChart {
    portalchartparms: ChartParms,
    portalchartsettings: PortalChartSettings,
    portalchartlocation: PortalChartLocation,
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
// internal component of chart config
interface YearScope {
    latestyear: number,
    earliestyear: number,
    fullrange: boolean,
}

// location of chart config in for portal
interface MatrixLocation {
    row: number,
    column: number,
}

interface ChartSelectionData {
    row:number,
    column:number
}

interface PortalChartLocation {
    matrixlocation: MatrixLocation,
    portalindex: number,
}

// settings for individual portal chart
interface PortalChartSettings {
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
    configlocation: PortalChartLocation,
    Chart: any,
    selection: ChartSelectionData[],
    err: any,
}

export {
    ChartConfig, 
    MatrixLocation,
    PortalChartLocation, 
    ChartSelectionData,
    ChartParms, 
    ChartParmsObj, 
    ChartSelectionContext,
    PortalChartSettings,
    BudgetPortalConfig,
    PortalBudgetChart,
}
