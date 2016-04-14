"use strict";
(function (ChartSeries) {
    ChartSeries[ChartSeries["DrillDown"] = 0] = "DrillDown";
    ChartSeries[ChartSeries["Compare"] = 1] = "Compare";
    ChartSeries[ChartSeries["Differences"] = 2] = "Differences";
    ChartSeries[ChartSeries["Context"] = 3] = "Context";
})(exports.ChartSeries || (exports.ChartSeries = {}));
var ChartSeries = exports.ChartSeries;
exports.categoryaliases = {
    'Types': 'Division Activity Types',
    'Groups': 'Division Activity Clusters',
    'Expenditures': 'Expenditure Categories'
};
