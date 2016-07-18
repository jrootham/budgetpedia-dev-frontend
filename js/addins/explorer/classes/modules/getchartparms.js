"use strict";
var format = require('format-number');
let getChartParms = (props, selectionCallbacks) => {
    let { budgetNode, chartIndex, branchsettings, configData } = props;
    let { viewpointConfig, itemseriesConfig } = configData;
    let budgetCell = budgetNode.cells[chartIndex];
    let nodeDatasetName = budgetCell.nodeDatasetName;
    let sortedlist = 'Sorted' + nodeDatasetName;
    let { viewpointName: viewpointindex, dataNode, timeSpecs: yearscope } = budgetNode;
    let { rightYear: year } = yearscope;
    let { facet: dataseriesname } = branchsettings;
    let units = itemseriesConfig.Units, vertlabel;
    vertlabel = itemseriesConfig.UnitsAlias;
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
    if (!dataNode) {
        return {
            isError: true,
            errorMessage: 'node not found',
            chartParms: {}
        };
    }
    let components;
    if (nodeDatasetName == 'Categories') {
        components = dataNode.Categories;
    }
    else {
        components = dataNode.Components;
    }
    let chartType = budgetCell.googleChartType;
    let axistitle = null;
    if ((dataNode.Contents) && (nodeDatasetName == 'Components')) {
        let titleref = viewpointConfig[dataNode.Contents];
        axistitle = titleref.Alias || titleref.Name;
    }
    else {
        let portaltitles = itemseriesConfig.Titles;
        axistitle = portaltitles.Categories;
    }
    let title;
    if (budgetNode.parentData) {
        let parentdataNode = budgetNode.parentData.dataNode;
        let configindex = dataNode.Config || parentdataNode.Contents;
        let catname = null;
        if (configindex) {
            let category = viewpointConfig[configindex].Instance;
            catname = category.Alias || category.Name;
        }
        else {
            catname = 'Service/Activity';
        }
        title = catname + ': ' + budgetNode.parentData.Name;
    }
    else {
        title = itemseriesConfig.Title;
    }
    let titleamount = null;
    if (dataNode.years) {
        titleamount = dataNode.years[year];
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
    let nodeIndex = budgetNode.nodeIndex;
    let configlocation = {
        nodeIndex: nodeIndex,
        cellIndex: chartIndex
    };
    let events = [
        {
            eventName: 'select',
            callback: (Chart, err) => {
                let chart = Chart.chart;
                let selection = chart.getSelection();
                let chartSelectionData = {
                    selection: selection,
                    err: err
                };
                selectionCallbacks.current(chartSelectionData);
            }
        }
    ];
    let categorylabel = 'Component';
    let columns = [
        { type: 'string', label: categorylabel },
        { type: 'number', label: year.toString() },
        { type: 'string', role: 'annotation' }
    ];
    if (!dataNode[sortedlist]) {
        return {
            isError: true,
            errorMessage: 'sorted list "' + sortedlist + '" not available',
            chartParms: {}
        };
    }
    let rows = dataNode[sortedlist].map((item) => {
        let component = components[item.Code];
        if (!component) {
            console.error('component not found for (node, sortedlist components, item, item.Code) ', dataNode, sortedlist, components, item.Code, item);
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
