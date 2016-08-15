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
    if (!budgetCell) {
        console.error('System Error: budgetNode, faulty cellIndex in applyChartComponentSelection', budgetNode, cellIndex);
        throw Error('faulty cellIndex in applyChartComponentSelection');
    }
    if (budgetCell.nodeDataseriesName == 'CommonObjects') {
        return;
    }
    budgetCell.chartSelection = selection ? chartSelectionData.selection : null;
    let removed = branchNodes.splice(nodeIndex + 1);
    let removeditems = removed.map((item) => {
        return { nodeuid: item.uid, cellList: item.cellList };
    });
    if (removeditems.length > 0) {
        let { removeNodeDeclarations } = budgetBranch.actions;
        removeNodeDeclarations(removeditems);
    }
    let { updateCellChartSelection } = budgetNode.actions;
    updateCellChartSelection(budgetCell.uid, chartSelectionData.selection);
    setTimeout(() => {
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
