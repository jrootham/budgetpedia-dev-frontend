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
}

module.exports = preprocess
