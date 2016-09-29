"use strict";
const constants_1 = require('../constants');
const constants_2 = require('../constants');
const utilities_1 = require('../modules/utilities');
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
            this.setChartParms();
        };
        this.switchYearCodes = yearCodes => {
            this.setChartParms();
        };
        this.setChartParms = () => {
            let budgetCell = this;
            let { viewpointNamingConfigs, datasetConfig } = budgetCell.viewpointConfigPack;
            let { treeNodeData, yearSpecs, treeNodeMetaDataFromParentSortedList, } = budgetCell.nodeDataPack;
            if (!treeNodeData) {
                console.error('System Error: node not found in setChartParms', budgetCell);
                throw Error('node not found');
            }
            let chartType = budgetCell.googleChartType;
            let options = budgetCell._chartParmsOptions(treeNodeData, treeNodeMetaDataFromParentSortedList, viewpointNamingConfigs, datasetConfig, yearSpecs);
            let events = budgetCell._chartParmsEvents();
            let columns = budgetCell._chartParmsColumns(yearSpecs);
            let { nodeDataseriesName } = budgetCell;
            let nodeDataseries = treeNodeData[nodeDataseriesName];
            let sortedlistName = 'Sorted' + nodeDataseriesName;
            let sortedDataseries = treeNodeData[sortedlistName];
            let rows;
            if (sortedDataseries) {
                rows = budgetCell._chartParmsRows(treeNodeData, yearSpecs);
            }
            else {
                console.error('System Error: no sortedDataSeries', sortedlistName, sortedDataseries, treeNodeData);
                return;
            }
            let chartParms = {
                chartType: chartType,
                options: options,
                events: events,
                columns: columns,
                rows: rows,
            };
            this.setState({
                chartParms: chartParms,
            });
        };
        this._chartParmsOptions = (treeNodeData, treeNodeMetaDataFromParentSortedList, viewpointNamingConfigs, datasetConfig, yearSpecs) => {
            let budgetCell = this;
            let { aspectName, nodeDataseriesName } = budgetCell;
            let datasetName = constants_1.AspectNameToDatasetName[aspectName];
            let units = datasetConfig.Units;
            let verticalLabel = datasetConfig.UnitsAlias || datasetConfig.Units;
            verticalLabel = datasetConfig.DatasetName + ' (' + verticalLabel + ')';
            let horizontalLabel = null;
            if ((treeNodeData.NamingConfigRef) && (nodeDataseriesName != 'CommonDimension')) {
                let titleref = viewpointNamingConfigs[treeNodeData.NamingConfigRef];
                horizontalLabel = titleref.Contents.Alias || titleref.Contents.Name;
            }
            else {
                if (nodeDataseriesName == 'CommonDimension') {
                    let portaltitles = datasetConfig.CellTitles;
                    horizontalLabel = portaltitles[nodeDataseriesName];
                }
                else {
                    let contentdimensionname = treeNodeData.ComponentsDimensionName;
                    let names = datasetConfig.DimensionNames;
                    horizontalLabel = names[contentdimensionname].Collection;
                }
            }
            let nodename = null;
            if (treeNodeMetaDataFromParentSortedList) {
                nodename = treeNodeMetaDataFromParentSortedList.Name;
            }
            else {
                nodename = datasetConfig.DatasetTitle;
            }
            let configindex = treeNodeData.NamingConfigRef;
            let catname = null;
            if (configindex) {
                let names = viewpointNamingConfigs[configindex];
                let instancenames = names.Instance;
                catname = instancenames.Alias || instancenames.Name;
            }
            else {
                if (treeNodeMetaDataFromParentSortedList &&
                    treeNodeMetaDataFromParentSortedList.parentBudgetNode &&
                    treeNodeMetaDataFromParentSortedList.parentBudgetNode.treeNodeData) {
                    let parentconfigindex = treeNodeMetaDataFromParentSortedList.parentBudgetNode.treeNodeData.NamingConfigRef;
                    if (parentconfigindex) {
                        let names = viewpointNamingConfigs[parentconfigindex];
                        if (names && names.Contents && names.Contents.DefaultInstance) {
                            catname = names.Contents.DefaultInstance.Name;
                        }
                    }
                    else {
                        let nameindex = nodeDataseriesName;
                        if (nameindex = 'Components') {
                            nameindex += 'DimensionName';
                        }
                        else if (name = 'CommonDimension') {
                            nameindex += 'Name';
                        }
                        else {
                            console.error('nodeDataseriesName not found for ', this);
                        }
                        catname = treeNodeMetaDataFromParentSortedList.parentBudgetNode.treeNodeData[nameindex];
                    }
                }
                if (!catname) {
                    catname = '(** Unknown Category **)';
                }
            }
            let title = catname + ': ' + nodename;
            let cellDeclaration = this.cellDeclaration;
            let { rightYear, leftYear } = cellDeclaration.yearSelections;
            let { yearScope } = cellDeclaration;
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
            if (treeNodeData.years) {
                titleamount = treeNodeData.years[rightYear];
                if (units == 'DOLLAR') {
                    titleamount = dollarformat(titleamount);
                }
                else {
                    titleamount = simpleroundedone(titleamount);
                }
                title += ' (Total: ' + titleamount + ')';
            }
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
            let options_extension = budgetCell._chartParmsOptions_chartTypeOptions(budgetCell.googleChartType, treeNodeData);
            options = Object.assign(options, options_extension);
            return options;
        };
        this._chartParmsOptions_chartTypeOptions = (googleChartType, treeNodeData) => {
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
                case "PieChart": {
                    options = this._pieChartOptions(treeNodeData);
                    break;
                }
            }
            return options;
        };
        this._pieChartOptions = (treeNodeData) => {
            let budgetCell = this;
            let cellDeclaration = this.cellDeclaration;
            let { rightYear, leftYear } = cellDeclaration.yearSelections;
            let { nodeDataseriesName } = budgetCell;
            let nodeDataseries = treeNodeData[nodeDataseriesName];
            let sortedlistName = 'Sorted' + nodeDataseriesName;
            let sortedDataseries = treeNodeData[sortedlistName];
            if (!sortedDataseries) {
                console.error({
                    errorMessage: 'sorted list "' + sortedlistName + '" not available'
                });
                throw Error('sorted list "' + sortedlistName + '" not available');
            }
            let sliceslist = sortedDataseries.map((sortedItem) => {
                let componentItem = nodeDataseries[sortedItem.Code];
                if (!componentItem) {
                    console.error('System Error: component not found for (node, sortedlistName, nodeDataseries, item, item.Code) ', treeNodeData, sortedlistName, nodeDataseries, sortedItem.Code, sortedItem);
                    throw Error('componentItem not found');
                }
                let offset = (!(componentItem.Components || componentItem.CommonDimension)) ? 0.2 : 0;
                return offset;
            });
            let slices = {};
            for (let index in sliceslist) {
                slices[index] = { offset: sliceslist[index] };
                if ((slices[index].offset) != 0) {
                    slices[index].color = utilities_1.ColorBrightness(constants_2.GoogleChartColors[index], 120);
                    slices[index].offset = 0;
                }
            }
            let options = {
                slices: slices,
                pieHole: 0.4,
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
            let cellDeclaration = this.cellDeclaration;
            let { rightYear, leftYear } = cellDeclaration.yearSelections;
            let budgetCell = this;
            let categorylabel = 'Component';
            let columns = [
                { type: 'string', label: categorylabel },
                { type: 'number', label: rightYear.toString() },
                { type: 'string', role: 'style' }
            ];
            return columns;
        };
        this._columns_PieChart = (yearSpecs) => {
            let cellDeclaration = this.cellDeclaration;
            let { rightYear, leftYear } = cellDeclaration.yearSelections;
            let budgetCell = this;
            let categorylabel = 'Component';
            let columns = [
                { type: 'string', label: categorylabel },
                { type: 'number', label: rightYear.toString() },
            ];
            return columns;
        };
        this._chartParmsRows = (treeNodeData, yearSpecs) => {
            let budgetCell = this;
            let cellDeclaration = this.cellDeclaration;
            let { rightYear, leftYear } = cellDeclaration.yearSelections;
            let { nodeDataseriesName } = budgetCell;
            let nodeDataseries = treeNodeData[nodeDataseriesName];
            let sortedlistName = 'Sorted' + nodeDataseriesName;
            let sortedDataseries = treeNodeData[sortedlistName];
            if (!sortedDataseries) {
                console.error({
                    errorMessage: 'sorted list "' + sortedlistName + '" not available'
                });
                throw Error('sorted list "' + sortedlistName + '" not available');
            }
            let rows = sortedDataseries.map((sortedItem) => {
                let componentItem = nodeDataseries[sortedItem.Code];
                if (!componentItem) {
                    console.error('System Error: component not found for (node, sortedlistName, nodeDataseries, item, item.Code) ', treeNodeData, sortedlistName, nodeDataseries, sortedItem.Code, sortedItem);
                    throw Error('componentItem not found');
                }
                let amount;
                if (componentItem.years) {
                    amount = componentItem.years[rightYear];
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
            if (componentItem.Baseline) {
                style = 'stroke-color: Gold; stroke-width: 3;';
            }
            if (!(componentItem.Components || componentItem.CommonDimension)) {
                style += 'fill-opacity: 0.5';
            }
            row.push(style);
            return row;
        };
        let { nodeDataseriesName, explorerChartCode, chartSelection, uid } = specs;
        this.nodeDataseriesName = nodeDataseriesName;
        this.chartSelection = chartSelection;
        this.uid = uid;
    }
    get explorerChartCode() {
        let cellDeclaration = this.getProps().declarationData.cellsById[this.uid];
        let settings = cellDeclaration.chartConfigs[cellDeclaration.yearScope];
        return settings.explorerChartCode;
    }
    get googleChartType() {
        return constants_1.ChartCodeToGoogleChartType[this.explorerChartCode];
    }
    get cellDeclaration() {
        return this.getProps().declarationData.cellsById[this.uid];
    }
    get chart() {
        if (this.chartComponent)
            return this.chartComponent.chart;
        else
            return null;
    }
    get chartParms() {
        return this.getState().chartParms;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BudgetCell;
