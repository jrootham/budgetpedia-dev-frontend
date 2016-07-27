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
let FacetNameToDatasetName = {
    'Expenses': 'BudgetExpenses',
    'Revenues': 'BudgetRevenues',
    'Staffing': 'BudgetStaffing'
};
exports.FacetNameToDatasetName = FacetNameToDatasetName;
exports.DatasetNameToFacetName = {};
for (let FacetName in FacetNameToDatasetName) {
    exports.DatasetNameToFacetName[FacetNameToDatasetName[FacetName]] = FacetName;
}
