"use strict";
var format = require('format-number');
const onchartcomponentselection_1 = require('./onchartcomponentselection');
let getChartParms = (props, callbacks) => {
    let nodeConfig = props.nodeConfig;
    let chartIndex = props.chartIndex;
    let userselections = props.userselections;
    let budgetdata = props.budgetdata;
    let chartmatrix = props.chartmatrix;
    let refreshPresentation = callbacks.refreshPresentation;
    let onPortalCreation = callbacks.onPortalCreation;
    let workingStatus = callbacks.workingStatus;
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
            vertlabel = 'Expenditures' + ' (' + vertlabel + ')';
        else
            vertlabel = 'Revenues' + ' (' + vertlabel + ')';
    }
    let isError = false;
    let thousandsformat = format({ prefix: "$" });
    let rounded = format({ round: 0, integerSeparator: '' });
    let singlerounded = format({ round: 1, integerSeparator: '' });
    let staffrounded = format({ round: 1, integerSeparator: ',' });
    let { node, components } = getNodeDatasets(viewpointindex, path, budgetdata);
    if (portalcharttype == 'Categories') {
        components = node.Categories;
    }
    let chartType = chartConfig.charttype;
    let axistitle = null;
    if ((node.Contents) && (node.Contents != 'BASELINE') && (portalcharttype == 'Components')) {
        let titleref = viewpointdata.Configuration[node.Contents];
        axistitle = titleref.Alias || titleref.Name;
    }
    else {
        let portaltitles = budgetdata.DataSeries[dataseriesname].Titles;
        axistitle = portaltitles.Categories;
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
    let chartleft;
    let chartwidth;
    switch (chartType) {
        case "ColumnChart":
            legendvalue = 'none';
            chartheight = '50%';
            charttop = '15%';
            chartleft = '25%';
            chartwidth = '70%';
            break;
        case "PieChart":
            legendvalue = {
                position: "top",
                textStyle: {
                    fontSize: 9
                },
                maxLines: 4
            };
            chartheight = '55%';
            charttop = '30%';
            chartleft = 'auto';
            chartwidth = 'auto';
            break;
        default:
            break;
    }
    let options = {
        title: title,
        vAxis: { title: vertlabel, minValue: 0, textStyle: { fontSize: 8 } },
        hAxis: { title: axistitle, textStyle: { fontSize: 10 } },
        bar: { groupWidth: "95%" },
        height: 400,
        width: 400,
        legend: legendvalue,
        annotations: { alwaysOutside: true },
        pieHole: 0.4,
        chartArea: {
            height: chartheight,
            top: charttop,
            left: chartleft,
            width: chartwidth,
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
                    let props = {
                        context: context,
                        userselections: userselections,
                        budgetdata: budgetdata,
                        chartmatrix: chartmatrix
                    };
                    let callbacks = {
                        refreshPresentation: refreshPresentation,
                        onPortalCreation: onPortalCreation,
                        workingStatus: workingStatus,
                    };
                    onchartcomponentselection_1.onChartComponentSelection(props, callbacks);
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
        console.log('sortedlist missing from node ', sortedlist, node);
        return {
            isError: true,
            errorMessage: 'sorted list "' + sortedlist + '" not available',
            chartParms: {}
        };
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
exports.getNodeDatasets = getNodeDatasets;
