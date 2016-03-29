// preprocess.js
'use strict'
var jsonfile = require('jsonfile')
var fs = require('fs')
var departments = require('./departments.json')
var categories = require('./categories.json')
var divisions = require('./programs.json')
var expenditures = require('./expenditures.json')
var expenditurenames = require('./expenditurenames.json')

let budget = {}

let expenditurebudget = expenditures.map( item => {
    let expenditurenameitem = expenditurenames.filter(nameitem => {
        if (nameitem.Expenditure == item.Expenditure)
            return true
        else 
            return false
    })
    expenditurenameitem = expenditurenameitem[0]
    item.Amount = parseInt(item.Amount)
    item.Expenditure = expenditurenameitem.Name + ' (' + item.Expenditure + ')'
    return item
})

let divisionbudget = divisions.map( division => {
    let expenditureitems = expenditurebudget.filter (expenditureitem => {
        if (expenditureitem.Division == division.Division)
            return true
        else
            return false
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
        if (divisionitem.Category == category.Category)
            return true
        else
            return false
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
        if (categoryitem.Department == department.Department)
            return true
        else
            return false
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

jsonfile.spaces = 4

jsonfile.writeFile('./budget.json',departmentbudget)
