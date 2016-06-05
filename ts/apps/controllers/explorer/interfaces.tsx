// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// interfaces.tsx

// return by getChartParms; returns isError with ChartParms
interface ChartParmsObj {
    isError: Boolean,
    errorMessage?: string,
    chartParms?: ChartParms,
    datanode?: any,
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

// settings for individual portal chart
interface ChartSettings {
    onSwitchChartCode: Function,
    chartCode: string,
    graph_id: string,
}

// configuration for ExplorerChart
interface ChartConfig {
    chartparms: ChartParms,
    chartsettings: ChartSettings,
    chartblocktitle: string,
}

// =====================================================
// ---------------[ PORTAL CONFIGURATION ]--------------

// configuration for budget portal, built on render
interface PortalConfig {
    portalCharts: ChartConfig[],
    portalName: string,
}

// to return value for callback processing
interface PortalChartLocation {
    matrixlocation: MatrixLocation,
    portalindex: number,
}
    
interface GetChartParmsProps {
    nodeConfig: MatrixNodeConfig, 
    chartIndex: number,
    userselections:any, 
    budgetdata:any, 
    chartmatrixrow:any,
}

interface GetChartParmsCallbacks {
    refreshPresentation: Function,
    onPortalCreation: Function, 
    workingStatus: Function,
}

interface OnChartComponentSelectionProps {
    context: ChartSelectionContext,
    userselections: any,
    budgetdata: any,
    chartmatrixrow: any,
}
interface OnChartComponentSelectionCallbacks {
    refreshPresentation: Function,
    onPortalCreation: Function,
    workingStatus: Function,
}
// =====================================================
// ---------------[ NODE CONFIGURATION ]--------------

// used to configure single chart of chart portal
interface MatrixNodeConfig {
    // name?: string,

    viewpoint: string,
    facet: string,
    datapath: string[],

    yearscope: YearScope,
    parentdata?: SortedComponentItem,
    datanode?: any,

    matrixlocation: MatrixLocation,
    isError?: boolean,
    charts: MatrixChartConfig[]

}

interface MatrixChartConfig {

    googlecharttype: string,
    chartCode?: string,
    chartparms?: ChartParms,
    nodedatapropertyname?:string,

    chartselection?: ChartSelectionCell[],
    chart?: any,
    ChartObject?: any,
}

// location of chart config in for portal
interface MatrixLocation {
    // row: number,
    column: number,
}

interface SortedComponentItem {
    Code: string,
    Index?: number,
    Name: string,
    datanode?: any // data node from budgetdata model
}

// internal component of chart config
interface YearScope {
    latestyear: number,
    earliestyear: number,
    fullrange: boolean,
}

// =======================================================
// ---------------[ CHART SELECTION OUTPUT ]--------------


interface ChartSelectionCell {
    row:number,
    column:number
}

// returned when user clicks on a chart component 
// for drill-down or other action
interface ChartSelectionContext {
    portalchartlocation: PortalChartLocation,
    ChartObject: any,
    selection: ChartSelectionCell[],
    err: any,
}

// =====================================================
// ---------------[ EXPORT ]--------------

export {
    MatrixNodeConfig, 
    MatrixChartConfig,
    MatrixLocation,
    PortalChartLocation, 
    ChartParms, 
    ChartParmsObj, 
    ChartSelectionContext,
    ChartSettings,
    PortalConfig,
    ChartConfig,
    SortedComponentItem,
    GetChartParmsProps,
    GetChartParmsCallbacks,
    OnChartComponentSelectionProps,
    OnChartComponentSelectionCallbacks,
}
