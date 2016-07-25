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
