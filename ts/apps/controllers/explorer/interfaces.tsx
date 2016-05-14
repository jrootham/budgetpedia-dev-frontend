// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// interfaces.tsx

// =====================================================
// ---------------[ PORTAL CONFIGURATION ]--------------

// configuration for budget portal, built on render
interface PortalConfig {
    portalCharts: PortalChartConfig[],
    portalName: string,
    // onChangeBudgetPortal:Function,
    portalLocation:MatrixLocation,
}

// configuration for individual chart of budget portal
interface PortalChartConfig {
    portalchartparms: ChartParms,
    portalchartsettings: ChartSettings,
    portalchartlocation: ChartLocation,
    chartblocktitle: string,
}

// settings for individual portal chart
interface ChartSettings {
    onSwitchChartCode: Function,
    chartCode: string,
    graph_id: string,
}

// to return value for callback processing
interface ChartLocation {
    matrixlocation: MatrixLocation,
    portalindex: number,
}
    
interface GetChartParmsProps {
    nodeConfig: BudgetNodeConfig, 
    chartIndex: number,
    userselections:any, 
    budgetdata:any, 
    chartmatrix:any,
}

interface GetChartParmsCallbacks {
    refreshPresentation: Function,
    onPortalCreation: Function, 
    workingStatus: Function,
}

interface onChartComponentSelectionProps {
    context: ChartSelectionContext,
    userselections: any,
    budgetdata: any,
    chartmatrix: any,
}
interface onChartComponentSelectionCallbacks {
    refreshPresentation: Function,
    onPortalCreation: Function,
    workingStatus: Function,
}
// =====================================================
// ---------------[ NODE CONFIGURATION ]--------------

// used to configure single chart of chart portal
interface BudgetNodeConfig {
    // name?: string,

    viewpoint: string,
    dataseries: string,
    datapath: string[],

    yearscope: YearScope,
    parentdata?: SortedComponentItem,
    datanode?: any,

    matrixlocation: MatrixLocation,
    isError?: boolean,
    charts: NodeChartConfig[]

}

interface NodeChartConfig {

    charttype: string,
    chartCode?: string,
    chartparms?: ChartParms,
    portalcharttype?:string,

    chartselection?: ChartSelectionData[],
    chart?: any,
    Chart?: any,
}

// location of chart config in for portal
interface MatrixLocation {
    row: number,
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

// =====================================================
// --------------------[ CHART PARMS ]------------------

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
    datanode?:any,
}

// =======================================================
// ---------------[ CHART SELECTION OUTPUT ]--------------


interface ChartSelectionData {
    row:number,
    column:number
}

// returned when user clicks on a chart component 
// for drill-down or other action
interface ChartSelectionContext {
    portalchartlocation: ChartLocation,
    Chart: any,
    selection: ChartSelectionData[],
    err: any,
}

// =====================================================
// ---------------[ EXPORT ]--------------


export {
    BudgetNodeConfig, 
    NodeChartConfig,
    MatrixLocation,
    ChartLocation, 
    ChartSelectionData,
    ChartParms, 
    ChartParmsObj, 
    ChartSelectionContext,
    ChartSettings,
    PortalConfig,
    PortalChartConfig,
    SortedComponentItem,
    GetChartParmsProps,
    GetChartParmsCallbacks,
    onChartComponentSelectionProps,
    onChartComponentSelectionCallbacks,
}
