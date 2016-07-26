"use strict";
const databaseapi_1 = require('./databaseapi');
const getbudgetnode_1 = require('../modules/getbudgetnode');
const node_class_1 = require('./node.class');
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
                timeSpecs: {
                    leftYear: null,
                    rightYear: rightYear,
                    spanYears: false,
                    firstYear: null,
                    lastYear: null,
                },
                portalCharts: viewpointData.PortalCharts,
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
            let dataNode = getbudgetnode_1.default(viewpointData, dataPath);
            let branchNodes = this.nodes;
            let parentNode = (nodeIndex == 0) ? undefined : branchNodes[branchNodes.length - 1].dataNode;
            let budgetNode = new node_class_1.default(budgetNodeParms, budgetNodeUid, dataNode, parentNode);
            branchNodes[nodeIndex] = budgetNode;
            this.setState({
                branchNodes: branchNodes,
            });
        };
        this.getViewpointData = () => {
            let branchSettings = this.settings;
            let { viewpoint: viewpointName, facet: datasetName, inflationAdjusted, } = branchSettings;
            let viewpointdata = databaseapi_1.default.getViewpointData({
                viewpointName: viewpointName,
                datasetName: datasetName,
                inflationAdjusted: inflationAdjusted,
                timeSpecs: {
                    leftYear: null,
                    rightYear: null,
                    spanYears: false,
                    firstYear: null,
                    lastYear: null,
                }
            });
            this.setState({
                viewpointData: viewpointdata
            });
        };
        this.createChildNode = (props) => {
            let budgetBranch = this;
            let { nodes: branchNodes, nodeCallbacks: callbacks, actions, settings: branchSettings, } = budgetBranch;
            let viewpointData = budgetBranch.state.viewpointData;
            let { selectionrow, nodeIndex, cellIndex, } = props;
            let budgetNode = branchNodes[nodeIndex];
            let { facetName, viewpointName } = budgetNode;
            let { workingStatus, onPortalCreation, updateChartSelections, } = callbacks;
            let childdatapath = budgetNode.dataPath.slice();
            let dataNode = budgetNode.dataNode;
            if (!dataNode.Components) {
                return;
            }
            let components = dataNode.Components;
            let code = null;
            let parentData = null;
            let parentNode = null;
            if (dataNode && dataNode.SortedComponents && dataNode.SortedComponents[selectionrow]) {
                parentData = dataNode.SortedComponents[selectionrow];
                parentNode = dataNode;
                code = parentData.Code;
            }
            if (code)
                childdatapath.push(code);
            else {
                return;
            }
            let newnode = dataNode.Components[code];
            if (!newnode.Components && !newnode.Categories) {
                return;
            }
            workingStatus(true);
            let newrange = Object.assign({}, budgetNode.timeSpecs);
            let portalCharts = viewpointData.PortalCharts;
            let newdatanode = getbudgetnode_1.default(viewpointData, childdatapath);
            let newnodeconfigparms = {
                portalCharts: portalCharts,
                viewpointName: viewpointName,
                facetName: facetName,
                dataPath: childdatapath,
                nodeIndex: nodeIndex + 1,
                parentData: parentData,
                timeSpecs: newrange,
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
    switchFacet() {
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
            let nextdataNode = getbudgetnode_1.default(viewpointData, budgetNode.dataPath);
            if (nextdataNode) {
                let deeperdata = (!!nextdataNode.Components && (budgetNode.cells.length == 1));
                let shallowerdata = (!nextdataNode.Components && (budgetNode.cells.length == 2));
                budgetNode.update(nextdataNode, branchSettings.facet);
                if (deeperdata || shallowerdata) {
                    switchResults.deeperdata = deeperdata;
                    switchResults.shallowerdata = shallowerdata;
                    isError = true;
                    let prevBudgetNode = branchNodes[nodeIndex - 1];
                    let removed = branchNodes.splice(nodeIndex);
                    let removedids = removed.map((item) => {
                        return { uid: item.uid, cellList: item.cellList };
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
            }
            else {
                console.error('no data node');
            }
        }
        this.setState({
            branchNodes: branchNodes,
        });
        return switchResults;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BudgetBranch;
