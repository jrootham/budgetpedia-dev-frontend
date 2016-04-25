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
        years[year] =
            {
                Amount:total,
                Components:{
                    FULL:{Amount:perm},
                    PART:{Amount:temp}
                }
            }
        // re-assemble
        item.years = years
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
        let yearobj = years[year] || {
            Amount:0,
            Components:{}
        }
        yearobj.Amount += amount
        // some accounts may be incorrectly duplicated
        let yearaccount = yearobj.Components[expenditure] || {}
        if (yearaccount.Amount) {
            yearaccount.Amount += amount
        } else {
            yearaccount.Amount = amount
        }
        // re-assemble
        yearobj.Components[expenditure] = yearaccount
        years[year] = yearobj
        item.years = years
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
        let yearobj = years[year] || {
            Amount:0,
            Components:{}
        }
        yearobj.Amount += amount
        // some accounts may be incorrectly duplicated
        let yearaccount = yearobj.Components[expenditure] || {}
        if (yearaccount.Amount) {
            yearaccount.Amount += amount
        } else {
            yearaccount.Amount = amount
        }
        // re-assemble
        yearobj.Components[expenditure] = yearaccount
        years[year] = yearobj
        item.years = years
    }
}

// ======================================================================
// -------------------------[ SAVE OUTPUT JSON FILE ]--------------------

jsonfile.spaces = 4

jsonfile.writeFile('./2015budget.json', budgetroot)
