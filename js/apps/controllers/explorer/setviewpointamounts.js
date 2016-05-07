"use strict";
let setViewpointAmounts = (viewpointname, dataseriesname, budgetdata, wantsInflationAdjusted) => {
    let viewpoint = budgetdata.Viewpoints[viewpointname];
    if (viewpoint.currentdataseries == dataseriesname)
        return;
    let itemseries = budgetdata.DataSeries[dataseriesname];
    let baselinecat = itemseries.Baseline;
    let baselinelookups = budgetdata.Lookups[baselinecat];
    let componentcat = itemseries.Components;
    let componentlookups = budgetdata.Lookups[componentcat];
    let categorylookups = viewpoint.Lookups.Categories;
    let lookups = {
        baselinelookups: baselinelookups,
        componentlookups: componentlookups,
        categorylookups: categorylookups,
    };
    let items = itemseries.Items;
    let isInflationAdjusted = !!itemseries.InflationAdjusted;
    let rootcomponent = { "ROOT": viewpoint };
    setComponentSummaries(rootcomponent, items, isInflationAdjusted, lookups, wantsInflationAdjusted);
    viewpoint.currentdataseries = dataseriesname;
};
exports.setViewpointAmounts = setViewpointAmounts;
let setComponentSummaries = (components, items, isInflationAdjusted, lookups, wantsInflationAdjusted) => {
    let cumulatingSummaries = {
        years: {},
        Aggregates: {},
    };
    for (let componentname in components) {
        let component = components[componentname];
        let componentSummaries = null;
        if (component.years)
            delete component.years;
        if (component.Aggregates)
            delete component.Aggregates;
        if (component.Contents != "BASELINE") {
            if (component.Components) {
                let sorted = getIndexSortedComponents(component.Components, lookups);
                component.SortedComponents = sorted;
                componentSummaries = setComponentSummaries(component.Components, items, isInflationAdjusted, lookups, wantsInflationAdjusted);
                if (componentSummaries.years)
                    component.years = componentSummaries.years;
                if (componentSummaries.Aggregates) {
                    component.Aggregates = componentSummaries.Aggregates;
                    if (component.Aggregates) {
                        let sorted = getNameSortedComponents(component.Aggregates, lookups);
                        component.SortedAggregates = sorted;
                    }
                }
            }
        }
        else {
            let item = items[componentname];
            if (!item)
                console.error('failed to find item for ', componentname);
            if (isInflationAdjusted) {
                if (wantsInflationAdjusted) {
                    if (item.Adjusted) {
                        componentSummaries = {
                            years: item.Adjusted.years,
                            Aggregates: item.Adjusted.Components,
                        };
                    }
                }
                else {
                    if (item.Nominal) {
                        componentSummaries = {
                            years: item.Nominal.years,
                            Aggregates: item.Nominal.Components,
                        };
                    }
                }
            }
            else {
                componentSummaries = {
                    years: item.years,
                    Aggregates: item.Components,
                };
            }
            if (componentSummaries) {
                if (componentSummaries.years) {
                    component.years = componentSummaries.years;
                }
                if (componentSummaries.Aggregates) {
                    component.Components = componentSummaries.Aggregates;
                }
            }
            else {
                if (component.Components)
                    delete component.SortedComponents;
                delete component.Components;
                if (component.years)
                    delete component.years;
            }
            if (component.Components) {
                let sorted = getNameSortedComponents(component.Components, lookups);
                component.SortedComponents = sorted;
            }
        }
        if (componentSummaries) {
            aggregateComponentSummaries(cumulatingSummaries, componentSummaries);
        }
    }
    return cumulatingSummaries;
};
let getIndexSortedComponents = (components, lookups) => {
    let sorted = [];
    let catlookups = lookups.categorylookups;
    for (let componentname in components) {
        let component = components[componentname];
        let config = component.Contents;
        let name = (config == 'BASELINE')
            ? lookups.baselinelookups[componentname]
            : catlookups[componentname];
        let item = {
            Code: componentname,
            Index: component.Index,
            Name: name || 'unknown name'
        };
        sorted.push(item);
    }
    sorted.sort((a, b) => {
        let value;
        if (a.Index < b.Index)
            value = -1;
        else if (a.Index > b.Index)
            value = 1;
        else
            value = 0;
        return value;
    });
    return sorted;
};
let getNameSortedComponents = (components, lookups) => {
    let sorted = [];
    let complookups = lookups.componentlookups;
    for (let componentname in components) {
        let component = components[componentname];
        let config = component.Contents;
        let name = complookups[componentname];
        let item = {
            Code: componentname,
            Name: name || 'unknown name'
        };
        sorted.push(item);
    }
    sorted.sort((a, b) => {
        let value;
        if (a.Name < b.Name)
            value = -1;
        else if (a.Name > b.Name)
            value = 1;
        else
            value = 0;
        return value;
    });
    return sorted;
};
let aggregateComponentSummaries = (cumulatingSummaries, componentSummaries) => {
    if (componentSummaries.years) {
        let years = componentSummaries.years;
        for (let yearname in years) {
            let yearvalue = years[yearname];
            if (cumulatingSummaries.years[yearname])
                cumulatingSummaries.years[yearname] += yearvalue;
            else
                cumulatingSummaries.years[yearname] = yearvalue;
        }
    }
    if (componentSummaries.Aggregates) {
        let Aggregates = componentSummaries.Aggregates;
        for (let aggregatename in Aggregates) {
            let Aggregate = Aggregates[aggregatename];
            if (Aggregate.years) {
                let years = Aggregate.years;
                for (let yearname in years) {
                    let yearvalue = years[yearname];
                    let cumulatingAggregate = cumulatingSummaries.Aggregates[aggregatename] || { years: {} };
                    if (cumulatingAggregate.years[yearname])
                        cumulatingAggregate.years[yearname] += yearvalue;
                    else
                        cumulatingAggregate.years[yearname] = yearvalue;
                    cumulatingSummaries.Aggregates[aggregatename] = cumulatingAggregate;
                }
            }
        }
    }
};