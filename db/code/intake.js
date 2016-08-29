// preprocess.js

/*
    - get settings file; read reference year, from
        db/repositories/<repository>/datasets/<version>/settings.json
    - get files to process <year>.<aspect>.csv, from 
        db/repositories/<repository>/datasets/<version>/intake/*.csv
    for each file
    - extract metadata __META_START__ to __META_END__
    - lookup code for each program name, from
        db/repositories/<repository>/datasets/<version>/maps/<year>.program_name_to_code.csv        
    - insert code if found in first column, else insert null
    - add newly found name to lookup, with warning to operator
    - write successfully completed file to preprocessed, with a successfully
        processed file to intake/processed
    - abandon unsuccessfully processed file, with copy to pedning/failes
    - write revised maps file to maps, with original to maps/replaced
*/

let utilities = require('./utilities')

const intake = context => {
    console.log('body of preprocess')
    // get settings
    collectBaseData(context)

    console.log(context)

    let intakefiles = context.intakefiles

    for (let filename of intakefiles) {
        processIntakeFile(filename,context)
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
    // get intake path and intake files list
    try {
        let intakepath = context.dbroot +
            `${context.repository}/datasets/${context.version}/intake/`
        let intakefiles = utilities.getDirContents( intakepath )
        let newintake = []
        for (let filename of intakefiles) {
            let fileparts = filename.split('.') // <year>.<aspect>.csv
            if (fileparts.length == 3 && fileparts[2] == 'csv') {
                newintake.push(filename)
            }
        }
        context.intakepath = intakepath
        context.intakefiles = newintake
    } catch (e) {
        console.log(e)
        throw Error()
    }

}

const processIntakeFile = (filename,context) => {
    console.log('processing intake file ', filename)
    let intakefilespec = context.intakepath + filename
    let csv = utilities.readFileCsv(intakefilespec)
    let components = utilities.decomposeCsv(csv, filename) // {meta, data}
    let fileparts = filename.split('.')
    let fileyear = fileparts[0]
    let namelookups_filepspec = 
        `${context.dbroot}${context.repository}/datasets/${context.version}/maps/${fileyear}.program_name_to_code.csv`
    let namelookups = utilities.readFileCsv(namelookups_filepspec)
    // TODO process line items once for each category column
    //    if there are codes for a column, add codes to lookup
    let lineitems = components.data
    let newnames = {} // use properties to filter out duplicates
    let newlist = null
    for (let line of lineitems) {
        let name = line[0]
        let filtered = namelookups.filter(item => {
            return (item[0] == name)?true:false
        })
        if (filtered.length > 0 && filtered[0][1]) {
            line.splice(0,0,filtered[0][1])
        } else {
            line.splice(0,0,null)
            newnames[name] = null // using an object filters out duplicates
        }
    }
    newnames = Object.keys(newnames)
    newnames = newnames.map(item =>{
        return [item,null]
    })
    if (newnames.length > 0) {
        newlist = [...namelookups, ...newnames]
    }

    if (newlist) { // still null if no new items
        // sort
        let sorted = newlist.sort((a,b)=>{
            if (a[0] < b[0])
                return -1
            else if (a[0] > b[0]) 
                return 1
            else 
                return 0
        })
        newlist = sorted
        // TODO: save namelookups to replaced
        // overwrite namelookups with newlist
        // write failed preprocessed file to failed
        // log result
    } else {
        // TODO: move intake file to subdir processed, with datetime infix
        // add meta + lineitems to preprocessed dir
        // log result
    }

    console.log(lineitems, namelookups, newnames, newlist)
}

module.exports = intake
