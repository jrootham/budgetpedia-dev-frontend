// databaseapi.tsx
// TEMPORARY DATA SOURCES
// data sources

// deepclone = JSON.parse(JSON.stringify(obj)) // but this destroys dates, undefined, and functions

import updateViewpointData, { SetViewpointDataParms } from './databaseapi/setviewpointdata'

let db_dataseries = require('../../../../data/dataseries.json')
// common lookups
let db_lookups = require('../../../../data/lookups.json')
// top level taxonomies
let db_viewpoints = require('../../../../data/viewpoints.json')

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

export interface PortalCell {
    Type:string,
}

export interface Viewpoint extends Component {
    Lookups: Lookups,
    itemseriesconfigdata?: any,
    Configuration: {
        [configurationcode:string]:Configuration,
    },
    PortalCharts: PortalCell[],
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

export interface DatasetConfig {
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
}

interface Dataset<ItemType> extends DatasetConfig {
    InflationAdjusted?: boolean,
    Items: {
        [itemcode:string]:ItemType
    }
}

interface Datasets {
    [index: string]: Dataset<CurrencyItemType> | Dataset<ItemType>
}

export interface TimeSpecs {
    leftYear: number,
    rightYear: number,
    spanYears: boolean,
    firstYear: number,
    lastYear: number,
}

export interface GetViewpointDataParms {
    viewpointname:string,
    dataseriesname: string,
    inflationAdjusted: boolean,
    timeSpecs: TimeSpecs,
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

    // pending
    public getBranch(viewpointname, path = []) {

    }

    public getViewpointData(parms: GetViewpointDataParms) {

        let { viewpointname, dataseriesname, inflationAdjusted, timeSpecs } = parms

        let viewpointdata = this.getViewpoint(viewpointname),
            itemseriesdata = this.getDataset(dataseriesname),
            lookups = this.getLookup()

        viewpointdata = JSON.parse(JSON.stringify(viewpointdata)) // deep clone

        let setparms:SetViewpointDataParms = {
            dataseriesname,
            inflationAdjusted,
            timeSpecs,
            viewpointdata,
            itemseriesdata,
            lookups,
        }

        this.setViewpointData(setparms)

        viewpointdata = setparms.viewpointdata

        viewpointdata.itemseriesconfigdata = this.getDatasetConfig(parms.dataseriesname)

        return setparms.viewpointdata

    }

    private getDatasetConfig(dataset:string):DatasetConfig {
        let datasetdata = this.getDataset(dataset)
        let { Baseline,
            Name,
            Titles,
            Units,
            UnitsAlias,
            Categories,
            Title } = datasetdata

        let config = {
            Baseline, 
            Name, 
            Titles, 
            Units, 
            UnitsAlias,
            Categories,
            Title,
        }
        return config
    }

    private setViewpointData(parms: SetViewpointDataParms) {
        updateViewpointData(parms)
    }

    private getViewpoint(viewpoint: string): Viewpoint {
        let viewpointdata: Viewpoint = db_viewpoints[viewpoint]
        return viewpointdata
    }

    private getDataset(dataset: string) {
        let datasetdata: CurrencyDataset | ItemDataset = db_dataseries[dataset]
        return datasetdata
        // delay(500).then(() => {
        //     let dst: CurrencyDataset | ItemDataset
        //     dst = db_dataseries[dataset]
        //     if (!dst) throw new Error(`dataset "${dataset}" not found`)
        //     return dst
        // })
    }

    private getLookup(lookup:string = undefined):Lookup {
        let lookupdata: Lookup = db_lookups
        return lookupdata
    }
}

const database = new Database()

export default database