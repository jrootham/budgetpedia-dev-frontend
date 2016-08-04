"use strict";
const constants_1 = require('../../constants');
var format = require('format-number');
class BudgetCell {
    constructor(specs) {
        this.switchChartCode = chartCode => {
            this.explorerChartCode = chartCode;
            let chartParmsObj = this.getChartParms();
            if (!chartParmsObj.isError) {
                this.chartParms = chartParmsObj.chartParms;
            }
        };
        this.getChartParms = () => {
            let selectionCallbacks = this.chartCallbacks;
            let budgetCell = this;
            let { cellIndex: chartIndex, nodeDataseriesName } = budgetCell;
            let sortedlist = 'Sorted' + nodeDataseriesName;
            let { branchSettings } = this;
            let { viewpointConfig, datasetConfig } = this.viewpointConfigData;
            let { dataNode, timeSpecs: yearscope, parentData, nodeIndex } = this.nodeData;
            let { rightYear: year } = yearscope;
            let { facet } = branchSettings;
            let datasetName = constants_1.FacetNameToDatasetName[facet];
            let units = datasetConfig.Units, vertlabel;
            vertlabel = datasetConfig.UnitsAlias;
            if (units != 'FTE') {
                if (datasetName == 'BudgetExpenses')
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
            if (nodeDataseriesName == 'Categories') {
                components = dataNode.Categories;
            }
            else {
                components = dataNode.Components;
            }
            let chartType = budgetCell.googleChartType;
            let axistitle = null;
            if ((dataNode.Contents) && (nodeDataseriesName == 'Components')) {
                let titleref = viewpointConfig[dataNode.Contents];
                axistitle = titleref.Alias || titleref.Name;
            }
            else {
                let portaltitles = datasetConfig.Titles;
                axistitle = portaltitles.Categories;
            }
            let title;
            if (parentData) {
                let parentdataNode = parentData.dataNode;
                let configindex = dataNode.Config || parentdataNode.Contents;
                let catname = null;
                if (configindex) {
                    let category = viewpointConfig[configindex].Instance;
                    catname = category.Alias || category.Name;
                }
                else {
                    catname = 'Service/Activity';
                }
                title = catname + ': ' + parentData.Name;
            }
            else {
                title = datasetConfig.Title;
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
                animation: {
                    startup: true,
                    duration: 500,
                    easing: 'out',
                },
                title: title,
                vAxis: { title: vertlabel, minValue: 0, textStyle: { fontSize: 8 } },
                hAxis: { title: axistitle, textStyle: { fontSize: 10 } },
                bar: { groupWidth: "95%" },
                height: "400px",
                width: "400px",
                legend: legendvalue,
                pieHole: 0.4,
                chartArea: {
                    height: chartheight,
                    top: charttop,
                    left: chartleft,
                    width: chartwidth,
                }
            };
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
                            Chart: Chart,
                            selection: selection,
                            err: err
                        };
                        selectionCallbacks.selectionCallback(chartSelectionData);
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
            let categorylabel = 'Component';
            let columns = [
                { type: 'string', label: categorylabel },
                { type: 'number', label: year.toString() },
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
                return [item.Name, amount];
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
        let { nodeDataseriesName, explorerChartCode, chartSelection, uid } = specs;
        this.nodeDataseriesName = nodeDataseriesName;
        this.explorerChartCode = explorerChartCode;
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
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BudgetCell;
