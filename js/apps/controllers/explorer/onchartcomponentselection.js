"use strict";
var format = require('format-number');
const budgetnode_1 = require('../../../local/budgetnode');
const updatechartselections_1 = require('./updatechartselections');
const constants_1 = require('../../constants');
const getchartparms_1 = require('./getchartparms');
const getbudgetnode_1 = require('./getbudgetnode');
let onChartComponentSelection = (props, callbacks) => {
    let context = props.context;
    let userselections = props.userselections;
    let budgetdata = props.budgetdata;
    let chartmatrixrow = props.chartmatrixrow;
    let refreshPresentation = callbacks.refreshPresentation;
    let onPortalCreation = callbacks.onPortalCreation;
    let workingStatus = callbacks.workingStatus;
    let selection = context.selection[0];
    let selectionrow;
    if (selection) {
        selectionrow = selection.row;
    }
    else {
        selectionrow = null;
    }
    let chart = context.ChartObject.chart;
    let selectmatrixlocation = context.portalchartlocation.matrixlocation;
    let matrixcolumn = selectmatrixlocation.column;
    let budgetNode = chartmatrixrow[matrixcolumn];
    let portalChartIndex = context.portalchartlocation.cellIndex;
    let budgetCell = budgetNode.cells[portalChartIndex];
    if (budgetCell.nodeDataPropertyName == 'Categories') {
        return;
    }
    let viewpoint = budgetNode.viewpointName, facet = budgetNode.facetName;
    chartmatrixrow.splice(matrixcolumn + 1);
    refreshPresentation(chartmatrixrow);
    if (!selection) {
        delete budgetCell.chartselection;
        delete budgetCell.chart;
        updatechartselections_1.updateChartSelections(chartmatrixrow);
        return;
    }
    let childprops = {
        budgetNode: budgetNode,
        userselections: userselections,
        budgetdata: budgetdata,
        chartmatrixrow: chartmatrixrow,
        selectionrow: selectionrow,
        matrixcolumn: matrixcolumn,
        portalChartIndex: portalChartIndex,
        context: context,
        chart: chart,
    };
    let childcallbacks = {
        workingStatus: workingStatus,
        refreshPresentation: refreshPresentation,
        onPortalCreation: onPortalCreation,
    };
    createChildNode(childprops, childcallbacks);
};
exports.onChartComponentSelection = onChartComponentSelection;
let createChildNode = (props, callbacks) => {
    let { budgetNode, userselections, budgetdata, chartmatrixrow, selectionrow, matrixcolumn, portalChartIndex, context, chart, } = props;
    let viewpoint = budgetNode.viewpointName, facet = budgetNode.facetName;
    let { workingStatus, refreshPresentation, onPortalCreation, } = callbacks;
    let childdatapath = budgetNode.dataPath.slice();
    let node = budgetNode.dataNode;
    if (!node.Components) {
        updatechartselections_1.updateChartSelections(chartmatrixrow);
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
        updatechartselections_1.updateChartSelections(chartmatrixrow);
        return;
    }
    let newnode = node.Components[code];
    if (!newnode.Components && !newnode.Categories) {
        updatechartselections_1.updateChartSelections(chartmatrixrow);
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
        viewpointName: viewpoint,
        facetName: facet,
        dataPath: childdatapath,
        matrixLocation: {
            column: matrixcolumn + 1
        },
        parentData: parentdata,
        timeSpecs: newrange,
        dataNode: newdatanode,
    };
    let newnodeconfig = new budgetnode_1.default(newnodeconfigparms);
    let newnodeindex = null;
    let chartParmsObj = null;
    let isError = false;
    for (newnodeindex in newnodeconfig.cells) {
        let props = {
            budgetNode: newnodeconfig,
            chartIndex: newnodeindex,
            userselections: userselections,
            budgetdata: budgetdata,
            chartmatrixrow: chartmatrixrow,
        };
        let callbacks = {
            refreshPresentation: refreshPresentation,
            onPortalCreation: onPortalCreation,
            workingStatus: workingStatus,
        };
        chartParmsObj = getchartparms_1.default(props, callbacks);
        if (chartParmsObj.isError) {
            isError = true;
            break;
        }
        let budgetCell = newnodeconfig.cells[newnodeindex];
        budgetCell.chartparms = chartParmsObj.chartParms;
        budgetCell.chartCode =
            constants_1.ChartTypeCodes[budgetCell.googleChartType];
    }
    if (isError) {
        updatechartselections_1.updateChartSelections(chartmatrixrow);
        workingStatus(false);
        return;
    }
    let newmatrixcolumn = matrixcolumn + 1;
    chartmatrixrow[newmatrixcolumn] = newnodeconfig;
    refreshPresentation(chartmatrixrow);
    let budgetCell = budgetNode.cells[portalChartIndex];
    budgetCell.chartselection = context.selection;
    budgetCell.chart = chart;
    budgetCell.ChartObject = context.ChartObject;
    updatechartselections_1.updateChartSelections(chartmatrixrow);
    onPortalCreation();
    workingStatus(false);
};
exports.createChildNode = createChildNode;
