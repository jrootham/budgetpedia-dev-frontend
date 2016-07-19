// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// budgetbranch.tsx

import databaseapi , { DatasetConfig, TimeSpecs, ViewpointData } from './databaseapi'
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
    SortedComponentItem,
    GetCellChartProps,
    BranchSettings,
} from '../modules/interfaces'
import getBudgetNode from '../modules/getbudgetnode'
import BudgetNode from './budgetnode'
import { 
    // createChildNode,
    // ChartSelectionContext,
    CreateChildNodeProps,
    // CreateChildNodeCallbacks,
    onChartComponentSelection,
} from '../modules/onchartcomponentselection'
import * as ExplorerActions from '../actions'

import { BudgetNodeParms } from './budgetnode'
import BudgetCell from './budgetcell'

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

    get nodes() {
        let branchNodes = this.state.branchNodes
        let copy = [...branchNodes]
        return copy // new copy
    }

    public settings:BranchSettings

    public uid: string

    public actions: any

    public nodeCallbacks: any

    get state() {
        return this.getState()
    }

    public getState: Function

    public setState: Function

    public getProps: Function

    public initializeBranch = () => {

        let branchsettings = this.settings
        let viewpointdata = this.state.viewpointData

        // *** CREATE BRANCH
        // -----------------[ THE DRILLDOWN ROOT ]-----------------
        let datapath = []

        let {
            chartType:defaultChartType,
            viewpoint:viewpointName,
            facet:facetName,
            latestYear:rightYear,
        } = branchsettings

        let budgetNodeParms:BudgetNodeParms = {
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

        this.actions.addNode(budgetNodeParms)

    }

    addNode = (budgetNodeUid, nodeIndex, budgetNodeParms:BudgetNodeParms) => {

        let { actions, nodeCallbacks:callbacks } = this

        let { dataPath } = budgetNodeParms
        let branchsettings = this.settings

        let viewpointdata = this.state.viewpointData
        let datanode = getBudgetNode(viewpointdata, dataPath)
        let branchNodes = this.nodes
        let parentNode = (nodeIndex == 0)?undefined:branchNodes[branchNodes.length - 1].dataNode
        let budgetNode:BudgetNode = new BudgetNode(budgetNodeParms, budgetNodeUid, datanode, parentNode)

        let budgetdata = {viewpointdata:this.state.viewpointData}
        let chartParmsObj: ChartParmsObj = {} as ChartParmsObj
        let cellindex: any
        let branchuid = this.uid
        let selectfn = onChartComponentSelection(this)
        let {
            Configuration: viewpointConfig,
            itemseriesconfigdata: itemseriesConfig,
        } = budgetdata.viewpointdata
        let configData = {
            viewpointConfig,
            itemseriesConfig,
        }
        for (cellindex in budgetNode.cells) {
            let budgetCell:BudgetCell = budgetNode.cells[cellindex]
            let props: GetCellChartProps = {
                chartIndex: cellindex,
                configData,
                branchsettings,
            }

            let fcurrent = selectfn(nodeIndex)(cellindex)

            chartParmsObj = budgetNode.getChartParms(props, {current:fcurrent,next:selectfn})

            if (!chartParmsObj.isError) {

                budgetCell.chartParms = chartParmsObj.chartParms
                budgetCell.chartCode =
                    ChartTypeCodes[budgetCell.chartParms.chartType]

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

    switchFacet() {
        let { actions, nodeCallbacks:callbacks } = this
        let switchResults = {
            deeperdata: false,
            shallowerdata: false,
        }
        let branchsettings: BranchSettings = this.settings
        let viewpointData = this.state.viewpointData

        let branchNodes = this.nodes

        let budgetNode: BudgetNode = null
        let parentBudgetNode: BudgetNode
        let nodeIndex: any
        let isError = false
        let chartParmsObj: ChartParmsObj = null
        let branchuid = this.uid
        let fn = onChartComponentSelection(this)

        for (nodeIndex in branchNodes) {
            parentBudgetNode = budgetNode
            budgetNode = branchNodes[nodeIndex]
            let nextdataNode = getBudgetNode(viewpointData, budgetNode.dataPath)
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
                    let removed = branchNodes.splice(nodeIndex)
                    let removedids = removed.map((item) => {
                        return item.uid
                    })
                    actions.removeNode(this.getProps().callbackuid, removedids)
                    setTimeout(()=> {

                        let prevBudgetCell:BudgetCell = prevBudgetNode.cells[0]

                        let chartSelectionData = {
                            selection:prevBudgetCell.chartSelection,
                        }

                        let childprops: CreateChildNodeProps = {
                            selectionrow: prevBudgetCell.chartSelection[0].row,
                            nodeIndex: prevBudgetNode.nodeIndex,
                            cellIndex:0,
                            chartSelectionData,
                        }
                        let fcurrent = fn(nodeIndex)(0)
                        let budgetBranch = this
                        budgetBranch.createChildNode(childprops)
                    })
                    budgetNode = null // branchNodes[nodeIndex] // created by createChildNode as side effect
                }
            } else {
                console.error('no data node')
            }
            let nodeCellIndex: any = null
            if (!budgetNode) break
            let configData = {
                viewpointConfig:viewpointData.Configuration,
                itemseriesConfig:viewpointData.itemseriesconfigdata,
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
                    let removed = branchNodes.splice(nodeIndex)
                    let removedids = removed.map((item) => {
                        return item.uid
                    })
                    // actions.removeNode(this.getProps().callbackuid, removedids)
                    if (nodeIndex > 0) { // unset the selection of the parent
                        let parentBudgetNode: BudgetNode = branchNodes[nodeIndex - 1]
                        let parentBudgetCell = parentBudgetNode.cells[nodeCellIndex]
                        // disable reselection
                        parentBudgetCell.chartSelection = null
                        // parentBudgetCell.chart = null
                    }
                    isError = true
                    break
                } else {
                    // TODO: this should be set through reset
                    budgetNode.facetName = branchsettings.facet
                    let budgetCell:BudgetCell = budgetNode.cells[nodeCellIndex]
                    budgetCell.chartParms = chartParmsObj.chartParms
                    budgetCell.chartCode =
                        ChartTypeCodes[budgetCell.chartParms.chartType]
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

    switchChartCode(props) {
        let { actions, nodeCallbacks:callbacks } = this
        let branchsettings: BranchSettings = this.settings
        let {
            nodeIndex,
            cellIndex,
            chartCode,
        } = props
        let chartType = ChartCodeTypes[chartCode]

        let branchNodes = this.nodes
        let budgetNode: BudgetNode = branchNodes[nodeIndex]
        let budgetCell:BudgetCell = budgetNode.cells[cellIndex]
        let switchResults = {
            budgetCell,
        }
        let oldChartType = budgetCell.googleChartType
        budgetCell.googleChartType = chartType
        let budgetdata = {viewpointdata:this.state.viewpointData}
        let configData = {
            viewpointConfig:budgetdata.viewpointdata.Configuration,
            itemseriesConfig:budgetdata.viewpointdata.itemseriesconfigdata,
        }        
        let chartprops: GetCellChartProps = {
            chartIndex: cellIndex,
            branchsettings,
            configData,
        }
        let branchuid = this.uid
        let fn = onChartComponentSelection(this)
        let fncurrent = fn(nodeIndex)(cellIndex)
        let chartParmsObj: ChartParmsObj = budgetNode.getChartParms(chartprops,{current: fncurrent, next: fn})
        if (!chartParmsObj.isError) {
            budgetCell.chartParms = chartParmsObj.chartParms
            budgetCell.chartCode =
                ChartTypeCodes[budgetCell.chartParms.chartType]
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

        let viewpointdata:ViewpointData = databaseapi.getViewpointData({
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

        this.setState({
            viewpointData:viewpointdata
        })

    }

    createChildNode = ( props: CreateChildNodeProps ) => {

        let budgetBranch = this

        let { 
            nodes: branchNodes, 
            nodeCallbacks:callbacks, 
            actions, 
            settings:branchsettings,
        } = budgetBranch

        let viewpointData = budgetBranch.state.viewpointData

        let {
            selectionrow,
            nodeIndex,
            cellIndex,
            chartSelectionData,
        } = props

        let budgetNode = branchNodes[nodeIndex]

        let { facetName:facet, viewpointName } = budgetNode

        let {
            workingStatus,
            // refreshPresentation,
            onPortalCreation,
            updateChartSelections,
            // updateBranchNodesState,
        } = callbacks

        // ----------------------------------------------------
        // ----------------[ create child ]--------------------
        // copy path
        let childdatapath = budgetNode.dataPath.slice()

        let dataNode = budgetNode.dataNode

        if (!dataNode.Components) {
            updateChartSelections()
            return
        }

        let components = dataNode.Components

        let code = null
        let parentdata: SortedComponentItem = null
        let parentNode: any = null
        if (dataNode && dataNode.SortedComponents && dataNode.SortedComponents[selectionrow]) {
            parentdata = dataNode.SortedComponents[selectionrow]
            parentNode = dataNode
            code = parentdata.Code
        }
        if (code)
            childdatapath.push(code)
        else {
            updateChartSelections()
            return
        }

        let newnode = dataNode.Components[code]
        if (!newnode.Components && !newnode.Categories) {
            updateChartSelections()
            return
        }
        workingStatus(true)
        let budgetCell:BudgetCell = budgetNode.cells[cellIndex]

        budgetCell.chartSelection = chartSelectionData.selection

        let newrange = Object.assign({}, budgetNode.timeSpecs)
        let charttype = branchsettings.chartType
        let chartCode = ChartTypeCodes[charttype]
        let portalcharts = viewpointData.PortalCharts

        let newdatanode = getBudgetNode(viewpointData, childdatapath)
        let newnodeconfigparms: BudgetNodeParms = {
            portalCharts: portalcharts,
            defaultChartType:charttype,
            viewpointName:viewpointName,
            facetName:facet,
            dataPath: childdatapath,
            nodeIndex: nodeIndex + 1,
            parentData: parentdata,
            timeSpecs: newrange,
        }

        actions.addNode(newnodeconfigparms)

        setTimeout(() => {

            workingStatus(false)
            setTimeout(() => {
                updateChartSelections()
                onPortalCreation()
            })

        })
    }

}



export default BudgetBranch