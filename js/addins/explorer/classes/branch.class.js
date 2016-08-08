"use strict";
const databaseapi_1 = require('./databaseapi');
const getbudgetnode_1 = require('../modules/getbudgetnode');
const node_class_1 = require('./node.class');
const constants_1 = require('../../constants');
class BudgetBranch {
    constructor(parms) {
        this.getInitialBranchNodeParms = () => {
            let defaults = this.getProps().declarationData.defaults.node;
            let branchSettings = this.settings;
            let viewpointData = this.state.viewpointData;
            let datapath = [];
            let { viewpoint: viewpointName, facet: facetName, latestYear: rightYear, } = branchSettings;
            let budgetNodeParms = {
                viewpointName: viewpointName,
                facetName: facetName,
                yearSpecs: {
                    leftYear: null,
                    rightYear: rightYear,
                    yearScope: false,
                    firstYear: null,
                    lastYear: null,
                },
                datasetSpecs: viewpointData.DatasetSeries,
                dataPath: [],
                nodeIndex: 0,
            };
            budgetNodeParms = Object.assign(defaults, budgetNodeParms);
            return budgetNodeParms;
        };
        this.addNode = (budgetNodeUid, nodeIndex, budgetNodeParms) => {
            let { actions, nodeCallbacks: callbacks } = this;
            let { dataPath } = budgetNodeParms;
            let branchSettings = this.settings;
            let viewpointData = this.state.viewpointData;
            let nodeData = getbudgetnode_1.default(viewpointData, dataPath);
            let branchNodes = this.nodes;
            let parentNode = (nodeIndex == 0) ? undefined : branchNodes[branchNodes.length - 1].nodeData;
            let budgetNode = new node_class_1.default(budgetNodeParms, budgetNodeUid, nodeData, parentNode);
            branchNodes[nodeIndex] = budgetNode;
            this.setState({
                branchNodes: branchNodes,
            });
        };
        this.saveFacetState = () => {
            let budgetBranch = this;
            let nodes = budgetBranch.nodes;
            for (let node of nodes) {
                node.oldFacetState = node.cells.length;
            }
        };
        this.switchFacet = () => {
            let { actions, nodeCallbacks: callbacks } = this;
            let switchResults = {
                deeperdata: false,
                shallowerdata: false,
            };
            let branchSettings = this.settings;
            let viewpointData = this.state.viewpointData;
            let branchNodes = this.nodes;
            let budgetNode = null;
            let parentBudgetNode;
            let nodeIndex;
            let isError = false;
            let chartParmsObj = null;
            let branchuid = this.uid;
            for (nodeIndex in branchNodes) {
                parentBudgetNode = budgetNode;
                budgetNode = branchNodes[nodeIndex];
                let dataNode = getbudgetnode_1.default(viewpointData, budgetNode.dataPath);
                if (dataNode) {
                    let deeperdata = (!!dataNode.Components && (budgetNode.oldFacetState == 1));
                    let shallowerdata = (!dataNode.Components && (budgetNode.oldFacetState == 2));
                    let parentDataNode = null;
                    if (nodeIndex > 0) {
                        parentDataNode = branchNodes[nodeIndex - 1].nodeData;
                    }
                    if (deeperdata || shallowerdata) {
                        switchResults.deeperdata = deeperdata;
                        switchResults.shallowerdata = shallowerdata;
                        isError = true;
                        let prevBudgetNode = branchNodes[nodeIndex - 1];
                        let removed = branchNodes.splice(nodeIndex);
                        let removedids = removed.map((item) => {
                            return { nodeuid: item.uid, cellList: item.cellList };
                        });
                        actions.removeNodeDeclarations(removedids);
                        setTimeout(() => {
                            let prevBudgetCell = prevBudgetNode.cells[0];
                            let childprops = {
                                selectionrow: prevBudgetCell.chartSelection[0].row,
                                nodeIndex: prevBudgetNode.nodeIndex,
                                cellIndex: 0,
                            };
                            let budgetBranch = this;
                            budgetBranch.createChildNode(childprops);
                        });
                        budgetNode = null;
                    }
                    else {
                        budgetNode.update(branchSettings.facet, dataNode, parentDataNode);
                        let newCells = budgetNode.resetCells();
                        budgetNode.newCells = newCells;
                    }
                }
                else {
                    console.error('no data node');
                }
            }
            this.setState({
                branchNodes: branchNodes,
            });
            return switchResults;
        };
        this.getViewpointData = () => {
            let branchSettings = this.settings;
            let { viewpoint: viewpointName, facet: facetName, inflationAdjusted, } = branchSettings;
            let datasetName = constants_1.FacetNameToDatasetName[facetName];
            let _promise = databaseapi_1.default.getViewpointData({
                viewpointName: viewpointName,
                datasetName: datasetName,
                inflationAdjusted: inflationAdjusted,
                yearSpecs: {
                    leftYear: null,
                    rightYear: null,
                    yearScope: false,
                    firstYear: null,
                    lastYear: null,
                }
            });
            let promise = new Promise(resolve => {
                _promise.then((viewpointdata) => {
                    this.setState({
                        viewpointData: viewpointdata
                    });
                    resolve(true);
                });
            });
            return promise;
        };
        this.createChildNode = (props) => {
            let budgetBranch = this;
            let { nodes: branchNodes, nodeCallbacks: callbacks, actions, settings: branchSettings, } = budgetBranch;
            let viewpointData = budgetBranch.state.viewpointData;
            let { selectionrow, nodeIndex, cellIndex, } = props;
            let budgetNode = branchNodes[nodeIndex];
            let { facetName, viewpointName } = budgetNode;
            let { workingStatus, onPortalCreation, } = callbacks;
            let childdatapath = budgetNode.dataPath.slice();
            let nodeData = budgetNode.nodeData;
            if (!nodeData.Components) {
                return;
            }
            let components = nodeData.Components;
            let code = null;
            let parentData = null;
            let parentNode = null;
            if (nodeData && nodeData.SortedComponents && nodeData.SortedComponents[selectionrow]) {
                parentData = nodeData.SortedComponents[selectionrow];
                parentNode = nodeData;
                code = parentData.Code;
            }
            if (code)
                childdatapath.push(code);
            else {
                return;
            }
            let newnode = nodeData.Components[code];
            if (!newnode.Components && !newnode.Categories) {
                return;
            }
            workingStatus(true);
            let newrange = Object.assign({}, budgetNode.yearSpecs);
            let datasetSpecs = viewpointData.DatasetSeries;
            let newdatanode = getbudgetnode_1.default(viewpointData, childdatapath);
            let newnodeconfigparms = {
                datasetSpecs: datasetSpecs,
                viewpointName: viewpointName,
                facetName: facetName,
                dataPath: childdatapath,
                nodeIndex: nodeIndex + 1,
                parentData: parentData,
                yearSpecs: newrange,
            };
            actions.addNodeDeclaration(newnodeconfigparms);
            setTimeout(() => {
                workingStatus(false);
                setTimeout(() => {
                    onPortalCreation();
                });
            });
        };
        this.settings = parms.settings;
        this.uid = parms.uid;
    }
    get nodes() {
        let copy = [...this.state.branchNodes];
        return copy;
    }
    get state() {
        return this.getState();
    }
    get props() {
        return this.getProps();
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BudgetBranch;
