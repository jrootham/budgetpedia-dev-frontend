// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// budgetbranch.tsx

import databaseapi , { DatasetConfig, TimeSpecs, Viewpoint } from './databaseapi'
import {
    // MatrixCellConfig,
    // ChartParms,
    ChartParmsObj,
    // MatrixLocation,
    // PortalConfig,
    // CellSettings,
    // CellCallbacks,
    // PortalChartLocation,
    // ChartConfig,
    GetCellChartProps,
    // GetChartParmsCallbacks,
} from '../containers/explorer/interfaces'
import getBudgetNode from '../containers/explorer/getbudgetnode'
import BudgetNode from '../classes/budgetnode'
import { 
    // createChildNode,
    // ChartSelectionContext,
    // CreateChildNodeProps,
    // CreateChildNodeCallbacks,
    onChartComponentSelection,
} from '../containers/explorer/onchartcomponentselection'

import { ChartTypeCodes, ChartCodeTypes } from '../constants'

interface BudgetBranchParms {
    data:any,
    nodes:any[],
}

class BudgetBranch {
    constructor(parms) {
        this.data = parms.data
        this.nodes = parms.nodes
    }

    public data

    public nodes

    public initializeChartSeries = (props, callbacks) => {

        let { userselections } = props
        let chartmatrixrow = this.nodes
        let budgetdata = this.data
        let matrixlocation,
            chartParmsObj: ChartParmsObj

        // ------------------------[ POPULATE VIEWPOINT WITH VALUES ]-----------------------

        let { 
            viewpoint: viewpointname, 
            facet: dataseriesname, 
            inflationadjusted: wantsInflationAdjusted 
        } = userselections

        let viewpointdata = databaseapi.getViewpointData({
            viewpointname, 
            dataseriesname,
            wantsInflationAdjusted,
            timeSpecs: {
                leftYear: null,
                rightYear: null,
                spanYears: false,
            }
        })

        budgetdata.viewpointdata = viewpointdata
        // *** CREATE BRANCH
        // -----------------[ THE DRILLDOWN ROOT ]-----------------
        let datapath = []
        let node = getBudgetNode(viewpointdata, datapath)

        let {
            charttype:defaultChartType,
            viewpoint:viewpointName,
            facet:facetName,
            latestyear:rightYear,
        } = userselections

        let budgetNodeParms = {
            defaultChartType,
            viewpointName,
            facetName,
            portalCharts:viewpointdata.PortalCharts,
            timeSpecs: {
                leftYear:null,
                rightYear,
                spanYears:false,
            },
            dataPath: [],
            matrixLocation: {column:0},
            dataNode:node,
        }

        let budgetNode:BudgetNode = new BudgetNode(budgetNodeParms)

        let cellindex: any
        let selectfn = onChartComponentSelection(userselections)(budgetdata)(chartmatrixrow)(callbacks)
        let {
            Configuration: viewpointConfig,
            itemseriesconfigdata: itemseriesConfig,
        } = budgetdata.viewpointdata
        let configData = {
            viewpointConfig,
            itemseriesConfig,
        }
        for (cellindex in budgetNode.cells) {
            let budgetCell = budgetNode.cells[cellindex]
            let props: GetCellChartProps = {
                chartIndex: cellindex,
                configData,
                userselections,
            }

            let fcurrent = selectfn(0)(cellindex)

            chartParmsObj = budgetNode.getChartParms(props, {current:fcurrent,next:selectfn})

            if (!chartParmsObj.isError) {

                budgetCell.chartparms = chartParmsObj.chartParms
                budgetCell.chartCode =
                    ChartTypeCodes[budgetCell.chartparms.chartType]

            } else {
                break
            }
        }
        if (!chartParmsObj.isError) {
            matrixlocation = budgetNode.matrixLocation
            chartmatrixrow[matrixlocation.column] = budgetNode
        }

        // -------------[ SAVE INITIALIZATION ]----------------

        // refreshPresentation()

    }


}

export default BudgetBranch