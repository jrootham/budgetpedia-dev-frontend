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
} from '../modules/interfaces'
import getBudgetNode from '../modules/getbudgetnode'
import BudgetNode from './budgetnode'
import { BranchSettings } from '../components/explorerbranch'
import { 
    createChildNode,
    // ChartSelectionContext,
    CreateChildNodeProps,
    // CreateChildNodeCallbacks,
    onChartComponentSelection,
} from '../modules/onchartcomponentselection'

import { ChartTypeCodes, ChartCodeTypes } from '../../constants'


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

    public initializeChartSeries(props, callbacks) {

        let { branchsettings, viewpointdata }:{branchsettings:BranchSettings,viewpointdata:any}= props
        let chartmatrixrow = this.nodes
        let budgetdata = this.data
        let chartParmsObj: ChartParmsObj

        budgetdata.viewpointdata = viewpointdata
        // *** CREATE BRANCH
        // -----------------[ THE DRILLDOWN ROOT ]-----------------
        let datapath = []
        let node = getBudgetNode(viewpointdata, datapath)

        let {
            chartType:defaultChartType,
            viewpoint:viewpointName,
            facet:facetName,
            latestYear:rightYear,
        } = branchsettings

        let budgetNodeParms = {
            viewpointName,
            facetName,
            timeSpecs: {
                leftYear:null,
                rightYear,
                spanYears:false,
                firstYear: null,
                lastYear: null,
            },
            defaultChartType,
            portalCharts:viewpointdata.PortalCharts,
            dataPath: [],
            nodeIndex:0,
            dataNode:node,
        }

        let budgetNode:BudgetNode = new BudgetNode(budgetNodeParms)

        let cellindex: any
        let selectfn = onChartComponentSelection(branchsettings)(budgetdata)(chartmatrixrow)(callbacks)
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
                branchsettings,
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
            let { nodeIndex } = budgetNode
            chartmatrixrow[nodeIndex] = budgetNode
        }

    }

    switchFacet(props, callbacks) {
        let switchResults = {
            deeperdata: false,
            shallowerdata: false,
        }
        let {viewpointdata, branchsettings} = props
        let budgetdata = this.data
        budgetdata.viewpointdata = viewpointdata

        let chartmatrixrow = this.nodes

        let budgetNode: BudgetNode = null
        let parentBudgetNode: BudgetNode
        let cellptr: any
        let isError = false
        let chartParmsObj: ChartParmsObj = null

        let fn = onChartComponentSelection(branchsettings)(budgetdata)(chartmatrixrow)(callbacks)

        for (cellptr in chartmatrixrow) {
            parentBudgetNode = budgetNode
            budgetNode = chartmatrixrow[cellptr]
            let nextdataNode = getBudgetNode(viewpointdata, budgetNode.dataPath)
            if (nextdataNode) {
                // check previous cell configuration against previous node
                // TODO: THIS IS A PROXY THAT NEEDS TO BE REPLACED
                // there is only one chart where there should be 2
                let deeperdata = (!!nextdataNode.Components && (budgetNode.cells.length == 1))
                // there are two charts where there should be 1
                let shallowerdata = (!nextdataNode.Components && (budgetNode.cells.length == 2))
                // now set budgetNode with new data node
                budgetNode.update(
                    nextdataNode,
                    // viewpointdata.PortalCharts,
                    // branchsettings.charttype,
                    branchsettings.facet
                )
                if ( deeperdata || shallowerdata) {
                    switchResults.deeperdata = deeperdata
                    switchResults.shallowerdata = shallowerdata
                    // replace budgetNode
                    isError = true
                    let prevBudgetNode: BudgetNode = chartmatrixrow[cellptr - 1]
                    chartmatrixrow.splice(cellptr)

                    let prevBudgetCell = prevBudgetNode.cells[0]

                    let context = {
                        selection:prevBudgetCell.chartselection,
                        ChartObject: prevBudgetCell.ChartObject,
                    }

                    let childprops: CreateChildNodeProps = {
                        budgetNode:prevBudgetNode,
                        branchsettings,
                        budgetdata,
                        chartmatrixrow,
                        selectionrow: prevBudgetCell.chartselection[0].row,
                        nodeIndex: prevBudgetNode.nodeIndex,
                        cellIndex:0,
                        context,
                        chart:prevBudgetCell.chart,
                    }
                    let fcurrent = fn(cellptr)(0)
                    createChildNode(childprops, callbacks,{current:fcurrent,next:fn})
                    budgetNode = null // chartmatrixrow[cellptr] // created by createChildNode as side effect
                }
            } else {
                console.error('no data node')
            }
            let nodecellindex: any = null
            if (!budgetNode) break
            let configData = {
                viewpointConfig:budgetdata.viewpointdata.Configuration,
                itemseriesConfig:budgetdata.viewpointdata.itemseriesconfigdata,
            }
            for (nodecellindex in budgetNode.cells) {
                let props: GetCellChartProps = {
                    chartIndex: nodecellindex,
                    branchsettings,
                    configData,
                }
                let fcurrent = fn(cellptr)(nodecellindex),
                chartParmsObj = budgetNode.getChartParms(props, {current:fcurrent,next:fn})
                if (chartParmsObj.isError) {
                    chartmatrixrow.splice(cellptr)
                    if (cellptr > 0) { // unset the selection of the parent
                        let parentBudgetNode: BudgetNode = chartmatrixrow[cellptr - 1]
                        let parentBudgetCell = parentBudgetNode.cells[nodecellindex]
                        // disable reselection
                        parentBudgetCell.chartselection = null
                        parentBudgetCell.chart = null
                    }
                    isError = true
                    break
                } else {
                    // TODO: this should be set through reset
                    // budgetNode.facetName = facet
                    let budgetCell = budgetNode.cells[nodecellindex]
                    budgetCell.chartparms = chartParmsObj.chartParms
                    budgetCell.chartCode =
                        ChartTypeCodes[budgetCell.chartparms.chartType]
                    if (parentBudgetNode) {
                        budgetNode.parentData.dataNode = parentBudgetNode.dataNode
                    }
                }
            }
        }
        return switchResults
    }

    switchChartCode(props, callbacks) {
        let {
            branchsettings,
            nodeIndex,
            cellIndex,
            chartCode,
        } = props
        let chartType = ChartCodeTypes[chartCode]
        // let cellIndex = location.cellIndex
        let chartmatrixrow = this.nodes
        let budgetNode: BudgetNode = chartmatrixrow[nodeIndex]
        let budgetCell = budgetNode.cells[cellIndex]
        let switchResults = {
            budgetCell,
        }
        let oldChartType = budgetCell.googleChartType
        budgetCell.googleChartType = chartType
        let budgetdata = this.data
        let configData = {
            viewpointConfig:budgetdata.viewpointdata.Configuration,
            itemseriesConfig:budgetdata.viewpointdata.itemseriesconfigdata,
        }        
        let chartprops: GetCellChartProps = {
            chartIndex: cellIndex,
            branchsettings,
            configData,
        }
        let fn = onChartComponentSelection(branchsettings)(budgetdata)(chartmatrixrow)(callbacks)
        let fncurrent = fn(nodeIndex)(cellIndex)
        let chartParmsObj: ChartParmsObj = budgetNode.getChartParms(chartprops,{current: fncurrent, next: fn})
        if (!chartParmsObj.isError) {
            budgetCell.chartparms = chartParmsObj.chartParms
            budgetCell.chartCode =
                ChartTypeCodes[budgetCell.chartparms.chartType]
        } else {
            budgetCell.googleChartType = oldChartType
        }
        return switchResults
    }

}

export default BudgetBranch