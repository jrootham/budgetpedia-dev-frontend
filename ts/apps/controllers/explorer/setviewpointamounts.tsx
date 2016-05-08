// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// setviewpointamounts.tsx

// TODO:
//    BUG: mayor's office revenues are absent from dataset,
//        but instead of showing up as no chart, subchart contains
//        previous structure from either expenses or staff

// summarization structure for setviewpointamounts
interface ComponentSummaries {
    years?: any,
    Categories?: any,
}

// -------------------[ SET VIEWPOINT HIERARCHY NODE AMOUNTS ]-----------

// starts with hash of components, 
// recursively descends to BASELINE items, then leaves 
// summaries by year, and Categories by year on ascent
let setViewpointAmounts = (viewpointname, dataseriesname, budgetdata, wantsInflationAdjusted) => {
    let viewpoint = budgetdata.Viewpoints[viewpointname]

    // already done if currentdataseries matches request
    if (viewpoint.currentdataseries == dataseriesname)
        return

    let itemseries = budgetdata.DataSeries[dataseriesname]

    let baselinecat = itemseries.Baseline // use for system lookups
    let baselinelookups = budgetdata.Lookups[baselinecat]
    let componentcat = itemseries.Components
    let componentlookups = budgetdata.Lookups[componentcat]
    let categorylookups = viewpoint.Lookups.Categories

    let lookups = {
        baselinelookups,
        componentlookups,
        categorylookups,
    }

    let items = itemseries.Items

    let isInflationAdjusted = !!itemseries.InflationAdjusted

    let rootcomponent = { "ROOT": viewpoint }

    // set years, and Categories by years
    // initiates recursion
    setComponentSummaries(rootcomponent, items, isInflationAdjusted,
        lookups, wantsInflationAdjusted)

    // create sentinel to prevent unnucessary processing
    viewpoint.currentdataseries = dataseriesname

    // let text = JSON.stringify(viewpoint, null, 4) + '\n'

}

// this is recursive, with "BASELINE" component at the leaf,
// or with absence of Components property at leaf
let setComponentSummaries = (components, items, isInflationAdjusted,
    lookups, wantsInflationAdjusted): ComponentSummaries => {
    // cumulate summaries for this level
    let cumulatingSummaries: ComponentSummaries = {
        years: {},
        Categories: {},
    }

    // for every component at this level
    for (let componentname in components) {

        // isolate the component...
        let component = components[componentname]

        let componentSummaries = null

        // remove any previous aggregations...
        if (component.years) delete component.years
        if (component.Categories) delete component.Categories

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
                componentSummaries = setComponentSummaries(
                    component.Components, items, isInflationAdjusted,
                    lookups, wantsInflationAdjusted)

                // capture data for chart-making
                if (componentSummaries.years)
                    component.years = componentSummaries.years
                if (componentSummaries.Categories) {
                    component.Categories = componentSummaries.Categories
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
            if (!item) console.error('failed to find item for ', componentname)
            // first set componentSummaries as usual
            if (isInflationAdjusted) {
                if (wantsInflationAdjusted) {
                    if (item.Adjusted) {
                        componentSummaries = {
                            years: item.Adjusted.years,
                            Categories: item.Adjusted.Components,
                        }
                    }
                } else {
                    if (item.Nominal) {
                        componentSummaries = {
                            years: item.Nominal.years,
                            Categories: item.Nominal.Components,
                        }
                    }
                }
            } else {
                componentSummaries = {
                    years: item.years,
                    Categories: item.Components,
                }
            }
            // capture data for chart-making
            if (componentSummaries) {
                if (componentSummaries.years) {
                    component.years = componentSummaries.years
                } 
                if (componentSummaries.Categories) {
                    component.Components = componentSummaries.Categories
                } 
            } else {
                if (component.Components)
                    delete component.SortedComponents
                    delete component.Components
                if (component.years)
                    delete component.years
            }
            if (component.Components) { // && !component.SortedComponents) {
                let sorted = getNameSortedComponents(
                    component.Components, lookups)

                component.SortedComponents = sorted
            }

        }

        // aggregate the collected summaries for the caller
        if (componentSummaries) {
            aggregateComponentSummaries(cumulatingSummaries, componentSummaries)
        }
    }

    return cumulatingSummaries
}

// -----------------------[ RETURN SORTED COMPONENT LIST ]------------------------

let getIndexSortedComponents = (components, lookups) => {
    let sorted = []
    let catlookups = lookups.categorylookups
    for (let componentname in components) {
        let component = components[componentname]
        let config = component.Contents
        let name = (config == 'BASELINE')
            ? lookups.baselinelookups[componentname]
            : catlookups[componentname]
        let item = {
            Code: componentname,
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

let getNameSortedComponents = (components, lookups) => {
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

// summarize the componentSummaries into the cumumlatingSummaries

let aggregateComponentSummaries = (
    cumulatingSummaries: ComponentSummaries,
    componentSummaries: ComponentSummaries) => {

    // if years have been collected, add them to the total
    if (componentSummaries.years) {

        let years = componentSummaries.years

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
    if (componentSummaries.Categories) {

        let Categories = componentSummaries.Categories

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

export { setViewpointAmounts }
