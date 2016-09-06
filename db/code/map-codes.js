// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// map-codes.js

'use strict'

let utilities = require('./utilities')
let constants = require('./constants')
let common = require('./common')

let header = ['_COLUMNS_','Category:CODE,Category:NAME,ReferenceCategory:CODE,ReferenceCategory:NAME,AlternateNames:LIST']

const mapCodes = context => {

    common.collectMapCodesData(context)

    let mapsfiles = context.mapsfiles

    for (let filename of mapsfiles) {
        mapFileCodes(filename, context)
    }

}

const mapFileCodes = (filename, context) => {

    utilities.log('mapping file codes for ' + filename)

    let map = utilities.readFileCsv(context.mapspath + filename)
    common.stripMapHeader(map)
    let codemap = {}
    // TODO get codemap items from file maps_codes file
    for (let line of map) {
        let code = line[1]
        let name = line[0]
        let item = codemap[code] || {name:name}
        item.mark = true // later identify unmarked items to leave them out of file write
        if (item.name != name) {
            console.log('alternate name found', name)
            let names = item.alternatenames || item.name + ';#' + name
            let namelist = names.split(';#')
            if (namelist.indexOf(name) == -1) {
                namelist.push(name)
            }
            item.alternatenames = namelist.join(';#')
            console.log(item)
        }
        if (!codemap[code]) codemap[code] = item
    }
    // console.log(codemap)
    // write <year>.<category>.code_to_name.csv

}

module.exports = mapCodes
