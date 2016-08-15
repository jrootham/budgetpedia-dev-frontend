"use strict";
let setViewpointData = (parms) => {
    let { datasetName, viewpointData, datasetData, lookups, inflationAdjusted } = parms;
    if (viewpointData.currentDataset == datasetName)
        return;
    let componentLookupIndex = datasetData.ComponentsLookupIndex;
    let commonObjectLookupIndex = datasetData.CommonObjectsLookupIndex;
    let componentlookups = lookups[componentLookupIndex];
    let commonObjectLookups = lookups[commonObjectLookupIndex];
    let taxonomylookups = viewpointData.Lookups.Taxonomy;
    let lookupset = {
        componentlookups: componentlookups,
        commonObjectLookups: commonObjectLookups,
        taxonomylookups: taxonomylookups,
    };
    let items = datasetData.Items;
    let isInflationAdjusted = !!datasetData.InflationAdjusted;
    let rootcomponent = { "ROOT": viewpointData };
    setComponentAggregates(rootcomponent, items, isInflationAdjusted, lookupset, inflationAdjusted);
    viewpointData.currentDataset = datasetName;
};
let setComponentAggregates = (components, items, isInflationAdjusted, lookups, wantsInflationAdjusted) => {
    let cumulatingSummaries = {
        years: {},
        CommonObjects: {},
    };
    for (let componentname in components) {
        let component = components[componentname];
        let componentAggregates = null;
        if (component.years)
            delete component.years;
        if (component.CommonObjects) {
            delete component.CommonObjects;
            delete component.SortedCommonObjects;
        }
        if (component.ConfigRef != "BASELINE") {
            if (component.Components) {
                let sorted = getIndexSortedComponents(component.Components, lookups);
                component.SortedComponents = sorted;
                componentAggregates = setComponentAggregates(component.Components, items, isInflationAdjusted, lookups, wantsInflationAdjusted);
                if (componentAggregates.years)
                    component.years = componentAggregates.years;
                if (componentAggregates.CommonObjects) {
                    component.CommonObjects = componentAggregates.CommonObjects;
                    if (component.CommonObjects) {
                        let sorted = getNameSortedComponents(component.CommonObjects, lookups);
                        component.SortedCommonObjects = sorted;
                    }
                }
            }
        }
        else {
            let item = items[componentname];
            let importitem = null;
            if (!item)
                console.error('System Error: failed to find item for ', componentname);
            if (isInflationAdjusted) {
                if (wantsInflationAdjusted) {
                    importitem = item.Adjusted;
                    if (importitem) {
                        componentAggregates = {
                            years: item.Adjusted.years,
                            CommonObjects: item.Adjusted.CommonObjects,
                        };
                    }
                }
                else {
                    importitem = item.Nominal;
                    if (item.Nominal) {
                        componentAggregates = {
                            years: item.Nominal.years,
                            CommonObjects: item.Nominal.CommonObjects,
                        };
                    }
                }
            }
            else {
                importitem = item;
                componentAggregates = {
                    years: item.years,
                    CommonObjects: item.CommonObjects,
                };
            }
            if (component.Components) {
                delete component.SortedComponents;
                delete component.Components;
            }
            if (component.CommonObjects) {
                delete component.SortedCommonObjects;
                delete component.CommonObjects;
            }
            if (component.years) {
                delete component.years;
            }
            if (importitem) {
                if (importitem.years) {
                    component.years = importitem.years;
                }
                if (importitem.CommonObjects) {
                    component.CommonObjects = importitem.CommonObjects;
                }
                if (importitem.SortedCommonObjects) {
                    component.SortedCommonObjects = importitem.SortedCommonObjects;
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
            if (component.CommonObjects && !component.SortedCommonObjects) {
                let sorted = getNameSortedComponents(component.CommonObjects, lookups);
                component.SortedCommonObjects = sorted;
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
    let catlookups = lookups.taxonomylookups;
    for (let componentcode in components) {
        let component = components[componentcode];
        let config = component.ConfigRef;
        let name = (config == 'BASELINE')
            ? lookups.componentlookups[componentcode]
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
    let complookups = lookups.commonObjectLookups;
    for (let componentname in components) {
        let component = components[componentname];
        let config = component.ConfigRef;
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
    if (componentAggregates.CommonObjects) {
        let CommonObjects = componentAggregates.CommonObjects;
        for (let commonObjectName in CommonObjects) {
            let commonObject = CommonObjects[commonObjectName];
            if (commonObject.years) {
                let years = commonObject.years;
                for (let yearname in years) {
                    let yearvalue = years[yearname];
                    let cumulatingCommonObject = cumulatingSummaries.CommonObjects[commonObjectName] || { years: {} };
                    if (cumulatingCommonObject.years[yearname])
                        cumulatingCommonObject.years[yearname] += yearvalue;
                    else
                        cumulatingCommonObject.years[yearname] = yearvalue;
                    cumulatingSummaries.CommonObjects[commonObjectName] = cumulatingCommonObject;
                }
            }
        }
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = setViewpointData;
