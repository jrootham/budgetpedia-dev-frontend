// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// utilities.js

'use strict'

let fs = require('fs')
let jsonfile = require('jsonfile')
jsonfile.spaces = 4
var parse = require('csv-parse/lib/sync')
var stringify = require('csv-stringify')
var moment = require('moment')

var constants = require('./constants')

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
        } else if (type == constant.CODE) {
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


exports.getDirContents = dirspec => {
    return fs.readdirSync(dirspec)
}

exports.readFileText = filespec => {
    return fs.readFileSync(filespec,'utf8')
}

exports.writeFileText = (filespec, content) => {
    fs.writeFileSync(filespec,content,'utf8')
}

exports.readFileJson = filespec => {
    return jsonfile.readFileSync(filespec)
}

exports.writeFileJson = (filespec, content) => {

    jsonfile.writeFile(filespec, content)

}

exports.readFileCsv = filespec => {
    try {
        let filetext = exports.readFileText(filespec)
        return parse(filetext, {auto_parse:true})
    } catch (e) {
        return []
    }
}

exports.writeFileCsv = (filespec, csv) => {
    stringify(csv, function(err, output){
        // TODO: if (err)...
        exports.writeFileText(filespec, output)
    })
}

exports.fileExists = filespec => {
    try {
      fs.accessSync(filespec)
      return true
    } catch (e) {
        return false
    }
}

exports.deleteFile = filespec => {
    fs.unlinkSync(filespec)
}

exports.copyFile = (sourcespec, targetspec) => {
    let content = exports.readFileText(sourcespec)
    exports.writeFileText(targetspec, content)
}

exports.moveFile = (sourcespec, targetspec) => {
    fs.renameSync(sourcespec, targetspec)
    // exports.copyFile(sourcespec, targetspec)
    // exports.deleteFile(sourcespec)
}

exports.log = message => {
    console.log(message)
    // TODO: save to log file    
}

exports.getDateTime = () => {
    return moment().format('YYYY-MM-DD-HH-mm-ss')
}

exports.prefixDateTime = filename => {
    let datetimestring = exports.getDateTime()
    return datetimestring + filename
}

exports.infixDateTime = filename => {
    let datetimestring = exports.getDateTime()
    let parts = filename.split('.')
    parts.splice(parts.length - 1,0,datetimestring) // insert before file extension
    return parts.join('.')
}
