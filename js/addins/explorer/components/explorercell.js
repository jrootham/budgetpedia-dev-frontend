'use strict';
const React = require('react');
var { Component } = React;
var { Chart } = require('../../../../forked/react-google-charts/Chart.js');
const IconButton_1 = require('material-ui/IconButton');
const FontIcon_1 = require('material-ui/FontIcon');
const SvgIcon_1 = require('material-ui/SvgIcon');
const DropDownMenu_1 = require('material-ui/DropDownMenu');
const MenuItem_1 = require('material-ui/MenuItem');
const constants_1 = require('../constants');
class ExplorerCell extends Component {
    constructor(...args) {
        super(...args);
        this.state = {
            timescope: constants_1.TimeScope[constants_1.TimeScope.OneYear],
            deltastate: false,
            netstate: false,
            variancestate: false
        };
        this.onChangeChartCode = (explorerChartCode) => {
            let { budgetCell } = this.props;
            budgetCell.switchChartCode(explorerChartCode);
            this.props.globalStateActions.updateCellChartCode(budgetCell.uid, explorerChartCode);
        };
        this.onChangeTimeCode = explorerTimeCode => {
            this.setState({
                timescope: explorerTimeCode,
            });
        };
        this.onToggleDelta = () => {
            this.setState({
                deltastate: !this.state.deltastate
            });
        };
        this.onToggleNet = () => {
            this.setState({
                deltastate: !this.state.netstate
            });
        };
        this.onToggleVariance = () => {
            this.setState({
                deltastate: !this.state.variancestate
            });
        };
        this._respondToGlobalStateChange = () => {
        };
    }
    shouldComponentUpdate(nextProps, nextState) {
        let { lastAction } = nextProps.declarationData;
        let { celluid } = lastAction;
        if (celluid) {
            let retval = (nextProps.budgetCell.uid == celluid) ? true : false;
            return retval;
        }
        return true;
    }
    componentDidUpdate() {
        this._respondToGlobalStateChange();
        setTimeout(() => {
            this.props.budgetCell.refreshSelection();
        });
    }
    render() {
        let { chartParms, explorerChartCode, expandable, graph_id } = this.props.budgetCell;
        if (!expandable) {
            chartParms.options['backgroundColor'] = '#E4E4E4';
        }
        let timescopes = React.createElement("div", {style: {
            paddingTop: "10px",
            borderRight: "1px solid silver",
            marginRight: "3px",
            position: "relative",
            display: "inline-block"
        }}, React.createElement("div", {style: { position: "absolute", top: "0", left: "0", fontSize: "8px" }}, "years"), React.createElement(IconButton_1.default, {tooltip: "One year", tooltipPosition: "top-center", style: {
            backgroundColor: (this.state.timescope == constants_1.TimeScope[constants_1.TimeScope.OneYear])
                ? "rgba(144,238,144,0.5)"
                : "rgba(255,255,255,0.5)",
            borderRadius: "15%",
            padding: "0",
            height: "36px",
            width: "36px",
            marginRight: "3px",
        }, onTouchTap: e => {
            this.onChangeTimeCode(constants_1.TimeScope[constants_1.TimeScope.OneYear]);
        }}, React.createElement(SvgIcon_1.default, {style: { height: "36px", width: "36px" }, viewBox: "0 0 36 36"}, React.createElement("rect", {x: "13", y: "13", width: "10", height: "10"}))), React.createElement(IconButton_1.default, {tooltip: "Two years", tooltipPosition: "top-center", style: {
            backgroundColor: (this.state.timescope == constants_1.TimeScope[constants_1.TimeScope.TwoYears])
                ? "rgba(144,238,144,0.5)"
                : "rgba(255,255,255,0.5)",
            borderRadius: "15%",
            padding: "0",
            height: "36px",
            width: "36px",
            marginRight: "3px",
        }, onTouchTap: e => {
            this.onChangeTimeCode(constants_1.TimeScope[constants_1.TimeScope.TwoYears]);
        }, disabled: false}, React.createElement(SvgIcon_1.default, {style: { height: "36px", width: "36px" }, viewBox: "0 0 36 36"}, React.createElement("rect", {x: "4", y: "13", width: "10", height: "10"}), React.createElement("rect", {x: "22", y: "13", width: "10", height: "10"}))), React.createElement(IconButton_1.default, {tooltip: "All years", tooltipPosition: "top-center", style: {
            backgroundColor: (this.state.timescope == constants_1.TimeScope[constants_1.TimeScope.AllYears])
                ? "rgba(144,238,144,0.5)"
                : "rgba(255,255,255,0.5)",
            borderRadius: "15%",
            padding: "0",
            height: "36px",
            width: "36px",
            marginRight: "3px",
        }, onTouchTap: e => {
            this.onChangeTimeCode(constants_1.TimeScope[constants_1.TimeScope.AllYears]);
        }, disabled: false}, React.createElement(SvgIcon_1.default, {style: { height: "36px", width: "36px" }, viewBox: "0 0 36 36"}, React.createElement("ellipse", {cx: "6", cy: "18", rx: "4", ry: "4"}), React.createElement("ellipse", {cx: "18", cy: "18", rx: "4", ry: "4"}), React.createElement("ellipse", {cx: "30", cy: "18", rx: "4", ry: "4"}))));
        let columnchart = React.createElement(IconButton_1.default, {key: 'columnchart', tooltip: "Column Chart", tooltipPosition: "top-center", style: {
            backgroundColor: (explorerChartCode == "ColumnChart")
                ? "rgba(144,238,144,0.5)"
                : "transparent",
            borderRadius: "50%",
            padding: "0",
            height: "36px",
            width: "36px",
            marginRight: "3px",
        }, onTouchTap: e => {
            this.onChangeChartCode('ColumnChart');
        }}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "insert_chart"));
        let doublecolumnchart = React.createElement(IconButton_1.default, {key: 'doublecolumnchart', tooltip: "Column Chart", tooltipPosition: "top-center", style: {
            backgroundColor: (explorerChartCode == "DoubleColumnChart")
                ? "rgba(144,238,144,0.5)"
                : "transparent",
            borderRadius: "50%",
            padding: "0",
            height: "36px",
            width: "36px",
            marginRight: "3px",
        }, onTouchTap: e => {
            this.onChangeChartCode('DoubleColumnChart');
        }}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "insert_chart"));
        let donutchart = React.createElement(IconButton_1.default, {key: 'donutchart', tooltip: "Donut Pie Chart", tooltipPosition: "top-center", style: {
            backgroundColor: (explorerChartCode == "DonutChart")
                ? "rgba(144,238,144,0.5)"
                : "transparent",
            borderRadius: "50%",
            padding: "0",
            height: "36px",
            width: "36px",
            marginRight: "3px",
        }, onTouchTap: e => {
            this.onChangeChartCode('DonutChart');
        }}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "donut_small"));
        let contextchart = React.createElement(IconButton_1.default, {disabled: true, key: 'contextchart', tooltip: "Context Chart", tooltipPosition: "top-center", style: {
            backgroundColor: (explorerChartCode == "ContextChart")
                ? "rgba(144,238,144,0.5)"
                : "transparent",
            borderRadius: "50%",
            padding: "0",
            height: "36px",
            width: "36px",
            marginRight: "3px",
        }, onTouchTap: e => {
            this.onChangeChartCode('ContextChart');
        }}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "view_quilt"));
        let timeline = React.createElement(IconButton_1.default, {key: 'timeline', tooltip: "Timeline", tooltipPosition: "top-center", style: {
            backgroundColor: (explorerChartCode == "TimeLine")
                ? "rgba(144,238,144,0.5)"
                : "transparent",
            borderRadius: "50%",
            padding: "0",
            height: "36px",
            width: "36px",
            marginRight: "3px",
        }, disabled: true, onTouchTap: e => {
            this.onChangeChartCode('Timeline');
        }}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "timeline"));
        let stackedchart = React.createElement(IconButton_1.default, {key: 'stackedchart', tooltip: "Stacked chart", tooltipPosition: "top-center", style: {
            backgroundColor: (explorerChartCode == "StackedArea")
                ? "rgba(144,238,144,0.5)"
                : "transparent",
            borderRadius: "50%",
            padding: "0",
            height: "36px",
            width: "36px",
            marginRight: "3px",
        }, disabled: true, onTouchTap: e => {
            this.onChangeChartCode('StackedArea');
        }}, React.createElement(SvgIcon_1.default, {style: { height: "24px", width: "24px" }}, React.createElement("path", {d: "M20,6c0-0.587-0.257-1.167-0.75-1.562c-0.863-0.69-2.121-0.551-2.812,0.312l-2.789,3.486L11.2,6.4  c-0.864-0.648-2.087-0.493-2.762,0.351l-4,5C4.144,12.119,4,12.562,4,13v3h16V6z"}), React.createElement("path", {d: "M20,19H4c-0.552,0-1,0.447-1,1s0.448,1,1,1h16c0.552,0,1-0.447,1-1S20.552,19,20,19z"})));
        let proportionalchart = React.createElement(IconButton_1.default, {key: 'propchart', tooltip: "Proportional chart", tooltipPosition: "top-center", style: {
            backgroundColor: (explorerChartCode == "Proportional")
                ? "rgba(144,238,144,0.5)"
                : "transparent",
            borderRadius: "50%",
            padding: "0",
            height: "36px",
            width: "36px",
            marginRight: "3px",
        }, disabled: true, onTouchTap: e => {
            this.onChangeChartCode('Proportional');
        }}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "view_stream"));
        let getchartoptions = () => {
            let chartoptions;
            switch (this.state.timescope) {
                case constants_1.TimeScope[constants_1.TimeScope.OneYear]:
                    chartoptions = [columnchart, donutchart, contextchart];
                    break;
                case constants_1.TimeScope[constants_1.TimeScope.TwoYears]:
                    chartoptions = [doublecolumnchart];
                    break;
                case constants_1.TimeScope[constants_1.TimeScope.AllYears]:
                    chartoptions = [timeline, stackedchart, proportionalchart];
                    break;
            }
            return React.createElement("div", {style: {
                paddingTop: "10px",
                borderRight: "1px solid silver",
                marginRight: "3px",
                position: "relative",
                display: "inline-block"
            }}, React.createElement("div", {style: { position: "absolute", top: "0", left: "0", fontSize: "8px" }}, "charts"), chartoptions);
        };
        let chartoptions = getchartoptions();
        let deltatoggle = (this.state.timescope != constants_1.TimeScope[constants_1.TimeScope.OneYear]) ?
            React.createElement("div", {style: {
                paddingTop: "10px",
                borderRight: "1px solid silver",
                marginRight: "3px",
                position: "relative",
                display: "inline-block"
            }}, React.createElement("div", {style: {
                position: "absolute",
                top: "0",
                left: "0",
                fontSize: "8px",
                zIndex: "10"
            }}, "year-over-", React.createElement("br", null), " year"), React.createElement(IconButton_1.default, {disabled: false, tooltip: "Year-over-year change", tooltipPosition: "top-center", style: {
                backgroundColor: (this.state.deltastate)
                    ? "rgba(144,238,144,0.5)"
                    : "rgba(255,255,255,0.5)",
                borderRadius: "15%",
                padding: "0",
                height: "36px",
                width: "36px",
                marginRight: "3px",
            }, onTouchTap: e => {
                this.onToggleDelta();
            }}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "change_history"))) : null;
        let nettoggle = (this.state.timescope != constants_1.TimeScope[constants_1.TimeScope.OneYear]) ?
            React.createElement("div", {style: {
                paddingTop: "10px",
                borderRight: "1px solid silver",
                marginRight: "3px",
                position: "relative",
                display: "inline-block"
            }}, React.createElement("div", {style: { position: "absolute", top: "0", left: "0", fontSize: "8px" }}, "net"), React.createElement(IconButton_1.default, {disabled: true, tooltip: "Net (revenue - expenses)", tooltipPosition: "top-center", style: {
                backgroundColor: (this.state.netstate)
                    ? "rgba(144,238,144,0.5)"
                    : "rgba(255,255,255,0.5)",
                borderRadius: "15%",
                padding: "0",
                height: "36px",
                width: "36px",
                marginRight: "3px",
            }, onTouchTap: e => {
                this.onToggleNet();
            }}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "exposure"))) : null;
        let variancetoggle = (this.state.timescope != constants_1.TimeScope[constants_1.TimeScope.OneYear]) ?
            React.createElement("div", {style: {
                paddingTop: "10px",
                borderRight: "1px solid silver",
                marginRight: "3px",
                position: "relative",
                display: "inline-block"
            }}, React.createElement("div", {style: { position: "absolute", top: "0", left: "0", fontSize: "8px" }}, "variance"), React.createElement(IconButton_1.default, {disabled: true, tooltip: "Variance (actual - budget)", tooltipPosition: "top-center", style: {
                backgroundColor: (this.state.variancestate)
                    ? "rgba(144,238,144,0.5)"
                    : "rgba(255,255,255,0.5)",
                borderRadius: "15%",
                padding: "0",
                height: "36px",
                width: "36px",
                marginRight: "3px",
            }, onTouchTap: e => {
                this.onToggleVariance();
            }}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "exposure"))) : null;
        let datatable = React.createElement("div", {style: {
            paddingTop: "10px",
            borderLeft: "1px solid silver",
            marginRight: "3px",
            position: "relative",
            display: "inline-block",
        }}, React.createElement("div", {style: { paddingLeft: '3px', position: "absolute", top: "0", left: "0", fontSize: "8px" }}, "data"), React.createElement(IconButton_1.default, {disabled: true, tooltip: "Data Table", tooltipPosition: "top-center", style: {
            backgroundColor: (explorerChartCode == "DataTable")
                ? "rgba(144,238,144,0.5)"
                : "transparent",
            borderRadius: "50%",
            padding: "0",
            height: "36px",
            width: "36px",
            marginRight: "3px",
        }, onTouchTap: e => {
            this.onChangeChartCode('DataTable');
        }}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "view_list")));
        let harmonizeoptions = React.createElement("div", {style: {
            paddingTop: "10px",
            borderLeft: "1px solid silver",
            borderRight: "1px solid silver",
            paddingRight: "3px",
            position: "relative",
            display: "inline-block",
        }}, React.createElement("div", {style: { paddingLeft: '3px', position: "absolute", top: "0", left: "0", fontSize: "8px" }}, "harmonize"), React.createElement(IconButton_1.default, {disabled: true, tooltip: "Harmonize settings for row", tooltipPosition: "top-center", style: {
            borderRadius: "50%",
            padding: "0",
            height: "36px",
            width: "36px",
            marginRight: "3px",
        }, onTouchTap: e => {
        }}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "swap_horiz")));
        let socialoptions = React.createElement("div", {style: {
            paddingTop: "10px",
            display: "inline-block",
            position: "relative",
        }}, React.createElement("div", {style: { paddingLeft: "3px", position: "absolute", top: "0", left: "0", fontSize: "8px" }}, "social"), React.createElement(IconButton_1.default, {tooltip: "Shared stories", tooltipPosition: "top-center", style: {
            padding: "0",
            height: "36px",
            width: "36px",
            marginRight: "3px",
        }, disabled: true}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "share")), React.createElement(IconButton_1.default, {tooltip: "Calls to action", tooltipPosition: "top-center", style: {
            padding: "0",
            height: "36px",
            width: "36px",
            marginRight: "3px",
            marginLeft: "3px",
        }, disabled: true}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "announcement")));
        let informationoptions = React.createElement("div", {style: {
            display: "inline-block",
            paddingTop: "10px",
            borderLeft: "1px solid silver",
            borderRight: "1px solid silver",
            position: "relative",
        }}, React.createElement("div", {style: { paddingLeft: "3px", position: "absolute", top: "0", left: "0", fontSize: "8px" }}, "information"), React.createElement(IconButton_1.default, {tooltip: "Information", tooltipPosition: "top-center", style: {
            padding: "0",
            height: "36px",
            width: "36px",
            marginRight: "3px",
        }, disabled: true}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "info_outline")), React.createElement(IconButton_1.default, {tooltip: "Technical notes", tooltipPosition: "top-center", style: {
            padding: "0",
            height: "36px",
            width: "36px",
            marginRight: "3px",
            marginLeft: "3px",
        }, disabled: true}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "note")));
        let chart = (chartParms) ?
            React.createElement(Chart, {ref: node => { this.props.budgetCell.chartComponent = node; }, chartType: chartParms.chartType, options: chartParms.options, chartEvents: chartParms.events, rows: chartParms.rows, columns: chartParms.columns, graph_id: graph_id})
            : React.createElement("div", null, " no data... ");
        let drilldownprompt = React.createElement("div", {style: {
            position: "absolute",
            bottom: "10px",
            left: "40px",
            fontSize: "9px",
            fontStyle: "italic",
        }}, expandable ? 'drill down' : 'no drill down');
        let yearsoptions = () => {
            let startyear = 2003;
            let endyear = 2016;
            let years = [];
            for (let year = startyear; year <= endyear; year++) {
                let yearitem = React.createElement(MenuItem_1.default, {key: year, value: year, primaryText: year.toString()});
                years.push(yearitem);
            }
            return years;
        };
        let yearselection = React.createElement("div", {style: { paddingBottom: "3px" }}, React.createElement("span", {style: { fontStyle: "italic" }}, "Select years: "), React.createElement(DropDownMenu_1.default, {value: 2003, style: {}, onChange: e => { }}, yearsoptions()), " - ", React.createElement(DropDownMenu_1.default, {value: 2016, style: {}, onChange: e => { }}, yearsoptions()));
        return React.createElement("div", null, (this.props.showControls) ? React.createElement("div", {style: { padding: "3px" }}, timescopes, chartoptions, deltatoggle, nettoggle, variancetoggle) : null, React.createElement("div", {style: { position: "relative" }}, chart, drilldownprompt), React.createElement("div", {style: { padding: "3px", textAlign: "center" }}, (this.props.showControls) ?
            yearselection : null, informationoptions, socialoptions, datatable, harmonizeoptions));
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ExplorerCell;
