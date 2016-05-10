"use strict";
var format = require('format-number');
const updatechartselections_1 = require('./updatechartselections');
const constants_1 = require('../../constants');
let getChartParms = (nodeConfig, chartIndex, userselections, budgetdata, setState, chartmatrix) => {
    let chartConfig = nodeConfig.charts[chartIndex];
    let sortedlist = 'SortedComponents';
    let portalcharttype = chartConfig.portalcharttype;
    if (portalcharttype == 'Categories') {
        sortedlist = 'SortedCategories';
    }
    let viewpointindex = nodeConfig.viewpoint, path = nodeConfig.datapath, yearscope = nodeConfig.yearscope, year = yearscope.latestyear;
    let dataseriesname = userselections.dataseries;
    let viewpointdata = budgetdata.Viewpoints[viewpointindex], itemseries = budgetdata.DataSeries[dataseriesname], units = itemseries.Units, vertlabel;
    vertlabel = itemseries.UnitsAlias;
    if (units != 'FTE') {
        if (dataseriesname == 'BudgetExpenses')
            vertlabel += ' (Expenses)';
        else
            vertlabel += ' (Revenues)';
    }
    let isError = false;
    let thousandsformat = format({ prefix: "$", suffix: "T" });
    let rounded = format({ round: 0, integerSeparator: '' });
    let singlerounded = format({ round: 1, integerSeparator: '' });
    let staffrounded = format({ round: 1, integerSeparator: ',' });
    let { node, components } = getNodeDatasets(viewpointindex, path, budgetdata);
    if (portalcharttype == 'Categories') {
        components = node.Categories;
    }
    let chartType = chartConfig.charttype;
    let axistitle = null;
    if ((node.Contents != 'BASELINE') && (portalcharttype == 'Components')) {
        let titleref = viewpointdata.Configuration[node.Contents];
        axistitle = titleref.Alias || titleref.Name;
    }
    else {
        let portaltitles = budgetdata.DataSeries[dataseriesname].Titles;
        axistitle = portaltitles.Components;
    }
    let title;
    if (nodeConfig.parentdata) {
        let parentdatanode = nodeConfig.parentdata.datanode;
        let configindex = node.Config || parentdatanode.Contents;
        let category = viewpointdata.Configuration[configindex].Instance;
        let catname = category.Alias || category.Name;
        title = catname + ': ' + nodeConfig.parentdata.Name;
    }
    else {
        title = itemseries.Title;
    }
    let titleamount = null;
    if (node.years) {
        titleamount = node.years[year];
    }
    if (units == 'DOLLAR') {
        titleamount = parseInt(rounded(titleamount / 1000));
        titleamount = thousandsformat(titleamount);
    }
    else {
        titleamount = staffrounded(titleamount);
    }
    title += ' (Total: ' + titleamount + ')';
    let legendvalue;
    let chartheight;
    let charttop;
    switch (chartType) {
        case "ColumnChart":
            legendvalue = "none";
            chartheight = 'auto';
            charttop = 'auto';
            break;
        case "PieChart":
            legendvalue = {
                position: "top",
                textStyle: {
                    fontSize: 9
                },
                maxLines: 4
            };
            chartheight = '70%';
            charttop = '30%';
            break;
        default:
            break;
    }
    let options = {
        title: title,
        vAxis: { title: vertlabel, minValue: 0, textStyle: { fontSize: 8 } },
        hAxis: { title: axistitle, textStyle: { fontSize: 9 } },
        bar: { groupWidth: "95%" },
        height: 400,
        width: 400,
        legend: legendvalue,
        annotations: { alwaysOutside: true },
        pieHole: 0.4,
        chartArea: {
            height: chartheight,
            top: charttop
        }
    };
    let matrixlocation = Object.assign({}, nodeConfig.matrixlocation);
    let configlocation = {
        matrixlocation: matrixlocation,
        portalindex: chartIndex
    };
    let events = [
        {
            eventName: 'select',
            callback: ((configLocation) => {
                return (Chart, err) => {
                    let chart = Chart.chart;
                    let selection = chart.getSelection();
                    let context = { portalchartlocation: configLocation, Chart: Chart, selection: selection, err: err };
                    onChartComponentSelection(context, userselections, budgetdata, setState, chartmatrix);
                };
            })(configlocation)
        }
    ];
    let categorylabel = 'Component';
    let columns = [
        { type: 'string', label: categorylabel },
        { type: 'number', label: year.toString() },
        { type: 'string', role: 'annotation' }
    ];
    if (!node[sortedlist]) {
        return { isError: true, chartParms: {} };
    }
    let rows = node[sortedlist].map((item) => {
        let component = components[item.Code];
        if (!component) {
            console.error('component not found for (components, item, item.Code) ', components, item.Code, item);
        }
        let amount;
        if (component.years)
            amount = components[item.Code].years[year];
        else
            amount = null;
        let annotation;
        if (units == 'DOLLAR') {
            amount = parseInt(rounded(amount / 1000));
            annotation = thousandsformat(amount);
        }
        else if (units == 'FTE') {
            annotation = staffrounded(amount);
            amount = parseInt(singlerounded(amount));
        }
        else {
            if (components[item.Code] && components[item.Code].years)
                amount = components[item.Code].years[year];
            else
                amount = null;
            annotation = amount;
        }
        return [item.Name, amount, annotation];
    });
    let chartParms = {
        columns: columns,
        rows: rows,
        options: options,
        events: events,
        chartType: chartType,
    };
    let chartParmsObj = {
        isError: isError,
        chartParms: chartParms,
        datanode: node,
    };
    return chartParmsObj;
};
exports.getChartParms = getChartParms;
let onChartComponentSelection = (context, userselections, budgetdata, setState, chartmatrix) => {
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
    if (nodeconfig.charts[portalChartIndex].portalcharttype == 'Categories')
        return;
    let viewpoint = nodeconfig.viewpoint, dataseries = nodeconfig.dataseries;
    serieslist.splice(matrixcolumn + 1);
    setState({
        chartmatrix: chartmatrix,
    });
    if (!selection) {
        delete nodeconfig.charts[portalChartIndex].chartselection;
        delete nodeconfig.charts[portalChartIndex].chart;
        updatechartselections_1.updateChartSelections(chartmatrix, matrixrow);
        return;
    }
    let childdataroot = nodeconfig.datapath.slice();
    let { node, components } = getNodeDatasets(userselections.viewpoint, childdataroot, budgetdata);
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
    if (!newnode.Components) {
        updatechartselections_1.updateChartSelections(chartmatrix, matrixrow);
        return;
    }
    let newrange = Object.assign({}, nodeconfig.yearscope);
    let charttype = userselections.charttype;
    let chartCode = constants_1.ChartTypeCodes[charttype];
    let portalcharts = budgetdata.Viewpoints[viewpoint].PortalCharts[dataseries];
    let charts = [];
    for (let type of portalcharts) {
        if ((newnode.Contents == 'BASELINE') && (type.Type == 'Categories')) {
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
        chartParmsObj = getChartParms(newnodeconfig, newnodeindex, userselections, budgetdata, setState, chartmatrix);
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
        return;
    }
    newnodeconfig.datanode = chartParmsObj.datanode;
    let newmatrixcolumn = matrixcolumn + 1;
    chartmatrix[matrixrow][newmatrixcolumn] = newnodeconfig;
    setState({
        chartmatrix: chartmatrix,
    });
    nodeconfig.charts[portalChartIndex].chartselection = context.selection;
    nodeconfig.charts[portalChartIndex].chart = chart;
    nodeconfig.charts[portalChartIndex].Chart = context.Chart;
    updatechartselections_1.updateChartSelections(chartmatrix, matrixrow);
};
let getNodeDatasets = (viewpointindex, path, budgetdata) => {
    let node = budgetdata.Viewpoints[viewpointindex];
    let components = node.Components;
    for (let index of path) {
        node = components[index];
        if (!node)
            console.error('component node not found', components, viewpointindex, path);
        components = node.Components;
    }
    return { node: node, components: components };
};
