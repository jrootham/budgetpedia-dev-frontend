"use strict";
(function (ChartSeries) {
    ChartSeries[ChartSeries["DrillDown"] = 0] = "DrillDown";
    ChartSeries[ChartSeries["Compare"] = 1] = "Compare";
    ChartSeries[ChartSeries["Differences"] = 2] = "Differences";
    ChartSeries[ChartSeries["Context"] = 3] = "Context";
})(exports.ChartSeries || (exports.ChartSeries = {}));
var ChartSeries = exports.ChartSeries;
exports.categoryaliases = {
    'Types': 'Program Activity Types',
    'Groups': 'Program Activity Clusters',
    'Divisions': 'Programs',
    'Expenditures': 'Expenditure Categories'
};
exports.ChartTypeCodes = {
    'PieChart': 'DonutChart',
    'ColumnChart': 'ColumnChart',
    'LineChart': 'Timelines'
};
let ChartCodeTypes = {};
exports.ChartCodeTypes = ChartCodeTypes;
for (let chartType in exports.ChartTypeCodes) {
    ChartCodeTypes[exports.ChartTypeCodes[chartType]] = chartType;
}
