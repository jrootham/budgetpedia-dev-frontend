"use strict";
let getBudgetNode = (node, path) => {
    let components = node.Components;
    for (let index of path) {
        if (!components) {
            return null;
        }
        node = components[index];
        if (!node) {
            return null;
        }
        components = node.Components;
    }
    return node;
};
exports.getBudgetNode = getBudgetNode;
