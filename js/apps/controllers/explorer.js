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
            let comparechartconfig = this.initRootChartConfig(constants_1.ChartSeries.Compare, userselections);
            chartParmsObj = this.getChartParms(comparechartconfig);
            if (!chartParmsObj.error) {
                comparechartconfig.chartparms = chartParmsObj.chartParms;
                matrixlocation = comparechartconfig.matrixlocation;
                chartmatrix[matrixlocation.row][matrixlocation.column] = comparechartconfig;
            }
            this.setState({
                chartmatrix: chartmatrix,
            });
        };
        this.setViewpointAmounts = (viewpointname, dataseriesname, budgetdata) => {
            let viewpoint = budgetdata.Viewpoints[viewpointname];
            if (viewpoint.currentdataseries && (viewpoint.currentdataseries == dataseriesname))
                return;
            let items = budgetdata.DataSeries[dataseriesname].Items;
            let rootcomponent = { "ROOT": viewpoint };
            this.setComponentSummaries(rootcomponent, items);
            viewpoint.currentdataseries = dataseriesname;
            console.log('writing viewpoint ', viewpoint);
        };
        this.setComponentSummaries = (components, items) => {
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
                if (component.Config != "BASELINE") {
                    if (component.Components) {
                        componentSummaries = this.setComponentSummaries(component.Components, items);
                        if (componentSummaries.years)
                            component.years = componentSummaries.years;
                        if (componentSummaries.Aggregates)
                            component.Aggregates = componentSummaries.Aggregates;
                    }
                }
                else {
                    let item = items[componentname];
                    componentSummaries = {
                        years: item.Components,
                        Aggregates: item.years,
                    };
                    if (componentSummaries.years)
                        component.years = componentSummaries.years;
                    if (componentSummaries.Aggregates)
                        component.Components = componentSummaries.Aggregates;
                }
                if (componentSummaries)
                    this.aggregateComponentSummaries(cumulatingSummaries, componentSummaries);
            }
            return cumulatingSummaries;
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
            let budgetdata = this.props.budgetdata, viewpointindex = chartConfig.viewpoint, viewpointdata = budgetdata.Viewpoints[viewpointindex], path = chartConfig.datapath, yearscope = chartConfig.yearscope, year = yearscope.latestyear;
            let { node, components } = this.getNodeDatasets(viewpointindex, path, budgetdata);
            let chartType = chartConfig.charttype;
            let axistitle = '';
            let options = {
                title: '',
                vAxis: { title: 'Amount', minValue: 0, textStyle: { fontSize: 8 } },
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
            let categorylabel = '';
            let columns = [
                { type: 'string', label: categorylabel },
                { type: 'number', label: year.toString() },
                { type: 'string', role: 'annotation' }
            ];
            let amountformat = format({ prefix: "$", suffix: "T" });
            let rounded = format({ round: 0, integerSeparator: '' });
            let rows = components.map(item => {
                let amount = parseInt(rounded(item.Amount / 1000));
                let annotation = amountformat(amount);
                return [item[categorylabel], amount, annotation];
            });
            let chartdata = {
                columns: columns,
                rows: rows,
                options: options,
                events: events,
                chartType: chartType,
            };
            let chartParmsObj = {
                isError: false,
                chartParms: chartdata
            };
            return chartParmsObj;
        };
        this.getNodeDatasets = (viewpointindex, path, budgetdata) => {
            let node = budgetdata.Viewpoints[viewpointindex];
            let components = node.Components;
            for (let index of path) {
                node = components.Component[index];
                components = node.Components;
            }
            return { node: node, components: components };
        };
        this.updateChartsSelection = (context) => {
            let chartmatrix = this.state.chartmatrix;
            let sourcechartconfig = context.chartconfig, selectmatrixlocation = sourcechartconfig.matrixlocation, matrixrow = selectmatrixlocation.row, matrixcolumn = selectmatrixlocation.column, selection = context.selection[0], selectionrow = selection.row, viewpoint = sourcechartconfig.viewpoint, dataseries = sourcechartconfig.dataseries;
            let serieslist = chartmatrix[matrixrow];
            serieslist.splice(matrixcolumn + 1);
            this.setState({
                chartmatrix: chartmatrix,
            });
            let parentchartconfig = chartmatrix[matrixrow][matrixcolumn];
            let childdataroot = parentchartconfig.datapath.map(node => {
                return Object.assign({}, node);
            });
            let newrange = Object.assign({}, parentchartconfig.yearscope);
            let newchartconfig = {
                viewpoint: viewpoint,
                dataseries: dataseries,
                datapath: childdataroot,
                matrixlocation: {
                    row: matrixrow,
                    column: matrixcolumn + 1
                },
                yearscope: newrange,
                chartparms: { chartType: "ColumnChart" }
            };
            let chartParmsObj = this.getChartParms(newchartconfig);
            if (chartParmsObj.isError)
                return;
            chartmatrix[matrixrow][matrixcolumn + 1] = newchartconfig;
            this.setState({
                chartmatrix: chartmatrix,
            });
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
        let dashboardsegment = React.createElement(Card, {initiallyExpanded: false}, React.createElement(CardTitle, {actAsExpander: true, showExpandableButton: true}, "Dashboard"), React.createElement(CardText, {expandable: true}, React.createElement("div", {style: { fontStyle: 'italic' }}, " These dashboard controls are not yet functional "), React.createElement("div", {style: { display: 'inline-block', verticalAlign: "bottom", height: "24px", marginRight: "24px" }}, "Viewpoint:"), React.createElement(RadioButtonGroup, {style: {
            display: (explorer.state.datafacet != "staffing") ? 'inline-block' : 'none',
        }, name: "viewselection", defaultSelected: "functional"}, React.createElement(RadioButton, {value: "functional", label: "Functional", iconStyle: { marginRight: "4px" }, labelStyle: { width: "auto", marginRight: "24px" }, style: { display: 'inline-block', width: 'auto' }}), React.createElement(RadioButton, {value: "structural", label: "Structural", iconStyle: { marginRight: "4px" }, labelStyle: { width: "auto", marginRight: "24px" }, style: { display: 'inline-block', width: 'auto' }}), React.createElement(RadioButton, {value: "auditor", label: "Auditor", iconStyle: { marginRight: "4px" }, labelStyle: { width: "auto", marginRight: "24px" }, style: { display: 'inline-block', width: 'auto' }})), " ", React.createElement("br", null), React.createElement(Divider, null), React.createElement(Checkbox, {label: "Inflation adjusted", defaultChecked: true}), React.createElement(Divider, null), React.createElement("div", {style: { display: 'inline-block', verticalAlign: "bottom", height: "24px", marginRight: "24px" }}, "Years:"), React.createElement(RadioButtonGroup, {style: { display: 'inline-block' }, name: "yearscope", defaultSelected: explorer.state.yearscope, onChange: (ev, selection) => {
            explorer.setState({ yearscope: selection });
        }}, React.createElement(RadioButton, {value: "one", label: "One", iconStyle: { marginRight: "4px" }, labelStyle: { width: "auto", marginRight: "24px" }, style: { display: 'inline-block', width: 'auto' }}), React.createElement(RadioButton, {value: "two", label: "Two (side-by-side)", iconStyle: { marginRight: "4px" }, labelStyle: { width: "auto", marginRight: "24px" }, style: { display: 'inline-block', width: 'auto' }}), React.createElement(RadioButton, {value: "all", label: "All (timelines)", iconStyle: { marginRight: "4px" }, labelStyle: { width: "auto", marginRight: "24px" }, style: { display: 'inline-block', width: 'auto' }})), singleslider, doubleslider, React.createElement("div", {style: { display: (explorer.state.yearscope == 'all') ? 'inline' : 'none' }}, React.createElement(Checkbox, {label: "Year-over-year change, rather than actuals", defaultChecked: false})), React.createElement(Divider, null), React.createElement(RaisedButton, {style: { marginRight: "24px" }, type: "button", label: "Download"}), React.createElement(RaisedButton, {type: "button", label: "Reset"})));
        let drilldownlist = explorer.state.chartmatrix[constants_1.ChartSeries.DrillDown];
        let drilldowncharts = explorer.getCharts(drilldownlist, constants_1.ChartSeries.DrillDown);
        let drilldownsegment = React.createElement(Card, {initiallyExpanded: true}, React.createElement(CardTitle, {actAsExpander: true, showExpandableButton: true}, "Drill Down"), React.createElement(CardText, {expandable: true}, React.createElement("p", null, "Click or tap on any column to drill down."), React.createElement(RadioButtonGroup, {style: { display: 'inline-block' }, name: "datafacet", defaultSelected: explorer.state.datafacet, onChange: (ev, selection) => {
            explorer.setState({
                datafacet: selection,
            });
        }}, React.createElement(RadioButton, {value: "expenses", label: "Expenses", iconStyle: { marginRight: "4px" }, labelStyle: { width: "auto", marginRight: "24px" }, style: { display: 'inline-block', width: 'auto' }}), React.createElement(RadioButton, {value: "revenues", label: "Revenues", iconStyle: { marginRight: "4px" }, labelStyle: { width: "auto", marginRight: "24px" }, style: { display: 'inline-block', width: 'auto' }}), React.createElement(RadioButton, {value: "net", label: "Net", iconStyle: { marginRight: "4px" }, labelStyle: { width: "auto", marginRight: "24px" }, style: { display: 'inline-block', width: 'auto' }}), React.createElement(RadioButton, {value: "staffing", label: "Staffing", iconStyle: { marginRight: "4px" }, labelStyle: { width: "auto", marginRight: "24px" }, style: { display: 'inline-block', width: 'auto' }})), React.createElement(RadioButtonGroup, {style: { display: (explorer.state.datafacet != "staffing") ? 'inline-block' : 'none',
            backgroundColor: "#eee" }, name: "activities", defaultSelected: "activities"}, React.createElement(RadioButton, {value: "activities", label: "Activities", iconStyle: { marginRight: "4px" }, labelStyle: { width: "auto", marginRight: "24px" }, style: { display: 'inline-block', width: 'auto' }}), React.createElement(RadioButton, {value: "categories", label: "Categories", iconStyle: { marginRight: "4px" }, labelStyle: { width: "auto", marginRight: "24px" }, style: { display: 'inline-block', width: 'auto' }})), React.createElement(RadioButtonGroup, {style: { display: (explorer.state.datafacet == "staffing") ? 'inline-block' : 'none',
            backgroundColor: "#eee" }, name: "staffing", defaultSelected: "positions"}, React.createElement(RadioButton, {value: "positions", label: "Positions", iconStyle: { marginRight: "4px" }, labelStyle: { width: "auto", marginRight: "24px" }, style: { display: 'inline-block', width: 'auto' }}), React.createElement(RadioButton, {value: "budget", label: "Budget", iconStyle: { marginRight: "4px" }, labelStyle: { width: "auto", marginRight: "24px" }, style: { display: 'inline-block', width: 'auto' }})), React.createElement(FontIcon, {className: "material-icons"}, "cloud_download"), React.createElement("div", {style: { whiteSpace: "nowrap" }}, React.createElement("div", {style: { overflow: "scroll" }}, drilldowncharts, React.createElement("div", {style: { display: "inline-block", width: "500px" }})))));
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
