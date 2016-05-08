// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// interfaces.tsx

// =====================================================
// ---------------[ PORTAL CONFIGURATION ]--------------

// configuration for budget portal, built on render
interface PortalConfig {
    portalCharts: PortalChartConfig[],
    portalName: string,
}

// configuration for individual chart of budget portal
interface PortalChartConfig {
    portalchartparms: ChartParms,
    portalchartsettings: PortalChartSettings,
    portalchartlocation: PortalChartLocation,
}

// settings for individual portal chart
interface PortalChartSettings {
    onSwitchChartCode: Function,
    chartCode: string,
    graph_id: string,
    chartblocktitle: string,
}

// to return value for callback processing
interface PortalChartLocation {
    matrixlocation: MatrixLocation,
    portalindex: number,
}

// =====================================================
// ---------------[ NODE CONFIGURATION ]--------------

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
    portalchartlocation: PortalChartLocation,
    Chart: any,
    selection: ChartSelectionData[],
    err: any,
}

// =====================================================
// ---------------[ EXPORT ]--------------


export {
    ChartConfig, 
    MatrixLocation,
    PortalChartLocation, 
    ChartSelectionData,
    ChartParms, 
    ChartParmsObj, 
    ChartSelectionContext,
    PortalChartSettings,
    PortalConfig,
    PortalChartConfig,
}
