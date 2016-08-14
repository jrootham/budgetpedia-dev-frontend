"use strict";
let ChartCodeToGoogleChartType = {
    'DonutChart': 'PieChart',
    'ColumnChart': 'ColumnChart',
    'Timelines': 'LineChart'
};
exports.ChartCodeToGoogleChartType = ChartCodeToGoogleChartType;
exports.GoogleChartTypeToChartCode = {};
for (let explorerChartCode in ChartCodeToGoogleChartType) {
    exports.GoogleChartTypeToChartCode[ChartCodeToGoogleChartType[explorerChartCode]] = explorerChartCode;
}
let AspectNameToDatasetName = {
    'Expenses': 'BudgetExpenses',
    'Revenues': 'BudgetRevenues',
    'Staffing': 'BudgetStaffing'
};
exports.AspectNameToDatasetName = AspectNameToDatasetName;
exports.DatasetNameToAspectName = {};
for (let AspectName in AspectNameToDatasetName) {
    exports.DatasetNameToAspectName[AspectNameToDatasetName[AspectName]] = AspectName;
}
