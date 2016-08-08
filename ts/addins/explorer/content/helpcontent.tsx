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
    <li><strong>Version:</strong> alternate detailed datasets available for the selected viewpoint</li>
    <li><strong>Aspect:</strong> particular aspects of the budget, such as Revenue, Expenses or Staffing</li>
    <li><strong>By Unit:</strong> the beginnings of diagnostic analytics, using simple math to view the 
        data compared with relevant related metrics, such as per person or per household</li>
    </ul>
    <p>Choices for the selections are interdependent. Toronto budgets have similar classifications for 
        Revenue and Expenses for example, and therefore these can be viewed together (as offered by the 
        <em>both</em> and <em>net</em> Aspects). Financial statements 
        on the other hand do not have similar classifications for Revenue and Expenses.</p>
    <p><strong><em>Viewpoint</em></strong> choices include:</p>
    <dl>
        <dt><strong>Budget (by function)</strong></dt>
        <dd>combines City of Toronto Agencies and Divisions into groups according to the nature of 
            the services delivered (this is the default)
        </dd>
        <dt><strong>Budget (by structure)</strong></dt>
        <dd>more traditional: separates Agencies from Divisions, and generally by organizational
            structures. Groupings are closer to those found in City annual Budget Summaries</dd>
        <dt><strong>Financial Statements</strong></dt>
        <dd>
            This reporting structure is manadated by the province (and GAAP -- Generally Accepted
            Accounting Principles), is functional, and is comparable to other municipalities in the 
            province.
        </dd>
    </dl>
    <p>Aspects are the main data series available: Expenditures, Revenues, and Staffing Positions 
        (Full Time Equivalents) </p>
    <p>This prototype uses data from the City Council Approved Operating Budget Summary 2015 from 
        the City of Toronto's open data portal
    </p>

    <p>
        Click or tap on any column in the "By Programs" charts to drill-down. Other charts do not 
        currently support drill-down.
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
</div>

export default content