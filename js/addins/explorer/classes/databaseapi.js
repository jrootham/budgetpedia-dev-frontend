"use strict";
const setviewpointdata_1 = require('./databaseapi/setviewpointdata');
let repo = '../../../../data/';
let db_datasets = require(repo + 'datasets.json');
let db_lookups = require(repo + 'lookups.json');
let db_viewpoints = require(repo + 'viewpoints.json');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
class Database {
    getViewpointData(parms) {
        let { viewpointName, versionName, datasetName, inflationAdjusted } = parms;
        let viewpointDataTemplatePromise = this.getViewpointTemplatePromise(viewpointName), datasetDataPromise = this.getDatasetPromise(versionName, datasetName), lookupsPromise = this.getLookupPromise(), datasetConfigPromise = this.getDatasetConfigPromise(versionName, datasetName);
        let promise = new Promise(resolve => {
            Promise.all([
                viewpointDataTemplatePromise,
                datasetDataPromise,
                lookupsPromise,
                datasetConfigPromise
            ]).then(values => {
                let viewpointDataTemplate;
                let datasetData;
                let lookups;
                let datasetConfig;
                [viewpointDataTemplate, datasetData, lookups, datasetConfig] = values;
                viewpointDataTemplate.datasetConfig = datasetConfig;
                let setparms = {
                    datasetName: datasetName,
                    inflationAdjusted: inflationAdjusted,
                    viewpointDataTemplate: viewpointDataTemplate,
                    datasetData: datasetData,
                    lookups: lookups,
                };
                this.calculateViewpointData(setparms);
                viewpointDataTemplate = setparms.viewpointDataTemplate;
                resolve(viewpointDataTemplate);
            });
        });
        return promise;
    }
    calculateViewpointData(parms) {
        setviewpointdata_1.default(parms);
    }
    getViewpointTemplatePromise(viewpoint) {
        let promise = new Promise(resolve => {
            let viewpointdata = db_viewpoints[viewpoint];
            viewpointdata = JSON.parse(JSON.stringify(viewpointdata));
            resolve(viewpointdata);
        });
        return promise;
    }
    getDatasetConfigPromise(versionName, datasetName) {
        let datasetpromise = this.getDatasetPromise(versionName, datasetName);
        let promise = new Promise(resolve => {
            datasetpromise.then((datasetdata) => {
                let metaData = datasetdata.MetaData;
                let { DatasetName, YearsRange, DatasetTitle, Dataseries, DataseriesTitles, Units, UnitsAlias, UnitRatio, } = metaData;
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
    getDatasetPromise(versionName, datasetName) {
        let promise = new Promise(resolve => {
            let datasetdata = db_datasets[versionName][datasetName];
            delay(0).then(() => {
                resolve(datasetdata);
            });
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
