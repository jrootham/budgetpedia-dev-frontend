"use strict";
let getBudgetNode = (viewpointindex, path, budgetdata) => {
    let node = budgetdata.Viewpoints[viewpointindex];
    let components = node.Components;
    for (let index of path) {
        node = components[index];
        if (!node) {
            return { node: null, components: null };
        }
        components = node.Components;
    }
    return { node: node, components: components };
};
exports.getBudgetNode = getBudgetNode;
