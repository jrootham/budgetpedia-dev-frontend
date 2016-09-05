// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// map-codes.js

'use strict'

let utilities = require('./utilities')
let constants = require('./constants')
let common = require('./common')

let header = ['_COLUMNS_','Category:CODE,Category:NAME,ReferenceCatetory:CODE,ReferenceCategory:NAME,Names:LIST']

const mapCodes = context => {

    common.collectMapCodesData(context)

}

module.exports = mapCodes
