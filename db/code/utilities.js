// utilities.js

let fs = require('fs')
let jsonfile = require('jsonfile')
jsonfile.spaces = 4
var parse = require('csv-parse/lib/sync')
var stringify = require('csv-stringify')
var moment = require('moment')

var constants = require('./constants')

exports.decomposeCsv = (csv, filename) => {

    // get span of meta data
    let metastartpos = (csv[0][0] == constants.META_START)?0:null

    let metaendpos = null, found = false
    for (metaendpos = 1; metaendpos < csv.length; metaendpos++) {
        if (csv[metaendpos][0] == constants.META_END) {
            found = true
            break
        }
    }

    // check for error
    if (metastartpos === null || !found) {
        throw Error('meta section not found for ' + filename)
    }

    // extract metadata
    let metapart = csv.splice(metastartpos, metaendpos - metastartpos + 1)

    let components = {
        meta:metapart,
        data:csv,
    }

    return components
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

exports.log = message => {
    console.log(message)    
}

exports.getDirContents = dirspec => {
    return fs.readdirSync(dirspec)
}

exports.prefixDateTime = filename => {
    let datetimestring = moment().format('YYYY-MM-DD-HH-mm-ss.')
    return datetimestring + filename
}
