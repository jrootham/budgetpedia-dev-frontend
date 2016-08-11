// helpcontent.tsx
// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// explorerbranch.tsx

import * as React from 'react'
import {Card, CardTitle, CardText} from 'material-ui/Card'
import SvgIcon from 'material-ui/SvgIcon'
import FontIcon from 'material-ui/FontIcon'

let content = 
<div>
<Card>
    <CardText>
    The best way to become familiar with the explorer is to <span style={{fontStyle:'italic'}}>play with it</span> (experiment).
    Once in a while, review the lists below. Click on any title below for details.
    </CardText>
</Card>
<Card>
    <CardTitle
        actAsExpander={true}
        showExpandableButton={true} >
        Dataset Options
    </CardTitle>
    <CardText expandable style={{paddingTop:"0px"}}>
    <p>There are several dataset options available for charts:</p>
    <dl>
        <dt><strong>Viewpoint</strong></dt>
        <dd> broad approaches to budget (or actual) data, based on similar 
            classification schemes (taxonomies), and data sources.</dd>
        <dt><strong>Version</strong></dt>
        <dd> alternate detailed datasets available for the selected Viewpoint</dd>
        <dt><strong>Aspect</strong></dt>
        <dd> particular aspects of the dataset, such as Revenue, Expenses or Staffing</dd>
        <dt><strong>By Unit</strong></dt>
        <dd> the beginnings of diagnostic analytics, using simple math to view the 
            data compared with relevant related metrics, such as per person or per household</dd>
        <dt><strong>Inflation adjusted</strong></dt>
        <dd> the datasets are updated annually to reflect the Bank of 
            Canada's Inflation Calculator. This makes it possible to get historical perspectives that are
            meaningful in today's dollar terms.
        </dd>
    </dl>
    <p>Choices for the selections are interdependent. Toronto budgets have similar classifications for 
        Revenue and Expenses for example, and therefore these can be viewed together (as offered by the 
         <em>paired</em> and <em>net</em> Aspects). Financial statements 
        on the other hand do not have similar classifications for Revenue and Expenses.
    </p>

    <hr />

    <p><strong><em>Viewpoint</em></strong> choices include:</p>
    <dl>
        <dt><strong>Budget (by function)</strong></dt>
        <dd>combines City of Toronto Agencies and Divisions into groups according to the nature of 
            the services delivered (this is the default). The classification scheme above the 
            Division/Agency level was developed by Budgetpedia project contributors.
        </dd>
        <dt><strong>Budget (by structure)</strong></dt>
        <dd>more traditional: separates Agencies from Divisions, and generally by organizational
            structures. Groupings are closer to those found in City annual Budget Summaries.</dd>
        <dt><strong>Consolidated Statements</strong></dt>
        <dd>
            This reporting structure is manadated by the province (and GAAP -- Generally Accepted
            Accounting Principles), is functional, and is comparable to other municipalities in the 
            province. Summary groupings above the statment level are added by the Budgetpedia project
            for easier access.
        </dd>
        <dt><strong>Expenses by Object</strong></dt>
        <dd>
            Expenses by Object is a restatement of expenses by object of expenditure, such as materials,
            or Wages & Salaries. These categories cross all Divisions and Agencies, and therefore provide a 
            general picture of the ways that money is spent.
        </dd>
    </dl>

    <hr />

    <p>
        <strong><em>Version</em></strong> choices depend on the Viewpoint that is chosen.
    </p>

    <dl>

    <dt><em>For Viewpoint = Budget (both functional and structural), Versions</em> include:</dt>
    <dd>
        <dl>
        <dt><strong>Summary</strong></dt>
        <dt><strong>Detail (PBF)</strong></dt>
        <dt><strong>Variance Reports</strong></dt>
        </dl>
    </dd>
    <dd><em>PBF</em> stands for <em>Public Budget Formulation Tool</em> which is part of the City's new
        FPARS (Financial Planning Analysis and Reporting System) system
    </dd>

    <dt style={{marginTop:"20px"}}><em>For Viewpoint = Consolidated Statements, Versions</em> include:</dt>
    <dd>
        <dl>
        <dt><strong>Consolidated Statements</strong></dt>
        <dt><strong>Financial Information Returns</strong></dt>
        </dl>
    </dd>
    <dd>
        FIR for MMAH = Financial Information Returns for the Ontario Ministry of Municipal Affairs 
        and Housing.
    </dd>
    </dl>
    <hr />

    <p>
        <strong><em>Aspect</em></strong> choices depend on the Viewpoint and Version that is chosen.
    </p>
    <dl>

        <dt><em>For Viewpoint = Budget (both functional and structural), Version = Summary or Detailed, 
            Aspects</em> include:
        </dt>

        <dd>
            <dl>
            <dt><strong>Revenue</strong></dt>
            <dt><strong>Expenses</strong></dt>
            <dt><strong>Both, paired</strong></dt>
            <dt><strong>Staffing</strong></dt>
            </dl>

        </dd>
        <dd> All of these are based on City documents which have similar line items across all aspects. This 
            makes the figures from all sources comparable.
        </dd>
        <dt style={{marginTop:"20px"}}><em>For Viewpoint = Consolidated Statements, any Version, Aspects</em> include:</dt>
        <dd>
            <dl>
                <dt><strong>Revenue (actual)</strong></dt>
                <dt><strong>Revenue (budget)</strong></dt>
                <dt><strong>Revenue (both actual & budget)</strong></dt>
                <dt><strong>Expenses (actual)</strong></dt>
                <dt><strong>Expenses (budget)</strong></dt>
                <dt><strong>Expenses (both actual & budget)</strong></dt>
            </dl>

        </dd>
        <dd>The classification schemes for these are different for each, and therefore they cannot be 
            combined.
        </dd>
        <dt style={{marginTop:"20px"}}><em>For Viewpoint = Expenses by Object, Version = 
            Consolidated Statements, Aspects</em> include:
        </dt>
        <dd>
            <dl>
                <dt><strong>Expenses</strong></dt>
            </dl>
        </dd>
        <dd>These come from notes to the audited financial statements.
        </dd>

        <dt style={{marginTop:"20px"}}><em>For Viewpoint = Budget (both functional and structural), Version = Variance reports, 
            Aspects</em> include:
        </dt>
        <dd>
            <dl>
                <dt><strong>Revenue</strong></dt>
                <dd>
                    <dl>
                    <dt><strong>Budget Revenue</strong></dt>
                    <dt><strong>Actual Revenue</strong></dt>
                    <dt><strong>Both Budget & Actual Revenues, paired</strong></dt>
                    </dl>
                </dd>
                <dt><strong>Expenses</strong></dt>
                <dd>
                    <dl>
                    <dt><strong>Budget Expenses</strong></dt>
                    <dt><strong>Actual Expenses</strong></dt>
                    <dt><strong>Both Budget & Actual Expenses, paired</strong></dt>
                    </dl>
                </dd>
                <dt><strong>Both (Revenue & Expenses)</strong></dt>
                <dd>
                    <dl>
                    <dt><strong>Budget Revenue & Expenses, paired</strong></dt>
                    <dt><strong>Actual Revenue & Expenses, paired</strong></dt>
                    <dt><strong>Both Budget Revenue & Expenses, paired, and Actual Revenue & Expenses, paired</strong></dt>
                    </dl>
                </dd>
                <dt><strong>Staffing</strong></dt>
                <dd>
                    <dl>
                    <dt><strong>Budget Staffing</strong></dt>
                    <dt><strong>Actual Staffing</strong></dt>
                    <dt><strong>Both Budget & Actual Staffing, paired</strong></dt>
                    </dl>
                </dd>
            </dl>
        </dd>
        <dd>When items are paired, net (revenue - expenses) and variance (actual - budget) 
            amounts can be selected through <em>Chart Options</em> on each chart.
        </dd>
    </dl>
    <hr />

    <p>
        <strong><em>By Unit</em></strong> choices are common for all other choices, and include:
    </p>
    <dl>
        <dd>
            <dl>
                <dt><strong>Per staffing position</strong></dt>
                <dt><strong>Population: per person</strong></dt>
                <dt><strong>Population: per 100,000 people</strong></dt>
                <dt><strong>Per household</strong></dt>
            </dl>
        </dd>
    </dl>

    <hr />

    <p>
        <strong><em>Inflation adjusted</em></strong> is on by default, but can be turned off.</p>
   <dl>
   <dd>This uses
        the Bank of Canada's Inflation Calculator to adjust historical figures in terms of recent 
        currency valuations, for more meaningful trend analysis.
    </dd>
    </dl>
    </CardText>

</Card>
<Card>
    <CardTitle
        actAsExpander={true}
        showExpandableButton={true} >
        Chart Options
    </CardTitle>
    <CardText expandable style={{paddingTop:"0px"}}>
    <p> Chart options vary according to the time options selected. The time options available are:</p>
    <dl>
    <dt><SvgIcon style={
        {
            height:"18px",
            width:"18px", 
            padding:"0 3px",
            border:"1px solid silver", 
            borderRadius:"5px",
            verticalAlign:"middle"
        }
    } viewBox = "0 0 36 36" >
            <rect x="13" y="13" width="10" height="10" />
        </SvgIcon> One year (default)</dt>
    <dd> Select a specific year to investigate.
    </dd>
    <dt><SvgIcon style={
        {
            height:"18px",
            width:"18px", 
            padding:"0 3px",
            border:"1px solid silver", 
            borderRadius:"5px",
            verticalAlign:"middle"
        }
    }  viewBox = "0 0 36 36" >
          <rect x="4" y="13" width="10" height="10" />
          <rect x="22" y="13" width="10" height="10" />
        </SvgIcon> Two years</dt><dd> Allows data for two years to be presented side by side for comparison.
    </dd>
    <dt><SvgIcon style={
        {
            height:"18px",
            width:"18px", 
            padding:"0 3px",
            border:"1px solid silver", 
            borderRadius:"5px",
            verticalAlign:"middle"
        }
    }  viewBox = "0 0 36 36" >
            <ellipse cx="6" cy="18" rx="4" ry="4"/>
            <ellipse cx="18" cy="18" rx="4" ry="4"/>
            <ellipse cx="30" cy="18" rx="4" ry="4"/>
        </SvgIcon> All years (all available years)</dt><dd> Shows all available years to investigate trends.
    </dd>
    </dl>
    <p>Specific years can be selected in the selection dropdowns under the charts.</p>

    <hr />

    <dl>
    <dt><SvgIcon style={
        {
            height:"18px",
            width:"18px", 
            padding:"0 3px",
            border:"1px solid silver", 
            borderRadius:"5px",
            verticalAlign:"middle"
        }
    } viewBox = "0 0 36 36" >
            <rect x="13" y="13" width="10" height="10" />
        </SvgIcon> Chart options when one year is chosen include:</dt>
        <dd>
        <dl>
        <dt><FontIcon style={
            {
                height:"18px", 
                width:"18px",
                padding:"0 3px",
                border:"1px solid silver", 
                borderRadius:"5px",
                verticalAlign:"middle",
                fontSize:"18px",
            }
        } className="material-icons">insert_chart</FontIcon> Column Chart</dt>
        <dd> This shows the basics
            of the components of the chart. Float the mouse over the column to see the number,
            or click on a column to drill down.</dd>
        <dt><FontIcon style={
            {
                height:"18px", 
                width:"18px",
                padding:"0 3px",
                border:"1px solid silver", 
                borderRadius:"5px",
                verticalAlign:"middle",
                fontSize:"18px",
            }
        }
        className="material-icons">donut_small</FontIcon> Donut Chart</dt>
        <dd> This shows the percentages of each
        number in relation to the whole.</dd>
        <dt><FontIcon style={
            {
                height:"18px", 
                width:"18px",
                padding:"0 3px",
                border:"1px solid silver", 
                borderRadius:"5px",
                verticalAlign:"middle",
                fontSize:"18px",
            }
        }
        className="material-icons">view_quilt</FontIcon> Context Chart </dt>
        <dd> This is a Tablemap chart, 
            which shows the current chart as a proportion of the overall top-level budget.</dd>
        </dl>
        </dd>
    </dl>

        <hr />

    <dl>
    <dt><SvgIcon style={
        {
            height:"18px",
            width:"18px", 
            padding:"0 3px",
            border:"1px solid silver", 
            borderRadius:"5px",
            verticalAlign:"middle"
        }
    } viewBox = "0 0 36 36" >
          <rect x="4" y="13" width="10" height="10" />
          <rect x="22" y="13" width="10" height="10" />
        </SvgIcon> Chart options when two years is chosen include:</dt>
    <dd>
        <dl>
        <dt><FontIcon style={
            {
                height:"18px", 
                width:"18px",
                padding:"0 3px",
                border:"1px solid silver", 
                borderRadius:"5px",
                verticalAlign:"middle",
                fontSize:"18px",
            }
        } className="material-icons">insert_chart</FontIcon> Column Chart</dt><dd> This is the only
        style of chart offered with the two year selection.</dd>
        <dt><FontIcon style={
            {
                height:"18px", 
                width:"18px",
                padding:"0 3px",
                border:"1px solid silver", 
                borderRadius:"5px",
                verticalAlign:"middle",
                fontSize:"18px",
            }
        }
        className="material-icons">change_history</FontIcon> Year-over-year toggle</dt>
        <dd> This shows the differences
        between the two years chosen.</dd>
        <dt><FontIcon style={
            {
                height:"18px", 
                width:"18px",
                padding:"0 3px",
                border:"1px solid silver", 
                borderRadius:"5px",
                verticalAlign:"middle",
                fontSize:"18px",
            }
        }
        className="material-icons">exposure</FontIcon> Net toggle</dt> 
        <dd>When paired revenue and expenses is the
        Aspect chosen, this toggle combines the two into net figures.</dd>
        <dt><FontIcon style={
            {
                height:"18px", 
                width:"18px",
                padding:"0 3px",
                border:"1px solid silver", 
                borderRadius:"5px",
                verticalAlign:"middle",
                fontSize:"18px",
            }
        }
        className="material-icons">exposure</FontIcon> Variance toggle</dt><dd> When paired budget and actual is the
        Aspect chosen, this toggle combines the two into variance figures.</dd>
        </dl>
    </dd>
    </dl>
    <hr />

    <dl>
    <dt><SvgIcon style={
        {
            height:"18px",
            width:"18px", 
            padding:"0 3px",
            border:"1px solid silver", 
            borderRadius:"5px",
            verticalAlign:"middle"
        }
    } viewBox = "0 0 36 36" >
          <rect x="4" y="13" width="10" height="10" />
          <rect x="22" y="13" width="10" height="10" />
        </SvgIcon> Chart options when all years is chosen include:</dt>
    <dd>
        <dl>
        <dt><FontIcon style={
            {
                height:"18px", 
                width:"18px",
                padding:"0 3px",
                border:"1px solid silver", 
                borderRadius:"5px",
                verticalAlign:"middle",
                fontSize:"18px",
            }
        }
        className="material-icons">timeline</FontIcon> Line Chart</dt>
        <dd> Basic time lines</dd>
        <dt><SvgIcon style={
        {
            height:"18px",
            width:"18px", 
            padding:"0 3px",
            border:"1px solid silver", 
            borderRadius:"5px",
            verticalAlign:"middle"
        }}>
            <path d="M20,6c0-0.587-0.257-1.167-0.75-1.562c-0.863-0.69-2.121-0.551-2.812,0.312l-2.789,3.486L11.2,6.4  c-0.864-0.648-2.087-0.493-2.762,0.351l-4,5C4.144,12.119,4,12.562,4,13v3h16V6z"/>
            <path d="M20,19H4c-0.552,0-1,0.447-1,1s0.448,1,1,1h16c0.552,0,1-0.447,1-1S20.552,19,20,19z"/>
        </SvgIcon> Area Chart</dt>
        <dd> Same data as timelines, but stacked.</dd>
        <dt><FontIcon style={
            {
                height:"18px", 
                width:"18px",
                padding:"0 3px",
                border:"1px solid silver", 
                borderRadius:"5px",
                verticalAlign:"middle",
                fontSize:"18px",
            }
        } className="material-icons">view_stream</FontIcon> Proportional Chart </dt>
        <dd> All lines add to 100%; 
            individual amounts are shown in proportion to the whole.</dd>
        <dt><FontIcon style={
            {
                height:"18px", 
                width:"18px",
                padding:"0 3px",
                border:"1px solid silver", 
                borderRadius:"5px",
                verticalAlign:"middle",
                fontSize:"18px",
            }
        }
        className="material-icons">change_history</FontIcon> Year-over-year toggle </dt>
        <dd> This shows the differences between adjacent years on a rolling basis.</dd>
        <dt><FontIcon style={
            {
                height:"18px", 
                width:"18px",
                padding:"0 3px",
                border:"1px solid silver", 
                borderRadius:"5px",
                verticalAlign:"middle",
                fontSize:"18px",
            }
        }
        className="material-icons">exposure</FontIcon> Net toggle </dt>
        <dd> When paired revenue and expenses is the
        Aspect chosen, this toggle is set and net figures (revenue - expenses) are shown.</dd>
        <dt><FontIcon style={
            {
                height:"18px", 
                width:"18px",
                padding:"0 3px",
                border:"1px solid silver", 
                borderRadius:"5px",
                verticalAlign:"middle",
                fontSize:"18px",
            }
        }
        className="material-icons">exposure</FontIcon> Variance toggle </dt>
        <dd> When paired budget and actual is the
        Aspect chosen, this toggle is set and variance figures (budget - actual) are shown.</dd>
        </dl>
        </dd>
        </dl>
    </CardText>
</Card>
<Card>
    <CardTitle
        actAsExpander={true}
        showExpandableButton={true} >
        Context Options
    </CardTitle>
    <CardText expandable style={{paddingTop:"0px"}}>
    <p> Context options are offered to provide contextual information for the data being viewed, and
    to afford the reader the opportunity to contribute to the process surrounding the budget. These
    are the options offered, found under each chart:</p>
    <dl>
        <dt><FontIcon 
            style={
                {
                    height:"18px", 
                    width:"18px",
                    padding:"0 3px",
                    border:"1px solid silver", 
                    borderRadius:"5px",
                    verticalAlign:"middle",
                    fontSize:"18px",
                }
            }
            className="material-icons">info_outline
            </FontIcon> The <em>information</em> icon 
        </dt>
        <dd>invokes a dialog containing information related to the current
            data. This could be brief explanations, links to related information, or links to websites
            which specialize in the subject matter. The idea is to allow the reader to discover more context 
            and detail about the subject matter at hand.
        </dd>
        <dt><FontIcon 
            style={
                {
                    height:"18px", 
                    width:"18px",
                    padding:"0 3px",
                    border:"1px solid silver", 
                    borderRadius:"5px",
                    verticalAlign:"middle",
                    fontSize:"18px",
                }
            }
            className="material-icons">note</FontIcon> The <em>notes</em> icon
        </dt>
        <dd>invokes detailed technical information about the 
            data presented, including source documents, exceptions, errors, and any relevant notes about the
            way the data was processed. If there are errors or exceptions in place, the note icon changes
            colour to red or orange, depending on severity.
        </dd>
        <dt><FontIcon 
            style={
                {
                    height:"18px", 
                    width:"18px",
                    padding:"0 3px",
                    border:"1px solid silver", 
                    borderRadius:"5px",
                    verticalAlign:"middle",
                    fontSize:"18px",
                }
            }
            className="material-icons">share</FontIcon> The <em>share</em> icon </dt> 
            <dd>provides access to relevant social media
            sites, to allow readers to read or contribute to discussion about the subject at hand.
        </dd>
        <dt><FontIcon 
            style={
                {
                    height:"18px", 
                    width:"18px",
                    padding:"0 3px",
                    border:"1px solid silver", 
                    borderRadius:"5px",
                    verticalAlign:"middle",
                    fontSize:"18px",
                }
            }
            className="material-icons">announcement</FontIcon> The <em>announcement</em> icon 
        </dt>
        <dd>provides the user with 
            lists of calls to actions or meetings related to the subject matter, or to contribute their own
            call to action or meetings.
        </dd>
        <dt><FontIcon 
            style={
                {
                    height:"18px", 
                    width:"18px",
                    padding:"0 3px",
                    border:"1px solid silver", 
                    borderRadius:"5px",
                    verticalAlign:"middle",
                    fontSize:"18px",
                }
            }
            className="material-icons">view_list</FontIcon> The <em>data</em> icon 
        </dt>
        <dd>brings up the data underlying the currently viewed chart, with an option to download same.
        </dd>
        <dt><FontIcon 
            style={
                {
                    height:"18px", 
                    width:"18px",
                    padding:"0 3px",
                    border:"1px solid silver", 
                    borderRadius:"5px",
                    verticalAlign:"middle",
                    fontSize:"18px",
                }
            }
            className="material-icons">swap_horiz</FontIcon> The <em>harmonize</em> icon 
        </dt>
        <dd> allows the user to impose the 
            settings made in the current chart to the other charts in the row or exhibit.
        </dd>
    </dl>
    </CardText>
</Card>
<Card>
    <CardTitle
        actAsExpander={true}
        showExpandableButton={true} >
        Cloning Features
    </CardTitle>
    <CardText expandable style={{paddingTop:"0px"}}>
    cloning features content
    </CardText>
</Card>
<Card>
    <CardTitle
        actAsExpander={true}
        showExpandableButton={true} >
        Actionable Features
    </CardTitle>
    <CardText expandable style={{paddingTop:"0px"}}>
    actionable features content
    </CardText>
</Card>
<Card>
    <CardTitle
        actAsExpander={true}
        showExpandableButton={true} >
        Assembling and printing reports
    </CardTitle>
    <CardText expandable style={{paddingTop:"0px"}}>
    assembling and printing reports content
    </CardText>
</Card>
<Card>
    <CardTitle
        actAsExpander={true}
        showExpandableButton={true} >
        Saving and sharing workspaces
    </CardTitle>
    <CardText expandable style={{paddingTop:"0px"}}>
    saving and sharing workspaces content
    </CardText>
</Card>
</div>

export default content