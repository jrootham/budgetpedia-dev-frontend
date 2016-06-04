// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// explorerbranch.tsx

'use strict'
import * as React from 'react'
var { Component } = React

import {
    MatrixNodeConfig,
    ChartParms,
    ChartParmsObj,
    ChartSelectionContext,
    MatrixLocation,
    PortalConfig,
    ChartSettings,
    PortalChartLocation,
    ChartConfig,
    GetChartParmsProps,
    GetChartParmsCallbacks,
} from '../controllers/explorer/interfaces'

import { ExplorerPortal } from './explorerportal'
import DropDownMenu from 'material-ui/DropDownMenu'
import { ChartSeries } from '../constants'
import IconButton from 'material-ui/IconButton'
import MenuItem from 'material-ui/MenuItem'
import FontIcon from 'material-ui/FontIcon'

interface ExploreBranchProps {
    budgetdata: any,
    chartmatrix: any,
    userselections: any,
    callbacks: any,
    branchScrollBlocks: any,
}

class ExplorerBranch extends Component<ExploreBranchProps, any> {

    callbacks = this.props.callbacks
    // get React components to render
    getPortals = (matrixcolumn, matrixrow) => {

        let userselections = this.props.userselections

        let budgetdata = this.props.budgetdata

        let portaltitles = budgetdata.DataSeries[userselections.dataseries].Titles
        let dataseries = budgetdata.DataSeries[userselections.dataseries]
        let portalseriesname = dataseries.Name
        if (dataseries.Units == 'DOLLAR') {
            portalseriesname += ' (' + dataseries.UnitsAlias + ')'
        }

        let portals = matrixcolumn.map((nodeconfig: MatrixNodeConfig, index) => {

            let portalcharts = []

            for (let chartindex in nodeconfig.charts) {

                let chartblocktitle = null
                if (//(nodeconfig.datanode.Contents == 'BASELINE') ||
                    (nodeconfig.charts[chartindex].nodedatapropertyname == 'Categories')) {
                    chartblocktitle = portaltitles.Categories
                } else {
                    chartblocktitle = portaltitles.Baseline
                }

                let chartparms = nodeconfig.charts[chartindex].chartparms

                let location = {
                    matrixlocation: nodeconfig.matrixlocation,
                    portalindex: Number(chartindex)
                }
                let explorer = this
                let chartsettings: ChartSettings = {
                    // matrixlocation: chartconfig.matrixlocation,
                    onSwitchChartCode: ((location) => {
                        return (chartCode) => {
                            this.callbacks.switchChartCode(location, chartCode)
                        }
                    })(location),
                    chartCode: nodeconfig.charts[chartindex].chartCode,
                    graph_id: "ChartID" + matrixrow + '-' + index + '-' + chartindex,
                    // index,
                }

                let portalchart: ChartConfig = {
                    chartparms,
                    chartsettings,
                    chartblocktitle: "By " + chartblocktitle,
                }

                portalcharts.push(portalchart)

            }
            let portalname = null
            if (nodeconfig.parentdata) {
                portalname = nodeconfig.parentdata.Name
            } else {
                portalname = 'City Budget'
            }

            portalname += ' ' + portalseriesname

            let budgetPortal: PortalConfig = {
                portalCharts: portalcharts,
                portalName: portalname,
                // onChangeBudgetPortal:this.onChangeBudgetPortalChart,
                matrixLocation: {
                    column: matrixcolumn,
                    row: matrixrow,
                }
            }

            return <ExplorerPortal
                key = {index}
                budgetPortal = { budgetPortal }
                onChangePortalChart = { this.callbacks.onChangeBudgetPortalChart }
                />
        })

        return portals

    }

    render() {

    let branch = this
    let drilldownbranch = branch.props.chartmatrix[ChartSeries.DrillDown]

    let drilldownportals = branch.getPortals(drilldownbranch, ChartSeries.DrillDown)
    return <div >
    <div>
        <span style={{ fontStyle: "italic" }}>Viewpoint: </span>
        <DropDownMenu
            value={this.props.userselections.viewpoint}
            style={{
            }}
            onChange={
                (e, index, value) => {
                    branch.callbacks.switchViewpoint(value, ChartSeries.DrillDown)
                }
            }
            >
            <MenuItem value={'FUNCTIONAL'} primaryText="Functional"/>
            <MenuItem value={'STRUCTURAL'} primaryText="Structural"/>
        </DropDownMenu>

        <span style={{ margin: "0 10px 0 10px", fontStyle: "italic" }}>Facets: </span>

        <IconButton
            tooltip="Expenditures"
            tooltipPosition="top-center"
            onTouchTap= {
                e => {
                    branch.callbacks.switchDataSeries('BudgetExpenses', ChartSeries.DrillDown)
                }
            }
            style={
                {
                    backgroundColor: (this.props.userselections.dataseries == 'BudgetExpenses')
                        ? "rgba(144,238,144,0.5)"
                        : 'transparent',
                    borderRadius: "50%"
                }
            }>
            <FontIcon className="material-icons">attach_money</FontIcon>
        </IconButton>

        <IconButton
            tooltip="Revenues"
            tooltipPosition="top-center"
            onTouchTap= {
                e => {
                    branch.callbacks.switchDataSeries('BudgetRevenues', ChartSeries.DrillDown)
                }
            }
            style={
                {
                    backgroundColor: (this.props.userselections.dataseries == 'BudgetRevenues')
                        ? "rgba(144,238,144,0.5)"
                        : 'transparent',
                    borderRadius: "50%"
                }
            }>
            <FontIcon className="material-icons">receipt</FontIcon>
        </IconButton>

        <IconButton
            tooltip="Staffing"
            tooltipPosition="top-center"
            onTouchTap= {
                e => {
                    branch.callbacks.switchDataSeries('BudgetStaffing', ChartSeries.DrillDown)
                }
            }
            style={
                {
                    backgroundColor: (this.props.userselections.dataseries == 'BudgetStaffing')
                        ? "rgba(144,238,144,0.5)"
                        : 'transparent',
                    borderRadius: "50%"
                }
            }>
            >
            <FontIcon className="material-icons">people</FontIcon>
        </IconButton >

    </div>

    <div style={{ whiteSpace: "nowrap" }}>
        <div ref={node => {
            branch.props.branchScrollBlocks[ChartSeries.DrillDown] = node
        } } style={{ overflow: "scroll" }}>

            { drilldownportals }

            <div style={{ display: "inline-block", width: "500px" }}></div>

        </div>
    </div>
                </div >
    }

}

export { ExplorerBranch }
