// run.js

/*
    run help
    run create-dataset <repository>
    run add-to-dataset <repository> [filename]
*/

var fs = require('fs');

let context = {};

(function(context) {

try {
    if (!setup(context)) return
} catch (e) {
    // console.log(e)
    return
}

console.log('Done.')

})(context)

function setup(context) {
    context.parms = process.argv.splice(2)

    let command = context.command = context.parms[0]
    context.repository = context.parms[1]
    context.filename = context.parms[2]

    context.dbroot = './repositories/' // relative to process.cwd()

    context.dirs = fs.readdirSync(context.dbroot)

    switch (command) {
        case 'help': {
            showHelp()
            return false
        } 
        break
        case 'create-dataset':
        case 'add-to-dataset': {
            if ((!context.repository) || (context.dirs.indexOf(context.repository) == -1)) {

                console.error('no repository specified, or repository not found. Use node code/run <repository>')
                throw Error()

            }
        }
        break
        default: {
            console.error('command not recognized. try node code/run help')
        }
    }

    return true
}

function showHelp() {
    console.log(
`
syntax 
    npm code/run <command> <parameters>

commands
    help

    create-dataset <repository>

    add-to-dateset <repository> [<filename>]
`
    )
}