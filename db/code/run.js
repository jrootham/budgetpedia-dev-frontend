// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// run.js

/*
    TODO
    - add column headings to map sheets
    - add source file chart link to meta

*/

/*

    node code/run <command> <parameters>
    see showHelp() at end for details

*/

'use strict'

var fs = require('fs');
var utilities = require('./utilities')

let context = {}

// main call - an immediately invoked function expression
const setup = (context) => {
    context.parms = process.argv.splice(2)

    let command = context.command = context.parms[0]
    context.repository = context.parms[1]
    context.version = context.parms[2]
    context.aspect = context.parms[3]
    context.year = context.parms[4]

    context.dbroot = './repositories/' // relative to process.cwd(); ../code/run

    context.repositorydirs = utilities.getDirContents(context.dbroot)

    switch (command) {
        case 'help': {
            showHelp()
            return false
        } 
        break
        case 'preprocess':
        case 'count-names':
        case 'map-codes':
        case 'prepare':
        case 'generate':
        case 'remove':
        {
            if ((!context.repository) || (context.repositorydirs.indexOf(context.repository) == -1)) {

                console.error(`no repository specified, or repository not found. Use node run ${command} <repository> <version>`)
                throw Error()

            }
            context.versiondirs = utilities.getDirContents(context.dbroot + context.repository + '/datasets')
            if ((!context.version) || (context.versiondirs.indexOf(context.version) == -1)) {

                console.error(`no repository version specified, or version not found. Use node run ${command} <repository> <version>`)
                throw Error()

            }
        }
        break
        default: {
            console.error(`command absent or not recognized. try 'node run help'`)
            throw Error()
        }
    }

    switch (command) {
        case 'preprocess':
            intakeToPreprocessed(context)
            break
        case 'count-names':
            countNames(context)
            break
        case 'map-codes':
            mapCodes(context)
            break
        case 'prepare': 
            preprocessedToPrepared(context)
            break
        case 'generate': 
            preparedToJson(context)
            break
        case 'remove':
            removeFromJson(context)
            break
    }

    return true
}

// ============================[ operations ]=============================

const intakeToPreprocessed = context => {
    utilities.log('processing intake to preprocessed')
    let intake = require('./preprocess')
    intake(context)
}

const countNames = context => {
    utilities.log('counting names in map files')
    let countnames = require('./count-names')
    countnames(context)
}

const mapCodes = context => {
    utilities.log('mapping codes to names')
    let mapcodes = require('./map-codes')
    mapcodes(context)
}

const preprocessedToPrepared = context => {
    utilities.log ('processing preprocessed to prepared')
}

const preparedToJson = context => {
    utilities.log ('processing prepared to json')
}

const removeFromJson = context => {
    utilities.log('removing from json')
}

// =============================[ help text ]=============================

const showHelp = () => {
    console.log(
`
syntax 
    node run <command> <parameters>
commands
    - help
    - preprocess <repository> <version> (add category codes to names, to preprocessed)
        will fail without codes for all category names; 
        manually add codes to name maps for found category names; 
        then iterate
    - count-names <repository> <version> (count category name usage from preprocessed to id orphans)
    - map-codes <repository> <version> (create or update code_to_name maps)
    - continuity <repository> <version> (create report showing discontinuations of codes)
    - prepare <repository> <version> (combine data and codes for current year, to prepared, and codes to lookups)
    - generate <repository> <version> (create or add to json aspect files; create lookup tables)
    - remove <repository> <version> <aspect> <year> (remove year from json file)
`
    )
}

module.export = ((context) => {

try {
    if (!setup(context)) return
} catch (e) {
    utilities.log(e)
    return
}

utilities.log('Done.')

})(context)

