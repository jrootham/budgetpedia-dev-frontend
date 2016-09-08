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

    let csv = utilities.readFileCsv(context.preprocessedpath + filename)
    if (csv.length == 0) {
        throw Error('preprocessed file not found ' + filename)
    }

    let components = common.decomposeCsv(csv, filename) // {meta, data}

    let columndata = common.getCategoryData(components, filename) // names, codes, columns, per _COLUMNS_CATEGORIES_

    let attributedata = common.getAttributeData(components, filename) // names, codes, columns, per _COLUMNS_ATTRIBUTES_

    let allocationsfound = imposeFileContinuity(components,columndata, attributedata, continuity, filename)

    if (allocationsfound) {
        // reduce newly allocated lines
    }

    // equalize rows to new allocations column

    // for preprocessed file, save latest; save processed

    let newcsv = [...components.meta, ...components.data]
    let targetfilespec = context.preparedpath + filename
    utilities.writeFileCsv(targetfilespec,newcsv)
}

// replace historic codes and names with continuity codes and names; add allocation notes when
// allocation is encountered
const imposeFileContinuity = (components,columndata, attributedata, continuity, filename) => {

    let columns = columndata.columns

    let allocationsindex = columns.length + attributedata.columns.length
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
                        allocationsfound = true
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

    return allocationsfound

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