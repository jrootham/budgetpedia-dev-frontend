"use strict";
let setViewpointData = (parms) => {
    let { datasetName, viewpointDataTemplate, datasetData, lookups, inflationAdjusted } = parms;
    if (viewpointDataTemplate.currentDataset == datasetName)
        return;
    let datasetMetaData = datasetData.MetaData;
    console.log('dataset MetaData', datasetData.MetaData);
    let componentLookupIndex = datasetMetaData.Dimensions[0].toLowerCase();
    let commonDimensionLookupIndex = datasetMetaData.CommonDimension;
    if (commonDimensionLookupIndex) {
        commonDimensionLookupIndex = commonDimensionLookupIndex.toLowerCase();
    }
    let baselinelookups = lookups[componentLookupIndex];
    let commonDimensionLookups = lookups[commonDimensionLookupIndex];
    let taxonomylookups = viewpointDataTemplate.Lookups.Taxonomy;
    let lookupset = {
        baselinelookups: baselinelookups,
        commonDimensionLookups: commonDimensionLookups,
        taxonomylookups: taxonomylookups,
    };
    console.log('lookupset', lookupset);
    let items = datasetData.Data;
    let isInflationAdjustable = !!datasetMetaData.InflationAdjustable;
    if (isInflationAdjustable) {
        if (inflationAdjusted) {
            items = items.Adjusted;
        }
        else {
            items = items.Nominal;
        }
    }
    console.log('inflationadjusted, items', inflationAdjusted, items);
    let rootcomponent = { "ROOT": viewpointDataTemplate };
    try {
        setComponentAggregates(rootcomponent, items, lookupset);
        console.log('completed set viewpointdata');
    }
    catch (e) {
        console.log(e);
    }
    viewpointDataTemplate.currentDataset = datasetName;
};
let setComponentAggregates = (components, items, lookups) => {
    let cumulatingSummaries = {
        years: {},
        CommonDimension: {},
    };
    for (let componentname in components) {
        let component = components[componentname];
        let componentAggregates = null;
        if (component.years)
            delete component.years;
        if (component.CommonDimension) {
            delete component.CommonDimension;
            delete component.SortedCommonDimension;
        }
        if (!component.Baseline) {
            if (component.Components) {
                let sorted = getIndexSortedComponentItems(component.Components, lookups);
                component.SortedComponents = sorted;
                componentAggregates = setComponentAggregates(component.Components, items, lookups);
                if (componentAggregates.years)
                    component.years = componentAggregates.years;
                if (componentAggregates.CommonDimension) {
                    component.CommonDimension = componentAggregates.CommonDimension;
                    if (component.CommonDimension) {
                        let sorted = getNameSortedComponentItems(component.CommonDimension, lookups);
                        component.SortedCommonDimension = sorted;
                    }
                }
            }
        }
        else {
            let item = items[componentname];
            let importitem = null;
            if (!item)
                console.error('System Error: failed to find item for ', componentname);
            importitem = item;
            componentAggregates = {
                years: item.years,
                CommonDimension: item.CommonDimension,
            };
            if (component.Components) {
                delete component.SortedComponents;
                delete component.Components;
            }
            if (component.CommonDimension) {
                delete component.SortedCommonDimension;
                delete component.CommonDimension;
            }
            if (component.years) {
                delete component.years;
            }
            if (importitem) {
                if (importitem.years) {
                    component.years = importitem.years;
                }
                if (importitem.CommonDimension) {
                    component.CommonDimension = importitem.CommonDimension;
                }
                if (importitem.SortedCommonDimension) {
                    component.SortedCommonDimension = importitem.SortedCommonDimension;
                }
                if (importitem.Components) {
                    component.Components = importitem.Components;
                }
                if (importitem.SortedComponents) {
                    component.SortedComponents = importitem.SortedComponents;
                }
            }
            if (component.Components && !component.SortedComponents) {
                let sorted = getNameSortedComponentItems(component.Components, lookups);
                component.SortedComponents = sorted;
            }
            if (component.CommonDimension && !component.SortedCommonDimension) {
                let sorted = getNameSortedComponentItems(component.CommonDimension, lookups);
                component.SortedCommonDimension = sorted;
            }
        }
        if (componentAggregates) {
            assembleComponentAggregates(cumulatingSummaries, componentAggregates);
        }
    }
    return cumulatingSummaries;
};
let getIndexSortedComponentItems = (components, lookups) => {
    let sorted = [];
    let taxonomylookups = lookups.taxonomylookups;
    for (let componentcode in components) {
        let component = components[componentcode];
        let baseline = !!component.Baseline;
        let name = baseline
            ? lookups.baselinelookups[componentcode]
            : taxonomylookups[componentcode];
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
let getNameSortedComponentItems = (components, lookups) => {
    let sorted = [];
    let complookups = lookups.commonDimensionLookups;
    for (let componentname in components) {
        let component = components[componentname];
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
let assembleComponentAggregates = (cumulatingSummaries, componentAggregates) => {
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
    if (componentAggregates.CommonDimension) {
        let CommonDimension = componentAggregates.CommonDimension;
        for (let commonDimensionName in CommonDimension) {
            let commonDimension = CommonDimension[commonDimensionName];
            if (commonDimension.years) {
                let years = commonDimension.years;
                for (let yearname in years) {
                    let yearvalue = years[yearname];
                    let cumulatingCommonDimension = cumulatingSummaries.CommonDimension[commonDimensionName] || { years: {} };
                    if (cumulatingCommonDimension.years[yearname])
                        cumulatingCommonDimension.years[yearname] += yearvalue;
                    else
                        cumulatingCommonDimension.years[yearname] = yearvalue;
                    cumulatingSummaries.CommonDimension[commonDimensionName] = cumulatingCommonDimension;
                }
            }
        }
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = setViewpointData;
