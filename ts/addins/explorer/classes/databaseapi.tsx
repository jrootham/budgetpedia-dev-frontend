// databaseapi.tsx
// TEMPORARY DATA SOURCES
// data sources

// deepclone = JSON.parse(JSON.stringify(obj)) // but this destroys dates, undefined, and functions

import updateViewpointData, { SetViewpointDataParms } from './databaseapi/setviewpointdata'

let db_datasets = require('../../../../data/datasets.json')
// common lookups
let db_lookups = require('../../../../data/lookups.json')
// top level taxonomies
let db_viewpoints = require('../../../../data/viewpoints.json')

const delay = ms => 
    new Promise(resolve => setTimeout(resolve,ms))

interface Component {
    Index: number,
    ConfigRef: string,
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

export interface DataseriesMeta {
    Type:string,
}

export interface ViewpointData extends Component {
    Lookups: Lookups,
    datasetConfig?: any,
    Configuration: {
        [configurationcode:string]:Configuration,
    },
   // Datasets: DataseriesMeta[],
}

interface Viewpoints {
    [index:string]: ViewpointData
}

interface YearsContent {
    [year:string]: number
}

interface ItemType {
    years: YearsContent,
    CommonObjects: {
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
    Components: string,
    Name: string,
    DataseriesTitles: {
        Components: string,
        CommonObjects: string,
    },
    Units: string,
    UnitsAlias: string,
    CommonObjects: string,
    DatasetTitle: string,
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

export interface YearSpecs {
    leftYear: number,
    rightYear: number,
    yearScope: boolean,
    firstYear: number,
    lastYear: number,
}

export interface GetViewpointDataParms {
    viewpointName:string,
    datasetName: string,
    inflationAdjusted: boolean,
    yearSpecs: YearSpecs,
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

        let { viewpointName, datasetName, inflationAdjusted, yearSpecs } = parms

        let viewpointDataPromise = this.getViewpointPromise(viewpointName),
            datasetDataPromise = this.getDatasetPromise(datasetName),
            lookupsPromise = this.getLookupPromise(),
            datasetConfigPromise = this.getDatasetConfigPromise(datasetName)

        let promise = new Promise(resolve => {

            Promise.all([viewpointDataPromise, datasetDataPromise, lookupsPromise, datasetConfigPromise]).then(
                values => {
                    let viewpointData
                    let datasetData
                    let lookups
                    let datasetConfig

                    [viewpointData, datasetData, lookups, datasetConfig] = values


                    viewpointData.datasetConfig = datasetConfig
                    let setparms:SetViewpointDataParms = {
                        datasetName,
                        inflationAdjusted,
                        yearSpecs,
                        viewpointData,
                        datasetData,
                        lookups,
                    }
                    this.setViewpointData(setparms)

                    viewpointData = setparms.viewpointData

                    resolve(viewpointData)
                }
            )
        })

        return promise

    }
    private getDatasetConfigPromise(dataset:string) {

        let datasetpromise = this.getDatasetPromise(dataset)
        let promise = new Promise(resolve => {
            datasetpromise.then((datasetdata: DatasetConfig) => {
                let { 
                    DatasetTitle,
                    DataseriesTitles,
                    Units,
                    UnitsAlias,
                } = datasetdata

                let config = {
                    DatasetTitle,
                    DataseriesTitles, 
                    Units, 
                    UnitsAlias,
                }
                 resolve(config)

            })
        })
        return promise
    }

    private setViewpointData(parms: SetViewpointDataParms) {
        updateViewpointData(parms)
    }

    private getViewpointPromise(viewpoint: string) {
        let promise = new Promise(resolve => {
            let viewpointdata: ViewpointData = db_viewpoints[viewpoint]
            viewpointdata = JSON.parse(JSON.stringify(viewpointdata))
            resolve(viewpointdata)
        })
        return promise
    }

    private getDatasetPromise(dataset: string) {
        let promise = new Promise(resolve => {
            let datasetdata: CurrencyDataset | ItemDataset = db_datasets[dataset]
            resolve(datasetdata)
        })
        return promise
        // delay(500).then(() => {
        //     let dst: CurrencyDataset | ItemDataset
        //     dst = db_dataseries[dataset]
        //     if (!dst) throw new Error(`dataset "${dataset}" not found`)
        //     return dst
        // })
    }

    private getLookupPromise(lookup:string = undefined) {
        let promise = new Promise(resolve => {
            let lookupdata: Lookup = db_lookups
            resolve(lookupdata)
        })
        return promise
    }
}

const database = new Database()

export default database