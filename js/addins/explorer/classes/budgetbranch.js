"use strict";
const databaseapi_1 = require('./databaseapi');
const getbudgetnode_1 = require('../modules/getbudgetnode');
const budgetnode_1 = require('./budgetnode');
const onchartcomponentselection_1 = require('../modules/onchartcomponentselection');
const constants_1 = require('../../constants');
class BudgetBranch {
    constructor(parms) {
        this.addNode = (budgetNodeUid, nodeIndex, budgetNodeParms, callbacks, actions) => {
            let { dataPath } = budgetNodeParms;
            let branchsettings = this.settings;
            let viewpointdata = this.getState().viewpointData;
            let datanode = getbudgetnode_1.default(viewpointdata, dataPath);
            let budgetNode = new budgetnode_1.default(budgetNodeParms, budgetNodeUid, datanode);
            let branchNodes = this.nodes;
            let budgetdata = { viewpointdata: this.getState().viewpointData };
            let chartParmsObj;
            let cellindex;
            let branchuid = this.uid;
            let selectfn = onchartcomponentselection_1.onChartComponentSelection(this)(branchsettings)(branchuid)(budgetdata)(branchNodes)(callbacks)(actions);
            let { Configuration: viewpointConfig, itemseriesconfigdata: itemseriesConfig, } = budgetdata.viewpointdata;
            let configData = {
                viewpointConfig: viewpointConfig,
                itemseriesConfig: itemseriesConfig,
            };
            for (cellindex in budgetNode.cells) {
                let budgetCell = budgetNode.cells[cellindex];
                let props = {
                    chartIndex: cellindex,
                    configData: configData,
                    branchsettings: branchsettings,
                };
                let fcurrent = selectfn(nodeIndex)(cellindex);
                chartParmsObj = budgetNode.getChartParms(props, { current: fcurrent, next: selectfn });
                if (!chartParmsObj.isError) {
                    budgetCell.chartparms = chartParmsObj.chartParms;
                    budgetCell.chartCode =
                        constants_1.ChartTypeCodes[budgetCell.chartparms.chartType];
                }
                else {
                    break;
                }
            }
            if (!chartParmsObj.isError) {
                let { nodeIndex } = budgetNode;
                branchNodes[nodeIndex] = budgetNode;
                this.setState({
                    branchNodes: branchNodes,
                });
            }
        };
        this.getViewpointData = () => {
            let branchsettings = this.settings;
            let { viewpoint: viewpointname, facet: dataseriesname, inflationAdjusted, } = branchsettings;
            let viewpointdata = databaseapi_1.default.getViewpointData({
                viewpointname: viewpointname,
                dataseriesname: dataseriesname,
                inflationAdjusted: inflationAdjusted,
                timeSpecs: {
                    leftYear: null,
                    rightYear: null,
                    spanYears: false,
                    firstYear: null,
                    lastYear: null,
                }
            });
            this.setState({
                viewpointData: viewpointdata
            });
        };
        this.settings = parms.settings;
        this.uid = parms.uid;
    }
    get nodes() {
        let branchNodes = this.state.branchNodes;
        let copy = [...branchNodes];
        return copy;
    }
    get state() {
        return this.getState();
    }
    initializeBranch() {
        let branchsettings = this.settings;
        let viewpointdata = this.getState().viewpointData;
        let datapath = [];
        let { chartType: defaultChartType, viewpoint: viewpointName, facet: facetName, latestYear: rightYear, } = branchsettings;
        let budgetNodeParms = {
            viewpointName: viewpointName,
            facetName: facetName,
            timeSpecs: {
                leftYear: null,
                rightYear: rightYear,
                spanYears: false,
                firstYear: null,
                lastYear: null,
            },
            defaultChartType: defaultChartType,
            portalCharts: viewpointdata.PortalCharts,
            dataPath: [],
            nodeIndex: 0,
        };
        this.actions.addNode(budgetNodeParms);
    }
    switchFacet(callbacks, actions) {
        let switchResults = {
            deeperdata: false,
            shallowerdata: false,
        };
        let branchsettings = this.settings;
        let viewpointdata = this.getState().viewpointData;
        let budgetdata = { viewpointdata: this.getState().viewpointData };
        let branchNodes = this.nodes;
        let budgetNode = null;
        let parentBudgetNode;
        let nodeIndex;
        let isError = false;
        let chartParmsObj = null;
        let branchuid = this.uid;
        let fn = onchartcomponentselection_1.onChartComponentSelection(this)(branchsettings)(branchuid)(budgetdata)(branchNodes)(callbacks)(actions);
        for (nodeIndex in branchNodes) {
            parentBudgetNode = budgetNode;
            budgetNode = branchNodes[nodeIndex];
            let nextdataNode = getbudgetnode_1.default(viewpointdata, budgetNode.dataPath);
            if (nextdataNode) {
                let deeperdata = (!!nextdataNode.Components && (budgetNode.cells.length == 1));
                let shallowerdata = (!nextdataNode.Components && (budgetNode.cells.length == 2));
                budgetNode.update(nextdataNode, branchsettings.facet);
                if (deeperdata || shallowerdata) {
                    switchResults.deeperdata = deeperdata;
                    switchResults.shallowerdata = shallowerdata;
                    isError = true;
                    let prevBudgetNode = branchNodes[nodeIndex - 1];
                    let removed = branchNodes.splice(nodeIndex);
                    let removedids = removed.map((item) => {
                        return item.uid;
                    });
                    actions.removeNode(this.getProps().callbackuid, removedids);
                    setTimeout(() => {
                        let prevBudgetCell = prevBudgetNode.cells[0];
                        let context = {
                            selection: prevBudgetCell.chartselection,
                            ChartObject: prevBudgetCell.ChartObject,
                        };
                        let childprops = {
                            parentNode: prevBudgetNode,
                            branchsettings: branchsettings,
                            budgetdata: budgetdata,
                            branchNodes: branchNodes,
                            selectionrow: prevBudgetCell.chartselection[0].row,
                            nodeIndex: prevBudgetNode.nodeIndex,
                            cellIndex: 0,
                            context: context,
                            chart: prevBudgetCell.chart,
                        };
                        let fcurrent = fn(nodeIndex)(0);
                        onchartcomponentselection_1.createChildNode(this, childprops, callbacks, { current: fcurrent, next: fn }, actions);
                    });
                    budgetNode = null;
                }
            }
            else {
                console.error('no data node');
            }
            let nodeCellIndex = null;
            if (!budgetNode)
                break;
            let configData = {
                viewpointConfig: budgetdata.viewpointdata.Configuration,
                itemseriesConfig: budgetdata.viewpointdata.itemseriesconfigdata,
            };
            for (nodeCellIndex in budgetNode.cells) {
                let props = {
                    chartIndex: nodeCellIndex,
                    branchsettings: branchsettings,
                    configData: configData,
                };
                let fcurrent = fn(nodeIndex)(nodeCellIndex), chartParmsObj = budgetNode.getChartParms(props, { current: fcurrent, next: fn });
                if (chartParmsObj.isError) {
                    let removed = branchNodes.splice(nodeIndex);
                    let removedids = removed.map((item) => {
                        return item.uid;
                    });
                    if (nodeIndex > 0) {
                        let parentBudgetNode = branchNodes[nodeIndex - 1];
                        let parentBudgetCell = parentBudgetNode.cells[nodeCellIndex];
                        parentBudgetCell.chartselection = null;
                        parentBudgetCell.chart = null;
                    }
                    isError = true;
                    break;
                }
                else {
                    budgetNode.facetName = branchsettings.facet;
                    let budgetCell = budgetNode.cells[nodeCellIndex];
                    budgetCell.chartparms = chartParmsObj.chartParms;
                    budgetCell.chartCode =
                        constants_1.ChartTypeCodes[budgetCell.chartparms.chartType];
                    if (parentBudgetNode) {
                        budgetNode.parentData.dataNode = parentBudgetNode.dataNode;
                    }
                }
            }
        }
        this.setState({
            branchNodes: branchNodes,
        });
        return switchResults;
    }
    switchChartCode(props, callbacks, actions) {
        let branchsettings = this.settings;
        let { nodeIndex, cellIndex, chartCode, } = props;
        let chartType = constants_1.ChartCodeTypes[chartCode];
        let branchNodes = this.nodes;
        let budgetNode = branchNodes[nodeIndex];
        let budgetCell = budgetNode.cells[cellIndex];
        let switchResults = {
            budgetCell: budgetCell,
        };
        let oldChartType = budgetCell.googleChartType;
        budgetCell.googleChartType = chartType;
        let budgetdata = { viewpointdata: this.getState().viewpointData };
        let configData = {
            viewpointConfig: budgetdata.viewpointdata.Configuration,
            itemseriesConfig: budgetdata.viewpointdata.itemseriesconfigdata,
        };
        let chartprops = {
            chartIndex: cellIndex,
            branchsettings: branchsettings,
            configData: configData,
        };
        let branchuid = this.uid;
        let fn = onchartcomponentselection_1.onChartComponentSelection(this)(branchsettings)(branchuid)(budgetdata)(branchNodes)(callbacks)(actions);
        let fncurrent = fn(nodeIndex)(cellIndex);
        let chartParmsObj = budgetNode.getChartParms(chartprops, { current: fncurrent, next: fn });
        if (!chartParmsObj.isError) {
            budgetCell.chartparms = chartParmsObj.chartParms;
            budgetCell.chartCode =
                constants_1.ChartTypeCodes[budgetCell.chartparms.chartType];
        }
        else {
            budgetCell.googleChartType = oldChartType;
        }
        return switchResults;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BudgetBranch;
