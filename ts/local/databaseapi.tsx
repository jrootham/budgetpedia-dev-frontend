// databaseapi.tsx
// TEMPORARY DATA SOURCES
// data sources

// deepclone = JSON.parse(JSON.stringify(obj)) // but this destroys dates, undefined, and functions

import updateViewpointData, { SetViewpointDataParms } from './databaseapi/setviewpointdata'

let db_dataseries = require('../../data/dataseries.json')
// common lookups
let db_lookups = require('../../data/lookups.json')
// top level taxonomies
let db_viewpoints = require('../../data/viewpoints.json')

const delay = ms => 
    new Promise(resolve => setTimeout(resolve,ms))

interface Component {
    Index: number,
    Contents: string,
    Components?: Components,
}

interface Components {
    [componentcode:string]:Component,
}

interface Name {
    name: string,
    alias?: string,
}

interface Configuration extends Name {
    Instance: Name,
}

interface PortalChart {
    Type:string,
}

interface Viewpoint extends Component {
    Lookups: Lookups,
    Configuration: {
        [configurationcode:string]:Configuration,
    },
    PortalCharts: PortalChart[],
}

interface Viewpoints {
    [index:string]: Viewpoint
}

interface YearsContent {
    [year:string]: number
}

interface ItemType {
    years: YearsContent,
    Categories: {
        [categorycode:string]: {
            years: YearsContent
        }
    }
}

interface CurrencyItemType {
    adjusted?: ItemType,
    nominal?: ItemType,
}

interface Dataset<ItemType> {
    // Action: string,
    Baseline: string,
    Name: string,
    Titles: {
        Baseline: string,
        Categories: string,
    },
    Units: string,
    UnitsAlias: string,
    Categories: string,
    Title: string,
    InflationAdjusted?: boolean,
    Items: {
        [itemcode:string]:ItemType
    }
}

interface Datasets {
    [index: string]: Dataset<CurrencyItemType> | Dataset<ItemType>
}

export interface CurrencyDataset extends Dataset<CurrencyItemType> {}

export interface ItemDataset extends Dataset<ItemType> {}

interface Lookup {
    [index:string]: {
        [index:string]:string,
    }
}

interface Lookups {
    [index:string]: Lookup
}

class Database {
    viewpoints: Viewpoints
    datasets: Datasets
    lookups: Lookups

    getBranch = (viewpoint, path = []) => {

    }

    setViewpointData = (parms: SetViewpointDataParms) => {
        updateViewpointData(parms)
    }

    private getViewpoint = (viewpoint:string):Viewpoint => {
        let vpt:Viewpoint
        return vpt
    }

    private getDataset = (dataset:string) => 
        delay(500).then(() => {
            let dst: CurrencyDataset | ItemDataset
            dst = db_dataseries[dataset]
            if (!dst) throw new Error(`dataset "${dataset}" not found`)
            return dst
        })

    private getLookup = (lookup:string):Lookup => {
        let lkp: Lookup
        return lkp
    }
}

const database = new Database()

export default database