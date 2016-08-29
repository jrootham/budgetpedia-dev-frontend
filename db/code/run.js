// run.js

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
        case 'intake':
        case 'preprocessed': 
        case 'prepared': 
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
        case 'intake':
            intakeToPreprocessed(context)
            break
        case 'preprocessed': 
            preprocessedToPrepared(context)
            break
        case 'prepared': 
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
    let intake = require('./intake')
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
    help

    intake <repository> <version> (add program codes to names, iteratively)

    preprocessed <repository> <version> (prepare reference codes and combine data for 
        current year)

    prepared <repository> <version> (create or add to json aspect files)

    remove <repository> <version> <aspect> <year> (remove year from json file)

`
    )
}

module.export = ((context) => {

try {
    if (!setup(context)) return
} catch (e) {
    console.log(e)
    return
}

console.log('Done.')

})(context)

