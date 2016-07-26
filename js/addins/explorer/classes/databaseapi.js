"use strict";
const setviewpointdata_1 = require('./databaseapi/setviewpointdata');
let db_datasets = require('../../../../data/datasets.json');
let db_lookups = require('../../../../data/lookups.json');
let db_viewpoints = require('../../../../data/viewpoints.json');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
class Database {
    getBranch(viewpointname, path = []) {
    }
    getViewpointData(parms) {
        let { viewpointName, datasetName, inflationAdjusted, timeSpecs } = parms;
        let viewpointData = this.getViewpoint(viewpointName), datasetData = this.getDataset(datasetName), lookups = this.getLookup();
        viewpointData = JSON.parse(JSON.stringify(viewpointData));
        let setparms = {
            datasetName: datasetName,
            inflationAdjusted: inflationAdjusted,
            timeSpecs: timeSpecs,
            viewpointData: viewpointData,
            datasetData: datasetData,
            lookups: lookups,
        };
        this.setViewpointData(setparms);
        viewpointData = setparms.viewpointData;
        viewpointData.datasetConfig = this.getDatasetConfig(parms.datasetName);
        return setparms.viewpointData;
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
        let datasetdata = db_datasets[dataset];
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
