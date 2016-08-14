// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// interfaces.tsx
import BudgetNode from '../classes/node.class'
import { ChartSelectionCell } from './onchartcomponentselection'

interface BranchSettings {
    latestYear: number,
    viewpoint: string,
    aspect: string,
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
    // nodeData?: any,
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
    chartIndex?: number,
    branchsettings:BranchSettings, 
    configData?: any,
    budgetCell?:any,
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
    // nodeData?: any,
}

// internal component of chart config
// interface YearScope {
//     rightYear: number,
//     leftYear: number,
//     yearScope: boolean,
// }

// =======================================================
// ---------------[ CHART SELECTION OUTPUT ]--------------


// =====================================================
// ---------------[ EXPORT ]--------------

export {
    PortalChartLocation, 
    ChartParms, 
    ChartParmsObj, 
    PortalConfig,
    SortedComponentItem,
    GetChartParmsProps,
    BranchSettings,
    BranchConfig,
}
