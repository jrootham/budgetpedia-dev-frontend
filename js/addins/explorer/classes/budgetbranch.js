"use strict";
const databaseapi_1 = require('./databaseapi');
const getbudgetnode_1 = require('../modules/getbudgetnode');
const budgetnode_1 = require('./budgetnode');
const onchartcomponentselection_1 = require('../modules/onchartcomponentselection');
const constants_1 = require('../../constants');
class BudgetBranch {
    constructor(parms) {
        this.addNode = (budgetNodeUid, nodeIndex, budgetNodeParms) => {
            let { actions, nodeCallbacks: callbacks } = this;
            let { dataPath } = budgetNodeParms;
            let branchsettings = this.settings;
            let viewpointdata = this.state.viewpointData;
            let datanode = getbudgetnode_1.default(viewpointdata, dataPath);
            let branchNodes = this.nodes;
            let parentNode = (nodeIndex == 0) ? undefined : branchNodes[branchNodes.length - 1].dataNode;
            let budgetNode = new budgetnode_1.default(budgetNodeParms, budgetNodeUid, datanode, parentNode);
            let budgetdata = { viewpointdata: this.state.viewpointData };
            let chartParmsObj;
            let cellindex;
            let branchuid = this.uid;
            let selectfn = onchartcomponentselection_1.onChartComponentSelection(this);
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
        this.createChildNode = (props) => {
            let budgetBranch = this;
            let callbacks = budgetBranch.nodeCallbacks;
            let actions = budgetBranch.actions;
            let { selectionrow, nodeIndex, cellIndex, chartSelectionData, } = props;
            let chart = chartSelectionData.ChartObject.chart;
            let { settings: branchsettings } = budgetBranch;
            let viewpointData = budgetBranch.state.viewpointData;
            let branchNodes = budgetBranch.nodes;
            let budgetNode = branchNodes[nodeIndex];
            let viewpointName = budgetNode.viewpointName, facet = budgetNode.facetName;
            let { workingStatus, refreshPresentation, onPortalCreation, updateChartSelections, updateBranchNodesState, } = callbacks;
            let childdatapath = budgetNode.dataPath.slice();
            let node = budgetNode.dataNode;
            if (!node.Components) {
                updateChartSelections();
                return;
            }
            let components = node.Components;
            let code = null;
            let parentdata = null;
            let parentNode = null;
            if (node && node.SortedComponents && node.SortedComponents[selectionrow]) {
                parentdata = node.SortedComponents[selectionrow];
                parentNode = node;
                code = parentdata.Code;
            }
            if (code)
                childdatapath.push(code);
            else {
                updateChartSelections();
                return;
            }
            let newnode = node.Components[code];
            if (!newnode.Components && !newnode.Categories) {
                updateChartSelections();
                return;
            }
            workingStatus(true);
            let newrange = Object.assign({}, budgetNode.timeSpecs);
            let charttype = branchsettings.chartType;
            let chartCode = constants_1.ChartTypeCodes[charttype];
            let portalcharts = viewpointData.PortalCharts;
            let newdatanode = getbudgetnode_1.default(viewpointData, childdatapath);
            let newnodeconfigparms = {
                portalCharts: portalcharts,
                defaultChartType: charttype,
                viewpointName: viewpointName,
                facetName: facet,
                dataPath: childdatapath,
                nodeIndex: nodeIndex + 1,
                parentData: parentdata,
                timeSpecs: newrange,
            };
            actions.addNode(newnodeconfigparms);
            setTimeout(() => {
                let newBudgetNode = budgetBranch.nodes[nodeIndex + 1];
                let newcellindex = null;
                let chartParmsObj = null;
                let isError = false;
                let configData = {
                    viewpointConfig: viewpointData.Configuration,
                    itemseriesConfig: viewpointData.itemseriesconfigdata,
                };
                let budgetCell = budgetNode.cells[cellIndex];
                budgetCell.chartselection = chartSelectionData.selection;
                budgetCell.chart = chart;
                budgetCell.ChartObject = chartSelectionData.ChartObject;
                workingStatus(false);
                setTimeout(() => {
                    updateChartSelections();
                    onPortalCreation();
                });
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
        let viewpointdata = this.state.viewpointData;
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
    switchFacet() {
        let { actions, nodeCallbacks: callbacks } = this;
        let switchResults = {
            deeperdata: false,
            shallowerdata: false,
        };
        let branchsettings = this.settings;
        let viewpointData = this.state.viewpointData;
        let branchNodes = this.nodes;
        let budgetNode = null;
        let parentBudgetNode;
        let nodeIndex;
        let isError = false;
        let chartParmsObj = null;
        let branchuid = this.uid;
        let fn = onchartcomponentselection_1.onChartComponentSelection(this);
        for (nodeIndex in branchNodes) {
            parentBudgetNode = budgetNode;
            budgetNode = branchNodes[nodeIndex];
            let nextdataNode = getbudgetnode_1.default(viewpointData, budgetNode.dataPath);
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
                        let chartSelectionData = {
                            selection: prevBudgetCell.chartselection,
                            ChartObject: prevBudgetCell.ChartObject,
                        };
                        let childprops = {
                            selectionrow: prevBudgetCell.chartselection[0].row,
                            nodeIndex: prevBudgetNode.nodeIndex,
                            cellIndex: 0,
                            chartSelectionData: chartSelectionData,
                        };
                        let fcurrent = fn(nodeIndex)(0);
                        let budgetBranch = this;
                        budgetBranch.createChildNode(childprops);
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
                viewpointConfig: viewpointData.Configuration,
                itemseriesConfig: viewpointData.itemseriesconfigdata,
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
    switchChartCode(props) {
        let { actions, nodeCallbacks: callbacks } = this;
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
        let budgetdata = { viewpointdata: this.state.viewpointData };
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
        let fn = onchartcomponentselection_1.onChartComponentSelection(this);
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
