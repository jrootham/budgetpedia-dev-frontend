"use strict";
var format = require('format-number');
const onchartcomponentselection_1 = require('./onchartcomponentselection');
let getChartParms = (props, callbacks) => {
    let budgetNode = props.budgetNode;
    let chartIndex = props.chartIndex;
    let userselections = props.userselections;
    let budgetdata = props.budgetdata;
    let viewpointdata = budgetdata.viewpointdata;
    let itemseriesdata = viewpointdata.itemseriesconfigdata;
    let chartmatrixrow = props.chartmatrixrow;
    let refreshPresentation = callbacks.refreshPresentation;
    let onPortalCreation = callbacks.onPortalCreation;
    let workingStatus = callbacks.workingStatus;
    let updateChartSelections = callbacks.updateChartSelections;
    let budgetCell = budgetNode.cells[chartIndex];
    let nodeDataPropertyName = budgetCell.nodeDataPropertyName;
    let sortedlist;
    if (nodeDataPropertyName == 'Categories') {
        sortedlist = 'SortedCategories';
    }
    else {
        sortedlist = 'SortedComponents';
    }
    let viewpointindex = budgetNode.viewpointName, yearscope = budgetNode.timeSpecs, year = yearscope.rightYear, node = budgetNode.dataNode;
    let dataseriesname = userselections.facet;
    let units = itemseriesdata.Units, vertlabel;
    vertlabel = itemseriesdata.UnitsAlias;
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
    if (!node) {
        return {
            isError: true,
            errorMessage: 'node not found',
            chartParms: {}
        };
    }
    let components;
    if (nodeDataPropertyName == 'Categories') {
        components = node.Categories;
    }
    else {
        components = node.Components;
    }
    let chartType = budgetCell.googleChartType;
    let axistitle = null;
    if ((node.Contents) && (nodeDataPropertyName == 'Components')) {
        let titleref = viewpointdata.Configuration[node.Contents];
        axistitle = titleref.Alias || titleref.Name;
    }
    else {
        let portaltitles = itemseriesdata.Titles;
        axistitle = portaltitles.Categories;
    }
    let title;
    if (budgetNode.parentData) {
        let parentdataNode = budgetNode.parentData.dataNode;
        let configindex = node.Config || parentdataNode.Contents;
        let catname = null;
        if (configindex) {
            let category = viewpointdata.Configuration[configindex].Instance;
            catname = category.Alias || category.Name;
        }
        else {
            catname = 'Service/Activity';
        }
        title = catname + ': ' + budgetNode.parentData.Name;
    }
    else {
        title = itemseriesdata.Title;
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
        height: "400px",
        width: "400px",
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
    let matrixlocation = Object.assign({}, budgetNode.matrixLocation);
    let configlocation = {
        matrixlocation: matrixlocation,
        cellIndex: chartIndex
    };
    let events = [
        {
            eventName: 'select',
            callback: ((configLocation) => {
                return (Chart, err) => {
                    let chart = Chart.chart;
                    let selection = chart.getSelection();
                    let context = { portalchartlocation: configLocation, ChartObject: Chart, selection: selection, err: err };
                    let props = {
                        context: context,
                        userselections: userselections,
                        budgetdata: budgetdata,
                        chartmatrixrow: chartmatrixrow
                    };
                    let callbacks = {
                        updateChartSelections: updateChartSelections,
                        refreshPresentation: refreshPresentation,
                        onPortalCreation: onPortalCreation,
                        workingStatus: workingStatus,
                    };
                    onchartcomponentselection_1.applyChartComponentSelection(props, callbacks);
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
        return {
            isError: true,
            errorMessage: 'sorted list "' + sortedlist + '" not available',
            chartParms: {}
        };
    }
    let rows = node[sortedlist].map((item) => {
        let component = components[item.Code];
        if (!component) {
            console.error('component not found for (node, sortedlist components, item, item.Code) ', node, sortedlist, components, item.Code, item);
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getChartParms;
