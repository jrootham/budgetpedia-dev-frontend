"use strict";
var format = require('format-number');
const constants_1 = require('../../constants');
const getbudgetnode_1 = require('./getbudgetnode');
let applyChartComponentSelection = (budgetBranch, props, callbacks, actions) => {
    let { context, branchsettings, budgetdata, branchNodes, selectionCallbackVersions, branchuid } = props;
    branchNodes = budgetBranch.nodes;
    let { refreshPresentation, onPortalCreation, workingStatus, updateChartSelections } = callbacks;
    let { addNode } = actions;
    console.log('in appluChartComponentSelection', props);
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
    console.log('removed', removed, removedids);
    if (removedids.length > 0) {
        actions.removeNode(branchuid, removedids);
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
            budgetdata: budgetdata,
            branchNodes: branchNodes,
            selectionrow: selectionrow,
            nodeIndex: nodeIndex,
            cellIndex: cellIndex,
            context: context,
            chart: chart,
        };
        let childcallbacks = callbacks;
        exports.createChildNode(budgetBranch, childprops, childcallbacks, selectionCallbackVersions, actions);
    });
};
exports.createChildNode = (budgetBranch, props, callbacks, selectionCallbacks, actions) => {
    let { parentNode: budgetNode, branchsettings, budgetdata, branchNodes, selectionrow, nodeIndex, cellIndex, context, chart, } = props;
    let viewpointName = budgetNode.viewpointName, facet = budgetNode.facetName;
    let { workingStatus, refreshPresentation, onPortalCreation, updateChartSelections, updateBranchNodesState, } = callbacks;
    let childdatapath = budgetNode.dataPath.slice();
    let node = budgetNode.dataNode;
    console.log('before node components', node);
    if (!node.Components) {
        updateChartSelections();
        return;
    }
    let components = node.Components;
    console.log('after node components', components);
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
    let portalcharts = budgetdata.viewpointdata.PortalCharts;
    let newdatanode = getbudgetnode_1.default(budgetdata.viewpointdata, childdatapath);
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
    console.log('before add child node', newnodeconfigparms);
    actions.addNode(newnodeconfigparms);
    console.log('after add child node');
    setTimeout(() => {
        let newBudgetNode = budgetBranch.nodes[nodeIndex + 1];
        console.log('newBudgetNode', newBudgetNode, nodeIndex + 1);
        let newcellindex = null;
        let chartParmsObj = null;
        let isError = false;
        let configData = {
            viewpointConfig: budgetdata.viewpointdata.Configuration,
            itemseriesConfig: budgetdata.viewpointdata.itemseriesconfigdata,
        };
        let budgetCell = budgetNode.cells[cellIndex];
        budgetCell.chartselection = context.selection;
        budgetCell.chart = chart;
        budgetCell.ChartObject = context.ChartObject;
        updateChartSelections();
        onPortalCreation();
    });
    workingStatus(false);
};
exports.onChartComponentSelection = budgetBranch => branchsettings => branchuid => budgetdata => branchNodes => callbacks => actions => nodeIndex => cellIndex => props => {
    props.context.nodeIndex = nodeIndex;
    props.context.cellIndex = cellIndex;
    props.branchsettings = branchsettings;
    props.budgetdata = budgetdata;
    props.branchNodes = branchNodes;
    props.branchuid = branchuid;
    applyChartComponentSelection(budgetBranch, props, callbacks, actions);
};
