"use strict";
const React = require('react');
const ChartObject = require('react-google-charts');
var { Component } = React;
var format = require('format-number');
const react_redux_1 = require('react-redux');
const Card = require('material-ui/lib/card/card');
const CardTitle = require('material-ui/lib/card/card-title');
const CardText = require('material-ui/lib/card/card-text');
let Chart = ChartObject['Chart'];
class ExplorerClass extends Component {
    constructor(props) {
        super(props);
        this.getSelectEvent = (parms) => {
            let self = this;
            return (Chart, err) => {
                let chart = Chart.chart;
                let selection = chart.getSelection();
                let chartparms = parms;
                self.updateCharts({ chartparms: chartparms, chart: chart, selection: selection, err: err });
            };
        };
        this.getChartData = (parms) => {
            let options = {}, events = null, rows = [], columns = [], budgetdata = this.props.budgetdata, meta = budgetdata[0].Meta, self = this, range = parms['range'];
            let { parent, children, depth } = this.getChartDatasets(parms, meta, budgetdata);
            options = {
                title: parent[meta[depth].Name] + ' ($Thousands)',
                hAxis: { title: meta[depth].Children },
                vAxis: { title: 'Amount', minValue: 0 },
                bar: { groupWidth: "95%" },
                width: children.length * 120,
                height: 300,
                legend: 'none',
            };
            events = [
                {
                    eventName: 'select',
                    callback: this.getSelectEvent(parms)
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
                return [item[categorylabel], amount, amountformat(amount)];
            });
            console.log('chartdata = ', options, events, columns, rows);
            return { options: options, events: events, rows: rows, columns: columns };
        };
        this.updateCharts = data => {
            console.log('updateCharts data = ', data);
        };
        this.getChartDatasets = (parms, meta, budgetdata) => {
            let parent, children, path = parms['path'], depth = 0, range = parms['range'];
            let list = budgetdata.filter(item => {
                return (item.Year == range.latestyear) ? true : false;
            });
            for (depth; depth < path.length; depth++) {
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
            if (this.props.budgetdata.length > 0)
                latestyear = this.props.budgetdata[0].Year;
            else
                latestyear = null;
            var rootchartoptions = {
                path: [{ parent: 0 }],
                range: {
                    latestyear: latestyear,
                    earliestyear: null,
                    fullrange: false,
                }
            };
            var { options, events, rows, columns } = this.getChartData(rootchartoptions);
            this.setState({
                rows: rows,
                columns: columns,
                options: options,
                events: events,
            });
        };
        this.state = {
            chartsdata: { seriesone: null, seriestwo: null, differences: null },
            chartsmeta: { options: {}, seriesone: {}, seriestwo: {}, differences: {} }
        };
    }
    render() {
        return React.createElement("div", null, React.createElement(Card, null, React.createElement(CardTitle, null, "Dashboard")), React.createElement(Card, {initiallyExpanded: true}, React.createElement(CardTitle, {actAsExpander: true, showExpandableButton: true}, "Drill Down"), React.createElement(CardText, {expandable: true}, React.createElement("p", null, "Click or tap on any column to drill down"), React.createElement(Chart, {chartType: "ColumnChart", rows: this.state.rows, columns: this.state.columns, options: this.state.options, graph_id: "ColumnChartID", chartEvents: this.state.events}))), React.createElement(Card, null, React.createElement(CardTitle, null, "Compare")), React.createElement(Card, null, React.createElement(CardTitle, null, "Show differences")));
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
