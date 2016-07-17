"use strict";
var format = require('format-number');
let applyChartComponentSelection = (budgetBranch, context) => {
    let { nodes: branchNodes, settings: branchsettings, uid: branchuid } = budgetBranch;
    let viewpointData = budgetBranch.state.viewpointData;
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
    let nodeIndex = context.nodeIndex;
    let budgetNode = branchNodes[nodeIndex];
    let cellIndex = context.cellIndex;
    let budgetCell = budgetNode.cells[cellIndex];
    if (budgetCell.nodeDataPropertyName == 'Categories') {
        return;
    }
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
            selectionrow: selectionrow,
            nodeIndex: nodeIndex,
            cellIndex: cellIndex,
            context: context,
        };
        budgetBranch.createChildNode(childprops);
    });
};
exports.onChartComponentSelection = budgetBranch => nodeIndex => cellIndex => context => {
    context.nodeIndex = nodeIndex;
    context.cellIndex = cellIndex;
    applyChartComponentSelection(budgetBranch, context);
};
