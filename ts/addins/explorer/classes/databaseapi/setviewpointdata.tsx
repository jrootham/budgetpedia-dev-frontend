// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// setviewpointamounts.tsx

// TODO:
//    BUG: mayor's office revenues are absent from dataset,
//        but instead of showing up as no chart, subchart contains
//        previous structure from either expenses or staff

// summarization structure for setviewpointamounts
interface ComponentAggregates {
    years?: any,
    CommonObjects?: any,
}

import {
    SortedComponentItem,
} from '../../modules/interfaces'

// -------------------[ SET VIEWPOINT HIERARCHY NODE AMOUNTS ]-----------

export interface SetViewpointDataParms {
    // viewpointname:string,
    datasetName: string,
    viewpointData:any,
    datasetData:any,
    lookups:any,
    inflationAdjusted: boolean,
    yearSpecs: {
        firstYear: number,
        lastYear: number,
    }
}

// starts with hash of components, 
// recursively descends to BASELINE items, then leaves 
// summaries by year, and CommonObjects by year on ascent
let setViewpointData = (parms: SetViewpointDataParms) => {
    // let viewpointname = parms.viewpointname,
    let { 
        datasetName, 
        viewpointData, 
        datasetData, 
        lookups, 
        inflationAdjusted 
    } = parms

    // already done if currentDataset matches request
    if (viewpointData.currentDataset == datasetName)
        return

    let datasetMetaData = datasetData.MetaData
    let componentLookupIndex = datasetMetaData.ComponentsLookupIndex // use for system lookups
    let commonObjectLookupIndex = datasetMetaData.CommonObjectsLookupIndex

    let componentlookups = lookups[componentLookupIndex]
    let commonObjectLookups = lookups[commonObjectLookupIndex]
    let taxonomylookups = viewpointData.Lookups.Taxonomy

    let lookupset = {
        componentlookups,
        commonObjectLookups,
        taxonomylookups,
    }

    let items = datasetData.Items

    let isInflationAdjustable = !!datasetMetaData.InflationAdjustable

    let rootcomponent = { "ROOT": viewpointData }

    // set years, and CommonObjects by years
    // initiates recursion
    setComponentAggregates(rootcomponent, items, isInflationAdjustable,
        lookupset, inflationAdjusted)

    // create sentinel to prevent unnucessary processing
    viewpointData.currentDataset = datasetName

    // let text = JSON.stringify(viewpoint, null, 4) + '\n'

}

// this is recursive, with absence of Components property at leaf
// special treatment for 'BASELINE' items -- fetches data from data series items
// sets years and CommonObjects for the node
let setComponentAggregates = (components, items, isInflationAdjustable,
    lookups, wantsInflationAdjusted): ComponentAggregates => {
    // cumulate summaries for this level
    let cumulatingSummaries: ComponentAggregates = {
        years: {},
        CommonObjects: {},
    }

    // for every component at this level
    for (let componentname in components) {

        // isolate the component...
        let component = components[componentname]

        let componentAggregates = null

        // remove any previous aggregations...
        if (component.years) delete component.years
        if (component.CommonObjects) {
            delete component.CommonObjects
            delete component.SortedCommonObjects
        }

        // for non-baseline items, recurse to collect aggregations
        if (!component.Baseline) { // NamingConfigRef != "BASELINE") {

            // if no components found, loop
            if (component.Components) {

                // if (!component.SortedComponents) {
                let sorted = getIndexSortedComponents(
                    component.Components, lookups)

                component.SortedComponents = sorted
                // }

                // get child component summaries recursively
                componentAggregates = setComponentAggregates(
                    component.Components, items, isInflationAdjustable,
                    lookups, wantsInflationAdjusted)

                // capture data for chart-making
                if (componentAggregates.years)
                    component.years = componentAggregates.years
                if (componentAggregates.CommonObjects) {
                    component.CommonObjects = componentAggregates.CommonObjects
                    if (component.CommonObjects) {// && !component.SortedCommonObjects) {
                        let sorted = getNameSortedComponents(
                            component.CommonObjects, lookups)

                        component.SortedCommonObjects = sorted
                    }

                }

            }

            // for baseline items, fetch the baseline amounts from the dataseries itemlist
        } else {

            // fetch the data from the dataseries itemlist
            let item = items[componentname]
            let importitem = null
            if (!item) console.error('System Error: failed to find item for ', componentname)
            // first set componentAggregates as usual
            if (isInflationAdjustable) {
                if (wantsInflationAdjusted) {
                    importitem = item.Adjusted
                    if (importitem) {
                        componentAggregates = {
                            years: item.Adjusted.years,
                            CommonObjects: item.Adjusted.CommonObjects,
                        }
                    }
                } else {
                    importitem = item.Nominal
                    if (item.Nominal) {
                        componentAggregates = {
                            years: item.Nominal.years,
                            CommonObjects: item.Nominal.CommonObjects,
                        }
                    }
                }
            } else {
                importitem = item
                componentAggregates = {
                    years: item.years,
                    CommonObjects: item.CommonObjects,
                }
            }
            // capture data for chart-making
            if (component.Components) {
                delete component.SortedComponents
                delete component.Components
            }
            if (component.CommonObjects) {
                delete component.SortedCommonObjects
                delete component.CommonObjects
            }
            if (component.years) {
                delete component.years
            }
            if (importitem) { // there is data
                if (importitem.years) {
                    component.years = importitem.years
                } 
                if (importitem.CommonObjects) {
                    component.CommonObjects = importitem.CommonObjects
                } 
                if (importitem.SortedCommonObjects) {
                    component.SortedCommonObjects = importitem.SortedCommonObjects
                }
                if (importitem.Components) {
                    component.Components = importitem.Components
                }
                if (importitem.SortedComponents) {
                    component.SortedComponents = importitem.SortedComponents
                }
            } 
            if (component.Components && !component.SortedComponents) { // && !component.SortedComponents) {
                let sorted = getNameSortedComponents(
                    component.Components, lookups)

                component.SortedComponents = sorted
            }
            if (component.CommonObjects && !component.SortedCommonObjects) { // && !component.SortedComponents) {
                let sorted = getNameSortedComponents(
                    component.CommonObjects, lookups)

                component.SortedCommonObjects = sorted
            }

        }

        // aggregate the collected summaries for the caller
        if (componentAggregates) {
            aggregateComponentAggregates(cumulatingSummaries, componentAggregates)
        }
    }

    return cumulatingSummaries
}

// -----------------------[ RETURN SORTED COMPONENT LIST ]------------------------

let getIndexSortedComponents = (components, lookups):SortedComponentItem[] => {
    let sorted = []
    let catlookups = lookups.taxonomylookups
    for (let componentcode in components) {
        let component = components[componentcode]
        let baseline = !!component.Baseline // config = component.NamingConfigRef
        let name = baseline // (config == 'BASELINE')
            ? lookups.componentlookups[componentcode]
            : catlookups[componentcode]
        let item = {
            Code: componentcode,
            Index: component.Index,
            Name: name || 'unknown name'
        }
        sorted.push(item)
    }
    sorted.sort((a, b) => {
        let value
        if (a.Index < b.Index)
            value = -1
        else if (a.Index > b.Index)
            value = 1
        else
            value = 0
        return value
    })

    return sorted

}

let getNameSortedComponents = (components, lookups):SortedComponentItem[] => {
    let sorted = []
    let complookups = lookups.commonObjectLookups
    for (let componentname in components) {
        let component = components[componentname]
        // let config = component.NamingConfigRef
        let name = complookups[componentname]
        let item = {
            Code: componentname,
            Name: name || 'unknown name'
        }
        sorted.push(item)
    }
    sorted.sort((a, b) => {
        let value
        if (a.Name < b.Name)
            value = -1
        else if (a.Name > b.Name)
            value = 1
        else
            value = 0
        return value
    })

    return sorted

}

// -----------------------[ SUMMARIZE COMPONENT DATA ]-----------------------

// summarize the componentAggregates into the cumumlatingSummaries

let aggregateComponentAggregates = (
    cumulatingSummaries: ComponentAggregates,
    componentAggregates: ComponentAggregates) => {

    // if years have been collected, add them to the total
    if (componentAggregates.years) {

        let years = componentAggregates.years

        // for each year...
        for (let yearname in years) {

            let yearvalue = years[yearname]

            // accumulate the value...
            if (cumulatingSummaries.years[yearname])
                cumulatingSummaries.years[yearname] += yearvalue
            else
                cumulatingSummaries.years[yearname] = yearvalue
        }
    }

    // if CommonObjects have been collected, add them to the totals
    if (componentAggregates.CommonObjects) {

        let CommonObjects = componentAggregates.CommonObjects

        // for each aggreate...
        for (let commonObjectName in CommonObjects) {

            let commonObject = CommonObjects[commonObjectName]

            // for each category year...
            // collect year values for the CommonObjects if they exist
            if (commonObject.years) {

                let years = commonObject.years

                for (let yearname in years) {

                    // accumulate the year value...
                    let yearvalue = years[yearname]
                    let cumulatingCommonObject =
                        cumulatingSummaries.CommonObjects[commonObjectName] || { years: {} }

                    if (cumulatingCommonObject.years[yearname])
                        cumulatingCommonObject.years[yearname] += yearvalue
                    else
                        cumulatingCommonObject.years[yearname] = yearvalue

                    // re-assemble
                    cumulatingSummaries.CommonObjects[commonObjectName] = cumulatingCommonObject

                }
            }
        }
    }
}

export default setViewpointData
