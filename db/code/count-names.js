// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// count-names.js

'use strict'

let utilities = require('./utilities')
let constants = require('./constants')
let common = require('./common')

let header = ['_COLUMNS_','Category:NAME,Category:CODE,Note:DESCRIPTION,Count:VALUE']

const countNames = context => {

    common.collectPreprocessedData(context)

    let preprocessedfiles = context.preprocessedfiles

    if (preprocessedfiles.length == 0) {
        throw Error('no intake files to process.')
    }
    for (let filename of preprocessedfiles) {
        processPreprocessedFile(filename,context)
    }

}

module.exports = countNames

const processPreprocessedFile = (filename, context) => {
    console.log('processing file ', filename)
}