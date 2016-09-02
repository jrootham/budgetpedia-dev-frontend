// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// run.js

/*
    TODO rename intake command to preprocess
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
        case 'intake': // s/b preprocess
        case 'preprocess': // s/b prepare
        case 'prepare': // s/b/ generate
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
        manually add codes to maps for found category names; 
        then iterate
    - count-lookups <repository> <version> (count category name usage from preprocessed to id orphans)
    - update-lookups <repository> <version> (create or update code_to_name lookups)
    - update-codes <repository> <version> (update all lookups with reference year codes)
    - prepare <repository> <version> (prepare reference codes and combine data for 
        current year, to prepared)
    - generate <repository> <version> (create or add to json aspect files; create lookup tables)
    - remove <repository> <version> <aspect> <year> (remove year from json file)
`
    )
}

module.export = ((context) => {

try {
    if (!setup(context)) return
} catch (e) {
    utilities.log(e.message)
    return
}

utilities.log('Done.')

})(context)

