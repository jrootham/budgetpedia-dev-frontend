"use strict";
var format = require('format-number');
const constants_1 = require('../../constants');
const getbudgetnode_1 = require('./getbudgetnode');
let applyChartComponentSelection = (budgetBranch, props) => {
    let { context } = props;
    let { nodes: branchNodes, settings: branchsettings, uid: branchuid } = budgetBranch;
    let viewpointData = budgetBranch.getState().viewpointData;
    let { refreshPresentation, onPortalCreation, workingStatus, updateChartSelections } = budgetBranch.nodeCallbacks;
    let { addNode, removeNode } = budgetBranch.actions;
    let selection = context.selection[0];
    let selectionrow;
    if (selection) {
        selectionrow = selection.row;
    }
    else {
        selectionrow = null;
    }
    let chart = context.ChartObject.chart;
    let nodeIndex = context.nodeIndex;
    let budgetNode = branchNodes[nodeIndex];
    let cellIndex = context.cellIndex;
    let budgetCell = budgetNode.cells[cellIndex];
    if (budgetCell.nodeDataPropertyName == 'Categories') {
        return;
    }
    let facet = budgetNode.facetName;
    let removed = branchNodes.splice(nodeIndex + 1);
    let removedids = removed.map((item) => {
        return item.uid;
    });
    if (removedids.length > 0) {
        removeNode(branchuid, removedids);
    }
    setTimeout(() => {
        branchNodes = budgetBranch.nodes;
        if (!selection) {
            delete budgetCell.chartselection;
            delete budgetCell.chart;
            updateChartSelections();
            return;
        }
        let childprops = {
            parentNode: budgetNode,
            branchsettings: branchsettings,
            viewpointData: viewpointData,
            branchNodes: branchNodes,
            selectionrow: selectionrow,
            nodeIndex: nodeIndex,
            cellIndex: cellIndex,
            context: context,
            chart: chart,
        };
        let childcallbacks = budgetBranch.nodeCallbacks;
        exports.createChildNode(budgetBranch, childprops, childcallbacks, budgetBranch.actions);
    });
};
exports.createChildNode = (budgetBranch, props, callbacks, actions) => {
    let { parentNode: budgetNode, branchsettings, viewpointData, branchNodes, selectionrow, nodeIndex, cellIndex, context, chart, } = props;
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
        budgetCell.chartselection = context.selection;
        budgetCell.chart = chart;
        budgetCell.ChartObject = context.ChartObject;
        workingStatus(false);
        setTimeout(() => {
            updateChartSelections();
            onPortalCreation();
        });
    });
};
exports.onChartComponentSelection = budgetBranch => nodeIndex => cellIndex => props => {
    props.context.nodeIndex = nodeIndex;
    props.context.cellIndex = cellIndex;
    applyChartComponentSelection(budgetBranch, props);
};
