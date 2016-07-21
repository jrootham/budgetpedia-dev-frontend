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
import { ExplorerBranchActions } from '../components/explorerbranch'

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

    public actions: ExplorerBranchActions

    public nodeCallbacks: any

    get state() {
        return this.getState()
    }

    public getState: Function

    public setState: Function

    public getProps: Function

    // this generates a trigger to create a budget node object
    public initializeBranchNodeDeclarations = () => {

        let defaults = this.getProps().declarationData.defaults.node

        let branchSettings = this.settings
        let viewpointdata = this.state.viewpointData

        // *** CREATE BRANCH
        // -----------------[ THE DRILLDOWN ROOT ]-----------------
        let datapath = []

        let {
            viewpoint:viewpointName,
            facet:facetName,
            latestYear:rightYear,
        } = branchSettings

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
            portalCharts:viewpointdata.PortalCharts,
            dataPath: [],
            nodeIndex:0,
        }

        budgetNodeParms = Object.assign(defaults, budgetNodeParms )

        this.actions.addNodeDeclaration(budgetNodeParms)

    }

    // this is a response to the addNode action
    addNode = (budgetNodeUid, nodeIndex, budgetNodeParms:BudgetNodeParms) => {

        let { actions, nodeCallbacks:callbacks } = this

        let { dataPath } = budgetNodeParms
        let branchSettings = this.settings

        let viewpointData = this.state.viewpointData
        let dataNode = getBudgetNode(viewpointData, dataPath)
        let branchNodes = this.nodes
        let parentNode = (nodeIndex == 0)? undefined: branchNodes[branchNodes.length - 1].dataNode
        let budgetNode:BudgetNode = new BudgetNode(budgetNodeParms, budgetNodeUid, dataNode, parentNode)
        branchNodes[nodeIndex] = budgetNode
        this.setState({
            branchNodes,
        })

    }

    // this resets the branch in response to the change facet user request
    switchFacet() {
        let { actions, nodeCallbacks:callbacks } = this
        let switchResults = {
            deeperdata: false,
            shallowerdata: false,
        }
        let branchSettings: BranchSettings = this.settings
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
                    branchSettings.facet
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
                    actions.removeNodeDeclaration(this.uid, removedids)
                    setTimeout(()=> {

                        let prevBudgetCell:BudgetCell = prevBudgetNode.cells[0]

                        let chartSelectionData = {
                            selection:prevBudgetCell.chartSelection,
                        }

                        let childprops: CreateChildNodeProps = {
                            selectionrow: prevBudgetCell.chartSelection[0].row,
                            nodeIndex: prevBudgetNode.nodeIndex,
                            cellIndex:0,
                            // chartSelectionData,
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
        }

        this.setState({
            branchNodes,
        })
        return switchResults
    }

    public getViewpointData = () => {

        let branchSettings:BranchSettings = this.settings

        let { 
            viewpoint: viewpointname, 
            facet: dataseriesname, 
            inflationAdjusted,
        } = branchSettings

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
            settings:branchSettings,
        } = budgetBranch

        let viewpointData = budgetBranch.state.viewpointData

        let {
            selectionrow,
            nodeIndex,
            cellIndex,
            // chartSelectionData,
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
        let newrange = Object.assign({}, budgetNode.timeSpecs)
        let portalcharts = viewpointData.PortalCharts

        let newdatanode = getBudgetNode(viewpointData, childdatapath)
        let newnodeconfigparms: BudgetNodeParms = {
            portalCharts: portalcharts,
            viewpointName:viewpointName,
            facetName:facet,
            dataPath: childdatapath,
            nodeIndex: nodeIndex + 1,
            parentData: parentdata,
            timeSpecs: newrange,
        }

        actions.addNodeDeclaration(newnodeconfigparms)

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