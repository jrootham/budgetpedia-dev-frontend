// 2015_preprocess.js
'use strict'
var jsonfile = require('jsonfile')
var fs = require('fs')
// var csv = require('csv')
var parse = require('csv-parse/lib/sync')
var budgetroot = require('./2015_data/budgetroot.json')

let year = 2015

// =============================================================================
// ----------------------------[ IMPORT STAFFING DATA ]-------------------------

var filetext = fs.readFileSync('./2015_data/2015.staffing.programs.csv','utf8')

var records = parse(filetext, {auto_parse:true})

var budgetstaffing = budgetroot.DataSeries.BudgetStaffing.Items

for (var line of records) {
    let code = line[0],
        perm = line[2],
        temp = line[3],
        total = line[4]

    if (perm === '') perm = null
    if (temp === '') temp = null
    if (total === '') total = null

    let item = budgetstaffing[code]
    if (!item) {
        console.log('code not found: ', code)
    } else {
        // decompose
        let years = item.years || {}
        years[year] = total
        let components = item.Components || {
            FULL:{years:{}},
            PART:{years:{}},
        }
        components.FULL.years[year]=perm
        components.PART.years[year]=temp
        // re-assemble
        item.years = years
        item.Components = components
    }
}

// =============================================================================
// ----------------------------[ IMPORT EXPENSE DATA ]-------------------------

var filetext = fs.readFileSync('./2015_data/2015.expenses.expenditures.csv','utf8')

var records = parse(filetext, {auto_parse:true})

var budgetexpenses = budgetroot.DataSeries.BudgetExpenses.Items

for (var line of records) {
    let program = line[0],
        expenditure = line[2],
        amount = line[5]

    if (amount === '') amount = null

    let item = budgetexpenses[program]
    if (!item) {
        console.log('expense program code not found: ', program)
    } else {
        // decompose
        let years = item.years || {}
        if (!years[year]) years[year] = 0
        let components = item.Components || {}

        years[year] += amount

        // some accounts may be incorrectly duplicated
        let yearaccount = components[expenditure] || {years:{}}
        if (yearaccount.years[year]) {
            yearaccount.years[year] += amount
        } else {
            yearaccount.years[year] = amount
        }
        // re-assemble
        components[expenditure] = yearaccount
        item.years = years
        item.Components = components
    }
}

// =============================================================================
// ----------------------------[ IMPORT REVENUE DATA ]-------------------------

var filetext = fs.readFileSync('./2015_data/2015.revenues.expenditures.csv','utf8')

var records = parse(filetext, {auto_parse:true})

var budgetrevenues = budgetroot.DataSeries.BudgetRevenues.Items

for (var line of records) {
    let program = line[0],
        expenditure = line[2],
        amount = line[5]

    if (amount === '') 
        amount = null
    else 
        amount = -amount // normalize

    let item = budgetrevenues[program]
    if (!item) {
        console.log('revenue program code not found: ', program)
    } else {
        // decompose
        let years = item.years || {}
        if (!years[year]) years[year] = 0
        let components = item.Components || {}

        years[year] += amount

        // some accounts may be incorrectly duplicated
        let yearaccount = components[expenditure] || {years:{}}
        if (yearaccount.years[year]) {
            yearaccount.years[year] += amount
        } else {
            yearaccount.years[year] = amount
        }
        // re-assemble
        components[expenditure] = yearaccount
        item.years = years
        item.Components = components
    }
}

// ======================================================================
// -------------------------[ SAVE OUTPUT JSON FILE ]--------------------

jsonfile.spaces = 4

jsonfile.writeFile('./2015budget.json', budgetroot)
