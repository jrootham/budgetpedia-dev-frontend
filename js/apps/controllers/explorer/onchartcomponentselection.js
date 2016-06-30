"use strict";
var format = require('format-number');
const budgetnode_1 = require('../../../local/budgetnode');
const constants_1 = require('../../constants');
const getbudgetnode_1 = require('./getbudgetnode');
let applyChartComponentSelection = (props, callbacks) => {
    let { context, userselections, budgetdata, chartmatrixrow, selectionProps } = props;
    let { refreshPresentation, onPortalCreation, workingStatus, updateChartSelections } = callbacks;
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
    let budgetNode = chartmatrixrow[nodeIndex];
    let cellIndex = context.cellIndex;
    let budgetCell = budgetNode.cells[cellIndex];
    if (budgetCell.nodeDataPropertyName == 'Categories') {
        return;
    }
    let facet = budgetNode.facetName;
    chartmatrixrow.splice(nodeIndex + 1);
    refreshPresentation();
    if (!selection) {
        delete budgetCell.chartselection;
        delete budgetCell.chart;
        updateChartSelections();
        return;
    }
    let childprops = {
        budgetNode: budgetNode,
        userselections: userselections,
        budgetdata: budgetdata,
        chartmatrixrow: chartmatrixrow,
        selectionrow: selectionrow,
        nodeIndex: nodeIndex,
        cellIndex: cellIndex,
        context: context,
        chart: chart,
    };
    let childcallbacks = callbacks;
    exports.createChildNode(childprops, childcallbacks, selectionProps);
};
exports.createChildNode = (props, callbacks, selectionCallbacks) => {
    let { budgetNode, userselections, budgetdata, chartmatrixrow, selectionrow, nodeIndex, cellIndex, context, chart, } = props;
    let viewpointName = budgetNode.viewpointName, facet = budgetNode.facetName;
    let { workingStatus, refreshPresentation, onPortalCreation, updateChartSelections, } = callbacks;
    let childdatapath = budgetNode.dataPath.slice();
    let node = budgetNode.dataNode;
    if (!node.Components) {
        updateChartSelections();
        return;
    }
    let components = node.Components;
    let code = null;
    let parentdata = null;
    if (node && node.SortedComponents && node.SortedComponents[selectionrow]) {
        parentdata = node.SortedComponents[selectionrow];
        parentdata.dataNode = node;
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
    let charttype = userselections.charttype;
    let chartCode = constants_1.ChartTypeCodes[charttype];
    let portalcharts = budgetdata.viewpointdata.PortalCharts;
    let newdatanode = getbudgetnode_1.getBudgetNode(budgetdata.viewpointdata, childdatapath);
    let newnodeconfigparms = {
        portalCharts: portalcharts,
        defaultChartType: charttype,
        viewpointName: viewpointName,
        facetName: facet,
        dataPath: childdatapath,
        matrixLocation: {
            column: nodeIndex + 1
        },
        parentData: parentdata,
        timeSpecs: newrange,
        dataNode: newdatanode,
    };
    let newBudgetNode = new budgetnode_1.default(newnodeconfigparms);
    let newcellindex = null;
    let chartParmsObj = null;
    let isError = false;
    let configData = {
        viewpointConfig: budgetdata.viewpointdata.Configuration,
        itemseriesConfig: budgetdata.viewpointdata.itemseriesconfigdata,
    };
    for (newcellindex in newBudgetNode.cells) {
        let props = {
            chartIndex: newcellindex,
            userselections: userselections,
            configData: configData,
        };
        let ccallbacks = {
            updateChartSelections: updateChartSelections,
            refreshPresentation: refreshPresentation,
            onPortalCreation: onPortalCreation,
            workingStatus: workingStatus,
        };
        let childSelectionCallbacks = {
            current: selectionCallbacks.next(nodeIndex + 1)(newcellindex),
            next: selectionCallbacks.next,
        };
        chartParmsObj = newBudgetNode.getChartParms(props, childSelectionCallbacks);
        if (chartParmsObj.isError) {
            isError = true;
            break;
        }
        let budgetCell = newBudgetNode.cells[newcellindex];
        budgetCell.chartparms = chartParmsObj.chartParms;
        budgetCell.chartCode =
            constants_1.ChartTypeCodes[budgetCell.googleChartType];
    }
    if (isError) {
        updateChartSelections();
        workingStatus(false);
        return;
    }
    let newmatrixcolumn = nodeIndex + 1;
    chartmatrixrow[newmatrixcolumn] = newBudgetNode;
    refreshPresentation();
    let budgetCell = budgetNode.cells[cellIndex];
    budgetCell.chartselection = context.selection;
    budgetCell.chart = chart;
    budgetCell.ChartObject = context.ChartObject;
    updateChartSelections();
    onPortalCreation();
    workingStatus(false);
};
exports.onChartComponentSelection = (userselections) => (budgetdata) => (chartmatrixrow) => (callbacks) => (nodeIndex) => (cellIndex) => (props) => {
    props.context.nodeIndex = nodeIndex;
    props.context.cellIndex = cellIndex;
    props.userselections = userselections;
    props.budgetdata = budgetdata;
    props.chartmatrixrow = chartmatrixrow;
    applyChartComponentSelection(props, callbacks);
};
