"use strict";
const React = require('react');
const ChartObject = require('react-google-charts');
var { Component } = React;
const react_redux_1 = require('react-redux');
let Chart = ChartObject['Chart'];
class ExplorerClass extends Component {
    constructor(props) {
        super(props);
        this.componentDidMount = () => {
            var chart_events = [
                {
                    eventName: 'select',
                    callback: (Chart, e) => {
                        let chart = Chart.chart;
                        let selection = chart.getSelection();
                        console.log("selection", Chart, chart, selection);
                    }
                }
            ];
            let options = {
                title: "Toronto Budget 2015/2016 ($Millions) Total: $10,991.5M",
                subtitle: "Something",
                hAxis: { title: 'Departments' },
                vAxis: { title: 'Amount', minValue: 0 },
                bar: { groupWidth: "95%" },
                width: 240,
                height: 300,
                legend: { position: 'bottom' },
            };
            let data = [
                ['Department', '2015', '2016', { role: 'annotation' }],
                ['Shared Services', 3769.5, 3969.5, '$3,969.5M'],
                ['Support Services', 4393.2, 4593.2, '$4,593.2M'],
                ['Administration', 2228.7, 2428.7, '$2,428.7M'],
            ];
            this.setState({
                data: data,
                options: options,
                chart_events: chart_events,
            });
        };
        this.state = {
            data: null,
            options: null,
            chart_events: null,
            chartsdata: { seriesone: null, seriestwo: null, differences: null },
            chartsmeta: { options: {}, seriesone: {}, seriestwo: {}, differences: {} }
        };
    }
    render() {
        return React.createElement(Chart, {chartType: "ColumnChart", data: this.state.data, options: this.state.options, graph_id: "ColumnChart", chartEvents: this.state.chart_events});
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
