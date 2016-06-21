"use strict";
var format = require('format-number');
const updatechartselections_1 = require('./updatechartselections');
const constants_1 = require('../../constants');
const getchartparms_1 = require('./getchartparms');
let onChartComponentSelection = (props, callbacks) => {
    let context = props.context;
    let userselections = props.userselections;
    let viewpointdata = props.viewpointdata;
    let itemseriesdata = props.itemseriesdata;
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
    if (nodeconfig.charts[portalChartIndex].nodedatapropertyname == 'Categories') {
        return;
    }
    let viewpoint = nodeconfig.viewpoint, facet = nodeconfig.facet;
    serieslist.splice(matrixcolumn + 1);
    refreshPresentation(chartmatrixrow);
    if (!selection) {
        delete nodeconfig.charts[portalChartIndex].chartselection;
        delete nodeconfig.charts[portalChartIndex].chart;
        updatechartselections_1.updateChartSelections(chartmatrixrow);
        return;
    }
    let childprops = {
        nodeconfig: nodeconfig,
        userselections: userselections,
        viewpointdata: viewpointdata,
        itemseriesdata: itemseriesdata,
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
    let { nodeconfig, userselections, viewpointdata, itemseriesdata, chartmatrixrow, selectionrow, matrixcolumn, portalChartIndex, context, chart, } = props;
    let viewpoint = nodeconfig.viewpoint, facet = nodeconfig.facet;
    let { workingStatus, refreshPresentation, onPortalCreation, } = callbacks;
    let childdatapath = nodeconfig.datapath.slice();
    let node = nodeconfig.datanode;
    if (!node.Components) {
        updatechartselections_1.updateChartSelections(chartmatrixrow);
        return;
    }
    let components = node.Components;
    let code = null;
    let parentdata = null;
    if (node && node.SortedComponents && node.SortedComponents[selectionrow]) {
        parentdata = node.SortedComponents[selectionrow];
        parentdata.datanode = node;
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
    let newrange = Object.assign({}, nodeconfig.yearscope);
    let charttype = userselections.charttype;
    let chartCode = constants_1.ChartTypeCodes[charttype];
    let portalcharts = viewpointdata.PortalCharts[facet];
    let charts = [];
    for (let type of portalcharts) {
        if (type.Type == 'Components' && !newnode.Components) {
            continue;
        }
        if (type.Type == 'Categories' && !newnode.Categories) {
            continue;
        }
        let chartconfig = {
            googlecharttype: charttype,
            chartCode: chartCode,
        };
        chartconfig.nodedatapropertyname = type.Type;
        charts.push(chartconfig);
    }
    let newnodeconfig = {
        viewpoint: viewpoint,
        facet: facet,
        datapath: childdatapath,
        matrixlocation: {
            column: matrixcolumn + 1
        },
        parentdata: parentdata,
        yearscope: newrange,
        charts: charts,
    };
    let newnodeindex = null;
    let chartParmsObj = null;
    let isError = false;
    for (newnodeindex in newnodeconfig.charts) {
        let props = {
            nodeConfig: newnodeconfig,
            chartIndex: newnodeindex,
            userselections: userselections,
            viewpointdata: viewpointdata,
            itemseriesdata: itemseriesdata,
            chartmatrixrow: chartmatrixrow,
        };
        let callbacks = {
            refreshPresentation: refreshPresentation,
            onPortalCreation: onPortalCreation,
            workingStatus: workingStatus,
        };
        chartParmsObj = getchartparms_1.getChartParms(props, callbacks);
        if (chartParmsObj.isError) {
            isError = true;
            break;
        }
        newnodeconfig.charts[newnodeindex].chartparms = chartParmsObj.chartParms;
        newnodeconfig.charts[newnodeindex].chartCode =
            constants_1.ChartTypeCodes[newnodeconfig.charts[newnodeindex].googlecharttype];
    }
    if (isError) {
        updatechartselections_1.updateChartSelections(chartmatrixrow);
        workingStatus(false);
        return;
    }
    newnodeconfig.datanode = chartParmsObj.datanode;
    let newmatrixcolumn = matrixcolumn + 1;
    chartmatrixrow[newmatrixcolumn] = newnodeconfig;
    refreshPresentation(chartmatrixrow);
    nodeconfig.charts[portalChartIndex].chartselection = context.selection;
    nodeconfig.charts[portalChartIndex].chart = chart;
    nodeconfig.charts[portalChartIndex].ChartObject = context.ChartObject;
    updatechartselections_1.updateChartSelections(chartmatrixrow);
    onPortalCreation();
    workingStatus(false);
};
exports.createChildNode = createChildNode;
