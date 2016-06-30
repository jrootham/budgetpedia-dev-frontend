// constants.tsx
export enum ChartSeries { DrillDown, Compare, Differences, Context }
export var categoryaliases = {
    'Types': 'Program Activity Types',
    'Groups': 'Program Activity Clusters',
    'Divisions':'Programs',
    'Expenditures':'Expenditure Categories'
}
export var ChartTypeCodes = {
    'PieChart':'DonutChart',
    'ColumnChart':'ColumnChart',
    'LineChart':'Timelines'
}

let ChartCodeTypes = {}

for (let chartType in ChartTypeCodes) {
    ChartCodeTypes[ChartTypeCodes[chartType]] = chartType
}

export { ChartCodeTypes }