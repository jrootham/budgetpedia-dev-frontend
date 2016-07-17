// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// interfaces.tsx
import BudgetNode from '../classes/budgetnode'
import { ChartSelectionCell } from './onchartcomponentselection'
// return by getChartParms; returns isError with ChartParms

interface BranchSettings {
    latestYear: number,
    viewpoint: string,
    facet: string,
    chartType: string,
    inflationAdjusted: boolean,
    yearSlider: { 
        singlevalue: {
            rightYear: number, 
        },
        doublevalue: {
            leftYear: number,
            rightYear: number,
        } 
    },
    yearScope:"one",
}

interface BranchConfig {
    settings: BranchSettings,
    uid: string,
}

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
    expandable?: boolean,
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
    // chartConfigs: ChartConfig[],
    portalName: string,
}

// to return value for callback processing
interface PortalChartLocation {
    nodeIndex: number,
    cellIndex: number,
}

export interface GetCellChartProps {
    chartIndex: number,
    branchsettings:BranchSettings, 
    configData: any,
}

interface GetChartParmsProps extends GetCellChartProps {
    budgetNode: BudgetNode, 
}

// =====================================================
// ---------------[ NODE CONFIGURATION ]--------------

interface SortedComponentItem {
    Code: string,
    Index?: number,
    Name: string,
    // dataNode?: any,
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
    // MatrixCellConfig,
    // MatrixLocation,
    PortalChartLocation, 
    ChartParms, 
    ChartParmsObj, 
    CellSettings,
    CellCallbacks,
    PortalConfig,
    ChartConfig,
    SortedComponentItem,
    GetChartParmsProps,
    BranchSettings,
    BranchConfig,
}
