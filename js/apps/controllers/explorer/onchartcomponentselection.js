"use strict";
var format = require('format-number');
const updatechartselections_1 = require('./updatechartselections');
const constants_1 = require('../../constants');
const getchartparms_1 = require('./getchartparms');
const getnodedatasets_1 = require('./getnodedatasets');
let onChartComponentSelection = (props, callbacks) => {
    let context = props.context;
    let userselections = props.userselections;
    let budgetdata = props.budgetdata;
    let chartmatrix = props.chartmatrix;
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
    let chart = context.Chart.chart;
    let selectmatrixlocation = context.portalchartlocation.matrixlocation;
    let matrixrow = selectmatrixlocation.row, matrixcolumn = selectmatrixlocation.column;
    let serieslist = chartmatrix[matrixrow];
    let nodeconfig = chartmatrix[matrixrow][matrixcolumn];
    if (nodeconfig.charts[portalChartIndex].portalcharttype == 'Categories') {
        return;
    }
    let viewpoint = nodeconfig.viewpoint, dataseries = nodeconfig.dataseries;
    serieslist.splice(matrixcolumn + 1);
    refreshPresentation(chartmatrix);
    if (!selection) {
        delete nodeconfig.charts[portalChartIndex].chartselection;
        delete nodeconfig.charts[portalChartIndex].chart;
        updatechartselections_1.updateChartSelections(chartmatrix, matrixrow);
        return;
    }
    let childdataroot = nodeconfig.datapath.slice();
    let { node, components } = getnodedatasets_1.getNodeDatasets(userselections.viewpoint, childdataroot, budgetdata);
    if (!node.Components) {
        updatechartselections_1.updateChartSelections(chartmatrix, matrixrow);
        return;
    }
    let code = null;
    let parentdata = null;
    if (node && node.SortedComponents && node.SortedComponents[selectionrow]) {
        parentdata = node.SortedComponents[selectionrow];
        parentdata.datanode = node;
        code = parentdata.Code;
    }
    if (code)
        childdataroot.push(code);
    else {
        updatechartselections_1.updateChartSelections(chartmatrix, matrixrow);
        return;
    }
    let newnode = node.Components[code];
    if (!newnode.Components && !newnode.Categories) {
        updatechartselections_1.updateChartSelections(chartmatrix, matrixrow);
        return;
    }
    workingStatus(true);
    setTimeout(() => {
        let newrange = Object.assign({}, nodeconfig.yearscope);
        let charttype = userselections.charttype;
        let chartCode = constants_1.ChartTypeCodes[charttype];
        let portalcharts = budgetdata.Viewpoints[viewpoint].PortalCharts[dataseries];
        let charts = [];
        for (let type of portalcharts) {
            if (type.Type == 'Components' && !newnode.Components) {
                continue;
            }
            if (type.Type == 'Categories' && !newnode.Categories) {
                continue;
            }
            let chartconfig = {
                charttype: charttype,
                chartCode: chartCode,
            };
            chartconfig.portalcharttype = type.Type;
            charts.push(chartconfig);
        }
        let newnodeconfig = {
            viewpoint: viewpoint,
            dataseries: dataseries,
            datapath: childdataroot,
            matrixlocation: {
                row: matrixrow,
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
                budgetdata: budgetdata,
                chartmatrix: chartmatrix,
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
                constants_1.ChartTypeCodes[newnodeconfig.charts[newnodeindex].charttype];
        }
        if (isError) {
            updatechartselections_1.updateChartSelections(chartmatrix, matrixrow);
            workingStatus(false);
            return;
        }
        newnodeconfig.datanode = chartParmsObj.datanode;
        let newmatrixcolumn = matrixcolumn + 1;
        chartmatrix[matrixrow][newmatrixcolumn] = newnodeconfig;
        refreshPresentation(chartmatrix);
        nodeconfig.charts[portalChartIndex].chartselection = context.selection;
        nodeconfig.charts[portalChartIndex].chart = chart;
        nodeconfig.charts[portalChartIndex].Chart = context.Chart;
        updatechartselections_1.updateChartSelections(chartmatrix, matrixrow);
        onPortalCreation(newnodeconfig.matrixlocation);
        workingStatus(false);
    });
};
exports.onChartComponentSelection = onChartComponentSelection;
