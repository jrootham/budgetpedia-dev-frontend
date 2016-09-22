// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// setviewpointamounts.tsx

// TODO:
//    BUG: mayor's office revenues are absent from dataset,
//        but instead of showing up as no chart, subchart contains
//        previous structure from either expenses or staff

// summarization structure for setviewpointamounts
interface ComponentAggregates {
    years?: any,
    CommonDimension?: any,
}

import {
    SortedComponentItem,
} from '../../modules/interfaces'

// -------------------[ SET VIEWPOINT HIERARCHY NODE AMOUNTS ]-----------

export interface SetViewpointDataParms {
    // viewpointname:string,
    datasetName: string,
    viewpointDataTemplate:any,
    datasetData:any,
    lookups:any,
    inflationAdjusted: boolean,
}

// starts with hash of components, 
// recursively descends to BASELINE items, then leaves 
// summaries by year, and CommonDimension by year on ascent
const setViewpointData = (parms: SetViewpointDataParms) => {
    // let viewpointname = parms.viewpointname,
    let { 
        datasetName, 
        viewpointDataTemplate, 
        datasetData, 
        lookups, 
        inflationAdjusted 
    } = parms

    // already done if currentDataset matches request
    if (viewpointDataTemplate.currentDataset == datasetName)
        return

    let datasetMetaData = datasetData.MetaData
    console.log('dataset MetaData', datasetData.MetaData)
    let baselineLookupIndex = datasetMetaData.Dimensions[0].toLowerCase() // use for system lookups
    let commonDimensionLookupIndex = datasetMetaData.CommonDimension
    if (commonDimensionLookupIndex) {
        commonDimensionLookupIndex = commonDimensionLookupIndex.toLowerCase()
    }

    let baselinelookups = lookups[baselineLookupIndex]
    let commonDimensionLookups = commonDimensionLookupIndex?lookups[commonDimensionLookupIndex]:null
    let taxonomylookups = viewpointDataTemplate.Lookups.Taxonomy

    let lookupset = {
        baselinelookups,
        commonDimensionLookups,
        taxonomylookups,
    }

    console.log('lookupset',lookupset)

    let items = datasetData.Data

    let isInflationAdjustable = !!datasetMetaData.InflationAdjustable

    if (isInflationAdjustable) {
        if (inflationAdjusted) {
            items = items.Adjusted
        } else {
            items = items.Nominal
        }
    }

    console.log('inflationadjusted, items', inflationAdjusted, items)

    let rootcomponent = { "ROOT": viewpointDataTemplate }

    // set years, and CommonDimension by years

    try {
        // initiates recursion
        setComponentAggregates(rootcomponent, items, lookupset)
        console.log('completed set viewpointdata', rootcomponent)
    } catch (e) {
        console.log('error in setCompomentAggregates', e)
    }
    // create sentinel to prevent unnucessary processing
    viewpointDataTemplate.currentDataset = datasetName
    viewpointDataTemplate.isInflationAdjusted = inflationAdjusted

}

// this is recursive, with absence of Components property at leaf
// special treatment for 'BASELINE' items -- fetches data from data series items
// sets years and CommonDimension for the node
const setComponentAggregates = (

        components, 
        items, 
        lookups

    ): ComponentAggregates => {
    // cumulate summaries for this level
    let cumulatingSummaries: ComponentAggregates = {
        years: {},
        CommonDimension: {},
    }

    // for every component at this level
    for (let componentname in components) {

        // isolate the component...
        let component = components[componentname]

        let componentAggregates = null

        // remove any previous aggregations...
        if (component.years) delete component.years
        if (component.CommonDimension) {
            delete component.CommonDimension
            delete component.SortedCommonDimension
        }

        // for non-baseline items, recurse to collect aggregations
        if (!component.Baseline) { // NamingConfigRef != "BASELINE") {

            // if no components found, loop
            if (component.Components) {

                // if (!component.SortedComponents) {
                let sorted = getIndexSortedComponentItems(
                    component.Components, lookups)

                component.SortedComponents = sorted
                // }

                // get child component summaries recursively
                componentAggregates = setComponentAggregates(
                    component.Components, items, lookups)

                // capture data for chart-making
                if (componentAggregates.years)
                    component.years = componentAggregates.years
                if (componentAggregates.CommonDimension) {
                    component.CommonDimension = componentAggregates.CommonDimension
                    if (component.CommonDimension) {// && !component.SortedCommonDimension) {
                        let sorted = getNameSortedComponentItems(
                            component.CommonDimension, lookups)

                        component.SortedCommonDimension = sorted
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
            importitem = item
            componentAggregates = {
                years: item.years,
                CommonDimension: item.CommonDimension,
            }
            // capture data for chart-making
            if (component.Components) {
                delete component.SortedComponents
                delete component.Components
            }
            if (component.CommonDimension) {
                delete component.SortedCommonDimension
                delete component.CommonDimension
            }
            if (component.years) {
                delete component.years
            }
            if (importitem) { // there is data
                if (importitem.years) {
                    component.years = importitem.years
                } 
                if (importitem.CommonDimension) {
                    component.CommonDimension = importitem.CommonDimension
                } 
                if (importitem.SortedCommonDimension) {
                    component.SortedCommonDimension = importitem.SortedCommonDimension
                }
                if (importitem.Components) {
                    component.Components = importitem.Components
                }
                if (importitem.SortedComponents) {
                    component.SortedComponents = importitem.SortedComponents
                }
            } 
            if (component.Components && !component.SortedComponents) { // && !component.SortedComponents) {
                let sorted = getNameSortedComponentItems(
                    component.Components, lookups)

                component.SortedComponents = sorted
            }
            if (component.CommonDimension && !component.SortedCommonDimension) { // && !component.SortedComponents) {
                let sorted = getNameSortedComponentItems(
                    component.CommonDimension, lookups)

                component.SortedCommonDimension = sorted
            }

        }

        // aggregate the collected summaries for the caller
        if (componentAggregates) {
            assembleComponentAggregates(cumulatingSummaries, componentAggregates)
        }
    }

    return cumulatingSummaries
}

// -----------------------[ RETURN SORTED COMPONENT LIST ]------------------------

const getIndexSortedComponentItems = (components, lookups):SortedComponentItem[] => {
    let sorted = []
    let taxonomylookups = lookups.taxonomylookups
    for (let componentcode in components) {
        let component = components[componentcode]
        let baseline = !!component.Baseline // config = component.NamingConfigRef
        let name = baseline // (config == 'BASELINE')
            ? lookups.baselinelookups[componentcode]
            : taxonomylookups[componentcode]
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

const getNameSortedComponentItems = (components, lookups):SortedComponentItem[] => {
    let sorted = []
    let complookups = lookups.commonDimensionLookups
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

const assembleComponentAggregates = (
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

    // if CommonDimension have been collected, add them to the totals
    if (componentAggregates.CommonDimension) {

        let CommonDimension = componentAggregates.CommonDimension

        // for each aggreate...
        for (let commonDimensionName in CommonDimension) {

            let commonDimension = CommonDimension[commonDimensionName]

            // for each category year...
            // collect year values for the CommonDimension if they exist
            if (commonDimension.years) {

                let years = commonDimension.years

                for (let yearname in years) {

                    // accumulate the year value...
                    let yearvalue = years[yearname]
                    let cumulatingCommonDimension =
                        cumulatingSummaries.CommonDimension[commonDimensionName] || { years: {} }

                    if (cumulatingCommonDimension.years[yearname])
                        cumulatingCommonDimension.years[yearname] += yearvalue
                    else
                        cumulatingCommonDimension.years[yearname] = yearvalue

                    // re-assemble
                    cumulatingSummaries.CommonDimension[commonDimensionName] = cumulatingCommonDimension

                }
            }
        }
    }
}

export default setViewpointData
