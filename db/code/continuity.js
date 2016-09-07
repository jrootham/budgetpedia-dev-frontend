// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// continuity.js

'use strict'

let utilities = require('./utilities')
let constants = require('./constants')
let common = require('./common')

let header = ['_COLUMNS_','Category:CODE,Category:NAME,Start:VALUE,End:Value,DiscontinueTo:CODE,DiscontinueTo:NAME']

const continuity = context => {

    common.collectContinuityData(context)

    let mapsfiles = context.mapscodesfiles

    // group files by category
    let groups = {}
    for (let filename of mapsfiles) {
        let parts = filename.split('.')
        let category = parts[1]
        if (!groups[category]) {
            groups[category] = []
        }
        groups[category].push(filename)
    }

    // get all in year order
    for (let groupname in groups) {
        groups[groupname].sort()
    }

    for (let groupname in groups) {
        let group = groups[groupname]
        updateContinuityGroup(groupname, group, context)
    }

}

module.exports = continuity

// groups are pre-sorted arrays of files
const updateContinuityGroup = (groupname, group, context) => {

    // console.log(groupname, group)
    let continuityfilename = `${groupname}.continuity.csv`
    let path = context.continuitypath
    let filespec = path + continuityfilename
    let continuity = {}
    let previouscsv = utilities.readFileCsv(filespec)
    common.stripMapHeader(previouscsv)
    // let previouscsv = []
    let previouscontinuity = {}
    for (let line of previouscsv) {
        let code = line[0]
        let name = line[1]
        let start = line[2]
        let end = line[3]
        let tocode = line[4]
        let toname = line[5]
        previouscontinuity[code] = {
            name:name,
            start:start,
            end:end,
            tocode:tocode,
            toname:toname
        }
    }

    for (let filename of group) {
        updateContinuityFromFile(groupname, continuity, filename, context)
    }

    for (let code in continuity) {
        if (previouscontinuity[code]) {
            let previousitem = previouscontinuity[code]
            let item = continuity[code]
            if (item.end == previousitem.end) {
                if (previousitem.tocode) {
                    item.tocode = previousitem.tocode
                }
                if (previousitem.toname) {
                    item.toname = previousitem.toname
                }
            }
        }
    }
    let csv = []
    let keys = Object.keys(continuity)
    keys.sort()
    for (let code of keys) {
        let item = continuity[code]
        let line = [code, item.name, item.start, item.end]
        if (item.tocode) {
            line.push(item.tocode)
            if (item.toname) {
                line.push(item.toname)
            }
        }
        csv.push(line)
    }
    // console.log(csv)
    let localheader = [...header]
    utilities.normalizeHeaderRow(localheader)
    utilities.equalizeLineLengths([localheader],csv)
    csv.splice(0,0,localheader)
    utilities.writeFileCsv(filespec, csv)
}

const updateContinuityFromFile = (groupname, continuity, filename, context) => {
    let parts = filename.split('.')
    let year = parseInt(parts[0])
    // let referenceyear = context.settings.ReferenceYear
    let filespec = context.mapscodespath + filename
    let map = utilities.readFileCsv(filespec)
    common.stripMapHeader(map)
    for (let line of map) {
        let code = line[0]
        let name = line[1]
        if (!continuity[code]) {
            continuity[code] = {start:year}
        }
        let codeitem = continuity[code]
        codeitem.name = name 
        codeitem.mark = true
        codeitem.end = null
    }
    for (let code in continuity) {
        let item = continuity[code]
        if (item.mark) {
            delete item.mark
        } else {
            if (!item.end) {
                item.end = year - 1
            }
        }
    }

}



