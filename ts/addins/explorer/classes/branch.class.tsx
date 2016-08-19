// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// budgetbranch.tsx

import databaseapi , { DatasetConfig, YearSpecs, ViewpointData } from './databaseapi'
import {
    ChartParmsObj,
    SortedComponentItem,
    GetCellChartProps,
    BranchSettings,
} from '../modules/interfaces'
import getBudgetNode from '../modules/getbudgetnode'
import BudgetNode,{ BudgetNodeParms } from './node.class'
import * as ExplorerActions from '../actions'

import BudgetCell from './cell.class'
import { ExplorerBranchActions } from '../components/explorerbranch'
import { 
    AspectNameToDatasetName, 
} from '../constants'

// import { GoogleChartTypeToChartCode, ChartCodeToGoogleChartType } from '../../constants'

export interface CreateChildNodeProps {
    selectionrow: any,
    nodeIndex: number,
    cellIndex: number,
}

interface BudgetBranchParms {
    // settings:BranchSettings,
    uid:string,
}

class BudgetBranch {
    constructor(parms:BudgetBranchParms) {
        // this.settings = parms.settings
        this.uid = parms.uid
    }

    get nodes() {
        let copy = [...this.state.branchNodes]
        return copy // new copy
    }

    // public settings:BranchSettings

    get settings() {
        return this.props.declarationData.branchesById[this.uid]
    }

    public uid: string

    public actions: ExplorerBranchActions

    public nodeCallbacks: any

    get state() {
        return this.getState()
    }

    get props() {
        return this.getProps()
    }

    public getState: Function

    public getProps: Function

    public setState: Function

    // this generates a trigger to create a budget node object
    public getInitialBranchNodeParms = () => {

        let defaults = this.getProps().declarationData.defaults.node

        let branchSettings = this.settings
        let viewpointData = this.state.viewpointData

        let datapath = []

        let {
            viewpoint:viewpointName,
            aspect:aspectName,
        } = branchSettings

        let budgetNodeParms:BudgetNodeParms = {
            viewpointName,
            aspectName,
            yearSpecs: {
                firstYear: null,
                lastYear: null,
            },
            // datasetSpecs:viewpointData.DatasetSeries,
            dataPath: [],
            nodeIndex:0,
        }

        budgetNodeParms = Object.assign( defaults, budgetNodeParms )

        return budgetNodeParms

    }

    // this is a response to the addNode action
    addNode = (budgetNodeUid, nodeIndex, budgetNodeParms:BudgetNodeParms) => {

        let { actions, nodeCallbacks:callbacks } = this

        let { dataPath } = budgetNodeParms
        let branchSettings = this.settings

        let viewpointData = this.state.viewpointData
        let treeNodeData = getBudgetNode(viewpointData, dataPath)
        let branchNodes = this.nodes
        let parentNode = (nodeIndex == 0)? null: branchNodes[branchNodes.length - 1]
        let budgetNode:BudgetNode = new BudgetNode(budgetNodeParms, budgetNodeUid, treeNodeData, parentNode)
        branchNodes[nodeIndex] = budgetNode
        this.setState({
            branchNodes,
        })

    }

    saveAspectState = () => {
        let budgetBranch = this
        let nodes = budgetBranch.nodes
        for (let node of nodes) {
            node.oldAspectState = node.cells.length
        }
    }

    // this resets the branch in response to the change aspect user request
    switchAspect = () => {

        let { actions, nodeCallbacks:callbacks } = this
        let switchResults = {
            deeperdata: false,
            shallowerdata: false,
            mismatch:false,
            message:null,
        }
        let branchSettings: BranchSettings = this.settings
        let viewpointData = this.state.viewpointData

        let branchNodes:BudgetNode[] = this.nodes

        let budgetNode: BudgetNode = null
        let parentBudgetNode: BudgetNode
        let nodeIndex: any
        let isError = false
        let chartParmsObj: ChartParmsObj = null
        let branchuid = this.uid

        for (nodeIndex in branchNodes) {

            parentBudgetNode = budgetNode
            budgetNode = branchNodes[nodeIndex]
            let dataNode = getBudgetNode(viewpointData, budgetNode.dataPath)
            if (dataNode) {
                // check previous cell configuration against previous node
                // TODO: THIS IS A PROXY THAT NEEDS TO BE REPLACED
                // there is only one chart where there should be 2
                let deeperdata = (!!dataNode.Components && (budgetNode.oldAspectState == 1))
                // there are two charts where there should be 1
                let shallowerdata = (!dataNode.Components && (budgetNode.oldAspectState == 2))
                // now set budgetNode with new data node
                let parentDataNode = null
                if (nodeIndex > 0) {
                    parentDataNode = branchNodes[nodeIndex-1].treeNodeData
                }
                if ( deeperdata || shallowerdata) {
                    switchResults.deeperdata = deeperdata
                    switchResults.shallowerdata = shallowerdata
                    // replace budgetNode
                    isError = true
                    let prevBudgetNode: BudgetNode = branchNodes[nodeIndex - 1]
                    let removed = branchNodes.splice(nodeIndex)
                    let removedids = removed.map((item:BudgetNode) => {
                        return {nodeuid:item.uid, cellList:item.cellDeclarationList}
                    })
                    actions.removeNodeDeclarations(removedids)
                    setTimeout(()=> {

                        let prevBudgetCell:BudgetCell = prevBudgetNode.cells[0]

                        let childprops: CreateChildNodeProps = {
                            selectionrow: prevBudgetCell.chartSelection[0].row,
                            nodeIndex: prevBudgetNode.nodeIndex,
                            cellIndex:0,
                            // chartSelectionData,
                        }
                        // let fcurrent = fn(nodeIndex)(0)
                        let budgetBranch = this
                        budgetBranch.createChildNode(childprops)
                    })
                    budgetNode = null // branchNodes[nodeIndex] // created by createChildNode as side effect
                } else {
                    budgetNode.update(
                        branchSettings.aspect,
                        dataNode,
                        parentDataNode
                    )
                    let newCells = budgetNode.resetCells()
                    budgetNode.newCells = newCells
                }
            } else {
                // console.error('Sytem Error: no data node', budgetNode, viewpointData)
                let removed = branchNodes.splice(nodeIndex)
                let removedids = removed.map((item:BudgetNode) => {
                    return {nodeuid:item.uid, cellList:item.cellDeclarationList}
                })
                actions.removeNodeDeclarations(removedids)
                switchResults.mismatch = true
                switchResults.message = 'The new aspect does not have a matching chart for ' + 
                    budgetNode.treeNodeMetaData.Name
                let cells = parentBudgetNode.cells
                for (let cell of cells) {
                    let theCell:BudgetCell = cell
                    if (theCell.chartSelection) {
                        theCell.chartSelection = null
                    }
                }
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
            viewpoint: viewpointName, 
            aspect: aspectName, 
            inflationAdjusted,
        } = branchSettings

        let datasetName = AspectNameToDatasetName[aspectName]

        let _promise = databaseapi.getViewpointData({
            viewpointName, 
            versionName:'PBFT',
            datasetName,
            inflationAdjusted
        })

        let promise = new Promise(resolve => {

            _promise.then( (viewpointdata:ViewpointData) => {

                this.props.globalStateActions.changeBranchData(this.uid)
                this.setState({
                    viewpointData:viewpointdata
                })

                resolve(true)
                
            })

        })

        return promise
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

        let { aspectName, viewpointName } = budgetNode

        let {
            workingStatus,
            // refreshPresentation,
            onPortalCreation,
            // updateChartSelections,
            // updateBranchNodesState,
        } = callbacks

        // ----------------------------------------------------
        // ----------------[ create child ]--------------------
        // copy path
        let childdatapath = budgetNode.dataPath.slice()

        let treeNodeData = budgetNode.treeNodeData

        if (!treeNodeData.Components) {
            // updateChartSelections()
            return
        }

        let components = treeNodeData.Components

        let code = null
        let treeNodeMetaData: SortedComponentItem = null
        let parentNode: any = null
        if (treeNodeData && treeNodeData.SortedComponents && treeNodeData.SortedComponents[selectionrow]) {
            treeNodeMetaData = treeNodeData.SortedComponents[selectionrow]
            parentNode = treeNodeData
            code = treeNodeMetaData.Code
        }
        if (code)
            childdatapath.push(code)
        else {
            // updateChartSelections()
            return
        }

        let newnode = treeNodeData.Components[code]
        if (!newnode.Components && !newnode.CommonObjects) {
            // updateChartSelections()
            return
        }
        workingStatus(true)
        let newrange = Object.assign({}, budgetNode.yearSpecs)
        // let datasetSpecs = viewpointData.DatasetSeries

        let newdatanode = getBudgetNode(viewpointData, childdatapath)
        let newnodeconfigparms: BudgetNodeParms = {
            // datasetSpecs,
            viewpointName,
            aspectName,
            dataPath: childdatapath,
            nodeIndex: nodeIndex + 1,
            treeNodeMetaData,
            yearSpecs: newrange,
        }

        actions.addNodeDeclaration(newnodeconfigparms)

        setTimeout(() => {

            workingStatus(false)
            setTimeout(() => {
                // updateChartSelections()
                onPortalCreation()
            })

        })
    }

}


export default BudgetBranch