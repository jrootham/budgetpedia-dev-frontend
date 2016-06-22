"use strict";
const setviewpointdata_1 = require('./databaseapi/setviewpointdata');
let db_dataseries = require('../../data/dataseries.json');
let db_lookups = require('../../data/lookups.json');
let db_viewpoints = require('../../data/viewpoints.json');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
class Database {
    constructor() {
        this.getBranch = (viewpointname, path = []) => {
        };
        this.setViewpointData = (parms) => {
            setviewpointdata_1.default(parms);
        };
        this.getViewpointData = (parms) => {
            let { viewpointname, dataseriesname, wantsInflationAdjusted, timeSpecs } = parms;
            let viewpointdata = this.getViewpoint(viewpointname), itemseriesdata = this.getDataset(dataseriesname), lookups = this.getLookup();
            viewpointdata = JSON.parse(JSON.stringify(viewpointdata));
            let setparms = {
                dataseriesname: dataseriesname,
                wantsInflationAdjusted: wantsInflationAdjusted,
                timeSpecs: timeSpecs,
                viewpointdata: viewpointdata,
                itemseriesdata: itemseriesdata,
                lookups: lookups,
            };
            this.setViewpointData(setparms);
            return setparms.viewpointdata;
        };
        this.getViewpoint = (viewpoint) => {
            let viewpointdata = db_viewpoints[viewpoint];
            return viewpointdata;
        };
        this.getDataset = (dataset) => {
            let datasetdata = db_dataseries[dataset];
            return datasetdata;
        };
        this.getLookup = (lookup = undefined) => {
            let lookupdata = db_lookups;
            return lookupdata;
        };
    }
}
const database = new Database();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = database;
