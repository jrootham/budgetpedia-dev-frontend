'use strict';
const React = require('react');
var { Component } = React;
const explorerportal_1 = require('./explorerportal');
const DropDownMenu_1 = require('material-ui/DropDownMenu');
const MenuItem_1 = require('material-ui/MenuItem');
const FontIcon_1 = require('material-ui/FontIcon');
const IconButton_1 = require('material-ui/IconButton');
const constants_1 = require('../constants');
const setviewpointdata_1 = require('../controllers/explorer/setviewpointdata');
const getchartparms_1 = require('../controllers/explorer/getchartparms');
const updatechartselections_1 = require('../controllers/explorer/updatechartselections');
class ExplorerBranch extends Component {
    constructor(props) {
        super(props);
        this.state = {
            chartmatrixrow: this.props.matrixrow,
            yearslider: this.props.yearslider,
            yearscope: this.props.yearscope,
            userselections: this.props.userselections,
        };
        this.branchScrollBlock = null;
        this.componentDidMount = () => {
            this.initializeChartSeries();
        };
        this.initializeChartSeries = () => {
            let userselections = this.state.userselections, chartmatrixrow = this.state.chartmatrixrow;
            let budgetdata = this.props.budgetdata;
            var matrixlocation, chartParmsObj;
            let viewpointname = userselections.viewpoint;
            let facet = userselections.facet;
            setviewpointdata_1.setViewpointData(viewpointname, facet, budgetdata, userselections.inflationadjusted);
            let drilldownnodeconfig = this.initRootNodeConfig(userselections);
            let drilldownindex;
            for (drilldownindex in drilldownnodeconfig.charts) {
                let props = {
                    nodeConfig: drilldownnodeconfig,
                    chartIndex: drilldownindex,
                    userselections: userselections,
                    budgetdata: budgetdata,
                    chartmatrixrow: chartmatrixrow,
                };
                let callbacks = {
                    refreshPresentation: this.refreshPresentation,
                    onPortalCreation: this.onPortalCreation,
                    workingStatus: this.props.callbacks.workingStatus,
                };
                chartParmsObj = getchartparms_1.getChartParms(props, callbacks);
                if (!chartParmsObj.isError) {
                    drilldownnodeconfig.charts[drilldownindex].chartparms = chartParmsObj.chartParms;
                    drilldownnodeconfig.charts[drilldownindex].chartCode =
                        constants_1.ChartTypeCodes[drilldownnodeconfig.charts[drilldownindex].chartparms.chartType];
                }
                else {
                    break;
                }
            }
            if (!chartParmsObj.isError) {
                drilldownnodeconfig.datanode = chartParmsObj.datanode;
                matrixlocation = drilldownnodeconfig.matrixlocation;
                chartmatrixrow[matrixlocation.column] = drilldownnodeconfig;
            }
            this.refreshPresentation(chartmatrixrow);
        };
        this.initRootNodeConfig = (userselections) => {
            let googlecharttype = userselections.charttype;
            let chartCode = constants_1.ChartTypeCodes[googlecharttype];
            let budgetdata = this.props.budgetdata;
            let viewpoint = userselections.viewpoint;
            let facet = userselections.facet;
            let portalcharts = budgetdata.Viewpoints[viewpoint].PortalCharts[facet];
            let charts = [];
            for (let type of portalcharts) {
                let chartconfig = {
                    googlecharttype: googlecharttype,
                    chartCode: chartCode,
                };
                chartconfig.nodedatapropertyname = type.Type;
                charts.push(chartconfig);
            }
            return {
                viewpoint: viewpoint,
                facet: facet,
                datapath: [],
                matrixlocation: {
                    column: 0
                },
                yearscope: {
                    latestyear: userselections.latestyear,
                    earliestyear: null,
                    fullrange: false,
                },
                charts: charts
            };
        };
        this.handleDialogOpen = () => {
            this.setState({
                dialogopen: true
            });
        };
        this.handleDialogClose = () => {
            this.setState({
                dialogopen: false
            });
        };
        this.onPortalCreation = () => {
            let element = this.branchScrollBlock;
            if (!element) {
                console.error('expected branch element not found in onPortalCreation');
                return;
            }
            setTimeout(() => {
                let scrollwidth = element.scrollWidth;
                let scrollleft = element.scrollLeft;
                let clientwidth = element.clientWidth;
                let scrollright = scrollleft + clientwidth;
                let targetright = scrollwidth - 500;
                let adjustment = scrollright - targetright;
                if (adjustment < 0) {
                    let frames = 60;
                    let t = 1 / frames;
                    let timeinterval = 1000 / frames;
                    let counter = 0;
                    let tick = () => {
                        counter++;
                        let factor = this.easeOutCubic(counter * t);
                        let scrollinterval = adjustment * factor;
                        element.scrollLeft = scrollleft - scrollinterval;
                        if (counter < frames) {
                            requestAnimationFrame(tick);
                        }
                    };
                    requestAnimationFrame(tick);
                }
            });
        };
        this.easeOutCubic = t => {
            const t1 = t - 1;
            return t1 * t1 * t1 + 1;
        };
        this.switchViewpoint = (viewpointname) => {
            let userselections = this.state.userselections;
            let chartmatrixrow = this.state.chartmatrixrow;
            let chartseries = chartmatrixrow;
            chartseries.splice(0);
            userselections.viewpoint = viewpointname;
            this.setState({
                userselections: userselections,
                chartmatrixrow: chartmatrixrow,
            });
            this.initializeChartSeries();
        };
        this.switchDataSeries = (facet) => {
            let userselections = this.state.userselections;
            userselections.facet = facet;
            let chartmatrixrow = this.state.chartmatrixrow;
            this.setState({
                userselections: userselections,
            });
            let viewpointname = this.state.userselections.viewpoint;
            let dataseriesname = this.state.userselections.facet;
            let budgetdata = this.props.budgetdata;
            setviewpointdata_1.setViewpointData(viewpointname, dataseriesname, budgetdata, this.state.userselections.inflationadjusted);
            let matrixseries = chartmatrixrow;
            let nodeconfig;
            let cellptr;
            let isError = false;
            let chartParmsObj = null;
            for (cellptr in matrixseries) {
                nodeconfig = matrixseries[cellptr];
                let nodechartindex = null;
                for (nodechartindex in nodeconfig.charts) {
                    let props = {
                        nodeConfig: nodeconfig,
                        chartIndex: nodechartindex,
                        userselections: userselections,
                        budgetdata: budgetdata,
                        chartmatrixrow: chartmatrixrow,
                    };
                    let callbacks = {
                        refreshPresentation: this.refreshPresentation,
                        onPortalCreation: this.onPortalCreation,
                        workingStatus: this.props.callbacks.workingStatus,
                    };
                    chartParmsObj = getchartparms_1.getChartParms(props, callbacks);
                    if (chartParmsObj.isError) {
                        matrixseries.splice(cellptr);
                        if (cellptr > 0) {
                            let parentconfig = matrixseries[cellptr - 1];
                            parentconfig.charts[nodechartindex].chartselection = null;
                            parentconfig.charts[nodechartindex].chart = null;
                        }
                        isError = true;
                        break;
                    }
                    else {
                        nodeconfig.charts[nodechartindex].chartparms = chartParmsObj.chartParms;
                        nodeconfig.charts[nodechartindex].chartCode =
                            constants_1.ChartTypeCodes[nodeconfig.charts[nodechartindex].chartparms.chartType];
                    }
                }
            }
            if (!isError) {
                nodeconfig.facet = facet;
                nodeconfig.datanode = chartParmsObj.datanode;
            }
            this.refreshPresentation(chartmatrixrow);
            setTimeout(() => {
                updatechartselections_1.updateChartSelections(chartmatrixrow);
            });
        };
        this.onChangeBudgetPortalChart = () => {
            setTimeout(() => {
                updatechartselections_1.updateChartSelections(this.state.chartmatrixrow);
            });
        };
        this.refreshPresentation = chartmatrix => {
            this.setState({
                chartmatrix: chartmatrix,
            });
        };
        this.switchChartCode = (location, chartCode) => {
            let chartType = constants_1.ChartCodeTypes[chartCode];
            let portalIndex = location.portalindex;
            let chartmatrixrow = this.state.chartmatrixrow;
            let nodeConfig = chartmatrixrow[location.matrixlocation.column];
            let oldChartType = nodeConfig.charts[portalIndex].googlecharttype;
            nodeConfig.charts[portalIndex].googlecharttype = chartType;
            let props = {
                nodeConfig: nodeConfig,
                chartIndex: portalIndex,
                userselections: this.state.userselections,
                budgetdata: this.props.budgetdata,
                chartmatrixrow: chartmatrixrow,
            };
            let callbacks = {
                refreshPresentation: this.refreshPresentation,
                onPortalCreation: this.onPortalCreation,
                workingStatus: this.props.callbacks.workingStatus,
            };
            let chartParmsObj = getchartparms_1.getChartParms(props, callbacks);
            if (!chartParmsObj.isError) {
                nodeConfig.charts[portalIndex].chartparms = chartParmsObj.chartParms;
                nodeConfig.charts[portalIndex].chartCode =
                    constants_1.ChartTypeCodes[nodeConfig.charts[portalIndex].chartparms.chartType];
                nodeConfig.datanode = chartParmsObj.datanode;
            }
            else {
                nodeConfig.charts[portalIndex].googlecharttype = oldChartType;
            }
            this.refreshPresentation(chartmatrixrow);
            setTimeout(() => {
                if (nodeConfig.charts[portalIndex].chart) {
                    nodeConfig.charts[portalIndex].chart = nodeConfig.charts[portalIndex].ChartObject.chart;
                    if (nodeConfig.charts[portalIndex].googlecharttype == "PieChart") {
                        nodeConfig.charts[portalIndex].chartselection[0].column = null;
                    }
                    else {
                        nodeConfig.charts[portalIndex].chartselection[0].column = 1;
                    }
                }
                updatechartselections_1.updateChartSelections(chartmatrixrow);
            });
        };
        this.getPortals = (matrixrow) => {
            let userselections = this.state.userselections;
            let budgetdata = this.props.budgetdata;
            let portaltitles = budgetdata.DataSeries[userselections.facet].Titles;
            let dataseries = budgetdata.DataSeries[userselections.facet];
            let portalseriesname = dataseries.Name;
            if (dataseries.Units == 'DOLLAR') {
                portalseriesname += ' (' + dataseries.UnitsAlias + ')';
            }
            let portals = matrixrow.map((nodeconfig, index) => {
                let portalcharts = [];
                for (let chartindex in nodeconfig.charts) {
                    let chartblocktitle = null;
                    if ((nodeconfig.charts[chartindex].nodedatapropertyname == 'Categories')) {
                        chartblocktitle = portaltitles.Categories;
                    }
                    else {
                        chartblocktitle = portaltitles.Baseline;
                    }
                    let chartparms = nodeconfig.charts[chartindex].chartparms;
                    let location = {
                        matrixlocation: nodeconfig.matrixlocation,
                        portalindex: Number(chartindex)
                    };
                    let explorer = this;
                    let chartsettings = {
                        onSwitchChartCode: ((location) => {
                            return (chartCode) => {
                                this.switchChartCode(location, chartCode);
                            };
                        })(location),
                        chartCode: nodeconfig.charts[chartindex].chartCode,
                        graph_id: "ChartID" + this.props.branchkey + '-' + index + '-' + chartindex,
                    };
                    let portalchart = {
                        chartparms: chartparms,
                        chartsettings: chartsettings,
                        chartblocktitle: "By " + chartblocktitle,
                    };
                    portalcharts.push(portalchart);
                }
                let portalname = null;
                if (nodeconfig.parentdata) {
                    portalname = nodeconfig.parentdata.Name;
                }
                else {
                    portalname = 'City Budget';
                }
                portalname += ' ' + portalseriesname;
                let budgetPortal = {
                    portalCharts: portalcharts,
                    portalName: portalname,
                };
                return React.createElement(explorerportal_1.ExplorerPortal, {key: index, budgetPortal: budgetPortal, onChangePortalChart: this.onChangeBudgetPortalChart});
            });
            return portals;
        };
    }
    render() {
        let branch = this;
        let drilldownbranch = branch.state.chartmatrixrow;
        let drilldownportals = branch.getPortals(drilldownbranch);
        return React.createElement("div", null, React.createElement("div", null, React.createElement("span", {style: { fontStyle: "italic" }}, "Viewpoint: "), React.createElement(DropDownMenu_1.default, {value: this.state.userselections.viewpoint, style: {}, onChange: (e, index, value) => {
            branch.switchViewpoint(value);
        }}, React.createElement(MenuItem_1.default, {value: 'FUNCTIONAL', primaryText: "Functional"}), React.createElement(MenuItem_1.default, {value: 'STRUCTURAL', primaryText: "Structural"})), React.createElement("span", {style: { margin: "0 10px 0 10px", fontStyle: "italic" }}, "Facets: "), React.createElement(IconButton_1.default, {tooltip: "Expenditures", tooltipPosition: "top-center", onTouchTap: e => {
            branch.switchDataSeries('BudgetExpenses');
        }, style: {
            backgroundColor: (this.state.userselections.facet == 'BudgetExpenses')
                ? "rgba(144,238,144,0.5)"
                : 'transparent',
            borderRadius: "50%"
        }}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "attach_money")), React.createElement(IconButton_1.default, {tooltip: "Revenues", tooltipPosition: "top-center", onTouchTap: e => {
            branch.switchDataSeries('BudgetRevenues');
        }, style: {
            backgroundColor: (this.state.userselections.facet == 'BudgetRevenues')
                ? "rgba(144,238,144,0.5)"
                : 'transparent',
            borderRadius: "50%"
        }}, React.createElement(FontIcon_1.default, {className: "material-icons"}, "receipt")), React.createElement(IconButton_1.default, {tooltip: "Staffing", tooltipPosition: "top-center", onTouchTap: e => {
            branch.switchDataSeries('BudgetStaffing');
        }, style: {
            backgroundColor: (this.state.userselections.facet == 'BudgetStaffing')
                ? "rgba(144,238,144,0.5)"
                : 'transparent',
            borderRadius: "50%"
        }}, ">", React.createElement(FontIcon_1.default, {className: "material-icons"}, "people"))), React.createElement("div", {style: { whiteSpace: "nowrap" }}, React.createElement("div", {ref: node => {
            branch.branchScrollBlock = node;
        }, style: { overflow: "scroll" }}, drilldownportals, React.createElement("div", {style: { display: "inline-block", width: "500px" }}))));
    }
}
exports.ExplorerBranch = ExplorerBranch;
