// helpcontent.tsx
// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// explorerbranch.tsx

import * as React from 'react'
import {Card, CardTitle, CardText, CardActions} from 'material-ui/Card'

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
        <li><strong>Aspect:</strong> particular aspects of the budget, such as Revenue, Expenses or Staffing</li>
        <li><strong>By Unit:</strong> the beginnings of diagnostic analytics, using simple math to view the 
            data compared with relevant related metrics, such as per person or per household</li>
        <li><strong>Inflation adjusted:</strong> the datasets are updated annually to reflect the Bank of 
            Canada's Inflation Calculator. This makes it possible to get historical perspectives that are
            meaningful in today's dollar terms.
        </li>
    </ul>
    <p>Choices for the selections are interdependent. Toronto budgets have similar classifications for 
        Revenue and Expenses for example, and therefore these can be viewed together (as offered by the 
        <em>both</em> and <em>net</em> Aspects). Financial statements 
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
        <dt><strong>Financial Statements</strong></dt>
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
    <p><em>For Viewpoint = Budget, Versions</em> (for both functional and structural Viewpoints) include:</p>
    <blockquote>
        <ul>
        <li>Summary</li>
        <li>Detail (FPARS)</li>
        <li>Variance Reports</li>
        </ul>
    </blockquote>
    <p><em>For Viewpoint = Financial statement, Versions</em> include:</p>
    <blockquote>
        <ul>
        <li>Audited Financial Statements</li>
        <li>Financial Information Returns (FIRs for MMAH)</li>
        </ul>
    </blockquote>

    <hr />

    <p>
        <strong><em>Aspect</em></strong> choices depend on the Viewpoint and Version that is chosen.
    </p>
        <p><em>For Viewpoint = Budget, Version = Summary or Detailed, Aspects</em> (for both functional and structural Viewpoints) include:</p>
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

        <p><em>For Viewpoint = Financial statement, any Version, Aspects</em> include:</p>
    <blockquote>
        <ul>
        <li>Revenue</li>
        <li>Expenses</li>
        </ul>

    <p>The classification schemes for these are different for each, and therefore they cannot be 
        combined.
    </p>
    </blockquote>
        <p><em>For Viewpoint = Expenses by Object, Version = Statements, Aspects</em> include:</p>
    <blockquote>
        <ul>
        <li>Expenses</li>
        </ul>
    <p>These come from notes to the audited financial statements.
    </p>
    </blockquote>

    <p><em>For Viewpoint = Budget, Version = Variance report, Aspects</em> include:</p>
    <blockquote>
        <ul>
        <li>Revenue
            <ul>
            <li>Budget Revenue</li>
            <li>Actual Revenue</li>
            <li>Both Revenues, paired</li>
            <li>Revenue Variance</li>
            </ul>
        </li>
        <li>Expenses
            <ul>
            <li>Budget Expenses</li>
            <li>Actual Expenses</li>
            <li>Both Expenses, paired</li>
            <li>Expenses Variance</li>
            </ul>
        </li>
        <li>Both (Revenue & Expenses)
            <ul>
            <li>Budget, paired</li>
            <li>Actual, paired</li>
            <li>Both Budget, paired & Actual, paired</li>
            <li>Variances, paired</li>
            </ul>
        </li>
        <li>Net (Revenue & Expenses)
            <ul>
            <li>Budget</li>
            <li>Actual</li>
            <li>Both Budget & Actual, paired</li>
            <li>Variances</li>
            </ul>
        </li>
        <li>Staffing
            <ul>
            <li>Budget Staffing</li>
            <li>Actual Staffing</li>
            <li>Both Staffing, paired</li>
            <li>Staffing Variance</li>
            </ul>
        </li>
        </ul>
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
    chart options content
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