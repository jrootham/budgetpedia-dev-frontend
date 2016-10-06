"use strict";
let applyChartComponentSelection = (budgetBranch, nodeIndex, cellIndex, chartSelectionData) => {
    let { nodes: branchNodes, uid: branchuid } = budgetBranch;
    let budgetNode = branchNodes[nodeIndex];
    let budgetCell = budgetNode.cells[cellIndex];
    if (!budgetCell) {
        console.error('System Error: budgetNode, faulty cellIndex in applyChartComponentSelection', budgetNode, cellIndex);
        throw Error('faulty cellIndex in applyChartComponentSelection');
    }
    let selection = chartSelectionData.selection[0];
    console.log('budgetCell googlecharttype', budgetCell.googleChartType, cellIndex);
    let selectionrow;
    if (selection) {
        switch (budgetCell.googleChartType) {
            case "AreaChart":
            case "LineChart":
                selectionrow = selection.column - 1;
                chartSelectionData.selection[0].row = null;
                break;
            default:
                selectionrow = selection.row;
                break;
        }
    }
    else {
        selectionrow = null;
    }
    if (budgetCell.nodeDataseriesName == 'CommonDimension') {
        return;
    }
    budgetCell.chartSelection = selection ? chartSelectionData.selection : null;
    let removed = branchNodes.splice(nodeIndex + 1);
    let removeditems = removed.map((item) => {
        return { nodeuid: item.uid, cellList: item.cellDeclarationList };
    });
    if (removeditems.length > 0) {
        let { removeNodeDeclarations } = budgetBranch.actions;
        removeNodeDeclarations(removeditems);
    }
    let { updateCellChartSelection } = budgetNode.actions;
    updateCellChartSelection(budgetCell.uid, chartSelectionData.selection);
    if (!selection) {
        budgetCell.chartSelection = null;
        return;
    }
    budgetCell.chartSelection = chartSelectionData.selection;
    let childprops = {
        selectionrow: selectionrow,
        nodeIndex: nodeIndex,
        cellIndex: parseInt(cellIndex),
    };
    budgetBranch.createChildNodeDeclaration(childprops);
};
exports.onChartComponentSelection = budgetBranch => nodeIndex => cellIndex => chartSelectionData => {
    console.log('chart selection data', chartSelectionData);
    applyChartComponentSelection(budgetBranch, nodeIndex, cellIndex, chartSelectionData);
};
