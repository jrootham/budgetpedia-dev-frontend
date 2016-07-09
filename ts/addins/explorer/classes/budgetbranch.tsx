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
    BranchSettings,
} from '../modules/interfaces'
import getBudgetNode from '../modules/getbudgetnode'
import BudgetNode from './budgetnode'
import { 
    createChildNode,
    // ChartSelectionContext,
    CreateChildNodeProps,
    // CreateChildNodeCallbacks,
    onChartComponentSelection,
} from '../modules/onchartcomponentselection'

import { ChartTypeCodes, ChartCodeTypes } from '../../constants'


interface BudgetBranchParms {
    settings:BranchSettings,
    uid:string,
}

class BudgetBranch {
    constructor(parms:BudgetBranchParms) {
        this.settings = parms.settings
        this.uid = parms.uid
    }

    public data = {viewpointdata:null}

    get nodes() {
        let branchNodes = this.state.branchNodes
        let copy = [...branchNodes]
        return copy // new copy
    }

    public settings:BranchSettings

    public uid:string

    public actions:any

    get state() {
        return this.getState()
    }

    public getState: Function

    public setState: Function

    public initializeChartSeries(callbacks, actions) {

        let branchsettings = this.settings
        let viewpointdata = this.getViewpointData()

        // *** CREATE BRANCH
        // -----------------[ THE DRILLDOWN ROOT ]-----------------
        let datapath = []

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
        }
        // do this:
        // let budgetNode:BudgetNode = new BudgetNode(budgetNodeParms, dataNode)
        // TEMPORARILY COMMENTED OUT
        // this.actions.addNode(budgetNodeParms)

        let node = getBudgetNode(viewpointdata, datapath)
        let budgetNode:BudgetNode = new BudgetNode(budgetNodeParms, node)

        let branchNodes = this.nodes
        let budgetdata = this.data
        let chartParmsObj: ChartParmsObj
        let cellindex: any
        let selectfn = onChartComponentSelection(branchsettings)(budgetdata)(branchNodes)(callbacks)(actions)
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
            branchNodes[nodeIndex] = budgetNode
            this.setState({
                branchNodes,
            })
        }

    }

    switchFacet(callbacks, actions) {
        let switchResults = {
            deeperdata: false,
            shallowerdata: false,
        }
        let branchsettings: BranchSettings = this.settings
        let viewpointdata = this.getViewpointData()
        let budgetdata = this.data

        let branchNodes = this.nodes

        let budgetNode: BudgetNode = null
        let parentBudgetNode: BudgetNode
        let nodeIndex: any
        let isError = false
        let chartParmsObj: ChartParmsObj = null

        let fn = onChartComponentSelection(branchsettings)(budgetdata)(branchNodes)(callbacks)(actions)

        for (nodeIndex in branchNodes) {
            parentBudgetNode = budgetNode
            budgetNode = branchNodes[nodeIndex]
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
                    branchsettings.facet
                )
                if ( deeperdata || shallowerdata) {
                    switchResults.deeperdata = deeperdata
                    switchResults.shallowerdata = shallowerdata
                    // replace budgetNode
                    isError = true
                    let prevBudgetNode: BudgetNode = branchNodes[nodeIndex - 1]
                    branchNodes.splice(nodeIndex)

                    let prevBudgetCell = prevBudgetNode.cells[0]

                    let context = {
                        selection:prevBudgetCell.chartselection,
                        ChartObject: prevBudgetCell.ChartObject,
                    }

                    let childprops: CreateChildNodeProps = {
                        budgetNode:prevBudgetNode,
                        branchsettings,
                        budgetdata,
                        branchNodes,
                        selectionrow: prevBudgetCell.chartselection[0].row,
                        nodeIndex: prevBudgetNode.nodeIndex,
                        cellIndex:0,
                        context,
                        chart:prevBudgetCell.chart,
                    }
                    let fcurrent = fn(nodeIndex)(0)
                    createChildNode(childprops, callbacks,{current:fcurrent,next:fn}, actions)
                    budgetNode = null // branchNodes[nodeIndex] // created by createChildNode as side effect
                }
            } else {
                console.error('no data node')
            }
            let nodeCellIndex: any = null
            if (!budgetNode) break
            let configData = {
                viewpointConfig:budgetdata.viewpointdata.Configuration,
                itemseriesConfig:budgetdata.viewpointdata.itemseriesconfigdata,
            }
            for (nodeCellIndex in budgetNode.cells) {
                let props: GetCellChartProps = {
                    chartIndex: nodeCellIndex,
                    branchsettings,
                    configData,
                }
                let fcurrent = fn(nodeIndex)(nodeCellIndex),
                chartParmsObj = budgetNode.getChartParms(props, {current:fcurrent,next:fn})
                if (chartParmsObj.isError) {
                    branchNodes.splice(nodeIndex)
                    if (nodeIndex > 0) { // unset the selection of the parent
                        let parentBudgetNode: BudgetNode = branchNodes[nodeIndex - 1]
                        let parentBudgetCell = parentBudgetNode.cells[nodeCellIndex]
                        // disable reselection
                        parentBudgetCell.chartselection = null
                        parentBudgetCell.chart = null
                    }
                    isError = true
                    break
                } else {
                    // TODO: this should be set through reset
                    // budgetNode.facetName = facet
                    let budgetCell = budgetNode.cells[nodeCellIndex]
                    budgetCell.chartparms = chartParmsObj.chartParms
                    budgetCell.chartCode =
                        ChartTypeCodes[budgetCell.chartparms.chartType]
                    if (parentBudgetNode) {
                        budgetNode.parentData.dataNode = parentBudgetNode.dataNode
                    }
                }
            }
        }
        this.setState({
            branchNodes,
        })
        return switchResults
    }

    switchChartCode(props, callbacks, actions) {
        let branchsettings: BranchSettings = this.settings
        let {
            nodeIndex,
            cellIndex,
            chartCode,
        } = props
        let chartType = ChartCodeTypes[chartCode]

        let branchNodes = this.nodes
        let budgetNode: BudgetNode = branchNodes[nodeIndex]
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
        let fn = onChartComponentSelection(branchsettings)(budgetdata)(branchNodes)(callbacks)(actions)
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

    public getViewpointData = () => {

        let branchsettings:BranchSettings = this.settings

        let { 
            viewpoint: viewpointname, 
            facet: dataseriesname, 
            inflationAdjusted,
        } = branchsettings

        let viewpointdata:Viewpoint = databaseapi.getViewpointData({
            viewpointname, 
            dataseriesname,
            inflationAdjusted,
            timeSpecs: {
                leftYear: null,
                rightYear: null,
                spanYears: false,
                firstYear: null,
                lastYear: null,
            }
        })

        this.data.viewpointdata = viewpointdata

        return viewpointdata
    }

}


export default BudgetBranch