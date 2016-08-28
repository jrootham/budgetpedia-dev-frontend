// run.js

/*

    node code/run <command> <parameters>
    see showHelp() at end for details

*/

'use strict'

var fs = require('fs');

let context = {}

// main call - an immediately invoked function expression
const setup = (context) => {
    context.parms = process.argv.splice(2)

    let command = context.command = context.parms[0]
    context.repository = context.parms[1]
    context.version = context.parms[2]
    context.aspect = context.parms[3]
    context.filename = context.parms[4]

    context.dbroot = './repositories/' // relative to process.cwd(); ../code/run

    context.dirs = fs.readdirSync(context.dbroot)

    switch (command) {
        case 'help': {
            showHelp()
            return false
        } 
        break
        case 'create-dataset':
        case 'add-to-dataset': 
        case 'replace-in-dataset': 
        case 'remove-from-dataset':
        case 'preprocess':
        case 'prepare':
        case 'prepare-codes':
        {
            if ((!context.repository) || (context.dirs.indexOf(context.repository) == -1)) {

                console.error(`no repository specified, or repository not found. Use node run ${command} <repository>`)
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
        case 'create-dataset':
            createDataset(context)
            break
        case 'add-to-dataset': 
            addToDataset(context)
            break
        case 'replace-in-dataset': 
            replaceInDataset(context)
            break
        case 'remove-from-dataset':
            context.year = context.filename
            removeFromDataset(context)
            break
        case 'preprocess':
            preprocessPending(context)
            break
        case 'prepare':
            preparePreprocessed(context)
            break
        case 'prepare-codes':
            prepareCodes(context)
            break
    }

    return true
}

// ============================[ operations ]=============================

const createDataset = context => {
    log('creating dataset')
}

const addToDataset = context => {
    log('adding to dataset')
}
const replaceInDataset = context => {
    log('replacing in dataset')
}

const removeFromDataset = context => {
    log('removing from dataset')
}

const preprocessPending = context => {
    log('preprocessing pending')
    let preprocess = require('./preprocess')
    preprocess(context)
}

const preparePreprocessed = context => {
    log ('preparing preprocessed')
}

const prepareCode = context => {
    log ('preparing codes for reference year')
}
// ----------------------[ operations common utilities]--------------------

const log = (message) => {
    console.log(message)    
}

// =============================[ help text ]=============================

const showHelp = () => {
    console.log(
`
syntax 
    node run <command> <parameters>

commands
    help

    preprocess <repository> (add program codes to names)

    prepare-codes <repository> (prepare reference codes for current year)

    prepare <repository> (update program codes for reference year)

    create-dataset <repository> [<version> [<aspect> [<filename>]]]

    add-to-dateset <repository> [<version> [<aspect> [<filename>]]]

    replace-in-dateset <repository> [<version> [<aspect> [<filename>]]]

    remove-from-dateset <repository> <version> <aspect> <year>

`
    )
}

module.export = ((context) => {

try {
    if (!setup(context)) return
} catch (e) {
    // console.log(e)
    return
}

console.log('Done.')

})(context)

