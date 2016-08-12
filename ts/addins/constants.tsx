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

let FacetNameToDatasetName = {
    'Expenses':'BudgetExpenses',
    'Revenues':'BudgetRevenues',
    'Staffing':'BudgetStaffing'
}

export var DatasetNameToFacetName = {
}

for (let FacetName in FacetNameToDatasetName) {
    DatasetNameToFacetName[FacetNameToDatasetName[FacetName]] = FacetName
}

export { FacetNameToDatasetName }