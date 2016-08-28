// preprocess.js

/*
    - get settings file; read reference year, from
        db/repositories/<repository>/datasets/<version>/settings.json
    - get files to process <year>.<aspect>.csv, from 
        db/repositories/<repository>/datasets/<version>/pending/*.csv
    for each file
    - extract metadata __META_START__ to __META_END__
    - lookup code for each program name, from
        db/repositories/<repository>/datasets/<version>/maps/<year>.program_name_to_code.csv        
    - insert code if found in first column, else insert null
    - add newly found name to lookup, with warning to operator
    - write successfully completed file to preprocessed, with a successfully
        processed file to pending/processed
    - abandon unsuccessfully processed file, with copy to pedning/failes
    - write revised maps file to maps, with original to maps/replaced
*/

let utilities = require('./utilities')

const preprocess = context => {
    console.log('body of preprocess')
    // get settings
    collectBaseData(context)

    console.log(context)

    let pendingfiles = context.pendingfiles

    for (let filename of pendingfiles) {
        processPendingFile(filename,context)
    }

}

const collectBaseData = context => {

    try {
        let settings = utilities.readFileJson(context.dbroot + 
            `${context.repository}/datasets/${context.version}/settings.json`)
        context.settings = settings
    } catch (e) {
        console.log(e)
        throw Error()
    }
    // get pending path and pending files list
    try {
        let pendingpath = context.dbroot +
            `${context.repository}/datasets/${context.version}/pending/`
        let pendingfiles = utilities.getDirContents( pendingpath )
        let newpending = []
        for (let filename of pendingfiles) {
            let fileparts = filename.split('.')
            if (fileparts.length == 3 && fileparts[2] == 'csv') {
                newpending.push(filename)
            }
        }
        context.pendingpath = pendingpath
        context.pendingfiles = newpending
    } catch (e) {
        console.log(e)
        throw Error()
    }

}

const processPendingFile = (filename,context) => {
    console.log('processing pending file ', filename)
    let csv = utilities.readFileCsv(context.pendingpath + filename)
    let components = utilities.decomposeCsv(csv, filename) // {meta, data}
}

module.exports = preprocess
