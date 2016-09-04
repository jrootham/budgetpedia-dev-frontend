// clear_repeating_names.js

/*
    clears same-line repeated category names
    place csv file in './temp', change name below and do
    node clear_repeating_names
*/

utilities = require('./utilities')

let filespec = './temp/2016.expenses.csv'

let csv = utilities.readFileCsv(filespec)

for (line of csv) {
    for (let index = 2; index > 0; index--) {
        if (line[index] == line[index-1]) {
            line[index] = null
        }
    }
}

utilities.writeFileCsv(filespec,csv)