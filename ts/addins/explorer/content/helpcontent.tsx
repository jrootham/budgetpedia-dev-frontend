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
    <ul>
        <li><strong>Viewpoint:</strong> broad approaches to budget (or actual) data, based on similar 
            classification schemes (taxonomies), and data sources.</li>
        <li><strong>Version:</strong> alternate detailed datasets available for the selected Viewpoint</li>
        <li><strong>Aspect:</strong> particular aspects of the dataset, such as Revenue, Expenses or Staffing</li>
        <li><strong>By Unit:</strong> the beginnings of diagnostic analytics, using simple math to view the 
            data compared with relevant related metrics, such as per person or per household</li>
        <li><strong>Inflation adjusted:</strong> the datasets are updated annually to reflect the Bank of 
            Canada's Inflation Calculator. This makes it possible to get historical perspectives that are
            meaningful in today's dollar terms.
        </li>
    </ul>
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
    <p><em>For Viewpoint = Budget (both functional and structural), Versions</em> include:</p>
    <blockquote>
        <ul>
        <li>Summary</li>
        <li>Detail (PBF)</li>
        <li>Variance Reports</li>
        </ul>
        <p><em>PBF</em> stands for <em>Public Budget Formulation Tool</em> which is part of the City's new
        FPARS (Financial Planning Analysis and Reporting System) system</p>
    </blockquote>
    <p><em>For Viewpoint = Consolidated Statements, Versions</em> include:</p>
    <blockquote>
        <ul>
        <li>Consolidated Statements</li>
        <li>Financial Information Returns</li>
        </ul>
        <p>FIR for MMAH = Financial Information Returns for the Ontario Ministry of Municipal Affairs 
        and Housing.</p>
    </blockquote>

    <hr />

    <p>
        <strong><em>Aspect</em></strong> choices depend on the Viewpoint and Version that is chosen.
    </p>
    <p><em>For Viewpoint = Budget (both functional and structural), Version = Summary or Detailed, 
        Aspects</em> include:
    </p>

    <blockquote>
        <ul>
        <li>Revenue</li>
        <li>Expenses</li>
        <li>Both, paired</li>
        <li>Net</li>
        <li>Staffing</li>
        </ul>
    <p> All of these are based on City documents which have similar line items across all aspects. This 
        makes the figures from all sources comparable.
    </p>
    </blockquote>

        <p><em>For Viewpoint = Consolidated Statements, any Version, Aspects</em> include:</p>
    <blockquote>
        <ul>
        <li>Revenue (actual)</li>
        <li>Revenue (budget)</li>
        <li>Revenue (both actual & budget)</li>
        <li>Expenses (actual)</li>
        <li>Expenses (budget)</li>
        <li>Expenses (both actual & budget)</li>
        </ul>

    <p>The classification schemes for these are different for each, and therefore they cannot be 
        combined.
    </p>
    </blockquote>
        <p><em>For Viewpoint = Expenses by Object, Version = Consolidated Statements, Aspects</em> include:</p>
    <blockquote>
        <ul>
        <li>Expenses</li>
        </ul>
    <p>These come from notes to the audited financial statements.
    </p>
    </blockquote>

    <p><em>For Viewpoint = Budget (both functional and structural), Version = Variance reports, 
        Aspects</em> include:
    </p>
    <blockquote>
        <ul>
        <li>Revenue
            <ul>
            <li>Budget Revenue</li>
            <li>Actual Revenue</li>
            <li>Both Budget & Actual Revenues, paired</li>
            </ul>
        </li>
        <li>Expenses
            <ul>
            <li>Budget Expenses</li>
            <li>Actual Expenses</li>
            <li>Both Budget & Actual Expenses, paired</li>
            </ul>
        </li>
        <li>Both (Revenue & Expenses)
            <ul>
            <li>Budget Revenue & Expenses, paired</li>
            <li>Actual Revenue & Expenses, paired</li>
            <li>Both Budget Revenue & Expenses, paired, and Actual Revenue & Expenses, paired</li>
            </ul>
        </li>
        <li>Staffing
            <ul>
            <li>Budget Staffing</li>
            <li>Actual Staffing</li>
            <li>Both Budget & Actual Staffing, paired</li>
            </ul>
        </li>
        </ul>
        <p>When items are paired, net (revenue - expenses) and variance (actual - budget) amounts can be selected for each chart.</p>
    </blockquote>

    <hr />

    <p>
        <strong><em>By Unit</em></strong> choices are common for all other choices, and include:
    </p>
    <blockquote>
    <ul>
        <li>Per staffing position</li>
        <li>Population: per person</li>
        <li>Population: per 100,000 people</li>
        <li>Per household</li>
    </ul>
    </blockquote>

    <hr />

    <p>
        <strong><em>Inflation adjusted</em></strong> is on by default, but can be turned off. This uses
        the Bank of Canada's Inflation Calculator to adjust historical figures in terms of recent 
        currency valuations, for more meaningful trend analysis.
    </p>
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
    <ul>
    <li><SvgIcon style={
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
        </SvgIcon> One year (default). Select a specific year to investigate.
    </li>
    <li><SvgIcon style={
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
        </SvgIcon> Two years. Allows data for two years to be presented side by side for comparison.
    </li>
    <li><SvgIcon style={
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
        </SvgIcon> All years (all available years). Shows all available years to investigate trends.
    </li>
    </ul>
    <p>Specific years can be selected in the selection boxes under the charts.</p>

    <hr />

    <p><SvgIcon style={
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
        </SvgIcon> Chart options when one year is chose include:</p>
        <ul>
        <li><FontIcon style={
            {
                height:"18px", 
                width:"18px",
                padding:"0 3px",
                border:"1px solid silver", 
                borderRadius:"5px",
                verticalAlign:"middle",
                fontSize:"18px",
            }
        } className="material-icons">insert_chart</FontIcon> Column Chart. This shows the basics
            of the components of the chart. Float the mouse over the column to see the number,
            or click on a column to drill down.</li>
        <li><FontIcon style={
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
        className="material-icons">donut_small</FontIcon> Donut Chart. This shows the percentages of each
        number in relation to the whole.</li>
        <li><FontIcon style={
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
        className="material-icons">view_quilt</FontIcon> Context Chart. This is a Tablemap chart, 
            which shows the current chart as a proportion of the overall top-level budget.</li>
        </ul>

        <hr />

    <p><SvgIcon style={
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
        </SvgIcon> Chart options when two years is chose include:</p>
        <ul>
        <li><FontIcon style={
            {
                height:"18px", 
                width:"18px",
                padding:"0 3px",
                border:"1px solid silver", 
                borderRadius:"5px",
                verticalAlign:"middle",
                fontSize:"18px",
            }
        } className="material-icons">insert_chart</FontIcon> Column Chart. This is the only
        style of chart offered with the two year selection.</li>
        <li><FontIcon style={
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
        className="material-icons">change_history</FontIcon> Year-over-year toggle. This shows the differences
        between the two years chosen.</li>
        <li><FontIcon style={
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
        className="material-icons">exposure</FontIcon> Net toggle. When paired revenue and expenses is the
        Aspect chosen, this toggle combines the two into net figures.</li>
        <li><FontIcon style={
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
        className="material-icons">exposure</FontIcon> Variance toggle. When paired budget and actual is the
        Aspect chosen, this toggle combines the two into variance figures.</li>
        </ul>

    <hr />

    <p><SvgIcon style={
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
        </SvgIcon> Chart options when all years is chose include:</p>
        <ul>
        <li><FontIcon style={
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
        className="material-icons">timeline</FontIcon> Line Chart. Basic time lines</li>
        <li><SvgIcon style={
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
        </SvgIcon> Area Chart. Same data as timelines, but stacked.</li>
        <li><FontIcon style={
            {
                height:"18px", 
                width:"18px",
                padding:"0 3px",
                border:"1px solid silver", 
                borderRadius:"5px",
                verticalAlign:"middle",
                fontSize:"18px",
            }
        } className="material-icons">view_stream</FontIcon> Proportional Chart. All lines add to 100%; 
            individual amounts are shown in proportion to the whole.</li>
        <li><FontIcon style={
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
        className="material-icons">change_history</FontIcon> Year-over-year toggle. This shows the differences
        between adjacent years on a rolling basis.</li>
        <li><FontIcon style={
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
        className="material-icons">exposure</FontIcon> Net toggle. When paired revenue and expenses is the
        Aspect chosen, this toggle is set and net figures (revenue - expenses) are shown.</li>
        <li><FontIcon style={
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
        className="material-icons">exposure</FontIcon> Variance toggle. When paired budget and actual is the
        Aspect chosen, this toggle is set and variance figures (budget - actual) are shown.</li>
        </ul>
    </CardText>
</Card>
<Card>
    <CardTitle
        actAsExpander={true}
        showExpandableButton={true} >
        Context Options
    </CardTitle>
    <CardText expandable style={{paddingTop:"0px"}}>
    context options content
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