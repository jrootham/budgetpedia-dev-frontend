"use strict";
let db_dataseries = require('../../data/dataseries.json');
let db_lookups = require('../../data/lookups.json');
let db_viewpoints = require('../../data/viewpoints.json');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
class Database {
    constructor() {
        this.getBranch = (viewpoint, path = []) => {
        };
        this.getViewpoint = (viewpoint) => {
            let vpt;
            return vpt;
        };
        this.getDataset = (dataset) => delay(500).then(() => {
            let dst;
            dst = db_dataseries[dataset];
            if (!dst)
                throw new Error(`dataset "${dataset}" not found`);
            return dst;
        });
        this.getLookup = (lookup) => {
            let lkp;
            return lkp;
        };
    }
}
const database = new Database();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = database;
