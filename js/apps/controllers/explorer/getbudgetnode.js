"use strict";
let getBudgetNode = (viewpointindex, path, budgetdata) => {
    let node = budgetdata.Viewpoints[viewpointindex];
    let components = node.Components;
    for (let index of path) {
        node = components[index];
        if (!node) {
            return null;
        }
        components = node.Components;
    }
    return node;
};
exports.getBudgetNode = getBudgetNode;
