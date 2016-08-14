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
        let { viewpointName, versionName, datasetName, inflationAdjusted, yearSpecs } = parms;
        let viewpointDataPromise = this.getViewpointPromise(viewpointName), datasetDataPromise = this.getDatasetPromise(versionName, datasetName), lookupsPromise = this.getLookupPromise(), datasetConfigPromise = this.getDatasetConfigPromise(versionName, datasetName);
        let promise = new Promise(resolve => {
            Promise.all([viewpointDataPromise, datasetDataPromise, lookupsPromise, datasetConfigPromise]).then(values => {
                let viewpointData;
                let datasetData;
                let lookups;
                let datasetConfig;
                [viewpointData, datasetData, lookups, datasetConfig] = values;
                viewpointData.datasetConfig = datasetConfig;
                let setparms = {
                    datasetName: datasetName,
                    inflationAdjusted: inflationAdjusted,
                    yearSpecs: yearSpecs,
                    viewpointData: viewpointData,
                    datasetData: datasetData,
                    lookups: lookups,
                };
                this.setViewpointData(setparms);
                viewpointData = setparms.viewpointData;
                resolve(viewpointData);
            });
        });
        return promise;
    }
    getDatasetConfigPromise(versionName, datasetName) {
        let datasetpromise = this.getDatasetPromise(versionName, datasetName);
        let promise = new Promise(resolve => {
            datasetpromise.then((datasetdata) => {
                let { DatasetName, YearsRange, DatasetTitle, Dataseries, DataseriesTitles, Units, UnitsAlias, UnitRatio, } = datasetdata;
                let config = {
                    DatasetName: DatasetName,
                    YearsRange: YearsRange,
                    DatasetTitle: DatasetTitle,
                    Dataseries: Dataseries,
                    DataseriesTitles: DataseriesTitles,
                    Units: Units,
                    UnitsAlias: UnitsAlias,
                    UnitRatio: UnitRatio,
                };
                resolve(config);
            });
        });
        return promise;
    }
    setViewpointData(parms) {
        setviewpointdata_1.default(parms);
    }
    getViewpointPromise(viewpoint) {
        let promise = new Promise(resolve => {
            let viewpointdata = db_viewpoints[viewpoint];
            viewpointdata = JSON.parse(JSON.stringify(viewpointdata));
            resolve(viewpointdata);
        });
        return promise;
    }
    getDatasetPromise(versionName, datasetName) {
        let promise = new Promise(resolve => {
            let datasetdata = db_datasets[versionName][datasetName];
            resolve(datasetdata);
        });
        return promise;
    }
    getLookupPromise(lookup = undefined) {
        let promise = new Promise(resolve => {
            let lookupdata = db_lookups;
            resolve(lookupdata);
        });
        return promise;
    }
}
const database = new Database();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = database;
