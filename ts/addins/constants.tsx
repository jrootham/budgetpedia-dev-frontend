// constants.tsx
// export var categoryAliases = {
//     'Types': 'Program Activity Types',
//     'Groups': 'Program Activity Clusters',
//     'Divisions':'Programs',
//     'Expenditures':'Expenditure CommonObjects'
// }
let ChartCodeToGoogleChartType = {
    'DonutChart':'PieChart',
    'ColumnChart':'ColumnChart',
    'Timelines':'LineChart'
}

export var GoogleChartTypeToChartCode = {
}

for (let explorerChartCode in ChartCodeToGoogleChartType) {
    GoogleChartTypeToChartCode[ChartCodeToGoogleChartType[explorerChartCode]] = explorerChartCode
}

export { ChartCodeToGoogleChartType }

let AspectNameToDatasetName = {
    'Expenses':'BudgetExpenses',
    'Revenues':'BudgetRevenues',
    'Staffing':'BudgetStaffing'
}

export var DatasetNameToAspectName = {
}

for (let AspectName in AspectNameToDatasetName) {
    DatasetNameToAspectName[AspectNameToDatasetName[AspectName]] = AspectName
}

export { AspectNameToDatasetName }