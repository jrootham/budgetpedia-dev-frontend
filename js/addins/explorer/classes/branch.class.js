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
            let budgetBranch = this;
            let datapath = [];
            let { viewpoint: viewpointName, aspect: aspectName, } = branchSettings;
            let budgetNodeParms = {
                viewpointName: viewpointName,
                aspectName: aspectName,
                yearSpecs: {
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
            let budgetBranch = this;
            let { dataPath } = budgetNodeParms;
            let branchSettings = budgetBranch.settings;
            let branchNode = budgetBranch;
            let viewpointData = budgetBranch.state.viewpointData;
            if (!viewpointData)
                return;
            let treeNodeData = getbudgetnode_1.default(viewpointData, dataPath);
            let branchNodes = budgetBranch.nodes;
            let parentNode = (nodeIndex === 0) ? null : branchNodes[branchNodes.length - 1];
            let budgetNode = new node_class_1.default(budgetNodeParms, budgetNodeUid, treeNodeData, parentNode);
            branchNodes[nodeIndex] = budgetNode;
            budgetBranch.setState({
                branchNodes: branchNodes,
            });
        };
        this.saveAspectState = () => {
            let budgetBranch = this;
            let nodes = budgetBranch.nodes;
            let node;
            for (node of nodes) {
                node.oldAspectState = !!node.treeNodeData.Components;
            }
        };
        this.toggleInflationAdjusted = () => {
            let budgetBranch = this;
            let nodeIndex;
            let branchuid = budgetBranch.uid;
            let branchSettings = budgetBranch.settings;
            let viewpointData = budgetBranch.state.viewpointData;
            let branchNodes = budgetBranch.nodes;
            for (nodeIndex in branchNodes) {
                let budgetNode = branchNodes[nodeIndex];
                let dataNode = getbudgetnode_1.default(viewpointData, budgetNode.dataPath);
                let parentDataNode = null;
                if (nodeIndex > 0) {
                    parentDataNode = branchNodes[nodeIndex - 1].treeNodeData;
                }
                budgetNode.updateDataNode(dataNode, parentDataNode);
                budgetNode.resetCells();
            }
            budgetBranch.setState({
                branchNodes: branchNodes,
            });
        };
        this.switchAspect = () => {
            let budgetBranch = this;
            let { actions, nodeCallbacks: callbacks } = budgetBranch;
            let switchResults = {
                deeperdata: false,
                shallowerdata: false,
                mismatch: false,
                message: null,
            };
            let branchSettings = budgetBranch.settings;
            let viewpointData = budgetBranch.state.viewpointData;
            let branchNodes = budgetBranch.nodes;
            let budgetNode = null;
            let parentBudgetNode;
            let nodeIndex;
            let isError = false;
            let chartParmsObj = null;
            let branchuid = budgetBranch.uid;
            for (nodeIndex in branchNodes) {
                parentBudgetNode = budgetNode;
                budgetNode = branchNodes[nodeIndex];
                let dataNode = getbudgetnode_1.default(viewpointData, budgetNode.dataPath);
                if (dataNode) {
                    let deeperdata = ((!!dataNode.Components) && (!budgetNode.oldAspectState));
                    let shallowerdata = ((!dataNode.Components) && (budgetNode.oldAspectState));
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
                            budgetBranch.createChildNode(childprops);
                        });
                        budgetNode = null;
                    }
                    else {
                        budgetNode.updateAspect(branchSettings.aspect, dataNode, parentDataNode);
                        budgetNode.resetCells();
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
                        budgetNode.treeNodeMetaDataFromParentSortedList.Name;
                    let cells = parentBudgetNode.cells;
                    for (let cell of cells) {
                        let theCell = cell;
                        if (theCell.chartSelection) {
                            theCell.chartSelection = null;
                        }
                    }
                }
            }
            budgetBranch.setState({
                branchNodes: branchNodes,
            });
            return switchResults;
        };
        this.getViewpointData = () => {
            let branchSettings = this.settings;
            let { viewpoint: viewpointName, aspect: aspectName, inflationAdjusted, version: versionName, repository, } = branchSettings;
            let datasetName = constants_1.AspectNameToDatasetName[aspectName];
            let _promise = databaseapi_1.default.getViewpointData({
                repository: repository,
                viewpointName: viewpointName,
                versionName: versionName,
                datasetName: datasetName,
                inflationAdjusted: inflationAdjusted
            });
            let promise = new Promise((resolve, error) => {
                _promise.then((viewpointdata) => {
                    let budgetBranch = this;
                    budgetBranch.setState({
                        viewpointData: viewpointdata
                    });
                    resolve(true);
                }).catch(reason => {
                    console.error(reason);
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
            let treeNodeMetaDataFromParentSortedList = null;
            let parentNode = null;
            if (treeNodeData && treeNodeData.SortedComponents && treeNodeData.SortedComponents[selectionrow]) {
                treeNodeMetaDataFromParentSortedList = treeNodeData.SortedComponents[selectionrow];
                parentNode = treeNodeData;
                code = treeNodeMetaDataFromParentSortedList.Code;
            }
            if (code)
                childdatapath.push(code);
            else {
                return;
            }
            let newnode = treeNodeData.Components[code];
            if (!newnode.Components && !newnode.CommonDimension) {
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
                treeNodeMetaDataFromParentSortedList: treeNodeMetaDataFromParentSortedList,
                yearSpecs: newrange,
            };
            actions.addNodeDeclaration(newnodeconfigparms);
            setTimeout(() => {
                workingStatus(false);
                onPortalCreation();
            });
        };
        this.uid = parms.uid;
    }
    get nodes() {
        let copy = [...this.state.branchNodes];
        return copy;
    }
    get settings() {
        return this.props.declarationData.branchesById[this.uid];
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
