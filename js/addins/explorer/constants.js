"use strict";
(function (TimeScope) {
    TimeScope[TimeScope["OneYear"] = 0] = "OneYear";
    TimeScope[TimeScope["TwoYears"] = 1] = "TwoYears";
    TimeScope[TimeScope["AllYears"] = 2] = "AllYears";
})(exports.TimeScope || (exports.TimeScope = {}));
var TimeScope = exports.TimeScope;
let ChartCodeToGoogleChartType = {
    'DonutChart': 'PieChart',
    'ColumnChart': 'ColumnChart',
    'DoubleColumnChart': 'ColumnChart',
    'Timeline': 'LineChart',
    'ContextChart': 'TreeMap',
    'StackedArea': 'AreaChart',
    'Proportional': 'AreaChart',
};
exports.ChartCodeToGoogleChartType = ChartCodeToGoogleChartType;
let AspectNameToDatasetName = {
    'Expenses': 'Expenses',
    'Revenues': 'Revenues',
    'Staffing': 'Staffing'
};
exports.AspectNameToDatasetName = AspectNameToDatasetName;
exports.DatasetNameToAspectName = {};
for (let AspectName in AspectNameToDatasetName) {
    exports.DatasetNameToAspectName[AspectNameToDatasetName[AspectName]] = AspectName;
}
