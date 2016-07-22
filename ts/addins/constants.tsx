// constants.tsx
// export var categoryAliases = {
//     'Types': 'Program Activity Types',
//     'Groups': 'Program Activity Clusters',
//     'Divisions':'Programs',
//     'Expenditures':'Expenditure Categories'
// }
let ChartCodeToGoogleChartType = {
    'DonutChart':'PieChart',
    'ColumnChart':'ColumnChart',
    'Timelines':'LineChart'
}

export var GoogleChartTypeToChartCode = {
}

for (let chartCode in ChartCodeToGoogleChartType) {
    GoogleChartTypeToChartCode[ChartCodeToGoogleChartType[chartCode]] = chartCode
}

export { ChartCodeToGoogleChartType }