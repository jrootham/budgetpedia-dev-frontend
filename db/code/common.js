// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// common.js

'use strict'

let constants = require('./constants')
let utilities = require('./utilities')

exports.decomposeCsv = (csv, filename) => {

    // get clean copy of csv file so that original copy can be saved
    let newcsv = [...csv]
    for (let index in newcsv) {
        newcsv[index] = [...newcsv[index]]
    }
    // get span of meta data
    let metastartpos = (newcsv[0][0] == constants.META_START)?0:null

    let metaendpos = null, found = false
    for (metaendpos = 1; metaendpos < newcsv.length; metaendpos++) {
        if (newcsv[metaendpos][0] == constants.META_END) {
            found = true
            break
        }
    }

    // check for error
    if (metastartpos === null || !found) {
        throw Error('meta section not found for ' + filename)
    }

    // extract metadata
    let metapart = newcsv.splice(metastartpos, metaendpos - metastartpos + 1)

    let components = {
        meta:metapart,
        data:newcsv,
    }

    return components
}

// {names:{<name>:'NAME'},codes:{<name>:'CODE'}, list: {name:<name>, type:<type>}[]} 
// presence of code for <name> determines whether to lookup code or save it to lookup
// CODE columns are expected to appear just before corresponding NAME column
exports.getColumnData = (components, filename) => {

    let columns_categories = components.meta.filter(item => {
        return (item[0] == constants.COLUMNS_CATEGORIES)? true: false
    })
    columns_categories = [...columns_categories[0]]
    if (columns_categories) {
        columns_categories.splice(0,1)
        columns_categories = columns_categories[0].split(',')
        for (let index in columns_categories) {
            columns_categories[index] = columns_categories[index].trim()
        }
    } else {
        throw Error(constants.COLUMNS_CATEGORIES + ' not found for ' + filename)
    }

    let category_names = {}
    let category_codes = {}
    let column_list = []
    for (let columnindex in columns_categories) {
        let column = columns_categories[columnindex]
        let parts = column.split(':')
        if (parts.length != 2) {
            console.log(parts)
            throw Error('improper columms format ' + column + ' in ' + filename)
        }
        let type = parts[1].trim()
        let name = parts[0].trim()
        if (type == constants.NAME) {
            category_names[name] = type
        } else if (type == constants.CODE) {
            category_codes[name] = type
        } else {
            Error('wrong column type ' + column + ' in ' + filename)
        }
        column_list.push({
            name:name,
            type:type
        })
    }

    let columndata = {
        names:category_names,
        codes:category_codes,
        columns:column_list
    }

    return columndata

}

/*
    get
    - version settings.json file
    - intake path
    - intake files
*/
exports.collectIntakeBaseData = context => {

    collectSettingsFile(context)

    let filedata = collectFileData(context,'intake')

    context.intakepath = filedata.path
    context.intakefiles = filedata.files
}

exports.collectPreprocessedData = context => {

    collectSettingsFile(context)

    let filedata = collectFileData(context,'preprocessed')

    context.preprocessedpath = filedata.path
    context.preprocessedfiles = filedata.files

    filedata = collectFileData(context, 'maps_names')
    context.mapspath = filedata.path
    context.mapsfiles = filedata.files

}

exports.collectMapCodesData = context => {

    collectSettingsFile(context)

    let filedata = collectFileData(context, 'maps_names')

    context.mapspath = filedata.path
    context.mapsfiles = filedata.files

    filedata = collectFileData(context, 'maps_codes')

    context.mapscodespath = filedata.path

}

exports.collectContinuityData = context => {

    collectSettingsFile(context)

    let filedata = collectFileData(context, 'maps_codes')

    context.mapscodespath = filedata.path
    context.mapscodesfiles = filedata.files

    filedata = collectFileData(context, 'continuity')

    context.continuitypath = filedata.path
    context.continuityfiles = filedata.files

}

const collectFileData = (context,dirname) => {

    // get intake path and intake files list
    try {
        let path = context.dbroot +
            `${context.repository}/datasets/${context.version}/${dirname}/`
        let files = utilities.getDirContents( path )
        let newfiles = []
        for (let filename of files) {
            let fileparts = filename.split('.') // <year>.<aspect>.csv
            if (fileparts[fileparts.length -1] == 'csv') {
                newfiles.push(filename)
            }
        }
        return {
            path:path,
            files:newfiles
        }
    } catch (e) {
        throw Error(dirname + ' path not found')
    }

}

const collectSettingsFile = context => {
    try {
        let settings = utilities.readFileJson(
            context.dbroot + 
            `${context.repository}/datasets/${context.version}/settings.json`
        )
        context.settings = settings
    } catch (e) {
        throw Error('Settings file not found in preprocess collectBaseData')
    }
}

exports.stripMapHeader = map => {

    if (map.length > 0 && map[0][0] == constants.COLUMNS) {
        map.splice(0,1)
    }

}

