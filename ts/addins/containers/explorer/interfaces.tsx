// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// interfaces.tsx
import BudgetNode from '../../classes/budgetnode'
import { ChartSelectionCell } from './onchartcomponentselection'
// return by getChartParms; returns isError with ChartParms
interface ChartParmsObj {
    isError: Boolean,
    errorMessage?: string,
    chartParms: ChartParms,
    // dataNode?: any,
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
interface CellSettings {
    chartCode: string,
    graph_id: string,
}

interface CellCallbacks {
    onSwitchChartCode: Function,
}

// configuration for ExplorerChart
interface ChartConfig {
    chartParms: ChartParms,
    cellSettings: CellSettings,
    cellCallbacks: CellCallbacks,
    cellTitle: string,
}

// =====================================================
// ---------------[ PORTAL CONFIGURATION ]--------------

// configuration for budget portal, built on render
interface PortalConfig {
    chartConfigs: ChartConfig[],
    portalName: string,
}

// to return value for callback processing
interface PortalChartLocation {
    matrixlocation: MatrixLocation,
    cellIndex: number,
}

export interface GetCellChartProps {
    chartIndex: number,
    userselections:any, 
    configData: any,
}

interface GetChartParmsProps extends GetCellChartProps {
    budgetNode: BudgetNode, 
}

// interface GetChartParmsCallbacks {
//     refreshPresentation: Function,
//     onPortalCreation: Function, 
//     workingStatus: Function,
//     updateChartSelections: Function,
// }

// =====================================================
// ---------------[ NODE CONFIGURATION ]--------------

interface MatrixCellConfig {

    googleChartType: string,
    chartCode?: string,
    chartparms?: ChartParms,
    nodeDataPropertyName?:string,
    // chart selection data
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


// =====================================================
// ---------------[ EXPORT ]--------------

export {
    MatrixCellConfig,
    MatrixLocation,
    PortalChartLocation, 
    ChartParms, 
    ChartParmsObj, 
    CellSettings,
    CellCallbacks,
    PortalConfig,
    ChartConfig,
    SortedComponentItem,
    GetChartParmsProps,
    // GetChartParmsCallbacks,
}
