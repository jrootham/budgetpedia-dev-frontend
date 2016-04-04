'use strict';
const React = require('react');
var { Component } = React;
const explorerchart_1 = require('../components/explorerchart');
var format = require('format-number');
const react_redux_1 = require('react-redux');
const Card = require('material-ui/lib/card/card');
const CardTitle = require('material-ui/lib/card/card-title');
const CardText = require('material-ui/lib/card/card-text');
const constants_1 = require('../constants');
class ExplorerClass extends Component {
    constructor(props) {
        super(props);
        this.setChartData = (parms) => {
            let options = {}, events = null, rows = [], columns = [], budgetdata = this.props.budgetdata, meta = budgetdata[0].Meta, self = this, range = parms.range;
            let { parent, children, depth } = this.getChartDatasets(parms, meta, budgetdata);
            if ((depth + 1) >= meta.length) {
                parms.isError = true;
                return parms;
            }
            options = {
                title: parent[meta[depth].Name] + ' ($Thousands)',
                vAxis: { title: 'Amount', minValue: 0, textStyle: { fontSize: 8 } },
                hAxis: { title: meta[depth].Children, textStyle: { fontSize: 8 } },
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
        this.updateCharts = data => {
            console.log('updateCharts data = ', data);
            let seriesdata = this.state.seriesdata;
            let sourceparms = data.chartparms, selectlocation = sourceparms.chartlocation, series = selectlocation.series, sourcedepth = selectlocation.depth, selection = data.selection[0], selectionrow = selection.row;
            let serieslist = seriesdata[series];
            serieslist.splice(sourcedepth + 1);
            this.forceUpdate();
            console.log('series, sourcedepth, selectionrow, serieslist', series, sourcedepth, selectionrow, serieslist);
            let oldchartparms = seriesdata[series][sourcedepth];
            let newdataroot = oldchartparms.dataroot.map(node => {
                return Object.assign({}, node);
            });
            newdataroot.push({ parent: selectionrow });
            let newrange = Object.assign({}, oldchartparms.range);
            let newchartparms = {
                dataroot: newdataroot,
                chartlocation: {
                    series: constants_1.ChartSeries.DrillDown,
                    depth: sourcedepth + 1
                },
                range: newrange,
                data: { chartType: "ColumnChart" }
            };
            newchartparms = this.setChartData(newchartparms);
            if (newchartparms.isError)
                return;
            console.log('newchartparms = ', newchartparms);
            seriesdata[series][sourcedepth + 1] = newchartparms;
            this.setState({
                seriesdata: seriesdata,
            });
        };
        this.getChartDatasets = (parms, meta, budgetdata) => {
            let parent, children, depth, path = parms.dataroot, range = parms.range;
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
        this.componentDidMount = () => {
            this.props.budgetdata.sort((a, b) => {
                if (a.year > b.year)
                    return 1;
                else if (a.year < b.year)
                    return -1;
                else
                    return 0;
            });
            let latestyear;
            if (this.props.budgetdata.length > 0) {
                let ptr = this.props.budgetdata.length - 1;
                latestyear = this.props.budgetdata[ptr].Year;
            }
            else {
                latestyear = null;
            }
            let rootchartparms = {
                dataroot: [{ parent: 0 }],
                chartlocation: {
                    series: constants_1.ChartSeries.DrillDown,
                    depth: 0
                },
                range: {
                    latestyear: latestyear,
                    earliestyear: null,
                    fullrange: false,
                },
                data: { chartType: "ColumnChart" }
            };
            rootchartparms = this.setChartData(rootchartparms);
            let seriesdata = this.state.seriesdata;
            let chartlocation = rootchartparms.chartlocation;
            seriesdata[chartlocation.series][chartlocation.depth] = rootchartparms;
            this.setState({
                seriesdata: seriesdata,
            });
        };
        this.state = {
            seriesdata: [[], [], [], []],
        };
    }
    render() {
        let explorer = this;
        let seriesdatalist = explorer.state.seriesdata[0];
        let charts = seriesdatalist.map((seriesdata, index) => {
            let data = seriesdata.data;
            let callback = (function (chartparms) {
                let self = explorer;
                return function (Chart, err) {
                    let chart = Chart.chart;
                    let selection = chart.getSelection();
                    self.updateCharts({ chartparms: chartparms, chart: chart, selection: selection, err: err });
                };
            })(seriesdata);
            data.events = data.events.map(eventdata => {
                eventdata.callback = callback;
                return eventdata;
            });
            return React.createElement(explorerchart_1.ExplorerChart, {key: index, chartType: data.chartType, options: data.options, chartEvents: data.events, rows: data.rows, columns: data.columns, graph_id: "ChartID" + index});
        });
        return React.createElement("div", null, React.createElement(Card, null, React.createElement(CardTitle, null, "Dashboard")), React.createElement(Card, {initiallyExpanded: true}, React.createElement(CardTitle, {actAsExpander: true, showExpandableButton: true}, "Drill Down"), React.createElement(CardText, {expandable: true}, React.createElement("p", null, "Click or tap on any column to drill down"), React.createElement("div", {style: { whiteSpace: "nowrap" }}, React.createElement("div", {style: { overflow: "scroll" }}, charts, React.createElement("div", {style: { display: "inline-block", width: "500px" }}))))), React.createElement(Card, null, React.createElement(CardTitle, null, "Compare")), React.createElement(Card, null, React.createElement(CardTitle, null, "Show differences")), React.createElement(Card, null, React.createElement(CardTitle, null, "Context")));
    }
}
function mapStateToProps(state) {
    let { budgetdata } = state;
    return {
        budgetdata: budgetdata,
    };
}
var Explorer = react_redux_1.connect(mapStateToProps)(ExplorerClass);
exports.Explorer = Explorer;
