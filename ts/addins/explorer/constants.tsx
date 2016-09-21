// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// explorerchart.tsx
// constants.tsx

export enum TimeScope {
    OneYear,
    TwoYears,
    AllYears,
}

let ChartCodeToGoogleChartType = {
    'DonutChart':'PieChart',
    'ColumnChart':'ColumnChart',
    'DoubleColumnChart':'ColumnChart',
    'Timeline':'LineChart',
    'ContextChart':'TreeMap',
    'StackedArea':'AreaChart', // isStacked:'absolute'
    'Proportional':'AreaChart', // isStacked:'percent'
}

export { ChartCodeToGoogleChartType }

let AspectNameToDatasetName = {
    'Expenses':'Expenses',
    'Revenues':'Revenues',
    'Staffing':'Staffing'
}

export var DatasetNameToAspectName = {
}

for (let AspectName in AspectNameToDatasetName) {
    DatasetNameToAspectName[AspectNameToDatasetName[AspectName]] = AspectName
}

export { AspectNameToDatasetName }
