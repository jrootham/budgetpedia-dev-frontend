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
let constants = require('./constants')

const intake = context => {
    console.log('body of intake')
    // get settings
    collectBaseData(context)

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
        throw Error('Settings file not found in intake collectBaseData')
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
        throw Error('intake path not found')
    }

}

const processIntakeFile = (filename,context) => {
    console.log('processing intake file ', filename)

    let intakefilespec = context.intakepath + filename
    let csv = utilities.readFileCsv(intakefilespec)
    if (csv.length == 0) {
        throw Error('intake file not found:' + filename)
    }

    let components = utilities.decomposeCsv(csv, filename) // {meta, data}

    // {names:{<name>:'NAME'},codes:<name>:'CODE', list: <name>[]} 
    // presence of code for <name> determines whether to lookup code or save it to lookup
    let columndata = getColumnData(components, filename)
    console.log(columndata)
    let columns = columndata.columns
    // process backwards to allow columnindex to be used for column reference
    // in file processing, as processing inserts a column
    for (let columnindex = columns.length -1; columnindex >=0; columnindex--) {
        let column = columndata.columns[columnindex]
        if (column.type == constants.NAME) {
            processFileCategory(columndata,columnindex,filename, components, context)
        }
    }
}

const getColumnData = (components, filename) => {
    let columns_categories = components.meta.filter(item => {
        return (item[0] == constants.COLUMNS_CATEGORIES)? true: false
    })
    columns_categories = columns_categories[0]
    if (columns_categories) {
        columns_categories.splice(0,1)
        columns_categories = columns_categories[0].split(',')
        for (let index in columns_categories) {
            columns_categories[index] = columns_categories[index].trim()
        }
    } else {
        throw Error(constants.COLUMNS_CATEGORIES + ' not found for ' + filename)
    }

    let category_names = {}
    let category_codes = {}
    let column_list = []
    for (let columnindex in columns_categories) {
        let column = columns_categories[columnindex]
        let parts = column.split(':')
        if (parts.length != 2) {
            console.log(parts)
            throw Error('improper columms format ' + column + ' in ' + filename)
        }
        let type = parts[1].trim()
        let name = parts[0].trim()
        if (type == constants.NAME) {
            category_names[name] = type
        } else if (type == constant.CODE) {
            category_codes[name] = type
        } else {
            Error('wrong column type ' + column + ' in ' + filename)
        }
        column_list.push({
            name:name,
            type:type
        })
    }

    let columndata = {
        names:category_names,
        codes:category_codes,
        columns:column_list
    }

    return columndata

}

const processFileCategory = (columndata,columnindex,filename, components, context) => {

    let column = columndata.columns[columnindex]
    let columnref = column.name.toLowerCase()
    let fileparts = filename.split('.')
    let fileyear = fileparts[0]
    let namelookups_filepspec = 
        `${context.dbroot}${context.repository}/datasets/${context.version}/maps/${fileyear}.${columnref}_name_to_code.csv`
    let namelookups = utilities.readFileCsv(namelookups_filepspec)

    // TODO process line items once for each category column
    //    if there are codes for a column, add codes to lookup
    let lineitems = components.data
    let newnames = {} // use properties to filter out duplicates
    for (let line of lineitems) {
        let name = line[columnindex]
        let filtered = namelookups.filter(item => {
            return (item[0] == name)?true:false
        })
        if (filtered.length > 0 && filtered[0][1]) {
            line.splice(columnindex,0,filtered[0][1])
        } else {
            line.splice(columnindex,0,null)
            newnames[name] = null // using an object filters out duplicates
        }
    }
    newnames = Object.keys(newnames)
    newnames = newnames.map(item =>{
        return [item,null]
    })
    let newlookupslist = null
    if (newnames.length > 0) {
        newlookupslist = [...namelookups, ...newnames]
    }

    if (newlookupslist) { // still null if no new items
        // sort
        let sorted = newlookupslist.sort((a,b)=>{
            if (a[0] < b[0])
                return -1
            else if (a[0] > b[0]) 
                return 1
            else 
                return 0
        })
        newlookupslist = sorted
        // TODO: save namelookups to replaced
        // overwrite namelookups with newlist
        // write failed preprocessed file to failed
        // log result
    } else {
        // TODO: move intake file to subdir processed, with datetime infix
        // add meta + lineitems to preprocessed dir
        // log result
    }

    console.log(lineitems, namelookups, newnames, newlookupslist)
}

module.exports = intake
