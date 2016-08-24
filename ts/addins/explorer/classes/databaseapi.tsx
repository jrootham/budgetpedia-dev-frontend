// databaseapi.tsx
// TEMPORARY DATA SOURCES
// data sources

// deepclone = JSON.parse(JSON.stringify(obj)) // but this destroys dates, undefined, and functions

/*
    TODO: the interface definitions are of data
*/

import updateViewpointData, 
    { SetViewpointDataParms as CalculateViewpointDataParms } from './databaseapi/setviewpointdata'

// -----------------------[ collect the data ]------------------------------

// let repo = '../../../../data/' parser needs literals as arguments

// datasets, by version/name
let db_datasets = require( '../../../../data/datasets.json' )
// common lookups
let db_lookups = require('../../../../data/lookups.json')
// top level taxonomies
let db_viewpoints = require('../../../../data/viewpoints.json')

const delay = ms => // for testing!
    new Promise(resolve => setTimeout(resolve,ms))

// =================================[ INTERFACES ]=======================================

// ----------------------[ Assemble basic (common) data structure ]------------------------

// the basic format for dataseries record
// the processed item type
interface NumericItemType {
    years: YearsContent,
    CommonObjects: {
        [categorycode:string]: {
            years: YearsContent
        }
    }
}

// series of years as string index and number
// used in the 'years' property in NumbericItemType
interface YearsContent {
    [year:string]: number
}

// the numeric datatype strucure, but with 2 copies: one for adjusted, one for nominal
interface CurrencyItemType {
    adjusted?: NumericItemType,
    nominal?: NumericItemType,
}

interface Dataset<ItemType> extends DatasetConfig {
    InflationAdjustable?: boolean,
    Items: {
        [itemcode:string]:ItemType
    }
}

// -------------------------[ databse API ]--------------------------------

// the data component part of the raw ViewpointData structure
interface Component {
    Index: number,
    NamingConfigRef: string,
    Components?: Components,
}

// the list of a node's components
interface Components {
    [componentcode:string]:Component,
}
// this represents the found raw viewpointdata settings portion
// TODO; lose datasetConfig as carried by viewpointData; it's independent!
export interface ViewpointData extends Component {
    Lookups: Lookups,
    datasetConfig?: DatasetConfig, // TODO: lose this!
    Configuration: {
        [configurationcode:string]:Configuration,
    },
}

// used above
interface Configuration extends Name {
    Instance: Name,
}

// used above
interface Name {
    name: string,
    alias?: string,
}

export interface DatasetConfig {
    YearsRange:{
        start: number,
        end: number,
    },
    DatasetName: string,
    DatasetTitle: string,
    Dataseries: DataseriesMeta[],
    DataseriesTitles: {
        Components: string,
        CommonObjects: string,
    },
    Units: string,
    UnitsAlias: string,
    UnitRatio: number,
}

// used above
export interface DataseriesMeta {
    Type:string,
}

export interface YearSpecs {
    firstYear: number,
    lastYear: number,
}

export interface GetViewpointDataParms {
    viewpointName:string,
    versionName: string,
    datasetName: string,
    inflationAdjusted: boolean,
}

// ---------------------------[ local use ]------------------------

// the following two items used only above
interface CurrencyDataset extends Dataset<CurrencyItemType> {}

interface NumericItemDataset extends Dataset<NumericItemType> {}

interface Lookup {
    [index:string]: {
        [index:string]:string,
    }
}

// property of datasetConfig; holds metadata properties
interface DatasetMetaData {
    MetaData:DatasetConfig,
}

// -----------------------[ key data caches, by name ]---------------------

interface Viewpoints {
    [index:string]: ViewpointData
}

interface Datasets {
    [index: string]: Dataset<CurrencyItemType> | Dataset<NumericItemType>
}

interface Lookups {
    [index:string]: Lookup
}

// =====================================[ CLASS DECLARATION ]==================================

class Database {

    // data caches...
    private viewpoints: Viewpoints
    private datasets: Datasets
    private lookups: Lookups

    // // pending
    // public getBranch(viewpointname, path = []) {

    // }

    // getViewpointData returns a promise.
    public getViewpointData(parms: GetViewpointDataParms) {

        let { viewpointName, versionName, datasetName, inflationAdjusted } = parms

        let viewpointDataTemplatePromise = this.getViewpointTemplatePromise(viewpointName),
            datasetDataPromise = this.getDatasetPromise(versionName,datasetName),
            lookupsPromise = this.getLookupPromise(),
            datasetConfigPromise = this.getDatasetConfigPromise(versionName, datasetName)

        let promise = new Promise(resolve => {

            Promise.all(
                [
                    viewpointDataTemplatePromise, 
                    datasetDataPromise, 
                    lookupsPromise, 
                    datasetConfigPromise

                ]).then(

                values => {
                    let viewpointDataTemplate
                    let datasetData
                    let lookups
                    let datasetConfig

                    // calculate all compatible data together, cached
                    [viewpointDataTemplate, datasetData, lookups, datasetConfig] = values

                    viewpointDataTemplate.datasetConfig = datasetConfig // TODO try to avoid this

                    let setparms:CalculateViewpointDataParms = {
                        datasetName,
                        inflationAdjusted,
                        viewpointDataTemplate,
                        datasetData,
                        lookups,
                    }
                    this.calculateViewpointData(setparms)

                    viewpointDataTemplate = setparms.viewpointDataTemplate

                    resolve(viewpointDataTemplate)
                    
                }
            )
        })

        return promise

    }


    private calculateViewpointData(parms: CalculateViewpointDataParms) {
        updateViewpointData(parms)
    }

    // -------------------------[ promises to collect data ]---------------------

    private getViewpointTemplatePromise(viewpoint: string) {

        let promise = new Promise(resolve => {

            let viewpointdata: ViewpointData = db_viewpoints[viewpoint]
            viewpointdata = JSON.parse(JSON.stringify(viewpointdata))

            resolve(viewpointdata)

        })

        return promise

    }

    // internal promise for dataset config
    private getDatasetConfigPromise(versionName:string, datasetName:string) {

        let datasetpromise = this.getDatasetPromise(versionName, datasetName)
        let promise = new Promise(resolve => {

            datasetpromise.then((datasetdata: DatasetMetaData) => {

                let metaData:DatasetConfig = datasetdata.MetaData

                let { 
                    DatasetName,
                    YearsRange,
                    DatasetTitle,
                    Dataseries,
                    DataseriesTitles,
                    Units,
                    UnitsAlias,
                    UnitRatio,
                } = metaData

                let config = {
                    DatasetName,
                    YearsRange,
                    DatasetTitle,
                    Dataseries,
                    DataseriesTitles, 
                    Units, 
                    UnitsAlias,
                    UnitRatio,
                }

                 resolve(config)

            })

        })

        return promise

    }

    private getDatasetPromise(versionName, datasetName: string) {

        let promise = new Promise(resolve => {

            let datasetdata: CurrencyDataset | NumericItemDataset = db_datasets[versionName][datasetName]

            delay(0). then(()=>{
                resolve(datasetdata)
            })

        })

        return promise

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