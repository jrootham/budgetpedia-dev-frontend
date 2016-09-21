// databaseapi.tsx
// TEMPORARY DATA SOURCES
// data sources

// deepclone = JSON.parse(JSON.stringify(obj)) // but this destroys dates, undefined, and functions

/*
    TODO: 
        add spinner for progress
        add cache for all fetch elements
*/

import updateViewpointData, 
    { SetViewpointDataParms as CalculateViewpointDataParms } from './databaseapi/setviewpointdata'

import { SortedComponentItem } from '../modules/interfaces'

// -----------------------[ collect the data ]------------------------------

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
    // included in declaration
    Index: number,
    NamingConfigRef: string,
    Components?: Components,
    // added after processing
    CommonObjects?: Components,
    SortedComponents?: SortedComponentItem,
    SortedCommonObjects?: SortedComponentItem,
    years?: Dataset<CurrencyItemType> | Dataset<NumericItemType>
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
    NamingConfigurations: {
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
    repository:string,
    viewpointName:string,
    versionName: string,
    datasetName: string,
    inflationAdjusted: boolean,
}

// ---------------------------[ local use ]------------------------

// the following two items used only above
interface CurrencyItemDataset extends Dataset<CurrencyItemType> {}

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
    private viewpointTemplates: Viewpoints
    private processedViewpoints: Viewpoints
    private datasets: Datasets
    private lookups: Lookups
    private viewpointDataParms: GetViewpointDataParms
    private dbroot: string = '/db/repositories/'
    private datasetsubpath: string = 'json/'
    private lookupssubpath: string = 'lookups/'

    // getViewpointData returns a promise.
    public getViewpointData(parms: GetViewpointDataParms) {

        this.viewpointDataParms = parms

        console.log('getViewpointData in databaseapi parms', parms)

        let { viewpointName, versionName, datasetName, inflationAdjusted } = parms

        let viewpointDataTemplatePromise = this.getViewpointTemplatePromise(viewpointName),
            datasetDataPromise = this.getDatasetPromise(versionName,datasetName),
            lookupsPromise = this.getLookupsPromise(versionName),
            datasetConfigPromise = this.getDatasetConfigPromise(versionName, datasetName)

        let promise = new Promise((resolve, error) => {

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
            ).catch(reason =>{
                console.log(reason)
                // error(reason)
            })
        })

        return promise

    }

    // TODO: use local cache
    private calculateViewpointData(parms: CalculateViewpointDataParms) {
        updateViewpointData(parms)
    }

    // -------------------------[ promises to collect data ]---------------------

    private getViewpointTemplatePromise(viewpoint: string) {

        let promise = new Promise((resolve, error) => {

            let path = this.dbroot + 
                this.viewpointDataParms.repository.toLowerCase() +
                '/viewpoints/' + 
                viewpoint.toLowerCase() + '.json'

            console.log('viewpointpath', path)

            fetch(path).then((viewpoint) => {
                return viewpoint.json()
            }).then((viewpointdata)=> {
                resolve(viewpointdata)
            }).catch((reason)=>{
                console.log('get viewpoint template error', reason)
                // error(reason)
            })

        })

        return promise

    }

    // internal promise for dataset config
    // TODO: get this from meta subdir
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

        let promise = new Promise((resolve, error) => {

            let path = this.dbroot + 
                this.viewpointDataParms.repository.toLowerCase() +
                '/datasets/' + 
                versionName.toLowerCase() + 
                '/' + this.datasetsubpath +
                datasetName.toLowerCase() + '.json'

            console.log('dataset path', path)

            fetch(path).then((dataset) => {
                return dataset.json()
            }).then((dataset)=> {
                resolve(dataset)
            }).catch((reason)=>{
                console.log('get dataset error', reason)
                // error(reason)
            })

        })

        return promise

    }

    private getLookupsPromise(version:string = undefined) {

        let promise = new Promise((resolve, error) => {

            let path = this.dbroot + 
                this.viewpointDataParms.repository.toLowerCase() +
                '/datasets/' + 
                version.toLowerCase() + 
                '/' + this.lookupssubpath +
                'lookups.json'

            console.log('lookup path', path)

            fetch(path).then((lookups) => {
                return lookups.json()
            }).then((lookups)=> {
                resolve(lookups)
            }).catch((reason)=>{
                console.log('get lookups error', reason)
                // error(reason)
            })

        })

        return promise

    }
}

const database = new Database()

export default database