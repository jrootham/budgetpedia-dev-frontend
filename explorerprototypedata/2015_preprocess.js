// 2015_preprocess.js
'use strict'
var jsonfile = require('jsonfile')
var csv = require('csv')
var parse = csv.parse

var budgetroot = require('./2015_data/budgetroot.json')
var expensedata = require('./2015_data/2015.expenses.expenditures.csv')
var revenuedata = require('./2015_data/2015.revenues.expenditures.csv')
var staffingdata = require('./2015_data/2015.staffing.programs.csv')

parse(staffingdata,(err,data)=>{
    console.log('inside',data)
})