'use strict';
const React = require('react');
var { Component } = React;
var format = require('format-number');
const react_redux_1 = require('react-redux');
const Card = require('material-ui/lib/card/card');
const CardTitle = require('material-ui/lib/card/card-title');
const CardText = require('material-ui/lib/card/card-text');
const RadioButton = require('material-ui/lib/radio-button');
const RadioButtonGroup = require('material-ui/lib/radio-button-group');
const FontIcon = require('material-ui/lib/font-icon');
const IconButton = require('material-ui/lib/icon-button');
const Divider = require('material-ui/lib/divider');
const Checkbox = require('material-ui/lib/checkbox');
const RaisedButton = require('material-ui/lib/raised-button');
const ReactSlider = require('react-slider');
const explorerchart_1 = require('../components/explorerchart');
const constants_1 = require('../constants');
class ExplorerClass extends Component {
    constructor(props) {
        super(props);
        this.state = {
            chartmatrix: [[], []],
            datafacet: "expenses",
            yearslider: { singlevalue: [2015], doublevalue: [2005, 2015] },
            yearscope: "one",
            viewselection: "activities",
            userselections: {
                latestyear: 2015,
                viewpoint: "FUNCTIONAL",
                dataseries: "BudgetExpenses",
                charttype: "ColumnChart",
                inflationadjusted: true,
            }
        };
        this.componentDidMount = () => {
            let userselections = this.state.userselections, chartmatrix = this.state.chartmatrix;
            var matrixlocation, chartParmsObj;
            this.setViewpointAmounts(this.state.userselections.viewpoint, this.state.userselections.dataseries, this.props.budgetdata);
            let drilldownchartconfig = this.initRootChartConfig(constants_1.ChartSeries.DrillDown, userselections);
            chartParmsObj = this.getChartParms(drilldownchartconfig);
            if (!chartParmsObj.error) {
                drilldownchartconfig.chartparms = chartParmsObj.chartParms;
                matrixlocation = drilldownchartconfig.matrixlocation;
                chartmatrix[matrixlocation.row][matrixlocation.column] = drilldownchartconfig;
            }
            this.setState({
                chartmatrix: chartmatrix,
            });
        };
        this.setViewpointAmounts = (viewpointname, dataseriesname, budgetdata) => {
            let viewpoint = budgetdata.Viewpoints[viewpointname];
            if (viewpoint.currentdataseries == dataseriesname)
                return;
            let itemseries = budgetdata.DataSeries[dataseriesname];
            let baselinecat = itemseries.Baseline;
            let baselinelookups = budgetdata.Lookups[baselinecat];
            let componentcat = itemseries.Components;
            let componentlookups = budgetdata.Lookups[componentcat];
            let categorylookups = viewpoint.Lookups.Categories;
            let lookups = {
                baselinelookups: baselinelookups,
                componentlookups: componentlookups,
                categorylookups: categorylookups,
            };
            let items = itemseries.Items;
            let isInflationAdjusted = !!itemseries.InflationAdjusted;
            let rootcomponent = { "ROOT": viewpoint };
            this.setComponentSummaries(rootcomponent, items, isInflationAdjusted, lookups);
            viewpoint.currentdataseries = dataseriesname;
        };
        this.setComponentSummaries = (components, items, isInflationAdjusted, lookups) => {
            let cumulatingSummaries = {
                years: {},
                Aggregates: {},
            };
            for (let componentname in components) {
                let component = components[componentname];
                let componentSummaries = null;
                if (component.years)
                    delete component.years;
                if (component.Aggregates)
                    delete component.Aggregates;
                if (component.Contents != "BASELINE") {
                    if (component.Components) {
                        let sorted = this.getIndexSortedComponents(component.Components, lookups);
                        component.SortedComponents = sorted;
                        componentSummaries = this.setComponentSummaries(component.Components, items, isInflationAdjusted, lookups);
                        if (componentSummaries.years)
                            component.years = componentSummaries.years;
                        if (componentSummaries.Aggregates) {
                            component.Aggregates = componentSummaries.Aggregates;
                            if (component.Aggregates) {
                                let sorted = this.getNameSortedComponents(component.Aggregates, lookups);
                                component.SortedAggregates = sorted;
                            }
                        }
                    }
                }
                else {
                    let item = items[componentname];
                    if (isInflationAdjusted) {
                        if (this.state.userselections.inflationadjusted) {
                            componentSummaries = {
                                years: item.Adjusted.years,
                                Aggregates: item.Adjusted.Components,
                            };
                        }
                        else {
                            componentSummaries = {
                                years: item.Nominal.years,
                                Aggregates: item.Nominal.Components,
                            };
                        }
                    }
                    else {
                        componentSummaries = {
                            years: item.years,
                            Aggregates: item.Components,
                        };
                    }
                    if (componentSummaries.years) {
                        component.years = componentSummaries.years;
                    }
                    if (componentSummaries.Aggregates) {
                        component.Components = componentSummaries.Aggregates;
                    }
                    if (component.Components) {
                        let sorted = this.getNameSortedComponents(component.Components, lookups);
                        component.SortedComponents = sorted;
                    }
                }
                if (componentSummaries) {
                    this.aggregateComponentSummaries(cumulatingSummaries, componentSummaries);
                }
            }
            return cumulatingSummaries;
        };
        this.getIndexSortedComponents = (components, lookups) => {
            let sorted = [];
            let catlookups = lookups.categorylookups;
            for (let componentname in components) {
                let component = components[componentname];
                let config = component.Contents;
                let name = (config == 'BASELINE')
                    ? lookups.baselinelookups[componentname]
                    : catlookups[componentname];
                let item = {
                    Code: componentname,
                    Index: component.Index,
                    Name: name || 'unknown name'
                };
                sorted.push(item);
            }
            sorted.sort((a, b) => {
                let value;
                if (a.Index < b.Index)
                    value = -1;
                else if (a.Index > b.Index)
                    value = 1;
                else
                    value = 0;
                return value;
            });
            return sorted;
        };
        this.getNameSortedComponents = (components, lookups) => {
            let sorted = [];
            let complookups = lookups.componentlookups;
            for (let componentname in components) {
                let component = components[componentname];
                let config = component.Contents;
                let name = complookups[componentname];
                let item = {
                    Code: componentname,
                    Name: name || 'unknown name'
                };
                sorted.push(item);
            }
            sorted.sort((a, b) => {
                let value;
                if (a.Name < b.Name)
                    value = -1;
                else if (a.Name > b.Name)
                    value = 1;
                else
                    value = 0;
                return value;
            });
            return sorted;
        };
        this.aggregateComponentSummaries = (cumulatingSummaries, componentSummaries) => {
            if (componentSummaries.years) {
                let years = componentSummaries.years;
                for (let yearname in years) {
                    let yearvalue = years[yearname];
                    if (cumulatingSummaries.years[yearname])
                        cumulatingSummaries.years[yearname] += yearvalue;
                    else
                        cumulatingSummaries.years[yearname] = yearvalue;
                }
            }
            if (componentSummaries.Aggregates) {
                let Aggregates = componentSummaries.Aggregates;
                for (let aggregatename in Aggregates) {
                    let Aggregate = Aggregates[aggregatename];
                    if (Aggregate.years) {
                        let years = Aggregate.years;
                        for (let yearname in years) {
                            let yearvalue = years[yearname];
                            let cumulatingAggregate = cumulatingSummaries.Aggregates[aggregatename] || { years: {} };
                            if (cumulatingAggregate.years[yearname])
                                cumulatingAggregate.years[yearname] += yearvalue;
                            else
                                cumulatingAggregate.years[yearname] = yearvalue;
                            cumulatingSummaries.Aggregates[aggregatename] = cumulatingAggregate;
                        }
                    }
                }
            }
        };
        this.initRootChartConfig = (matrixrow, userselections) => {
            return {
                viewpoint: userselections.viewpoint,
                dataseries: userselections.dataseries,
                datapath: [],
                matrixlocation: {
                    row: matrixrow,
                    column: 0
                },
                yearscope: {
                    latestyear: userselections.latestyear,
                    earliestyear: null,
                    fullrange: false,
                },
                charttype: userselections.charttype
            };
        };
        this.getChartParms = (chartConfig) => {
            let viewpointindex = chartConfig.viewpoint, path = chartConfig.datapath, yearscope = chartConfig.yearscope, year = yearscope.latestyear;
            let userselections = this.state.userselections, dataseriesname = userselections.dataseries;
            let budgetdata = this.props.budgetdata, viewpointdata = budgetdata.Viewpoints[viewpointindex], itemseries = budgetdata.DataSeries[dataseriesname], units = itemseries.Units, vertlabel = itemseries.UnitsAlias + ' (Expenses)';
            let isError = false;
            let thousandsformat = format({ prefix: "$", suffix: "T" });
            let rounded = format({ round: 0, integerSeparator: '' });
            let { node, components } = this.getNodeDatasets(viewpointindex, path);
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
            let titleamount = node.years[year];
            if (units == 'DOLLAR') {
                titleamount = parseInt(rounded(titleamount / 1000));
            }
            else {
                titleamount = titleamount;
            }
            title += ' (Total: ' + thousandsformat(titleamount) + ')';
            let options = {
                title: title,
                vAxis: { title: vertlabel, minValue: 0, textStyle: { fontSize: 8 } },
                hAxis: { title: axistitle, textStyle: { fontSize: 8 } },
                bar: { groupWidth: "95%" },
                height: 400,
                width: 400,
                legend: 'none',
                annotations: { alwaysOutside: true }
            };
            let events = [
                {
                    eventName: 'select',
                    callback: ((chartconfig) => {
                        let self = this;
                        return (Chart, err) => {
                            let chart = Chart.chart;
                            let selection = chart.getSelection();
                            let context = { chartconfig: chartconfig, chart: chart, selection: selection, err: err };
                            self.updateChartsSelection(context);
                        };
                    })(chartConfig)
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
                let amount;
                if (units == 'DOLLAR') {
                    amount = parseInt(rounded(components[item.Code].years[year] / 1000));
                }
                else {
                    amount = components[item.Code].years[year];
                }
                let annotation = thousandsformat(amount);
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
        this.getNodeDatasets = (viewpointindex, path) => {
            let budgetdata = this.props.budgetdata;
            let node = budgetdata.Viewpoints[viewpointindex];
            let components = node.Components;
            for (let index of path) {
                node = components[index];
                components = node.Components;
            }
            return { node: node, components: components };
        };
        this.updateChartsSelection = (context) => {
            let userselections = this.state.userselections;
            let selection = context.selection[0];
            let selectionrow;
            if (selection) {
                selectionrow = selection.row;
            }
            else {
                selectionrow = null;
            }
            let chart = context.chart;
            let chartconfig = context.chartconfig, selectmatrixlocation = chartconfig.matrixlocation;
            let matrixrow = selectmatrixlocation.row, matrixcolumn = selectmatrixlocation.column;
            let chartmatrix = this.state.chartmatrix, serieslist = chartmatrix[matrixrow];
            let viewpoint = chartconfig.viewpoint, dataseries = chartconfig.dataseries;
            serieslist.splice(matrixcolumn + 1);
            this.setState({
                chartmatrix: chartmatrix,
            });
            if (!selection) {
                delete chartconfig.chartselection;
                delete chartconfig.chart;
                this.updateSelections(chartmatrix, matrixrow);
                return;
            }
            let childdataroot = chartconfig.datapath.slice();
            let { node, components } = this.getNodeDatasets(userselections.viewpoint, childdataroot);
            if (!node.Components) {
                this.updateSelections(chartmatrix, matrixrow);
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
                this.updateSelections(chartmatrix, matrixrow);
                return;
            }
            let newnode = node.Components[code];
            if (!newnode.Components) {
                this.updateSelections(chartmatrix, matrixrow);
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
            let chartParmsObj = this.getChartParms(newchartconfig);
            if (chartParmsObj.isError) {
                this.updateSelections(chartmatrix, matrixrow);
                return;
            }
            newchartconfig.chartparms = chartParmsObj.chartParms;
            let newmatrixcolumn = matrixcolumn + 1;
            chartmatrix[matrixrow][newmatrixcolumn] = newchartconfig;
            this.setState({
                chartmatrix: chartmatrix,
            });
            chartconfig.chartselection = context.selection,
                chartconfig.chart = chart;
            this.updateSelections(chartmatrix, matrixrow);
        };
        this.updateSelections = (chartmatrix, matrixrow) => {
            for (let config of chartmatrix[matrixrow]) {
                let chart = config.chart;
                let selection = config.chartselection;
                if (chart)
                    chart.setSelection(selection);
            }
        };
        this.getCharts = (matrixcolumn, matrixrow) => {
            let charts = matrixcolumn.map((chartconfig, index) => {
                let chartparms = chartconfig.chartparms;
                return React.createElement(explorerchart_1.ExplorerChart, {key: index, chartType: chartparms.chartType, options: chartparms.options, chartEvents: chartparms.events, rows: chartparms.rows, columns: chartparms.columns, graph_id: "ChartID" + matrixrow + '' + index});
            });
            return charts;
        };
    }
    render() {
        let explorer = this;
        let singleslider = (explorer.state.yearscope == 'one') ?
            React.createElement(ReactSlider, {className: "horizontal-slider", defaultValue: explorer.state.yearslider.singlevalue, min: 2003, max: 2016, onChange: (value) => {
                explorer.setState({
                    yearslider: Object.assign(explorer.state.yearslider, {
                        singlevalue: [value]
                    })
                });
            }}, React.createElement("div", null, explorer.state.yearslider.singlevalue[0])) : '';
        let doubleslider = (explorer.state.yearscope != 'one') ?
            React.createElement(ReactSlider, {className: "horizontal-slider", defaultValue: explorer.state.yearslider.doublevalue, min: 2003, max: 2016, withBars: (explorer.state.yearscope == 'all') ? true : false, onChange: (value) => {
                explorer.setState({
                    yearslider: Object.assign(explorer.state.yearslider, {
                        doublevalue: value
                    })
                });
            }}, React.createElement("div", null, explorer.state.yearslider.doublevalue[0]), React.createElement("div", null, explorer.state.yearslider.doublevalue[1])) : '';
        let dashboardsegment = React.createElement(Card, {initiallyExpanded: false}, React.createElement(CardTitle, {actAsExpander: true, showExpandableButton: true}, "Dashboard"), React.createElement(CardText, {expandable: true}, React.createElement("div", {style: { fontStyle: 'italic' }}, " These dashboard controls are not yet functional "), React.createElement(Divider, null), React.createElement(Checkbox, {label: "Inflation adjusted", defaultChecked: true}), React.createElement(Divider, null), React.createElement("div", {style: { display: 'inline-block', verticalAlign: "bottom", height: "24px", marginRight: "24px" }}, "Years:"), React.createElement(RadioButtonGroup, {style: { display: 'inline-block' }, name: "yearscope", defaultSelected: explorer.state.yearscope, onChange: (ev, selection) => {
            explorer.setState({ yearscope: selection });
        }}, React.createElement(RadioButton, {value: "one", label: "One", iconStyle: { marginRight: "4px" }, labelStyle: { width: "auto", marginRight: "24px" }, style: { display: 'inline-block', width: 'auto' }}), React.createElement(RadioButton, {value: "two", label: "Two (side-by-side)", iconStyle: { marginRight: "4px" }, labelStyle: { width: "auto", marginRight: "24px" }, style: { display: 'inline-block', width: 'auto' }}), React.createElement(RadioButton, {value: "all", label: "All (timelines)", iconStyle: { marginRight: "4px" }, labelStyle: { width: "auto", marginRight: "24px" }, style: { display: 'inline-block', width: 'auto' }})), singleslider, doubleslider, React.createElement("div", {style: { display: (explorer.state.yearscope == 'all') ? 'inline' : 'none' }}, React.createElement(Checkbox, {label: "Year-over-year change, rather than actuals", defaultChecked: false})), React.createElement(Divider, null), React.createElement(RaisedButton, {style: { marginRight: "24px" }, type: "button", label: "Download"}), React.createElement(RaisedButton, {type: "button", label: "Reset"})));
        let drilldownlist = explorer.state.chartmatrix[constants_1.ChartSeries.DrillDown];
        let drilldowncharts = explorer.getCharts(drilldownlist, constants_1.ChartSeries.DrillDown);
        let drilldownsegment = React.createElement(Card, {initiallyExpanded: true}, React.createElement(CardTitle, {actAsExpander: true, showExpandableButton: true}, "Drill Down"), React.createElement(CardText, {expandable: true}, React.createElement("p", null, "Click or tap on any column to drill down.", React.createElement(IconButton, {tooltip: "help", tooltipPosition: "top-center"}, React.createElement(FontIcon, {className: "material-icons"}, "help_outline"))), React.createElement("div", {style: {
            padding: "3px" }}, React.createElement("span", null, "Viewpoints: "), React.createElement(IconButton, {tooltip: "Functional", tooltipPosition: "top-center", style: { backgroundColor: 'lightgreen' }}, React.createElement(FontIcon, {className: "material-icons"}, "directions_walk")), React.createElement(IconButton, {tooltip: "Structural", tooltipPosition: "top-center"}, React.createElement(FontIcon, {className: "material-icons"}, "layers")), React.createElement("span", null, "Facets: "), React.createElement(IconButton, {tooltip: "Expenses", tooltipPosition: "top-center", style: { backgroundColor: 'lightgreen' }}, React.createElement(FontIcon, {className: "material-icons"}, "attach_money")), React.createElement(IconButton, {tooltip: "Revenues", tooltipPosition: "top-center"}, React.createElement(FontIcon, {className: "material-icons"}, "receipt")), React.createElement(IconButton, {tooltip: "Staffing", tooltipPosition: "top-center"}, React.createElement(FontIcon, {className: "material-icons"}, "people"))), React.createElement("div", {style: { display: "none" }}, React.createElement(RadioButtonGroup, {style: { display: 'inline-block' }, name: "datafacet", defaultSelected: explorer.state.datafacet, onChange: (ev, selection) => {
            explorer.setState({
                datafacet: selection,
            });
        }}, React.createElement(RadioButton, {value: "expenses", label: "Expenses", iconStyle: { marginRight: "4px" }, labelStyle: { width: "auto", marginRight: "24px" }, style: { display: 'inline-block', width: 'auto' }}), React.createElement(RadioButton, {value: "revenues", label: "Revenues", iconStyle: { marginRight: "4px" }, labelStyle: { width: "auto", marginRight: "24px" }, style: { display: 'inline-block', width: 'auto' }}), React.createElement(RadioButton, {value: "net", label: "Net", iconStyle: { marginRight: "4px" }, labelStyle: { width: "auto", marginRight: "24px" }, style: { display: 'inline-block', width: 'auto' }}), React.createElement(RadioButton, {value: "staffing", label: "Staffing", iconStyle: { marginRight: "4px" }, labelStyle: { width: "auto", marginRight: "24px" }, style: { display: 'inline-block', width: 'auto' }})), React.createElement(RadioButtonGroup, {style: { display: (explorer.state.datafacet != "staffing") ? 'inline-block' : 'none',
            backgroundColor: "#eee" }, name: "activities", defaultSelected: "activities"}, React.createElement(RadioButton, {value: "activities", label: "Activities", iconStyle: { marginRight: "4px" }, labelStyle: { width: "auto", marginRight: "24px" }, style: { display: 'inline-block', width: 'auto' }}), React.createElement(RadioButton, {value: "categories", label: "Categories", iconStyle: { marginRight: "4px" }, labelStyle: { width: "auto", marginRight: "24px" }, style: { display: 'inline-block', width: 'auto' }})), React.createElement(RadioButtonGroup, {style: { display: (explorer.state.datafacet == "staffing") ? 'inline-block' : 'none',
            backgroundColor: "#eee" }, name: "staffing", defaultSelected: "positions"}, React.createElement(RadioButton, {value: "positions", label: "Positions", iconStyle: { marginRight: "4px" }, labelStyle: { width: "auto", marginRight: "24px" }, style: { display: 'inline-block', width: 'auto' }}), React.createElement(RadioButton, {value: "budget", label: "Budget", iconStyle: { marginRight: "4px" }, labelStyle: { width: "auto", marginRight: "24px" }, style: { display: 'inline-block', width: 'auto' }})), React.createElement(FontIcon, {className: "material-icons"}, "cloud_download")), React.createElement("div", {style: { whiteSpace: "nowrap" }}, React.createElement("div", {style: { overflow: "scroll" }}, drilldowncharts, React.createElement("div", {style: { display: "inline-block", width: "500px" }})))));
        let comparelist = explorer.state.chartmatrix[constants_1.ChartSeries.Compare];
        let comparecharts = explorer.getCharts(comparelist, constants_1.ChartSeries.Compare);
        let comparesegment = React.createElement(Card, {initiallyExpanded: false}, React.createElement(CardTitle, {actAsExpander: true, showExpandableButton: true}, "Compare"), React.createElement(CardText, {expandable: true}, React.createElement("p", null, "Click or tap on any column to drill down"), React.createElement("div", {style: { whiteSpace: "nowrap" }}, React.createElement("div", {style: { overflow: "scroll" }}, comparecharts, React.createElement("div", {style: { display: "inline-block", width: "500px" }})))));
        let differencessegment = React.createElement(Card, null, React.createElement(CardTitle, null, "Show differences"));
        let contextsegment = React.createElement(Card, null, React.createElement(CardTitle, null, "Context"));
        let buildsegment = React.createElement(Card, null, React.createElement(CardTitle, null, "Build"));
        return React.createElement("div", null, dashboardsegment, drilldownsegment, comparesegment, differencessegment, contextsegment, buildsegment);
    }
}
let mapStateToProps = (state) => {
    let { budgetdata } = state;
    return {
        budgetdata: budgetdata,
    };
};
let Explorer = react_redux_1.connect(mapStateToProps)(ExplorerClass);
exports.Explorer = Explorer;
