// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// budgetcell.tsx

import {
    ChartParms,
    CellCallbacks
} from '../modules/interfaces'

import {
    ChartSelectionCell,
} from '../modules/onchartcomponentselection'
import { GoogleChartTypeToChartCode, ChartCodeToGoogleChartType } from '../../constants'

export interface CellDeclaration {
    nodeDatasetName:string, 
    chartCode:string, 
    chartSelection:ChartSelectionCell[],
    uid?: string,
}

class BudgetCell {

    constructor(specs:CellDeclaration) {
        let { nodeDatasetName, chartCode, chartSelection, uid } = specs
        this.nodeDatasetName = nodeDatasetName
        this.chartCode = chartCode
        this.chartSelection = chartSelection
        this.uid = uid
    }

    // primary properties
    nodeDatasetName:string
    chartSelection: ChartSelectionCell[]
    chartCode: string
    uid: string

    // derivative properties
    chartComponent: any // the react Chart component, allows access to google chart objects
    get googleChartType() {
        return ChartCodeToGoogleChartType[this.chartCode]
    }
    chartParms: ChartParms
    get chart() {
        return this.chartComponent.chart
    }
    cellCallbacks: CellCallbacks
    expandable: boolean
    graph_id: string
    cellTitle: string


    // switchChartCode(props) {
    //     let { actions, nodeCallbacks:callbacks } = this
    //     let branchsettings: BranchSettings = this.settings
    //     let {
    //         nodeIndex,
    //         cellIndex,
    //         chartCode,
    //     } = props
    //     let chartType = ChartCodeToGoogleChartType[chartCode]

    //     let branchNodes = this.nodes
    //     let budgetNode: BudgetNode = branchNodes[nodeIndex]
    //     let budgetCell:BudgetCell = budgetNode.cells[cellIndex]
    //     let switchResults = {
    //         budgetCell,
    //     }
    //     let oldChartType = budgetCell.googleChartType
    //     budgetCell.googleChartType = chartType
    //     let viewpointdata = this.state.viewpointData
    //     let configData = {
    //         viewpointConfig:viewpointdata.Configuration,
    //         itemseriesConfig:viewpointdata.itemseriesconfigdata,
    //     }        
    //     let chartprops: GetCellChartProps = {
    //         chartIndex: cellIndex,
    //         branchsettings,
    //         configData,
    //     }
    //     let branchuid = this.uid
    //     let fn = onChartComponentSelection(this)
    //     let fncurrent = fn(nodeIndex)(cellIndex)
    //     let chartParmsObj: ChartParmsObj = budgetNode.getChartParms(chartprops,{current: fncurrent, next: fn})
    //     if (!chartParmsObj.isError) {
    //         budgetCell.chartParms = chartParmsObj.chartParms
    //         budgetCell.chartCode =
    //             GoogleChartTypeToChartCode[budgetCell.chartParms.chartType]
    //     } else {
    //         budgetCell.googleChartType = oldChartType
    //     }
    //     return switchResults
    // }

}

export default BudgetCell