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
    console.log('budgetNode, cellIndex in applyChartComponentSelection', budgetNode, cellIndex);
    let budgetCell = budgetNode.cells[cellIndex];
    if (budgetCell.nodeDatasetName == 'Categories') {
        return;
    }
    let removed = branchNodes.splice(nodeIndex + 1);
    let removeditems = removed.map((item) => {
        return { uid: item.uid, cellList: item.cellList };
    });
    if (removeditems.length > 0) {
        let { removeNodeDeclarations } = budgetBranch.actions;
        removeNodeDeclarations(removeditems);
    }
    setTimeout(() => {
        branchNodes = budgetBranch.nodes;
        let { updateChartSelections } = budgetBranch.nodeCallbacks;
        if (!selection) {
            budgetCell.chartSelection = null;
            return;
        }
        budgetCell.chartSelection = chartSelectionData.selection;
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
