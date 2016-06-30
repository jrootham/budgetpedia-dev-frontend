// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// setviewpointamounts.tsx

// TODO:
//    BUG: mayor's office revenues are absent from dataset,
//        but instead of showing up as no chart, subchart contains
//        previous structure from either expenses or staff

// summarization structure for setviewpointamounts
interface ComponentAggregates {
    years?: any,
    Categories?: any,
}

import {
    SortedComponentItem,
} from '../../controllers/explorer/interfaces'

// -------------------[ SET VIEWPOINT HIERARCHY NODE AMOUNTS ]-----------

export interface SetViewpointDataParms {
    // viewpointname:string,
    dataseriesname: string,
    viewpointdata:any,
    itemseriesdata:any,
    lookups:any,
    wantsInflationAdjusted: boolean,
    timeSpecs: {
        leftYear:number,
        rightYear:number,
        spanYears: boolean,
    }
}

// starts with hash of components, 
// recursively descends to BASELINE items, then leaves 
// summaries by year, and Categories by year on ascent
let setViewpointData = (parms: SetViewpointDataParms) => {
    // let viewpointname = parms.viewpointname,
    let dataseriesname = parms.dataseriesname,
        viewpointdata = parms.viewpointdata,
        itemseriesdata = parms.itemseriesdata,
        lookups = parms.lookups,
        wantsInflationAdjusted = parms.wantsInflationAdjusted

    // let viewpointdata = parms.viewpointdata

    // already done if currentdataseries matches request
    if (viewpointdata.currentdataseries == dataseriesname)
        return

    let baselinecat = itemseriesdata.Baseline // use for system lookups
    let baselinelookups = lookups[baselinecat]
    let componentcat = itemseriesdata.Categories
    let componentlookups = lookups[componentcat]
    let categorylookups = viewpointdata.Lookups.Categories

    let lookupset = {
        baselinelookups,
        componentlookups,
        categorylookups,
    }

    let items = itemseriesdata.Items

    let isInflationAdjusted = !!itemseriesdata.InflationAdjusted

    let rootcomponent = { "ROOT": viewpointdata }

    // set years, and Categories by years
    // initiates recursion
    setComponentAggregates(rootcomponent, items, isInflationAdjusted,
        lookupset, wantsInflationAdjusted)

    // create sentinel to prevent unnucessary processing
    viewpointdata.currentdataseries = dataseriesname

    // let text = JSON.stringify(viewpoint, null, 4) + '\n'

}

// this is recursive, with absence of Components property at leaf
// special treatment for 'BASELINE' items -- fetches data from data series items
// sets years and Categories for the node
let setComponentAggregates = (components, items, isInflationAdjusted,
    lookups, wantsInflationAdjusted): ComponentAggregates => {
    // cumulate summaries for this level
    let cumulatingSummaries: ComponentAggregates = {
        years: {},
        Categories: {},
    }

    // for every component at this level
    for (let componentname in components) {

        // isolate the component...
        let component = components[componentname]

        let componentAggregates = null

        // remove any previous aggregations...
        if (component.years) delete component.years
        if (component.Categories) {
            delete component.Categories
            delete component.SortedCategories
        }

        // for non-baseline items, recurse to collect aggregations
        if (component.Contents != "BASELINE") {

            // if no components found, loop
            if (component.Components) {

                // if (!component.SortedComponents) {
                let sorted = getIndexSortedComponents(
                    component.Components, lookups)

                component.SortedComponents = sorted
                // }

                // get child component summaries recursively
                componentAggregates = setComponentAggregates(
                    component.Components, items, isInflationAdjusted,
                    lookups, wantsInflationAdjusted)

                // capture data for chart-making
                if (componentAggregates.years)
                    component.years = componentAggregates.years
                if (componentAggregates.Categories) {
                    component.Categories = componentAggregates.Categories
                    if (component.Categories) {// && !component.SortedCategories) {
                        let sorted = getNameSortedComponents(
                            component.Categories, lookups)

                        component.SortedCategories = sorted
                    }

                }

            }

            // for baseline items, fetch the baseline amounts from the dataseries itemlist
        } else {

            // fetch the data from the dataseries itemlist
            let item = items[componentname]
            let importitem = null
            if (!item) console.error('failed to find item for ', componentname)
            // first set componentAggregates as usual
            if (isInflationAdjusted) {
                if (wantsInflationAdjusted) {
                    importitem = item.Adjusted
                    if (importitem) {
                        componentAggregates = {
                            years: item.Adjusted.years,
                            Categories: item.Adjusted.Categories,
                        }
                    }
                } else {
                    importitem = item.Nominal
                    if (item.Nominal) {
                        componentAggregates = {
                            years: item.Nominal.years,
                            Categories: item.Nominal.Categories,
                        }
                    }
                }
            } else {
                importitem = item
                componentAggregates = {
                    years: item.years,
                    Categories: item.Categories,
                }
            }
            // capture data for chart-making
            if (component.Components) {
                delete component.SortedComponents
                delete component.Components
            }
            if (component.Categories) {
                delete component.SortedCategories
                delete component.Categories
            }
            if (component.years) {
                delete component.years
            }
            if (importitem) { // there is data
                if (importitem.years) {
                    component.years = importitem.years
                } 
                if (importitem.Categories) {
                    component.Categories = importitem.Categories
                } 
                if (importitem.SortedCategories) {
                    component.SortedCategories = importitem.SortedCategories
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
            if (component.Categories && !component.SortedCategories) { // && !component.SortedComponents) {
                let sorted = getNameSortedComponents(
                    component.Categories, lookups)

                component.SortedCategories = sorted
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
    let catlookups = lookups.categorylookups
    for (let componentcode in components) {
        let component = components[componentcode]
        let config = component.Contents
        let name = (config == 'BASELINE')
            ? lookups.baselinelookups[componentcode]
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
    let complookups = lookups.componentlookups
    for (let componentname in components) {
        let component = components[componentname]
        let config = component.Contents
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

    // if Categories have been collected, add them to the totals
    if (componentAggregates.Categories) {

        let Categories = componentAggregates.Categories

        // for each aggreate...
        for (let categoryname in Categories) {

            let Category = Categories[categoryname]

            // for each category year...
            // collect year values for the Categories if they exist
            if (Category.years) {

                let years = Category.years

                for (let yearname in years) {

                    // accumulate the year value...
                    let yearvalue = years[yearname]
                    let cumulatingCategory =
                        cumulatingSummaries.Categories[categoryname] || { years: {} }

                    if (cumulatingCategory.years[yearname])
                        cumulatingCategory.years[yearname] += yearvalue
                    else
                        cumulatingCategory.years[yearname] = yearvalue

                    // re-assemble
                    cumulatingSummaries.Categories[categoryname] = cumulatingCategory

                }
            }
        }
    }
}

export default setViewpointData
