"use strict";
var format = require('format-number');
const updatechartselections_1 = require('./updatechartselections');
const constants_1 = require('../../constants');
let getChartParms = (chartConfig, userselections, budgetdata, setState, chartmatrix) => {
    let viewpointindex = chartConfig.viewpoint, path = chartConfig.datapath, yearscope = chartConfig.yearscope, year = yearscope.latestyear;
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
    let chartType = chartConfig.charttype;
    let titleref = viewpointdata.Configuration[node.Contents];
    let axistitle = titleref.Alias || titleref.Name;
    let title;
    if (chartConfig.parentdata) {
        let parentnode = chartConfig.parentdata.node;
        let configindex = node.Config || parentnode.Contents;
        let category = viewpointdata.Configuration[configindex].Instance;
        let catname = category.Alias || category.Name;
        title = catname + ': ' + chartConfig.parentdata.Name;
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
    let matrixlocation = Object.assign({}, chartConfig.matrixlocation);
    let configlocation = {
        matrixlocation: matrixlocation,
        portalindex: null
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
    if (!node.SortedComponents) {
        return { isError: true, chartParms: {} };
    }
    let rows = node.SortedComponents.map(item => {
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
    };
    return chartParmsObj;
};
exports.getChartParms = getChartParms;
let onChartComponentSelection = (context, userselections, budgetdata, setState, chartmatrix) => {
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
    let chartconfig = chartmatrix[matrixrow][matrixcolumn];
    let viewpoint = chartconfig.viewpoint, dataseries = chartconfig.dataseries;
    serieslist.splice(matrixcolumn + 1);
    setState({
        chartmatrix: chartmatrix,
    });
    if (!selection) {
        delete chartconfig.chartselection;
        delete chartconfig.chart;
        updatechartselections_1.updateChartSelections(chartmatrix, matrixrow);
        return;
    }
    let childdataroot = chartconfig.datapath.slice();
    let { node, components } = getNodeDatasets(userselections.viewpoint, childdataroot, budgetdata);
    if (!node.Components) {
        updatechartselections_1.updateChartSelections(chartmatrix, matrixrow);
        return;
    }
    let code = null;
    let parentdata = null;
    if (node && node.SortedComponents && node.SortedComponents[selectionrow]) {
        parentdata = node.SortedComponents[selectionrow];
        parentdata.node = node;
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
    let newrange = Object.assign({}, chartconfig.yearscope);
    let newchartconfig = {
        viewpoint: viewpoint,
        dataseries: dataseries,
        datapath: childdataroot,
        matrixlocation: {
            row: matrixrow,
            column: matrixcolumn + 1
        },
        parentdata: parentdata,
        yearscope: newrange,
        charttype: userselections.charttype,
    };
    let chartParmsObj = getChartParms(newchartconfig, userselections, budgetdata, setState, chartmatrix);
    if (chartParmsObj.isError) {
        updatechartselections_1.updateChartSelections(chartmatrix, matrixrow);
        return;
    }
    newchartconfig.chartparms = chartParmsObj.chartParms;
    newchartconfig.chartCode = constants_1.ChartTypeCodes[newchartconfig.charttype];
    let newmatrixcolumn = matrixcolumn + 1;
    chartmatrix[matrixrow][newmatrixcolumn] = newchartconfig;
    setState({
        chartmatrix: chartmatrix,
    });
    chartconfig.chartselection = context.selection;
    chartconfig.chart = chart;
    chartconfig.Chart = context.Chart;
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
