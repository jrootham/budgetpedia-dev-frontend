"use strict";
const setviewpointdata_1 = require('./databaseapi/setviewpointdata');
let db_dataseries = require('../../../data/dataseries.json');
let db_lookups = require('../../../data/lookups.json');
let db_viewpoints = require('../../../data/viewpoints.json');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
class Database {
    getBranch(viewpointname, path = []) {
    }
    getViewpointData(parms) {
        let { viewpointname, dataseriesname, inflationAdjusted, timeSpecs } = parms;
        let viewpointdata = this.getViewpoint(viewpointname), itemseriesdata = this.getDataset(dataseriesname), lookups = this.getLookup();
        viewpointdata = JSON.parse(JSON.stringify(viewpointdata));
        let setparms = {
            dataseriesname: dataseriesname,
            inflationAdjusted: inflationAdjusted,
            timeSpecs: timeSpecs,
            viewpointdata: viewpointdata,
            itemseriesdata: itemseriesdata,
            lookups: lookups,
        };
        this.setViewpointData(setparms);
        viewpointdata = setparms.viewpointdata;
        viewpointdata.itemseriesconfigdata = this.getDatasetConfig(parms.dataseriesname);
        return setparms.viewpointdata;
    }
    getDatasetConfig(dataset) {
        let datasetdata = this.getDataset(dataset);
        let { Baseline, Name, Titles, Units, UnitsAlias, Categories, Title } = datasetdata;
        let config = {
            Baseline: Baseline,
            Name: Name,
            Titles: Titles,
            Units: Units,
            UnitsAlias: UnitsAlias,
            Categories: Categories,
            Title: Title,
        };
        return config;
    }
    setViewpointData(parms) {
        setviewpointdata_1.default(parms);
    }
    getViewpoint(viewpoint) {
        let viewpointdata = db_viewpoints[viewpoint];
        return viewpointdata;
    }
    getDataset(dataset) {
        let datasetdata = db_dataseries[dataset];
        return datasetdata;
    }
    getLookup(lookup = undefined) {
        let lookupdata = db_lookups;
        return lookupdata;
    }
}
const database = new Database();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = database;
