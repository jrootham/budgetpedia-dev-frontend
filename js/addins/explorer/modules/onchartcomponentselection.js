"use strict";
let applyChartComponentSelection = (budgetBranch, nodeIndex, cellIndex, chartSelectionData) => {
    let { nodes: branchNodes, uid: branchuid } = budgetBranch;
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
    if (budgetCell.nodeDatasetName == 'Categories') {
        return;
    }
    let removed = branchNodes.splice(nodeIndex + 1);
    let removedids = removed.map((item) => {
        return item.uid;
    });
    if (removedids.length > 0) {
        let { removeNodeDeclaration } = budgetBranch.actions;
        removeNodeDeclaration(removedids);
    }
    setTimeout(() => {
        branchNodes = budgetBranch.nodes;
        let { updateChartSelections } = budgetBranch.nodeCallbacks;
        if (!selection) {
            budgetCell.chartSelection = null;
            updateChartSelections();
            return;
        }
        let childprops = {
            selectionrow: selectionrow,
            nodeIndex: nodeIndex,
            cellIndex: cellIndex,
        };
        budgetBranch.createChildNode(childprops);
    });
};
exports.onChartComponentSelection = budgetBranch => nodeIndex => cellIndex => chartSelectionData => {
    applyChartComponentSelection(budgetBranch, nodeIndex, cellIndex, chartSelectionData);
};
