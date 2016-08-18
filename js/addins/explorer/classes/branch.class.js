"use strict";
const databaseapi_1 = require('./databaseapi');
const getbudgetnode_1 = require('../modules/getbudgetnode');
const node_class_1 = require('./node.class');
const constants_1 = require('../constants');
class BudgetBranch {
    constructor(parms) {
        this.getInitialBranchNodeParms = () => {
            let defaults = this.getProps().declarationData.defaults.node;
            let branchSettings = this.settings;
            let viewpointData = this.state.viewpointData;
            let datapath = [];
            let { viewpoint: viewpointName, aspect: aspectName, yearSelector, } = branchSettings;
            let { rightYear } = yearSelector;
            let budgetNodeParms = {
                viewpointName: viewpointName,
                aspectName: aspectName,
                yearSpecs: {
                    leftYear: null,
                    rightYear: rightYear,
                    yearScope: branchSettings.yearScope,
                    firstYear: null,
                    lastYear: null,
                },
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
            let treeNodeData = getbudgetnode_1.default(viewpointData, dataPath);
            let branchNodes = this.nodes;
            let parentNode = (nodeIndex == 0) ? null : branchNodes[branchNodes.length - 1];
            let budgetNode = new node_class_1.default(budgetNodeParms, budgetNodeUid, treeNodeData, parentNode);
            branchNodes[nodeIndex] = budgetNode;
            this.setState({
                branchNodes: branchNodes,
            });
        };
        this.saveAspectState = () => {
            let budgetBranch = this;
            let nodes = budgetBranch.nodes;
            for (let node of nodes) {
                node.oldAspectState = node.cells.length;
            }
        };
        this.switchAspect = () => {
            let { actions, nodeCallbacks: callbacks } = this;
            let switchResults = {
                deeperdata: false,
                shallowerdata: false,
                mismatch: false,
                message: null,
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
                    let deeperdata = (!!dataNode.Components && (budgetNode.oldAspectState == 1));
                    let shallowerdata = (!dataNode.Components && (budgetNode.oldAspectState == 2));
                    let parentDataNode = null;
                    if (nodeIndex > 0) {
                        parentDataNode = branchNodes[nodeIndex - 1].treeNodeData;
                    }
                    if (deeperdata || shallowerdata) {
                        switchResults.deeperdata = deeperdata;
                        switchResults.shallowerdata = shallowerdata;
                        isError = true;
                        let prevBudgetNode = branchNodes[nodeIndex - 1];
                        let removed = branchNodes.splice(nodeIndex);
                        let removedids = removed.map((item) => {
                            return { nodeuid: item.uid, cellList: item.cellDeclarationList };
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
                        budgetNode.update(branchSettings.aspect, dataNode, parentDataNode);
                        let newCells = budgetNode.resetCells();
                        budgetNode.newCells = newCells;
                    }
                }
                else {
                    let removed = branchNodes.splice(nodeIndex);
                    let removedids = removed.map((item) => {
                        return { nodeuid: item.uid, cellList: item.cellDeclarationList };
                    });
                    actions.removeNodeDeclarations(removedids);
                    switchResults.mismatch = true;
                    switchResults.message = 'The new aspect does not have a matching chart for ' +
                        budgetNode.treeNodeMetaData.Name;
                    let cells = parentBudgetNode.cells;
                    for (let cell of cells) {
                        let theCell = cell;
                        if (theCell.chartSelection) {
                            theCell.chartSelection = null;
                        }
                    }
                }
            }
            this.setState({
                branchNodes: branchNodes,
            });
            return switchResults;
        };
        this.getViewpointData = () => {
            let branchSettings = this.settings;
            let { viewpoint: viewpointName, aspect: aspectName, inflationAdjusted, } = branchSettings;
            let datasetName = constants_1.AspectNameToDatasetName[aspectName];
            let _promise = databaseapi_1.default.getViewpointData({
                viewpointName: viewpointName,
                versionName: 'PBFT',
                datasetName: datasetName,
                inflationAdjusted: inflationAdjusted,
                yearSpecs: {
                    leftYear: null,
                    rightYear: null,
                    yearScope: null,
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
            let { aspectName, viewpointName } = budgetNode;
            let { workingStatus, onPortalCreation, } = callbacks;
            let childdatapath = budgetNode.dataPath.slice();
            let treeNodeData = budgetNode.treeNodeData;
            if (!treeNodeData.Components) {
                return;
            }
            let components = treeNodeData.Components;
            let code = null;
            let treeNodeMetaData = null;
            let parentNode = null;
            if (treeNodeData && treeNodeData.SortedComponents && treeNodeData.SortedComponents[selectionrow]) {
                treeNodeMetaData = treeNodeData.SortedComponents[selectionrow];
                parentNode = treeNodeData;
                code = treeNodeMetaData.Code;
            }
            if (code)
                childdatapath.push(code);
            else {
                return;
            }
            let newnode = treeNodeData.Components[code];
            if (!newnode.Components && !newnode.CommonObjects) {
                return;
            }
            workingStatus(true);
            let newrange = Object.assign({}, budgetNode.yearSpecs);
            let newdatanode = getbudgetnode_1.default(viewpointData, childdatapath);
            let newnodeconfigparms = {
                viewpointName: viewpointName,
                aspectName: aspectName,
                dataPath: childdatapath,
                nodeIndex: nodeIndex + 1,
                treeNodeMetaData: treeNodeMetaData,
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
