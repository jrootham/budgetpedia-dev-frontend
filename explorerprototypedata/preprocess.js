// preprocess.js
'use strict'
var jsonfile = require('jsonfile')
var budgetroot = require('./budgetroot.json')
var departments = require('./departments.json')
var categories = require('./categories.json')
var divisions = require('./programs.json')
var expenditures = require('./expenditures.json')
var expenditurenames = require('./expenditurenames.json')

let expenditurebudget = expenditures.map( item => {
    let expenditurenameitem = expenditurenames.filter(nameitem => {
        return (nameitem.Expenditure == item.Expenditure)? true: false
    })
    expenditurenameitem = expenditurenameitem[0]
    item.Amount = parseInt(item.Amount)
    item.Expenditure = expenditurenameitem.Name + ' (' + item.Expenditure + ')'
    return item
})

let divisionbudget = divisions.map( division => {
    let expenditureitems = expenditurebudget.filter (expenditureitem => {
        return (expenditureitem.Division == division.Division)? true: false
    })
    expenditureitems = expenditureitems.map( item => {
        delete item.Division
        return item
    })
    division.Expenditures = expenditureitems
    return division
})

let categorybudget = categories.map( category => {
    let divisionitems = divisionbudget.filter ( divisionitem => {
        return (divisionitem.Category == category.Category)? true: false
    })
    divisionitems = divisionitems.map( item => {
        delete item.Category
        return item
    })
    let total = divisionitems.reduce((previousvalue, currentitem) => {
        return previousvalue + currentitem.Amount
    },0)
    category.Divisions = divisionitems
    category.Amount = total
    return category
})

let departmentbudget = departments.map( department => {
    let categoryitems = categorybudget.filter ( categoryitem => {
        return (categoryitem.Department == department.Department)? true: false
    })
    categoryitems = categoryitems.map( item => {
        delete item.Department
        return item
    })
    let total = categoryitems.reduce((previousvalue, currentitem) => {
        return previousvalue + currentitem.Amount
    },0)
    department.Categories = categoryitems
    department.Amount = total
    return department
})

let budgettotal = departmentbudget.reduce((previousvalue, currentitem) => {
    return previousvalue + currentitem.Amount
},0)

budgetroot.Departments = departmentbudget
budgetroot.Amount = budgettotal

jsonfile.spaces = 4

jsonfile.writeFile('./budget.json', budgetroot)
