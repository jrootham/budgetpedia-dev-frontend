// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// interfaces.tsx
import BudgetNode from '../../../local/budgetnode'
// return by getChartParms; returns isError with ChartParms
interface ChartParmsObj {
    isError: Boolean,
    errorMessage?: string,
    chartParms?: ChartParms,
    dataNode?: any,
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
    nodeConfig: BudgetNode, 
    chartIndex: number,
    userselections:any, 
    budgetdata: any,
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
    budgetdata:any,
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
// interface MatrixNodeConfig {

//     // viewpoint: string,
//     // facet: string,
//     // datapath: string[],

//     // yearscope: YearScope,
//     // parentdata?: SortedComponentItem,
//     // dataNode?: any,

//     // matrixlocation: MatrixLocation,
//     // isError?: boolean,
//     // charts: MatrixCellConfig[]

//     viewpointName: string,
//     facetName: string,
//     dataPath: string[],

//     timeSpecs: YearScope,
//     parentData?: SortedComponentItem,
//     dataNode?: any,

//     matrixLocation: MatrixLocation,
//     isError?: boolean,
//     cells: MatrixCellConfig[]
// }

interface MatrixCellConfig {

    googleChartType: string,
    chartCode?: string,
    chartparms?: ChartParms,
    nodeDataPropertyName?:string,

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
    dataNode?: any,
}

// internal component of chart config
interface YearScope {
    rightYear: number,
    leftYear: number,
    spanYears: boolean,
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

interface CreateChildNodeProps {
    nodeconfig: BudgetNode,
    userselections: any,
    budgetdata:any,
    chartmatrixrow: any,
    selectionrow: any,
    matrixcolumn: any,
    portalChartIndex: number,
    context: any,
    chart: any
}
interface CreateChildNodeCallbacks {
    workingStatus: Function,
    refreshPresentation: Function,
    onPortalCreation: Function,
}

// =====================================================
// ---------------[ EXPORT ]--------------

export {
    // MatrixNodeConfig, 
    MatrixCellConfig,
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
    CreateChildNodeProps,
    CreateChildNodeCallbacks,
}
