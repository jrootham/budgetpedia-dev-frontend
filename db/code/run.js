// run.js

var fs = require('fs');

(function() {

let parms = process.argv.splice(2)

let repository = parms[0]

let dbroot = './repositories/' // relative to process.cwd()

let dirs = fs.readdirSync(dbroot)

if (!repository || (dirs.indexOf(repository) == -1)) {

    console.log('no repository specified, or repository not found. Use node code/run <repository>')
    return

}

console.log('Done.')

})()
