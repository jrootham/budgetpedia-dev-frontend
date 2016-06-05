"use strict";
let setViewpointData = (viewpointname, dataseriesname, budgetdata, wantsInflationAdjusted) => {
    let viewpoint = budgetdata.Viewpoints[viewpointname];
    if (viewpoint.currentdataseries == dataseriesname)
        return;
    let itemseries = budgetdata.DataSeries[dataseriesname];
    let baselinecat = itemseries.Baseline;
    let baselinelookups = budgetdata.Lookups[baselinecat];
    let componentcat = itemseries.Categories;
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
    setComponentAggregates(rootcomponent, items, isInflationAdjusted, lookups, wantsInflationAdjusted);
    viewpoint.currentdataseries = dataseriesname;
};
exports.setViewpointData = setViewpointData;
let setComponentAggregates = (components, items, isInflationAdjusted, lookups, wantsInflationAdjusted) => {
    let cumulatingSummaries = {
        years: {},
        Categories: {},
    };
    for (let componentname in components) {
        let component = components[componentname];
        let componentAggregates = null;
        if (component.years)
            delete component.years;
        if (component.Categories) {
            delete component.Categories;
            delete component.SortedCategories;
        }
        if (component.Contents != "BASELINE") {
            if (component.Components) {
                let sorted = getIndexSortedComponents(component.Components, lookups);
                component.SortedComponents = sorted;
                componentAggregates = setComponentAggregates(component.Components, items, isInflationAdjusted, lookups, wantsInflationAdjusted);
                if (componentAggregates.years)
                    component.years = componentAggregates.years;
                if (componentAggregates.Categories) {
                    component.Categories = componentAggregates.Categories;
                    if (component.Categories) {
                        let sorted = getNameSortedComponents(component.Categories, lookups);
                        component.SortedCategories = sorted;
                    }
                }
            }
        }
        else {
            let item = items[componentname];
            let importitem = null;
            if (!item)
                console.error('failed to find item for ', componentname);
            if (isInflationAdjusted) {
                if (wantsInflationAdjusted) {
                    importitem = item.Adjusted;
                    if (importitem) {
                        componentAggregates = {
                            years: item.Adjusted.years,
                            Categories: item.Adjusted.Categories,
                        };
                    }
                }
                else {
                    importitem = item.Nominal;
                    if (item.Nominal) {
                        componentAggregates = {
                            years: item.Nominal.years,
                            Categories: item.Nominal.Categories,
                        };
                    }
                }
            }
            else {
                importitem = item;
                componentAggregates = {
                    years: item.years,
                    Categories: item.Categories,
                };
            }
            if (component.Components) {
                delete component.SortedComponents;
                delete component.Components;
            }
            if (component.Categories) {
                delete component.SortedCategories;
                delete component.Categories;
            }
            if (component.years) {
                delete component.years;
            }
            if (importitem) {
                if (importitem.years) {
                    component.years = importitem.years;
                }
                if (importitem.Categories) {
                    component.Categories = importitem.Categories;
                }
                if (importitem.SortedCategories) {
                    component.SortedCategories = importitem.SortedCategories;
                }
                if (importitem.Components) {
                    component.Components = importitem.Components;
                }
                if (importitem.SortedComponents) {
                    component.SortedComponents = importitem.SortedComponents;
                }
            }
            if (component.Components && !component.SortedComponents) {
                let sorted = getNameSortedComponents(component.Components, lookups);
                component.SortedComponents = sorted;
            }
            if (component.Categories && !component.SortedCategories) {
                let sorted = getNameSortedComponents(component.Categories, lookups);
                component.SortedCategories = sorted;
            }
        }
        if (componentAggregates) {
            aggregateComponentAggregates(cumulatingSummaries, componentAggregates);
        }
    }
    return cumulatingSummaries;
};
let getIndexSortedComponents = (components, lookups) => {
    let sorted = [];
    let catlookups = lookups.categorylookups;
    for (let componentcode in components) {
        let component = components[componentcode];
        let config = component.Contents;
        let name = (config == 'BASELINE')
            ? lookups.baselinelookups[componentcode]
            : catlookups[componentcode];
        let item = {
            Code: componentcode,
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
let aggregateComponentAggregates = (cumulatingSummaries, componentAggregates) => {
    if (componentAggregates.years) {
        let years = componentAggregates.years;
        for (let yearname in years) {
            let yearvalue = years[yearname];
            if (cumulatingSummaries.years[yearname])
                cumulatingSummaries.years[yearname] += yearvalue;
            else
                cumulatingSummaries.years[yearname] = yearvalue;
        }
    }
    if (componentAggregates.Categories) {
        let Categories = componentAggregates.Categories;
        for (let categoryname in Categories) {
            let Category = Categories[categoryname];
            if (Category.years) {
                let years = Category.years;
                for (let yearname in years) {
                    let yearvalue = years[yearname];
                    let cumulatingCategory = cumulatingSummaries.Categories[categoryname] || { years: {} };
                    if (cumulatingCategory.years[yearname])
                        cumulatingCategory.years[yearname] += yearvalue;
                    else
                        cumulatingCategory.years[yearname] = yearvalue;
                    cumulatingSummaries.Categories[categoryname] = cumulatingCategory;
                }
            }
        }
    }
};
