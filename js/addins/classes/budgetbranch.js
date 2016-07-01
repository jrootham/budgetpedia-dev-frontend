"use strict";
const databaseapi_1 = require('./databaseapi');
const getbudgetnode_1 = require('../containers/explorer/getbudgetnode');
const budgetnode_1 = require('../classes/budgetnode');
const onchartcomponentselection_1 = require('../containers/explorer/onchartcomponentselection');
const constants_1 = require('../constants');
class BudgetBranch {
    constructor(parms) {
        this.initializeChartSeries = (props, callbacks) => {
            let { userselections } = props;
            let chartmatrixrow = this.nodes;
            let budgetdata = this.data;
            let matrixlocation, chartParmsObj;
            let { viewpoint: viewpointname, facet: dataseriesname, inflationadjusted: wantsInflationAdjusted } = userselections;
            let viewpointdata = databaseapi_1.default.getViewpointData({
                viewpointname: viewpointname,
                dataseriesname: dataseriesname,
                wantsInflationAdjusted: wantsInflationAdjusted,
                timeSpecs: {
                    leftYear: null,
                    rightYear: null,
                    spanYears: false,
                }
            });
            budgetdata.viewpointdata = viewpointdata;
            let datapath = [];
            let node = getbudgetnode_1.default(viewpointdata, datapath);
            let { charttype: defaultChartType, viewpoint: viewpointName, facet: facetName, latestyear: rightYear, } = userselections;
            let budgetNodeParms = {
                defaultChartType: defaultChartType,
                viewpointName: viewpointName,
                facetName: facetName,
                portalCharts: viewpointdata.PortalCharts,
                timeSpecs: {
                    leftYear: null,
                    rightYear: rightYear,
                    spanYears: false,
                },
                dataPath: [],
                matrixLocation: { column: 0 },
                dataNode: node,
            };
            let budgetNode = new budgetnode_1.default(budgetNodeParms);
            let cellindex;
            let { updateChartSelections, workingStatus, refreshPresentation, onPortalCreation, } = callbacks;
            let selectioncallbacks = {
                updateChartSelections: updateChartSelections,
                refreshPresentation: refreshPresentation,
                onPortalCreation: onPortalCreation,
                workingStatus: workingStatus,
            };
            let selectfn = onchartcomponentselection_1.onChartComponentSelection(userselections)(budgetdata)(chartmatrixrow)(selectioncallbacks);
            let { Configuration: viewpointConfig, itemseriesconfigdata: itemseriesConfig, } = budgetdata.viewpointdata;
            let configData = {
                viewpointConfig: viewpointConfig,
                itemseriesConfig: itemseriesConfig,
            };
            for (cellindex in budgetNode.cells) {
                let budgetCell = budgetNode.cells[cellindex];
                let props = {
                    chartIndex: cellindex,
                    configData: configData,
                    userselections: userselections,
                };
                let fcurrent = selectfn(0)(cellindex);
                chartParmsObj = budgetNode.getChartParms(props, { current: fcurrent, next: selectfn });
                if (!chartParmsObj.isError) {
                    budgetCell.chartparms = chartParmsObj.chartParms;
                    budgetCell.chartCode =
                        constants_1.ChartTypeCodes[budgetCell.chartparms.chartType];
                }
                else {
                    break;
                }
            }
            if (!chartParmsObj.isError) {
                matrixlocation = budgetNode.matrixLocation;
                chartmatrixrow[matrixlocation.column] = budgetNode;
            }
            refreshPresentation();
        };
        this.data = parms.data;
        this.nodes = parms.nodes;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BudgetBranch;
