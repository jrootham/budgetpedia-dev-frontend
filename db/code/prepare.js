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

    let preprocessedfiles = context.preprocessedfiles

    if (preprocessedfiles.length == 0) {
        throw Error('no preprocessed files to prepare.')
    }
    
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

    for (let filename of preprocessedfiles) {
        prepareFile(filename, continuity, context)
    }
}

module.exports = prepare

const prepareFile = (filename, continuity, context) => {
    utilities.log('preparing ' + filename)

    // load preprocess file
    let sourcefilespec = context.preprocessedpath + filename
    let csv = utilities.readFileCsv(sourcefilespec)
    if (csv.length == 0) {
        throw Error('preprocessed file not found ' + filename)
    }

    let originalcsv = [...csv]

    let components = common.decomposeCsv(csv, filename) // {meta, data}

    // add allocations column
    let columnlist = utilities.getMetaRow(constants.COLUMNS_ATTRIBUTES,components.meta)
    let columnarray = columnlist[1].split(',')
    columnarray.push('Allocations' + ':' + constants.DESCRIPTION)
    columnlist[1] = columnarray.join(',')

    // collect control data
    let categorydata = common.getCategoryData(components, filename) // names, codes, columns, per _COLUMNS_CATEGORIES_

    let attributedata = common.getAttributeData(components, filename) // names, codes, columns, per _COLUMNS_ATTRIBUTES_

    // impose file continuity; allocations to current codes; apply current names
    let allocationsfound = imposeFileContinuity(components, categorydata, attributedata, continuity, filename)

    if (allocationsfound) { // reduce resulting lines

        let reduction = reduceList(components, categorydata, attributedata)

        let newList = reconstituteList(reduction, categorydata, attributedata)

        // assign newList to components.data
        components.data = newList

    }

    // for preprocessed file, save latest; save processed
    // move previous prepared file to replaced

    utilities.equalizeLineLengths(components.data, components.meta)

    let newcsv = [...components.meta, ...components.data]
    
    // move previous prepared file to 'replaced/' dir
    let targetfilespec = context.preparedpath + filename
    if (utilities.fileExists(targetfilespec)) {
        let targetdatedspec = utilities.infixDateTime(filename)
        utilities.moveFile(targetfilespec, context.preparedpath + 'replaced/' + targetdatedspec)
    }
    utilities.writeFileCsv(targetfilespec,newcsv)

    utilities.writeFileCsv(context.preprocessedpath + 'latest/' + filename, originalcsv)
    let sourcedatedfilespec = utilities.infixDateTime(filename)
    utilities.moveFile(sourcefilespec, context.preprocessedpath + 'processed/' + sourcedatedfilespec)

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
        if (filtered.length == 0 ) {
            throw Error(`continuity code ${code} not found in ${filename}`)
        }

        continuityline = filtered[0]
        newcode = continuityline[4]

    } while (newcode)

    return continuityline
}

// reduce the spreadsheet into an object hierarchy (because it's a highly deterministic normalization)
const reduceList = (components, columndata, attributedata) => {

    let data = components.data
    let columns = columndata.columns
    let amountindex = columns.length // next column
    let noteindex = columns.length + 1
    let severityindex = columns.length + 2
    let allocationsindex = columns.length + attributedata.columns.length - 1
    let reduction = {}

    data.reduce((reduction, line) => {

        let node = reduction // node is reset recusively

        // ----------------------[ create object hierarchy ]----------------------------

        // recurse into category structure; add node components properties recursively
        for (let columnindex = 0; columnindex < columns.length; columnindex++) {
            let codeitem = columns[columnindex]
            if (codeitem.type == constants.CODE) {
                let type = codeitem.name
                let code = line[columnindex]

                if (!code) break // previous iteration node was the leaf

                let name = line[columnindex + 1]

                if (!node.components) {
                    node.components = {}
                }

                if (!node.components[code]) {
                    node.components[code] = {code:code, name:name, type:type}
                }
                node = node.components[code]
            }
        }

        if (node === reduction) {
            throw Error('no line item code found ' + line.join(',') + ' in ' + filename)
        }

        // --------------------[ collect attributes ]---------------------

        // latest node is the leaf, so add attributes
        // ... amount, note, severity, allocations
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
                let amount = node.amount
                if (amount === undefined) amount = null
                allocation = 'Original amount was ' + amount + ', plus:\n' + allocation
                node.allocations = allocation
            }
        }

        // amount is done after allocations to leave pre-allocation amount free
        // for catpure in allocation notes
        let amount = line[amountindex]
        if (typeof amount == 'string') amount = amount.trim() // sometimes a blank char shows up for some reason
        if (amount && !Number.isNaN(amount)) { // ignore if no amount is involved
            if (node.amount) {
                node.amount += amount
            } else {
                node.amount = amount
            }
        }

        return reduction

    }, reduction)

    return reduction

}

// reconsitute list csv structure from object hierarchy to spreadsheet format
const reconstituteList = (reduction, categorydata, attributedata) => {

    let columnarray = categorydata.column_names

    let newList = []

    let rootcomponents = reduction.components
    let rootkeys = Object.keys(rootcomponents)
    rootkeys.sort()

    /*   
        for each code in rootcomponents, create a block of reconstituted line items
        ie for each code object hierarchy, map to columnar structure ( = block ), 
        then reconstitute lines from that columnar structure
    */    
    for (let code of rootkeys) {
        let node = rootcomponents[code]
        // node.code = code // TODO reduncant?
        let queue = [node] // initialize recursrion
        let block = [] // reconstitution data for each category column

        // --------------[ collect block data for reconsitution ]---------------

        // recursively cycle through current queue (column), to create nextqueue, then recurse
        // where nextqueue becomes current queue
        // cycle through block horizontally...
        for (let columnindex in columnarray) { // there should be these numbers of queues
            // each columnindex represents a category code/name pair

            let category = columnarray[columnindex]
            let nextqueue = []
            let column = block[columnindex] = []

            // cycle through column vertically
            for (let queueindex in queue) {

                let node = queue[queueindex]
                let backlink = parseInt(node.backlink)
                backlink = Number.isNaN(backlink)?null:backlink

                // -----------[ create item to reconstitute ]--------------
                let item = {
                    category:category,
                    type:node.type,
                    code:node.code,
                    name:node.name,
                    backlink:backlink
                }
                if (!node.components) {
                    item.amount = (node.amount !== undefined)?node.amount:null
                    item.allocations = node.allocations?node.allocations:null
                    item.notes = node.notes?node.notes:null
                    item.severity = node.severity?node.severity:null
                    item.leaf = true
                }

                column.push(item) // push to block column

                // --------------------[ accumulate all dependents in nextqueue ]----------------
                let components = node.components

                if (components) {
                    // assemble current portion of next horizontal column to process
                    for (let code in components) {

                        let node = components[code]

                        node.backlink = queueindex // track dependencies
                        nextqueue.push(node)

                    }
                }
            }
            // recurse to next category column
            queue = nextqueue
        }

        // ------------------------[ now reconstitute lines for the block ]------------------
        /*
            recurse into the block data, creating a line into blocklines at each leaf point
        */
        // initialize for recursion launch
        let columnindex = 0
        let rowindex = 0
        let line_precursor = []
        let line_length = categorydata.columns.length + attributedata.columns.length
        // create placeholders in line_precursor
        for (let i = 0; i < line_length; i++) {
            line_precursor.push(null)
        }
        let blocklines = []

        // start recursion
        reconstituteLines(block, columnindex, rowindex, line_precursor, blocklines, columnarray)

        // add the reconstituted blocklines to newList
        newList.splice(newList.length -1, 0, ...blocklines)

    }

    return newList

}

// recursive, stops at leaf node to add attributes to line, and line to blocklines
const reconstituteLines = (
    block, // a matrix containing the block data to reconstitute
    columnindex, // the current block column to process
    rowindex, // the backlink to identify child nodes to associate with current node
    line_precursor, // accumulating row data
    blocklines, // collection of lines for the main root category to add to the file lines
    columnarray // list of categories, in dependency order
    ) => {

    let node = block[columnindex][rowindex]
    // last category (expense/revenue by object) may skip blank cells...
    let typeindex = columnarray.indexOf(node.type) 
    if (typeindex == -1) {
        throw Error(`node type not found in type list in reconstituteLines: ${node.type}, ${node.name}` )
    }
    let lineindex = typeindex * 2 // paired category code and name
    let line = [...line_precursor] // new copy

    // add category code and name to the line
    line[lineindex] = node.code
    line[lineindex + 1] = node.name
    
    if (node.leaf) { // insert attributes; stop recursing

        let line_length = line.length
        line.splice(line_length - 4, 4, node.amount, node.notes, node.severity, node.allocations)

        blocklines.push(line) // emit

    } else { // recurse

        let column = block[columnindex + 1]
        for (let columnlink in column) {
            let node = column[columnlink]
            if (node.backlink == rowindex) { // only process dependents
                reconstituteLines(block, columnindex + 1, columnlink, line, blocklines, columnarray)
            }
        }

    }
}

