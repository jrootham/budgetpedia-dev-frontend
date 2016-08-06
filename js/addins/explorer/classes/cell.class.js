"use strict";
const constants_1 = require('../../constants');
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
            let { facetName: facet, nodeDataseriesName, selectionCallback, } = budgetCell;
            let { viewpointConfig, datasetConfig } = budgetCell.viewpointConfigPack;
            let { dataNode, timeSpecs: yearscope, parentData, } = budgetCell.nodeDataPack;
            if (!dataNode) {
                console.error('node not found', {
                    isError: true,
                    errorMessage: 'node not found',
                    chartParms: {}
                });
                throw Error('node not found');
            }
            let components = dataNode[nodeDataseriesName];
            let chartType = budgetCell.googleChartType;
            let datasetName = constants_1.FacetNameToDatasetName[facet];
            let units = datasetConfig.Units;
            let vertlabel;
            vertlabel = datasetConfig.UnitsAlias;
            if (units != 'FTE') {
                if (datasetName == 'BudgetExpenses')
                    vertlabel = 'Expenditures' + ' (' + vertlabel + ')';
                else
                    vertlabel = 'Revenues' + ' (' + vertlabel + ')';
            }
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
            let { rightYear: year } = yearscope;
            let titleamount = null;
            let thousandsformat = format({ prefix: "$" });
            let rounded = format({ round: 0, integerSeparator: '' });
            let staffrounded = format({ round: 1, integerSeparator: ',' });
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
                        selectionCallback(chartSelectionData);
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
            let setStyle = false;
            if (chartType == 'ColumnChart') {
                columns.push({ type: 'string', role: 'style' });
                setStyle = true;
            }
            let sortedlist = 'Sorted' + nodeDataseriesName;
            if (!dataNode[sortedlist]) {
                console.error({
                    isError: true,
                    errorMessage: 'sorted list "' + sortedlist + '" not available',
                    chartParms: {}
                });
                throw Error('sorted list "' + sortedlist + '" not available');
            }
            let rows = dataNode[sortedlist].map((item) => {
                let component = components[item.Code];
                if (!component) {
                    console.error('component not found for (node, sortedlist components, item, item.Code) ', dataNode, sortedlist, components, item.Code, item);
                }
                let amount;
                if (component.years) {
                    amount = components[item.Code].years[year];
                }
                else {
                    amount = null;
                }
                let retval = [item.Name, amount];
                let style = '';
                if (component.Contents == 'BASELINE') {
                    style = 'stroke-color: Gold; stroke-width: 3';
                }
                if (setStyle)
                    retval.push(style);
                return retval;
            });
            let chartParms = {
                chartType: chartType,
                options: options,
                events: events,
                columns: columns,
                rows: rows,
            };
            this._chartParms = chartParms;
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
