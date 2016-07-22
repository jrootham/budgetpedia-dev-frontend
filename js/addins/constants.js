"use strict";
let ChartCodeToGoogleChartType = {
    'DonutChart': 'PieChart',
    'ColumnChart': 'ColumnChart',
    'Timelines': 'LineChart'
};
exports.ChartCodeToGoogleChartType = ChartCodeToGoogleChartType;
exports.GoogleChartTypeToChartCode = {};
for (let chartCode in ChartCodeToGoogleChartType) {
    exports.GoogleChartTypeToChartCode[ChartCodeToGoogleChartType[chartCode]] = chartCode;
}
