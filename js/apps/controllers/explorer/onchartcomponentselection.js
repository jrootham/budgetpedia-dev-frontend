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
    let portalChartIndex = context.portalchartlocation.portalindex;
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
    let serieslist = chartmatrixrow;
    let nodeconfig = chartmatrixrow[matrixcolumn];
    if (nodeconfig.cells[portalChartIndex].nodeDataPropertyName == 'Categories') {
        return;
    }
    let viewpoint = nodeconfig.viewpointName, facet = nodeconfig.facetName;
    serieslist.splice(matrixcolumn + 1);
    refreshPresentation(chartmatrixrow);
    if (!selection) {
        delete nodeconfig.cells[portalChartIndex].chartselection;
        delete nodeconfig.cells[portalChartIndex].chart;
        updatechartselections_1.updateChartSelections(chartmatrixrow);
        return;
    }
    let childprops = {
        nodeconfig: nodeconfig,
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
    let { nodeconfig, userselections, budgetdata, chartmatrixrow, selectionrow, matrixcolumn, portalChartIndex, context, chart, } = props;
    let viewpoint = nodeconfig.viewpointName, facet = nodeconfig.facetName;
    let { workingStatus, refreshPresentation, onPortalCreation, } = callbacks;
    let childdatapath = nodeconfig.dataPath.slice();
    let node = nodeconfig.dataNode;
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
    let newrange = Object.assign({}, nodeconfig.timeSpecs);
    let charttype = userselections.charttype;
    let chartCode = constants_1.ChartTypeCodes[charttype];
    let portalcharts = budgetdata.viewpointdata.PortalCharts[facet];
    let charts = [];
    for (let type of portalcharts) {
        if (type.Type == 'Components' && !newnode.Components) {
            continue;
        }
        if (type.Type == 'Categories' && !newnode.Categories) {
            continue;
        }
        let chartconfig = {
            googleChartType: charttype,
            chartCode: chartCode,
        };
        chartconfig.nodeDataPropertyName = type.Type;
        charts.push(chartconfig);
    }
    let newdatanode = getbudgetnode_1.getBudgetNode(budgetdata.viewpointdata, childdatapath);
    let newnodeconfigparms = {
        portalCharts: portalcharts,
        chartType: charttype,
        viewpointName: viewpoint,
        facetName: facet,
        dataPath: childdatapath,
        matrixLocation: {
            column: matrixcolumn + 1
        },
        parentData: parentdata,
        timeSpecs: newrange,
        cells: charts,
        dataNode: newdatanode,
    };
    let newnodeconfig = new budgetnode_1.default(newnodeconfigparms);
    let newnodeindex = null;
    let chartParmsObj = null;
    let isError = false;
    for (newnodeindex in newnodeconfig.cells) {
        let props = {
            nodeConfig: newnodeconfig,
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
        newnodeconfig.cells[newnodeindex].chartparms = chartParmsObj.chartParms;
        newnodeconfig.cells[newnodeindex].chartCode =
            constants_1.ChartTypeCodes[newnodeconfig.cells[newnodeindex].googleChartType];
    }
    if (isError) {
        updatechartselections_1.updateChartSelections(chartmatrixrow);
        workingStatus(false);
        return;
    }
    let newmatrixcolumn = matrixcolumn + 1;
    chartmatrixrow[newmatrixcolumn] = newnodeconfig;
    refreshPresentation(chartmatrixrow);
    nodeconfig.cells[portalChartIndex].chartselection = context.selection;
    nodeconfig.cells[portalChartIndex].chart = chart;
    nodeconfig.cells[portalChartIndex].ChartObject = context.ChartObject;
    updatechartselections_1.updateChartSelections(chartmatrixrow);
    onPortalCreation();
    workingStatus(false);
};
exports.createChildNode = createChildNode;
