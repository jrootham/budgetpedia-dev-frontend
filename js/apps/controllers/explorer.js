"use strict";
const React = require('react');
const ChartObject = require('react-google-charts');
var { Component } = React;
const react_redux_1 = require('react-redux');
const Card = require('material-ui/lib/card/card');
const CardTitle = require('material-ui/lib/card/card-title');
const CardText = require('material-ui/lib/card/card-text');
let Chart = ChartObject['Chart'];
class ExplorerClass extends Component {
    constructor(props) {
        super(props);
        this.getChartData = (parms) => {
            let options = {};
            let events = null;
            let rows = [];
            let columns = [];
            let budgetdata = this.props.budgetdata;
            let meta = budgetdata[0].Meta;
            let self = this;
            let { parent, children, depth } = this.getChartParentAndChildren(parms['path'], meta, budgetdata);
            options = {
                title: parent[meta[depth].Name],
                hAxis: { title: meta[depth].Children },
                vAxis: { title: 'Amount', minValue: 0 },
                bar: { groupWidth: "95%" },
                width: children.length * 80,
                height: 300,
            };
            events = [
                {
                    eventName: 'select',
                    callback: (Chart, e) => {
                        let chart = Chart.chart;
                        let selection = chart.getSelection();
                        self.updateCharts({ chart: chart, selection: selection });
                    }
                }
            ];
            return { options: options, events: events, rows: rows, columns: columns };
        };
        this.updateCharts = data => {
            console.log('updateCharts data = ', data);
        };
        this.getChartParentAndChildren = (path, meta, budgetdata) => {
            let parent, children;
            let list = budgetdata;
            let depth = 0;
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
            var rootchartoptions = {
                path: [{ parent: 0 }]
            };
            var { options, events, rows, columns } = this.getChartData(rootchartoptions);
            var testchart_events = [
                {
                    eventName: 'select',
                    callback: (Chart, e) => {
                        let chart = Chart.chart;
                        let selection = chart.getSelection();
                    }
                }
            ];
            let testoptions = {
                title: "Toronto Budget 2015/2016 ($Millions) Total: $10,991.5M",
                hAxis: { title: 'Departments' },
                vAxis: { title: 'Amount', minValue: 0 },
                bar: { groupWidth: "95%" },
                width: 240,
                height: 300,
                legend: { position: 'bottom' },
            };
            let testcolumns = [
                { type: 'string', label: "Department" },
                { type: 'number', label: '2015' },
                { type: 'number', label: '2016' },
                { type: 'string', role: 'annotation' }
            ];
            let testrows = [
                ['Shared Services', 3769.5, 3969.5, '$3,969.5M'],
                ['Support Services', 4393.2, 4593.2, '$4,593.2M'],
                ['Administration', 2228.7, 2428.7, '$2,428.7M']
            ];
            this.setState({
                rows: testrows,
                columns: testcolumns,
                options: testoptions,
                events: testchart_events,
            });
        };
        this.state = {
            chartsdata: { seriesone: null, seriestwo: null, differences: null },
            chartsmeta: { options: {}, seriesone: {}, seriestwo: {}, differences: {} }
        };
    }
    render() {
        return React.createElement("div", null, React.createElement(Card, null, React.createElement(CardTitle, null, "Dashboard")), React.createElement(Card, null, React.createElement("hr", null), React.createElement(CardTitle, null, "Drill Down"), React.createElement(CardText, null, "Click or tap on any column to drill down"), React.createElement(Chart, {chartType: "ColumnChart", rows: this.state.rows, columns: this.state.columns, options: this.state.options, graph_id: "ColumnChart", chartEvents: this.state.events})), React.createElement(Card, null, React.createElement("hr", null), React.createElement(CardTitle, null, "Compare")), React.createElement(Card, null, React.createElement("hr", null), React.createElement(CardTitle, null, "Show differences")));
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
