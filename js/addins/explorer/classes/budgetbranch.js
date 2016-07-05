"use strict";
const getbudgetnode_1 = require('../modules/getbudgetnode');
const budgetnode_1 = require('./budgetnode');
const onchartcomponentselection_1 = require('../modules/onchartcomponentselection');
const constants_1 = require('../../constants');
class BudgetBranch {
    constructor(parms) {
        this.data = parms.data;
        this.nodes = parms.nodes;
    }
    initializeChartSeries(props, callbacks) {
        let { branchsettings, viewpointdata } = props;
        let chartmatrixrow = this.nodes;
        let budgetdata = this.data;
        let chartParmsObj;
        budgetdata.viewpointdata = viewpointdata;
        let datapath = [];
        let node = getbudgetnode_1.default(viewpointdata, datapath);
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
            dataNode: node,
        };
        let budgetNode = new budgetnode_1.default(budgetNodeParms);
        let cellindex;
        let selectfn = onchartcomponentselection_1.onChartComponentSelection(branchsettings)(budgetdata)(chartmatrixrow)(callbacks);
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
            let fcurrent = selectfn(0)(cellindex);
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
            chartmatrixrow[nodeIndex] = budgetNode;
        }
    }
    switchFacet(props, callbacks) {
        let switchResults = {
            deeperdata: false,
            shallowerdata: false,
        };
        let { viewpointdata, branchsettings } = props;
        let budgetdata = this.data;
        budgetdata.viewpointdata = viewpointdata;
        let chartmatrixrow = this.nodes;
        let budgetNode = null;
        let parentBudgetNode;
        let cellptr;
        let isError = false;
        let chartParmsObj = null;
        let fn = onchartcomponentselection_1.onChartComponentSelection(branchsettings)(budgetdata)(chartmatrixrow)(callbacks);
        for (cellptr in chartmatrixrow) {
            parentBudgetNode = budgetNode;
            budgetNode = chartmatrixrow[cellptr];
            let nextdataNode = getbudgetnode_1.default(viewpointdata, budgetNode.dataPath);
            if (nextdataNode) {
                let deeperdata = (!!nextdataNode.Components && (budgetNode.cells.length == 1));
                let shallowerdata = (!nextdataNode.Components && (budgetNode.cells.length == 2));
                budgetNode.update(nextdataNode, branchsettings.facet);
                if (deeperdata || shallowerdata) {
                    switchResults.deeperdata = deeperdata;
                    switchResults.shallowerdata = shallowerdata;
                    isError = true;
                    let prevBudgetNode = chartmatrixrow[cellptr - 1];
                    chartmatrixrow.splice(cellptr);
                    let prevBudgetCell = prevBudgetNode.cells[0];
                    let context = {
                        selection: prevBudgetCell.chartselection,
                        ChartObject: prevBudgetCell.ChartObject,
                    };
                    let childprops = {
                        budgetNode: prevBudgetNode,
                        branchsettings: branchsettings,
                        budgetdata: budgetdata,
                        chartmatrixrow: chartmatrixrow,
                        selectionrow: prevBudgetCell.chartselection[0].row,
                        nodeIndex: prevBudgetNode.nodeIndex,
                        cellIndex: 0,
                        context: context,
                        chart: prevBudgetCell.chart,
                    };
                    let fcurrent = fn(cellptr)(0);
                    onchartcomponentselection_1.createChildNode(childprops, callbacks, { current: fcurrent, next: fn });
                    budgetNode = null;
                }
            }
            else {
                console.error('no data node');
            }
            let nodecellindex = null;
            if (!budgetNode)
                break;
            let configData = {
                viewpointConfig: budgetdata.viewpointdata.Configuration,
                itemseriesConfig: budgetdata.viewpointdata.itemseriesconfigdata,
            };
            for (nodecellindex in budgetNode.cells) {
                let props = {
                    chartIndex: nodecellindex,
                    branchsettings: branchsettings,
                    configData: configData,
                };
                let fcurrent = fn(cellptr)(nodecellindex), chartParmsObj = budgetNode.getChartParms(props, { current: fcurrent, next: fn });
                if (chartParmsObj.isError) {
                    chartmatrixrow.splice(cellptr);
                    if (cellptr > 0) {
                        let parentBudgetNode = chartmatrixrow[cellptr - 1];
                        let parentBudgetCell = parentBudgetNode.cells[nodecellindex];
                        parentBudgetCell.chartselection = null;
                        parentBudgetCell.chart = null;
                    }
                    isError = true;
                    break;
                }
                else {
                    let budgetCell = budgetNode.cells[nodecellindex];
                    budgetCell.chartparms = chartParmsObj.chartParms;
                    budgetCell.chartCode =
                        constants_1.ChartTypeCodes[budgetCell.chartparms.chartType];
                    if (parentBudgetNode) {
                        budgetNode.parentData.dataNode = parentBudgetNode.dataNode;
                    }
                }
            }
        }
        return switchResults;
    }
    switchChartCode(props, callbacks) {
        let { branchsettings, nodeIndex, cellIndex, chartCode, } = props;
        let chartType = constants_1.ChartCodeTypes[chartCode];
        let chartmatrixrow = this.nodes;
        let budgetNode = chartmatrixrow[nodeIndex];
        let budgetCell = budgetNode.cells[cellIndex];
        let switchResults = {
            budgetCell: budgetCell,
        };
        let oldChartType = budgetCell.googleChartType;
        budgetCell.googleChartType = chartType;
        let budgetdata = this.data;
        let configData = {
            viewpointConfig: budgetdata.viewpointdata.Configuration,
            itemseriesConfig: budgetdata.viewpointdata.itemseriesconfigdata,
        };
        let chartprops = {
            chartIndex: cellIndex,
            branchsettings: branchsettings,
            configData: configData,
        };
        let fn = onchartcomponentselection_1.onChartComponentSelection(branchsettings)(budgetdata)(chartmatrixrow)(callbacks);
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
