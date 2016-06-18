// databaseapi.tsx
let budgetdata = require('../../explorerprototypedata/2015budgetA.json')

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

    private getViewpoint = (viewpoint:string):Viewpoint => {
        let vpt:Viewpoint
        return vpt
    }

    private getCurrencyDataset = (dataset:string):Dataset<CurrencyItemType> => {
        let dst:Dataset<CurrencyItemType>
        return dst
    }

    private getItemDataset = (dataset: string):Dataset<ItemType> => {
        let dst: Dataset<ItemType>
        return dst
    }

    private getLookup = (lookup:string):Lookup => {
        let lkp: Lookup
        return lkp
    }
}

const database = new Database()

export default database