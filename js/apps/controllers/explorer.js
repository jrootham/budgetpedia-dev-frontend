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
const constants_2 = require('../constants');
class ExplorerClass extends Component {
    constructor(props) {
        super(props);
        this.state = {
            seriesdata: [[], []],
            dataselection: "expenses",
            slider: { singlevalue: [2015], doublevalue: [2005, 2015] },
            yearselection: "one",
            viewselection: "activities",
            userselections: {
                latestyear: 2015,
                viewpoint: "FUNCTIONAL",
                dataseries: "BudgetExpenses",
            }
        };
        this.componentDidMount = () => {
            var userselections = this.state.userselections;
            let seriesdata = this.state.seriesdata;
            var chartlocation;
            this.setViewpointAmounts(this.state.userselections.viewpoint, this.state.userselections.dataseries, this.props.budgetdata);
            let drilldownchartparms = this.initSeedChartParms(constants_1.ChartSeries.DrillDown, userselections);
            drilldownchartparms = this.addChartSpecs(drilldownchartparms);
            chartlocation = drilldownchartparms.location;
            seriesdata[chartlocation.series][chartlocation.depth] = drilldownchartparms;
            let comparechartparms = this.initSeedChartParms(constants_1.ChartSeries.Compare, userselections);
            comparechartparms = this.addChartSpecs(comparechartparms);
            chartlocation = comparechartparms.location;
            seriesdata[chartlocation.series][chartlocation.depth] = comparechartparms;
            this.setState({
                seriesdata: seriesdata,
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
                if (component.years)
                    delete component.years;
                if (component.Aggregates)
                    delete component.Aggregates;
                if (component.Config != "BASELINE") {
                    if (component.Components) {
                        let componentSummaries = this.setComponentSummaries(component.Components, items);
                        if (componentSummaries.years)
                            component.years = componentSummaries.years;
                        if (componentSummaries.Aggregates)
                            component.Aggregates = componentSummaries.Aggregates;
                        this.aggregateComponentSummaries(cumulatingSummaries, componentSummaries);
                    }
                }
                else {
                    let item = items[componentname];
                    if (item.years)
                        component.years = item.years;
                    if (item.Components)
                        component.Components = item.Components;
                    let componentSummaries = { years: {}, Aggregates: {} };
                    componentSummaries.Aggregates = item.Components;
                    componentSummaries.years = item.years;
                    this.aggregateComponentSummaries(cumulatingSummaries, componentSummaries);
                }
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
        this.initSeedChartParms = (series, userselections) => {
            return {
                viewpoint: userselections.viewpoint,
                dataseries: userselections.dataseries,
                dataroot: [{ parent: 0 }],
                location: {
                    series: series,
                    depth: 0
                },
                range: {
                    latestyear: userselections.latestyear,
                    earliestyear: null,
                    fullrange: false,
                },
                data: { chartType: "ColumnChart" }
            };
        };
        this.addChartSpecs = (parms) => {
            let options = {}, events = null, rows = [], columns = [], budgetdata = this.props.budgetdata, viewpointdata = budgetdata.Viewpoints[parms.viewpoint], self = this, range = parms.range, meta = [];
            let { parent, children, depth } = this.getChartDatasets(parms, budgetdata);
            if ((depth + 1) >= meta.length) {
                parms.isError = true;
                return parms;
            }
            let axistitle = meta[depth].Children;
            axistitle = constants_2.categoryaliases[axistitle] || axistitle;
            options = {
                title: parent[meta[depth].Name],
                vAxis: { title: 'Amount', minValue: 0, textStyle: { fontSize: 8 } },
                hAxis: { title: axistitle, textStyle: { fontSize: 8 } },
                bar: { groupWidth: "95%" },
                height: 400,
                width: 400,
                legend: 'none',
                annotations: { alwaysOutside: true }
            };
            events = [
                {
                    eventName: 'select',
                }
            ];
            let year = range.latestyear;
            let categorylabel = meta[depth + 1].Name;
            columns = [
                { type: 'string', label: categorylabel },
                { type: 'number', label: year.toString() },
                { type: 'string', role: 'annotation' }
            ];
            let amountformat = format({ prefix: "$", suffix: "T" });
            let rounded = format({ round: 0, integerSeparator: '' });
            rows = children.map(item => {
                let amount = parseInt(rounded(item.Amount / 1000));
                let annotation = amountformat(amount);
                return [item[categorylabel], amount, annotation];
            });
            let chartdata = parms.data;
            chartdata.columns = columns;
            chartdata.rows = rows;
            chartdata.options = options;
            chartdata.events = events;
            return parms;
        };
        this.updateChartsSelection = data => {
            let seriesdata = this.state.seriesdata;
            let sourcechartparms = data.chartparms, selectchartlocation = sourcechartparms.location, series = selectchartlocation.series, sourcedepth = selectchartlocation.depth, selection = data.selection[0], selectionrow = selection.row, viewpoint = sourcechartparms.viewpoint, dataseries = sourcechartparms.dataseries;
            let serieslist = seriesdata[series];
            serieslist.splice(sourcedepth + 1);
            this.setState({
                seriesdata: seriesdata,
            });
            let parentchartparms = seriesdata[series][sourcedepth];
            let childdataroot = parentchartparms.dataroot.map(node => {
                return Object.assign({}, node);
            });
            childdataroot.push({ parent: selectionrow });
            let newrange = Object.assign({}, parentchartparms.range);
            let newchartparms = {
                viewpoint: viewpoint,
                dataseries: dataseries,
                dataroot: childdataroot,
                location: {
                    series: series,
                    depth: sourcedepth + 1
                },
                range: newrange,
                data: { chartType: "ColumnChart" }
            };
            newchartparms = this.addChartSpecs(newchartparms);
            if (newchartparms.isError)
                return;
            seriesdata[series][sourcedepth + 1] = newchartparms;
            this.setState({
                seriesdata: seriesdata,
            });
        };
        this.getChartDatasets = (parms, budgetdata) => {
            let parent, children, depth, path = parms.dataroot, range = parms.range;
            let meta = {};
            let list = budgetdata.filter(item => {
                return (item.Year == range.latestyear) ? true : false;
            });
            for (depth = 0; depth < path.length; depth++) {
                let ref = path[depth];
                parent = list[ref.parent];
                list = parent[meta[depth].Children];
            }
            depth--;
            children = list;
            return { parent: parent, children: children, depth: depth };
        };
        this.getCharts = (datalist, series) => {
            let charts = datalist.map((seriesdata, index) => {
                let data = seriesdata.data;
                let callback = ((chartparms) => {
                    let self = this;
                    return (Chart, err) => {
                        let chart = Chart.chart;
                        let selection = chart.getSelection();
                        self.updateChartsSelection({ chartparms: chartparms, chart: chart, selection: selection, err: err });
                    };
                })(seriesdata);
                data.events = data.events.map(eventdata => {
                    eventdata.callback = callback;
                    return eventdata;
                });
                return React.createElement(explorerchart_1.ExplorerChart, {key: index, chartType: data.chartType, options: data.options, chartEvents: data.events, rows: data.rows, columns: data.columns, graph_id: "ChartID" + series + '' + index});
            });
            return charts;
        };
    }
    render() {
        let explorer = this;
        let singleslider = (explorer.state.yearselection == 'one') ?
            React.createElement(ReactSlider, {className: "horizontal-slider", defaultValue: explorer.state.slider.singlevalue, min: 2003, max: 2016, onChange: (value) => {
                explorer.setState({
                    slider: Object.assign(explorer.state.slider, {
                        singlevalue: [value]
                    })
                });
            }}, React.createElement("div", null, explorer.state.slider.singlevalue[0])) : '';
        let doubleslider = (explorer.state.yearselection != 'one') ?
            React.createElement(ReactSlider, {className: "horizontal-slider", defaultValue: explorer.state.slider.doublevalue, min: 2003, max: 2016, withBars: (explorer.state.yearselection == 'all') ? true : false, onChange: (value) => {
                explorer.setState({
                    slider: Object.assign(explorer.state.slider, {
                        doublevalue: value
                    })
                });
            }}, React.createElement("div", null, explorer.state.slider.doublevalue[0]), React.createElement("div", null, explorer.state.slider.doublevalue[1])) : '';
        let dashboardsegment = React.createElement(Card, {initiallyExpanded: false}, React.createElement(CardTitle, {actAsExpander: true, showExpandableButton: true}, "Dashboard"), React.createElement(CardText, {expandable: true}, React.createElement("div", {style: { fontStyle: 'italic' }}, " These dashboard controls are not yet functional "), React.createElement("div", {style: { display: 'inline-block', verticalAlign: "bottom", height: "24px", marginRight: "24px" }}, "Viewpoint:"), React.createElement(RadioButtonGroup, {style: {
            display: (explorer.state.dataselection != "staffing") ? 'inline-block' : 'none',
        }, name: "viewselection", defaultSelected: "functional"}, React.createElement(RadioButton, {value: "functional", label: "Functional", iconStyle: { marginRight: "4px" }, labelStyle: { width: "auto", marginRight: "24px" }, style: { display: 'inline-block', width: 'auto' }}), React.createElement(RadioButton, {value: "structural", label: "Structural", iconStyle: { marginRight: "4px" }, labelStyle: { width: "auto", marginRight: "24px" }, style: { display: 'inline-block', width: 'auto' }}), React.createElement(RadioButton, {value: "auditor", label: "Auditor", iconStyle: { marginRight: "4px" }, labelStyle: { width: "auto", marginRight: "24px" }, style: { display: 'inline-block', width: 'auto' }})), " ", React.createElement("br", null), React.createElement(Divider, null), React.createElement(Checkbox, {label: "Inflation adjusted", defaultChecked: true}), React.createElement(Divider, null), React.createElement("div", {style: { display: 'inline-block', verticalAlign: "bottom", height: "24px", marginRight: "24px" }}, "Years:"), React.createElement(RadioButtonGroup, {style: { display: 'inline-block' }, name: "yearselection", defaultSelected: explorer.state.yearselection, onChange: (ev, selection) => {
            explorer.setState({ yearselection: selection });
        }}, React.createElement(RadioButton, {value: "one", label: "One", iconStyle: { marginRight: "4px" }, labelStyle: { width: "auto", marginRight: "24px" }, style: { display: 'inline-block', width: 'auto' }}), React.createElement(RadioButton, {value: "two", label: "Two (side-by-side)", iconStyle: { marginRight: "4px" }, labelStyle: { width: "auto", marginRight: "24px" }, style: { display: 'inline-block', width: 'auto' }}), React.createElement(RadioButton, {value: "all", label: "All (timelines)", iconStyle: { marginRight: "4px" }, labelStyle: { width: "auto", marginRight: "24px" }, style: { display: 'inline-block', width: 'auto' }})), singleslider, doubleslider, React.createElement("div", {style: { display: (explorer.state.yearselection == 'all') ? 'inline' : 'none' }}, React.createElement(Checkbox, {label: "Year-over-year change, rather than actuals", defaultChecked: false})), React.createElement(Divider, null), React.createElement(RaisedButton, {style: { marginRight: "24px" }, type: "button", label: "Download"}), React.createElement(RaisedButton, {type: "button", label: "Reset"})));
        let drilldownlist = explorer.state.seriesdata[constants_1.ChartSeries.DrillDown];
        let drilldowncharts = explorer.getCharts(drilldownlist, constants_1.ChartSeries.DrillDown);
        let drilldownsegment = React.createElement(Card, {initiallyExpanded: true}, React.createElement(CardTitle, {actAsExpander: true, showExpandableButton: true}, "Drill Down"), React.createElement(CardText, {expandable: true}, React.createElement("p", null, "Click or tap on any column to drill down."), React.createElement(RadioButtonGroup, {style: { display: 'inline-block' }, name: "dataselection", defaultSelected: explorer.state.dataselection, onChange: (ev, selection) => {
            explorer.setState({
                dataselection: selection,
            });
        }}, React.createElement(RadioButton, {value: "expenses", label: "Expenses", iconStyle: { marginRight: "4px" }, labelStyle: { width: "auto", marginRight: "24px" }, style: { display: 'inline-block', width: 'auto' }}), React.createElement(RadioButton, {value: "revenues", label: "Revenues", iconStyle: { marginRight: "4px" }, labelStyle: { width: "auto", marginRight: "24px" }, style: { display: 'inline-block', width: 'auto' }}), React.createElement(RadioButton, {value: "net", label: "Net", iconStyle: { marginRight: "4px" }, labelStyle: { width: "auto", marginRight: "24px" }, style: { display: 'inline-block', width: 'auto' }}), React.createElement(RadioButton, {value: "staffing", label: "Staffing", iconStyle: { marginRight: "4px" }, labelStyle: { width: "auto", marginRight: "24px" }, style: { display: 'inline-block', width: 'auto' }})), React.createElement(RadioButtonGroup, {style: { display: (explorer.state.dataselection != "staffing") ? 'inline-block' : 'none',
            backgroundColor: "#eee" }, name: "activities", defaultSelected: "activities"}, React.createElement(RadioButton, {value: "activities", label: "Activities", iconStyle: { marginRight: "4px" }, labelStyle: { width: "auto", marginRight: "24px" }, style: { display: 'inline-block', width: 'auto' }}), React.createElement(RadioButton, {value: "categories", label: "Categories", iconStyle: { marginRight: "4px" }, labelStyle: { width: "auto", marginRight: "24px" }, style: { display: 'inline-block', width: 'auto' }})), React.createElement(RadioButtonGroup, {style: { display: (explorer.state.dataselection == "staffing") ? 'inline-block' : 'none',
            backgroundColor: "#eee" }, name: "staffing", defaultSelected: "positions"}, React.createElement(RadioButton, {value: "positions", label: "Positions", iconStyle: { marginRight: "4px" }, labelStyle: { width: "auto", marginRight: "24px" }, style: { display: 'inline-block', width: 'auto' }}), React.createElement(RadioButton, {value: "budget", label: "Budget", iconStyle: { marginRight: "4px" }, labelStyle: { width: "auto", marginRight: "24px" }, style: { display: 'inline-block', width: 'auto' }})), React.createElement(FontIcon, {className: "material-icons"}, "cloud_download"), React.createElement("div", {style: { whiteSpace: "nowrap" }}, React.createElement("div", {style: { overflow: "scroll" }}, drilldowncharts, React.createElement("div", {style: { display: "inline-block", width: "500px" }})))));
        let comparelist = explorer.state.seriesdata[constants_1.ChartSeries.Compare];
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
