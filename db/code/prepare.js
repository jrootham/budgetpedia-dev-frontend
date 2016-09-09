// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// prepare.js

'use strict'

let utilities = require('./utilities')
let constants = require('./constants')
let common = require('./common')

let discontinueToIndex = 4
let codeIndex = 0

const prepare = context => {

    common.collectPrepareData(context)

    let continuity = {}
    let continuityfiles = context.continuityfiles
    let continuitypath = context.continuitypath
    for (let filename of continuityfiles) {
        let filespec = continuitypath + filename
        let csv = utilities.readFileCsv(filespec)
        if (csv.length == 0) {
            throw Error('continuity file not found: ' + filename)
        }
        common.stripMapHeader(csv)
        let parts = filename.split('.')
        let category = parts[0]
        continuity[category] = csv
    }

    let preprocessedfiles = context.preprocessedfiles

    for (let filename of preprocessedfiles) {
        prepareFile(filename, continuity, context)
    }
}

module.exports = prepare

const prepareFile = (filename, continuity, context) => {
    utilities.log('preparing ' + filename)

    // let parts = filename.split('.')
    // let yearstring = parts[0]

    // move previous prepared file to replaced

    // load preprocess file
    let csv = utilities.readFileCsv(context.preprocessedpath + filename)
    if (csv.length == 0) {
        throw Error('preprocessed file not found ' + filename)
    }

    let components = common.decomposeCsv(csv, filename) // {meta, data}

    // add allocations column
    let columnlist = utilities.getMetaRow(constants.COLUMNS_ATTRIBUTES,components.meta)
    let columnarray = columnlist[1].split(',')
    columnarray.push('Allocations' + ':' + constants.DESCRIPTION)
    columnlist[1] = columnarray.join(',')
    let columndata = common.getCategoryData(components, filename) // names, codes, columns, per _COLUMNS_CATEGORIES_

    let attributedata = common.getAttributeData(components, filename) // names, codes, columns, per _COLUMNS_ATTRIBUTES_

    let allocationsfound = imposeFileContinuity(components,columndata, attributedata, continuity, filename)

    if (allocationsfound) { // reduce resulting lines
        let reduction = reduceList(components, columndata, attributedata)

        let newlist = reconstituteList(reduction, columndata)
    }

    // equalize rows to new allocations column

    // for preprocessed file, save latest; save processed

    let newcsv = [...components.meta, ...components.data]
    let targetfilespec = context.preparedpath + filename
    utilities.writeFileCsv(targetfilespec,newcsv)
}

const reconstituteList = (reduction, columndata) => {

    let columnarray = columndata.column_names

    let newList = []

    let components = reduction.components
    for (let code in components) {
        let node = components[code]
        node.code = code
        let queue = [node]
        let matrix = [] // data for each category column
        for (let columnindex in columnarray) {
            let category = columnarray[columnindex]
            let nextqueue = []
            let column = matrix[columnindex] = []
            for (let item of queue) {
                let display = {
                    category:category,
                    code:item.code,
                    name:item.name
                }
                if (!item.components) {
                    display.amount = item.amount?item.amount:null
                    display.allocations = item.allocations?item.allocations:null
                }
                column.push(display)
                let components = item.components
                if (components) {
                    for (let code in components) {
                        let item = components[code]
                        item.code = code
                        nextqueue.push(item)
                    }
                }
            }
            queue = nextqueue
        }
        // flesh out the matrix and add to newList here
        console.log(matrix)
    }

    // console.log(newList)

    // throw Error('end of newList')

    return [] //newList

}

const reduceList = (components, columndata, attributedata) => {

    let data = components.data
    let columns = columndata.columns
    let amountindex = columns.length // next column
    let noteindex = columns.length + 1
    let severityindex = columns.length + 2
    let allocationsindex = columns.length + attributedata.columns.length - 1
    let reduction = {}
    data.reduce((reduction, line) => {
        // let rootcode = line[0]
        // let item = reduction[rootcode] || {}
        let node = reduction
        // console.log('node', node)
        for (let columnindex = 0; columnindex < columns.length; columnindex++) {
            let codeitem = columns[columnindex]
            if (codeitem.type == constants.CODE) {
                let type = codeitem.name
                let code = line[columnindex]
                if (!code) break
                let name = line[columnindex + 1]
                if (!node.components) {
                    node.components = {}
                }
                // console.log('saving name', name)
                if (!node.components[code]) {
                    node.components[code] = {name:name, type:type}
                }
                node = node.components[code]
            }
        }
        if (node === reduction) {
            throw Error('no line item code found ' + line.join(',') + ' in ' + filename)
        }

        let amount = line[amountindex]
        if (typeof amount == 'string') amount = amount.trim() // sometimes a blank char shows up for some reason
        if (amount && !Number.isNaN(amount)) { // ignore if no amount is involved
            if (node.amount) {
                node.amount += amount
            } else {
                node.amount = amount
            }
        }

        let note = line[noteindex]
        if (note) {
            if (node.note) {
                node.note += '\n' + note
            } else {
                node.note = note
            }
        }

        let severity = line[severityindex]
        if (severity) {
            if (node.severity) {
                node.severity += '\n' + severity
            } else {
                node.severity = severity
            }
        }

        let allocation = line[allocationsindex]
        if (allocation) {
            if (node.allocations) {
                node.allocations += '\n' + allocation
            } else {
                node.allocations = allocation
            }
        }
        return reduction
    },reduction)

    return reduction

}

// replace historic codes and names with continuity codes and names; add allocation notes when
// allocation is encountered
const imposeFileContinuity = (components,columndata, attributedata, continuity, filename) => {

    let columns = columndata.columns

    let allocationsindex = columns.length + attributedata.columns.length -1
    let amountindex = columns.length // next column

    let allocationfound = false

    for (let columnindex = 0; columnindex < columns.length;columnindex ++) {
        let columndef = columns[columnindex]
        if (columndef.type == constants.CODE) {
            let categoryname = columndef.name.toLowerCase()
            let continuitylookup = continuity[categoryname]
            if (!continuitylookup) {
                throw Error('continuitylookup not found for ' + categoryname + ' in ' + filename)
            }
            let data = components.data
            for (let line of data) {
                let code = line[columnindex]
                if (!code) { // no category at this level
                    continue
                }
                // look for continuity item
                let continuityline = findContinuityLine(code, continuitylookup, filename)
                if (code != continuityline[0]) {
                    let amount = line[amountindex]
                    if (typeof amount == 'string') amount = amount.trim() // sometimes a blank char shows up for some reason
                    if (amount && !Number.isNaN(amount)) { // ignore if no amount is involved
                        allocationfound = true
                        let allocations = line[allocationsindex]
                        if (!allocations) { // only make note of allocation once, the first time
                            let addition = 'Allocation from: ' + line.join(',')
                            allocations = addition
                            line[allocationsindex] = allocations
                        }
    
                    }
                    line[columnindex] = continuityline[0]                    
                }
                line[columnindex + 1] = continuityline[1] // update name in any case
            }
        }
    }

    return allocationfound

}

const findContinuityLine = (code, continuitylookup, filename) => {

    let newcode = code
    let count = 0
    let continuityline = null
    do {
        count++
        if (count > 10) {
            throw Error('infinite loop looking for continuity lookup ' + code)
        }
        let filtered = continuitylookup.filter(item => {
            return (item[0] == newcode)
        })
        if (filtered.length ==0) {
            throw Error(`continuity code ${code} not found in ${filename}`)
        }
        continuityline = filtered[0]
        newcode = continuityline[4]
    } while (newcode)
    return continuityline
}