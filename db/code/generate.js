// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// generate.js

/*
*/

'use strict'

let utilities = require('./utilities')
let constants = require('./constants')
let common = require('./common')

const allocationcolumn = 4
const generate = context => {

    common.collectGenerateData(context)
    
    generateLookups(context)

    generateJsonFiles(context)

}

module.exports = generate

const generateLookups = context => {
    // move lookups files to history
    let lookupfiles = context.lookupfiles
    let lookupspath = context.lookupspath
    for (let filename of lookupfiles) {
        let datedfilename = utilities.infixDateTime(filename)
        utilities.moveFile(lookupspath + filename, lookupspath + 'history/' + datedfilename)
    }

    let continuityfiles = context.continuityfiles
    let continuitypath = context.continuitypath

    // include only codes that haven't been allocated
    let lookups = {}
    for (let filename of continuityfiles) {
        let csv = utilities.readFileCsv(continuitypath + filename)
        common.stripMapHeader(csv)
        let parts = filename.split('.')
        let category = parts[0]
        let lookup = {}
        for (let line of csv) { 
            if (!line[allocationcolumn]) {
                lookup[line[0]] = line[1]
            }
        }
        let targetname = category + '.lookup.json'
        utilities.writeFileJson(lookupspath + targetname, lookup)
        lookups[category] = lookup
    }
    utilities.writeFileJson(lookupspath + 'lookups.json', lookups)

}

const generateJsonFiles = context => {
    let preparedfiles = context.preparedfiles
    let preparedpath = context.preparedpath

    // sort files into aspects
    let aspects = {}
    for (let filename of preparedfiles) {
        let parts = filename.split('.')
        let aspect = parts[1]
        if (!aspects[aspect]) {
            aspects[aspect] = []
        }
        aspects[aspect].push(filename)
    }

    for (let aspect in aspects) {
        aspects[aspect].sort()
    }

    for (let aspect in aspects) {
        generateJsonFile(aspect, aspects, context)
    }

}

const generateJsonFile = (aspect, aspects, context) => {
    if (aspects[aspect].length == 0) {
        utilities.log('no files for aspect ' + aspect)
        return
    }
    let aspectfiles = aspects[aspect]
    let json = {
        "MetaData":null,
        "Data":null,
        "Notes":{}, // by year: Metadata, Allocations (by code), Notes (by code)
        "Allocations":{},
        "Headers":{}
    }
    let metafilename = aspect + '.json'
    let metapath = context.metapath
    let metadata = utilities.readFileJson(metapath + metafilename)
    let inflationseries = null
    let Decimals = context.settings.Decimals
    json.MetaData = metadata
    // add ReferenceYear, InflationReferenceYear, and YearsRange:{start, end}
    metadata.ReferenceYear = context.settings.ReferenceYear
    metadata.Decimals = context.settings.Decimals[metadata.Units]
    if (metadata.InflationAdjustable) {
        metadata.InflationReferenceYear = context.settings.InflationReferenceYear
    }
    metadata.YearsRange = {
        start:null,
        end:null
    }
    // set years range/ files are sorted by year
    let filename = aspectfiles[0]
    let parts = filename.split('.')
    let year = parseInt(parts[0])
    metadata.YearsRange.start = year
    filename = aspectfiles[aspectfiles.length - 1]
    parts = filename.split('.')
    year = parseInt(parts[0])
    metadata.YearsRange.end = year
    let data
    let basedata
    if (metadata.InflationAdjustable) {
        data = {
            Adjusted:{
            },
            Nominal:{
            }
        }
        basedata = data.Nominal
    } else {
        data = {
        }
        basedata = data
    }
    json.Data = data
    let notes = json.Notes
    let headers = json.Headers
    let allocations = json.Allocations
    for (let filename of aspectfiles) {
        addData(filename, basedata, notes, allocations, headers, metadata, context)
    }
    if (metadata.InflationAdjustable) {
        addAdjusted(data, metadata, context)
    }
    // save files
    let targetfilename = aspect + '.json'
    let targetfilespec = context.jsonpath + targetfilename
    if (utilities.fileExists(targetfilespec)) {
        let datedfilename = utilities.infixDateTime(targetfilename)
        utilities.moveFile(targetfilespec, context.jsonpath + 'history/' + datedfilename)
    }
    utilities.log('saving json file ' + targetfilename)
    utilities.writeFileJson(targetfilespec, json)
}

// add base data and notes data
const addData = (filename, basedata, notes, allocations, headers, metadata, context) => {
    let dimensions = metadata.Dimensions
    let preparedpath = context.preparedpath
    let csv = utilities.readFileCsv(preparedpath + filename)
    let filecomponents = common.decomposeCsv(csv, filename) // {meta, data}
    let metasource = filecomponents.meta
    let datasource = filecomponents.data
    let parts = filename.split('.')
    let year = parseInt(parts[0])
    let categorymeta = common.getCategoryMeta(filecomponents, filename) // names, codes, columns, per _COLUMNS_CATEGORIES_
    let attributemeta = common.getAttributeMeta(filecomponents, filename) // names, codes, columns, per _COLUMNS_ATTRIBUTES_
    let columns = categorymeta.columns
    let allocationsindex = columns.length + attributemeta.columns.length -1
    let amountindex = columns.length // next column
    let notesindex = amountindex + 1
    // getMetaRow UNITS_CODE, UNITS_MULTIPLIER
    let unitscode = utilities.getMetaRow(constants.UNITS_CODE, metasource)
    unitscode = unitscode[1]
    let unitsmultiplier = utilities.getMetaRow(constants.UNITS_MULTIPLIER, metasource)
    unitsmultiplier = unitsmultiplier[1] // multiply for singles
    let unitsratio = metadata.UnitRatio // divide for presentation
    let multiplier = unitsmultiplier/unitsratio
    let unitdecimals = context.settings.Decimals[unitscode] || 0

    let headersource = {}
    for (let index = 1; index < metasource.length - 1; index ++) {
        headersource[metasource[index][0]] = metasource[index][1]
    }
    headers[year] = headersource

    for (let line of datasource) {
        let amount = line[amountindex]
        if (typeof amount == 'string') amount = amount.trim() // sometimes a blank char shows up for some reason
        amount = Number(line[amountindex])
        let components = basedata
        let columnindex = 0
        let code = line[columnindex]
        let codeindex = year + '.'
        let node
        do  {
            if (code) { // always true on the first pass, therefore node will always be set
                if (!components[code]) {
                    components[code] = {years:{}}
                }
                node = components[code]
                if (amount && !Number.isNaN(amount)) { // ignore if no amount is involved
                    if (multiplier != 1) {
                        amount *= multiplier
                    }
                    amount = Number(amount.toFixed(unitdecimals))
                    // TODO: format amount to correct number of decimals
                    if (!node.years[year]) {
                        node.years[year] = amount
                    } else { // increment amount
                        node.years += amount
                    }
                }
                codeindex += code + '.'
            }
            columnindex += 2 // skip name
            if (columnindex >= columns.length) {
                break
            }
            let columndef = columns[columnindex]
            if (columndef.type != constants.CODE) {
                throw Error('wrong order of columns in ' + filename)
            }
            code = line[columnindex]
            if (code) { // else no category at this level
                if (metdata.CommonDimension && metdata.CommonDimension == code) {
                    // create components property
                    if (!node.CommonDimension) {
                        node.CommonDimension = {}
                    }
                    components = node.CommonDimension
                } else {
                    // create components property
                    if (!node.Components) {
                        node.Components = {}
                    }
                    components = node.Components
                }
            }
        } while (true)
        if (line[notesindex]) {
            notes[codeindex] = line[notesindex]
        }
        if (line[allocationsindex]) {
            allocations[codeindex] = line[allocationsindex]
        }
    }
}

const addAdjusted = (data, metadata, context) => {
    let adjusted = data.Adjusted
    let nominal = data.Nominal
    let inflationseries = utilities.readFileJson(context.dataseriespath + 'inflation.json')

    // start recursion
    addSeries(nominal, adjusted, inflationseries, metadata.Decimals)

}

// recursive
const addSeries = (nominalcomponents, adjustedcomponents, inflationseries, decimals) => {

    let multiplier, amount

    for (let category in nominalcomponents) {
        let nominalcomponent = nominalcomponents[category]
        let adjustedcomponent = adjustedcomponents[category] = {}
        let subcomponents = nominalcomponent.Components
        if (subcomponents) {
            adjustedcomponent.Components = {}
            addSeries(subcomponents, adjustedcomponents.Components, inflationseries, decimals)
        }
        let commondimensions = nominalcomponent.CommonDimension
        if (commondimensions) {
            adjustedcomponent.CommonDimension = {}
            addSeries(commondimensions, adjustedcomponent.CommonDimension, inflationseries, decimals)
        }
        if (!nominalcomponent.years) {
            continue
        }
        let nominalyears = nominalcomponent.years
        if (!adjustedcomponent.years) {
            adjustedcomponent.years = {}
        }
        // adjust years
        let adjustedyears = adjustedcomponent.years
        for (let year in nominalyears) {
            multiplier = inflationseries.years[year] || 1
            amount = nominalyears[year] * multiplier
            amount = Number(amount.toFixed(decimals))
            adjustedyears[year] = amount
        }
    }
    
}
