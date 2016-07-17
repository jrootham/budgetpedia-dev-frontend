"use strict";
var format = require('format-number');
let applyChartComponentSelection = (budgetBranch, nodeIndex, cellIndex, chartSelectionData) => {
    let { nodes: branchNodes, settings: branchsettings, uid: branchuid } = budgetBranch;
    let viewpointData = budgetBranch.state.viewpointData;
    let { refreshPresentation, onPortalCreation, workingStatus, updateChartSelections } = budgetBranch.nodeCallbacks;
    let { addNode, removeNode } = budgetBranch.actions;
    let selection = chartSelectionData.selection[0];
    let selectionrow;
    if (selection) {
        selectionrow = selection.row;
    }
    else {
        selectionrow = null;
    }
    let budgetNode = branchNodes[nodeIndex];
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
            chartSelectionData: chartSelectionData,
        };
        budgetBranch.createChildNode(childprops);
    });
};
exports.onChartComponentSelection = budgetBranch => nodeIndex => cellIndex => chartSelectionData => {
    applyChartComponentSelection(budgetBranch, nodeIndex, cellIndex, chartSelectionData);
};
