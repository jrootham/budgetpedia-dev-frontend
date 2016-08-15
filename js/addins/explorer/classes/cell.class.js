"use strict";
const constants_1 = require('../../constants');
const constants_2 = require('../constants');
var format = require('format-number');
class BudgetCell {
    constructor(specs) {
        this.refreshSelection = () => {
            let budgetCell = this;
            if (budgetCell.chartSelection) {
                if (budgetCell.chartSelection[0] && budgetCell.chart && budgetCell.chart.getSelection().length == 0) {
                    if (budgetCell.googleChartType == "PieChart") {
                        budgetCell.chartSelection[0].column = null;
                    }
                    else {
                        budgetCell.chartSelection[0].column = 1;
                    }
                    budgetCell.chart.setSelection(budgetCell.chartSelection);
                }
            }
        };
        this.switchChartCode = chartCode => {
            this.explorerChartCode = chartCode;
            this.setChartParms();
        };
        this.setChartParms = () => {
            let budgetCell = this;
            let { viewpointConfigs, datasetConfig } = budgetCell.viewpointConfigPack;
            let { nodeData, yearSpecs, metaData, } = budgetCell.nodeDataPack;
            if (!nodeData) {
                console.error('System Error: node not found in setChartParms', budgetCell);
                throw Error('node not found');
            }
            let chartType = budgetCell.googleChartType;
            let options = budgetCell._chartParmsOptions(nodeData, metaData, viewpointConfigs, datasetConfig, yearSpecs);
            let events = budgetCell._chartParmsEvents();
            let columns = budgetCell._chartParmsColumns(yearSpecs);
            let { nodeDataseriesName } = budgetCell;
            let nodeDataseries = nodeData[nodeDataseriesName];
            let sortedlistName = 'Sorted' + nodeDataseriesName;
            let sortedDataseries = nodeData[sortedlistName];
            let rows;
            if (sortedDataseries) {
                rows = budgetCell._chartParmsRows(nodeData, yearSpecs);
            }
            else {
                console.error('System Error: no sortedDataSeries', sortedlistName, sortedDataseries, nodeData);
                return;
            }
            let chartParms = {
                chartType: chartType,
                options: options,
                events: events,
                columns: columns,
                rows: rows,
            };
            budgetCell._chartParms = chartParms;
        };
        this._chartParmsOptions = (nodeData, metaData, viewpointConfigs, datasetConfig, yearSpecs) => {
            let budgetCell = this;
            let { aspectName, nodeDataseriesName } = budgetCell;
            let datasetName = constants_1.AspectNameToDatasetName[aspectName];
            let units = datasetConfig.Units;
            let unitRatio = datasetConfig.UnitRatio;
            let verticalLabel = datasetConfig.UnitsAlias || datasetConfig.Units;
            verticalLabel = datasetConfig.DatasetName + ' (' + verticalLabel + ')';
            let horizontalLabel = null;
            if ((nodeData.ConfigRef) && (nodeDataseriesName != 'CommonObjects')) {
                let titleref = viewpointConfigs[nodeData.ConfigRef];
                horizontalLabel = titleref.Alias || titleref.Name;
            }
            else {
                let portaltitles = datasetConfig.DataseriesTitles;
                horizontalLabel = portaltitles.CommonObjects;
            }
            let nodename = null;
            if (metaData) {
                nodename = metaData.Name;
            }
            else {
                nodename = datasetConfig.DatasetTitle;
            }
            let configindex = nodeData.ConfigRef;
            let catname = null;
            if (configindex) {
                let names = viewpointConfigs[configindex];
                let instancenames = names.Instance;
                catname = instancenames.Alias || instancenames.Name;
            }
            else {
                catname = '(** Unknown Category **)';
            }
            let title = catname + ': ' + nodename;
            let { rightYear, leftYear, yearScope } = yearSpecs;
            let timeSuffix = null;
            if (yearScope == constants_2.TimeScope[constants_2.TimeScope.OneYear]) {
                timeSuffix = rightYear.toString();
            }
            else {
                let separator;
                if (yearScope == constants_2.TimeScope[constants_2.TimeScope.TwoYears]) {
                    separator = ':';
                }
                else {
                    separator = ' - ';
                }
                timeSuffix = leftYear + separator + rightYear;
            }
            timeSuffix = ', ' + timeSuffix;
            title += timeSuffix;
            let titleamount = null;
            let dollarformat = format({ prefix: "$" });
            let rounded = format({ round: 0, integerSeparator: '' });
            let simpleroundedone = format({ round: 1, integerSeparator: ',' });
            if (nodeData.years) {
                titleamount = nodeData.years[rightYear];
            }
            if (unitRatio == 1) {
                titleamount = simpleroundedone(titleamount);
            }
            else {
                titleamount = parseInt(rounded(titleamount / unitRatio));
                if (units == 'DOLLAR') {
                    titleamount = dollarformat(titleamount);
                }
                else {
                    titleamount = simpleroundedone(titleamount);
                }
            }
            title += ' (Total: ' + titleamount + ')';
            let options = {
                animation: {
                    startup: true,
                    duration: 500,
                    easing: 'out',
                },
                title: title,
                vAxis: {
                    title: verticalLabel,
                    minValue: 0,
                    textStyle: {
                        fontSize: 8
                    }
                },
                hAxis: {
                    title: horizontalLabel,
                    textStyle: {
                        fontSize: 10
                    }
                },
                bar: {
                    groupWidth: "95%"
                },
                height: "400px",
                width: "400px",
            };
            let options_extension = budgetCell._chartParmsOptions_chartTypeOptions(budgetCell.googleChartType);
            options = Object.assign(options, options_extension);
            return options;
        };
        this._chartParmsOptions_chartTypeOptions = (googleChartType) => {
            let options = {};
            switch (googleChartType) {
                case "ColumnChart":
                    options = {
                        legend: 'none',
                        chartArea: {
                            height: '50%',
                            top: '15%',
                            left: '25%',
                            width: '70%',
                        }
                    };
                    break;
                case "PieChart":
                    options = {
                        legend: {
                            position: "top",
                            textStyle: {
                                fontSize: 9,
                            },
                            maxLines: 4,
                        },
                        chartArea: {
                            height: '55%',
                            top: '30%',
                            left: 'auto',
                            width: 'auto',
                        }
                    };
                    break;
            }
            return options;
        };
        this._chartParmsEvents = () => {
            let budgetCell = this;
            return [
                {
                    eventName: 'select',
                    callback: (Chart, err) => {
                        let chart = Chart.chart;
                        let selection = chart.getSelection();
                        let chartSelectionData = {
                            selection: selection,
                            err: err
                        };
                        budgetCell.selectionCallback(chartSelectionData);
                    }
                },
                {
                    eventName: 'animationfinish',
                    callback: ((cell) => Chart => {
                        let selection = Chart.chart.getSelection();
                        if (selection.length == 0 && cell.chartSelection && cell.chartSelection.length > 0) {
                            if (cell.chart) {
                                cell.chart.setSelection(cell.chartSelection);
                            }
                        }
                    })(budgetCell)
                }
            ];
        };
        this._chartParmsColumns = (yearSpecs) => {
            let budgetCell = this;
            let { googleChartType } = budgetCell;
            switch (googleChartType) {
                case "ColumnChart":
                    return this._columns_ColumnChart(yearSpecs);
                case "PieChart":
                    return this._columns_PieChart(yearSpecs);
                default:
                    return null;
            }
        };
        this._columns_ColumnChart = (yearSpecs) => {
            let budgetCell = this;
            let categorylabel = 'Component';
            let columns = [
                { type: 'string', label: categorylabel },
                { type: 'number', label: yearSpecs.rightYear.toString() },
                { type: 'string', role: 'style' }
            ];
            return columns;
        };
        this._columns_PieChart = (yearSpecs) => {
            let budgetCell = this;
            let categorylabel = 'Component';
            let columns = [
                { type: 'string', label: categorylabel },
                { type: 'number', label: yearSpecs.rightYear.toString() },
            ];
            return columns;
        };
        this._chartParmsRows = (nodeData, yearSpecs) => {
            let budgetCell = this;
            let { nodeDataseriesName } = budgetCell;
            let nodeDataseries = nodeData[nodeDataseriesName];
            let sortedlistName = 'Sorted' + nodeDataseriesName;
            let sortedDataseries = nodeData[sortedlistName];
            if (!sortedDataseries) {
                console.error({
                    errorMessage: 'sorted list "' + sortedlistName + '" not available'
                });
                throw Error('sorted list "' + sortedlistName + '" not available');
            }
            let rows = sortedDataseries.map((sortedItem) => {
                let componentItem = nodeDataseries[sortedItem.Code];
                if (!componentItem) {
                    console.error('System Error: component not found for (node, sortedlistName, nodeDataseries, item, item.Code) ', nodeData, sortedlistName, nodeDataseries, sortedItem.Code, sortedItem);
                    throw Error('componentItem not found');
                }
                let amount;
                if (componentItem.years) {
                    amount = componentItem.years[yearSpecs.rightYear];
                }
                else {
                    amount = null;
                }
                let row = [sortedItem.Name, amount];
                let { googleChartType } = budgetCell;
                switch (googleChartType) {
                    case "ColumnChart":
                        row = budgetCell._rows_ColumnCharts_row(row, componentItem);
                        break;
                }
                return row;
            });
            return rows;
        };
        this._rows_ColumnCharts_row = (row, componentItem) => {
            let style = '';
            if (componentItem.ConfigRef == 'BASELINE') {
                style = 'stroke-color: Gold; stroke-width: 3';
            }
            row.push(style);
            return row;
        };
        let { nodeDataseriesName, explorerChartCode, chartSelection, uid } = specs;
        this.explorerChartCode = explorerChartCode;
        this.nodeDataseriesName = nodeDataseriesName;
        this.chartSelection = chartSelection;
        this.uid = uid;
    }
    get googleChartType() {
        return constants_1.ChartCodeToGoogleChartType[this.explorerChartCode];
    }
    get chart() {
        if (this.chartComponent)
            return this.chartComponent.chart;
        else
            return null;
    }
    get chartParms() {
        return this._chartParms;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BudgetCell;
